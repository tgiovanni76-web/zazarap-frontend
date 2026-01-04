import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function SellerMetrics({ listings, chats }) {
  const [metrics, setMetrics] = useState({
    today: { views: 0, sales: 0, revenue: 0 },
    week: { views: 0, sales: 0, revenue: 0 },
    month: { views: 0, sales: 0, revenue: 0 }
  });

  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [listings, chats]);

  const calculateMetrics = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const completedChats = chats.filter(c => c.status === 'completata');

    const todayStats = {
      views: listings.filter(l => new Date(l.created_date) >= today).reduce((sum, l) => sum + (l.views || 0), 0),
      sales: completedChats.filter(c => new Date(c.updatedAt || c.created_date) >= today).length,
      revenue: completedChats.filter(c => new Date(c.updatedAt || c.created_date) >= today).reduce((sum, c) => sum + (c.agreedPrice || 0), 0)
    };

    const weekStats = {
      views: listings.filter(l => new Date(l.created_date) >= weekAgo).reduce((sum, l) => sum + (l.views || 0), 0),
      sales: completedChats.filter(c => new Date(c.updatedAt || c.created_date) >= weekAgo).length,
      revenue: completedChats.filter(c => new Date(c.updatedAt || c.created_date) >= weekAgo).reduce((sum, c) => sum + (c.agreedPrice || 0), 0)
    };

    const monthStats = {
      views: listings.reduce((sum, l) => sum + (l.views || 0), 0),
      sales: completedChats.length,
      revenue: completedChats.reduce((sum, c) => sum + (c.agreedPrice || 0), 0)
    };

    setMetrics({
      today: todayStats,
      week: weekStats,
      month: monthStats
    });
  };

  // Sales by category
  const categoryData = listings.reduce((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Daily sales last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const daySales = chats.filter(c => {
      const chatDate = new Date(c.updatedAt || c.created_date);
      return chatDate >= dayStart && chatDate < dayEnd && c.status === 'completata';
    }).length;

    return {
      date: date.toLocaleDateString('it-IT', { weekday: 'short' }),
      sales: daySales
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Metriche in tempo reale</h3>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Activity className="h-4 w-4 animate-pulse text-green-600" />
          <span>Aggiornamento automatico</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Oggi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Visualizzazioni</span>
                <span className="font-bold">{metrics.today.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vendite</span>
                <span className="font-bold">{metrics.today.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ricavi</span>
                <span className="font-bold text-green-600">{metrics.today.revenue.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Ultimi 7 giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Visualizzazioni</span>
                <span className="font-bold">{metrics.week.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vendite</span>
                <span className="font-bold">{metrics.week.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ricavi</span>
                <span className="font-bold text-green-600">{metrics.week.revenue.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardHeader>
            <CardTitle className="text-sm text-slate-600">Ultimi 30 giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Visualizzazioni</span>
                <span className="font-bold">{metrics.month.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Vendite</span>
                <span className="font-bold">{metrics.month.sales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ricavi</span>
                <span className="font-bold text-green-600">{metrics.month.revenue.toFixed(2)}€</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendite ultimi 7 giorni</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Annunci per categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance prodotti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {listings
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 5)
              .map((listing, idx) => (
                <div key={listing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-400">#{idx + 1}</span>
                    <div>
                      <p className="font-medium">{listing.title}</p>
                      <p className="text-sm text-slate-600">{listing.price}€</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{listing.views || 0} views</Badge>
                    <Badge className={listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'}>
                      {listing.status}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}