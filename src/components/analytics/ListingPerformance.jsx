import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, TrendingUp, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ListingPerformance({ listings, activities, favorites }) {
  // Calculate views per listing
  const listingViews = {};
  activities.filter(a => a.activityType === 'view' && a.listingId).forEach(a => {
    listingViews[a.listingId] = (listingViews[a.listingId] || 0) + 1;
  });

  // Calculate favorites per listing
  const listingFavorites = {};
  favorites.forEach(f => {
    listingFavorites[f.listing_id] = (listingFavorites[f.listing_id] || 0) + 1;
  });

  // Top listings by views
  const topListings = listings
    .map(l => ({
      ...l,
      views: listingViews[l.id] || 0,
      favCount: listingFavorites[l.id] || 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Category performance
  const categoryStats = {};
  listings.forEach(l => {
    if (!categoryStats[l.category]) {
      categoryStats[l.category] = { count: 0, views: 0, favorites: 0 };
    }
    categoryStats[l.category].count++;
    categoryStats[l.category].views += listingViews[l.id] || 0;
    categoryStats[l.category].favorites += listingFavorites[l.id] || 0;
  });

  const categoryData = Object.entries(categoryStats)
    .map(([name, stats]) => ({
      name,
      Listings: stats.count,
      Views: stats.views,
      Favoriten: stats.favorites
    }))
    .sort((a, b) => b.Views - a.Views)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gesamt Listings</p>
                <p className="text-2xl font-bold">{listings.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gesamt Views</p>
                <p className="text-2xl font-bold">{Object.values(listingViews).reduce((a, b) => a + b, 0)}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gesamt Favoriten</p>
                <p className="text-2xl font-bold">{favorites.length}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top 10 Listings nach Views
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topListings.map((listing, idx) => (
              <Link 
                key={listing.id} 
                to={createPageUrl('ListingDetail') + '?id=' + listing.id}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                    {idx + 1}
                  </div>
                  {listing.images?.[0] && (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{listing.title}</p>
                    <p className="text-sm text-slate-600">{listing.price}€ • {listing.category}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold">{listing.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-semibold">{listing.favCount}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kategorie Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Views" fill="#3b82f6" />
                <Bar dataKey="Favoriten" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-center py-12">Keine Daten verfügbar</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}