import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Heart, MessageSquare, TrendingUp, Clock, Target } from 'lucide-react';

export default function ListingAnalytics({ listing, activities, favorites, messages }) {
  // Calculate metrics
  const views = activities.filter(a => 
    a.activityType === 'view' && a.listingId === listing.id
  ).length;

  const favoriteCount = favorites.filter(f => 
    f.listing_id === listing.id
  ).length;

  const messageCount = messages.filter(m => 
    m.chatId && m.chatId.includes(listing.id)
  ).length;

  const clicks = activities.filter(a => 
    a.activityType === 'click' && a.listingId === listing.id
  ).length;

  // Calculate conversion rates
  const viewToFavoriteRate = views > 0 ? ((favoriteCount / views) * 100).toFixed(1) : 0;
  const viewToContactRate = views > 0 ? ((messageCount / views) * 100).toFixed(1) : 0;

  // Daily views trend (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayViews = activities.filter(a => {
      const actDate = new Date(a.created_date).toISOString().split('T')[0];
      return actDate === dateStr && a.activityType === 'view' && a.listingId === listing.id;
    }).length;

    last7Days.push({
      date: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      views: dayViews
    });
  }

  // Days since creation
  const daysSinceCreation = Math.floor(
    (new Date() - new Date(listing.created_date)) / (1000 * 60 * 60 * 24)
  );

  // Views per day
  const viewsPerDay = daysSinceCreation > 0 ? (views / daysSinceCreation).toFixed(1) : views;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Aufrufe</p>
                <p className="text-2xl font-bold">{views}</p>
                <p className="text-xs text-slate-500">{viewsPerDay}/Tag</p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Favoriten</p>
                <p className="text-2xl font-bold">{favoriteCount}</p>
                <p className="text-xs text-slate-500">{viewToFavoriteRate}% Conv.</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Nachrichten</p>
                <p className="text-2xl font-bold">{messageCount}</p>
                <p className="text-xs text-slate-500">{viewToContactRate}% Conv.</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Clicks</p>
                <p className="text-2xl font-bold">{clicks}</p>
                <p className="text-xs text-slate-500">CTR</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance-Indikatoren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">View-to-Favorite Rate</span>
                <span className="text-sm font-semibold">{viewToFavoriteRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(viewToFavoriteRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {parseFloat(viewToFavoriteRate) > 5 ? '✅ Gut' : parseFloat(viewToFavoriteRate) > 2 ? '⚠️ Durchschnitt' : '❌ Niedrig'}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">View-to-Contact Rate</span>
                <span className="text-sm font-semibold">{viewToContactRate}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(viewToContactRate, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {parseFloat(viewToContactRate) > 3 ? '✅ Sehr gut' : parseFloat(viewToContactRate) > 1 ? '⚠️ OK' : '❌ Zu niedrig'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Views Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Aufrufe-Trend (7 Tage)</CardTitle>
        </CardHeader>
        <CardContent>
          {last7Days.some(d => d.views > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-8">Noch keine Aufrufe</p>
          )}
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Empfehlungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {views === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-semibold text-yellow-800">💡 Keine Aufrufe</p>
                <p className="text-xs text-yellow-700">Verbessere Titel, Bilder und Tags für bessere Sichtbarkeit.</p>
              </div>
            )}
            {views > 10 && favoriteCount === 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-800">📸 Bilder optimieren</p>
                <p className="text-xs text-blue-700">Viele Aufrufe aber keine Favoriten - bessere Bilder könnten helfen.</p>
              </div>
            )}
            {views > 20 && messageCount === 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <p className="text-sm font-semibold text-purple-800">💰 Preis überprüfen</p>
                <p className="text-xs text-purple-700">Viele Aufrufe aber keine Kontakte - Preis könnte zu hoch sein.</p>
              </div>
            )}
            {parseFloat(viewToContactRate) > 5 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm font-semibold text-green-800">🎯 Sehr gute Performance!</p>
                <p className="text-xs text-green-700">Deine Anzeige konvertiert sehr gut - weiter so!</p>
              </div>
            )}
            {daysSinceCreation > 14 && views < 10 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm font-semibold text-red-800">⚠️ Geringe Sichtbarkeit</p>
                <p className="text-xs text-red-700">Anzeige seit {daysSinceCreation} Tagen online - erwäge eine Promotion oder Neuveröffentlichung.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}