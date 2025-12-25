import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Package, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = React.useState('30');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['allListings'],
    queryFn: () => base44.entities.Listing.list('-created_date', 1000),
    enabled: user?.role === 'admin'
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['allPromotions'],
    queryFn: () => base44.entities.ListingPromotion.list('-created_date', 500),
    enabled: user?.role === 'admin'
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['allTransactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
    enabled: user?.role === 'admin'
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => base44.entities.Category.list('order', 100),
    enabled: user?.role === 'admin'
  });

  const { data: systemLogs = [] } = useQuery({
    queryKey: ['systemLogs'],
    queryFn: () => base44.entities.SystemLog.list('-created_date', 100),
    enabled: user?.role === 'admin'
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Zugriff verweigert</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Nur Administratoren können auf diese Seite zugreifen.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const activeListings = listings.filter(l => l.status === 'active').length;
  const featuredListings = listings.filter(l => l.featured).length;
  const activePromotions = promotions.filter(p => p.status === 'paid' && p.autoRenew).length;
  const totalRevenue = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0);

  // Time-based filtering
  const daysAgo = parseInt(timeRange);
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const recentTransactions = transactions.filter(t => new Date(t.created_date) >= cutoffDate);

  // Revenue over time
  const revenueByDay = {};
  recentTransactions.forEach(t => {
    if (t.status === 'paid') {
      const day = new Date(t.created_date).toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + (t.amount || 0);
    }
  });
  const revenueData = Object.entries(revenueByDay)
    .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Transactions over time
  const transactionsByDay = {};
  recentTransactions.forEach(t => {
    const day = new Date(t.created_date).toISOString().split('T')[0];
    transactionsByDay[day] = (transactionsByDay[day] || 0) + 1;
  });
  const transactionsData = Object.entries(transactionsByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Category distribution
  const categoryCount = {};
  listings.forEach(l => {
    categoryCount[l.category] = (categoryCount[l.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount)
    .map(([name, value]) => ({ name: name || 'Unbekannt', value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Promotion types
  const promoTypes = {};
  promotions.forEach(p => {
    const key = `${p.type} (${p.renewalFrequency || p.billing})`;
    promoTypes[key] = (promoTypes[key] || 0) + 1;
  });
  const promoData = Object.entries(promoTypes)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // System logs by level
  const errorLogs = systemLogs.filter(l => l.level === 'error').slice(0, 10);
  const warnLogs = systemLogs.filter(l => l.level === 'warn').slice(0, 10);

  const COLORS = ['#d62828', '#f77f00', '#fcbf49', '#06a77d', '#118ab2', '#073b4c', '#ef476f', '#ffd166'];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Datenanalyse Dashboard</h1>
            <p className="text-gray-600 mt-1">Umfassende Übersicht über Plattform-Performance</p>
          </div>
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Letzte 7 Tage</SelectItem>
                <SelectItem value="30">Letzte 30 Tage</SelectItem>
                <SelectItem value="90">Letzte 90 Tage</SelectItem>
                <SelectItem value="365">Letztes Jahr</SelectItem>
              </SelectContent>
            </Select>
            <Link to={createPageUrl('AdminDashboard')}>
              <Button variant="outline">← Zurück zum Admin</Button>
            </Link>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeListings}</div>
              <p className="text-xs text-muted-foreground">
                {featuredListings} Featured
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Promotions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePromotions}</div>
              <p className="text-xs text-muted-foreground">
                Auto-Renewal aktiv
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {transactions.filter(t => t.status === 'paid').length} Transaktionen
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {errorLogs.length === 0 ? 'Stabil' : 'Warnung'}
              </div>
              <p className="text-xs text-muted-foreground">
                {errorLogs.length} Fehler, {warnLogs.length} Warnungen
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Umsatzentwicklung</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `€${value}`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#d62828" strokeWidth={2} name="Umsatz (EUR)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Transactions Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transaktionsverlauf</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transactionsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#118ab2" name="Anzahl Transaktionen" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Top Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Promotion Types */}
          <Card>
            <CardHeader>
              <CardTitle>Promotion-Typen</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={promoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#f77f00" name="Anzahl" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* System Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Error Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Fehler-Logs (Letzte 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {errorLogs.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 py-4">
                  <CheckCircle className="h-5 w-5" />
                  <span>Keine Fehler</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {errorLogs.map((log, idx) => (
                    <div key={idx} className="border-l-4 border-red-500 pl-3 py-2 bg-red-50 rounded">
                      <div className="text-sm font-semibold text-red-800">{log.message}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(log.created_date).toLocaleString()} • {log.path || 'N/A'}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-700 mt-1 font-mono bg-white p-2 rounded">
                          {log.details.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Warnungen (Letzte 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {warnLogs.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600 py-4">
                  <CheckCircle className="h-5 w-5" />
                  <span>Keine Warnungen</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {warnLogs.map((log, idx) => (
                    <div key={idx} className="border-l-4 border-yellow-500 pl-3 py-2 bg-yellow-50 rounded">
                      <div className="text-sm font-semibold text-yellow-800">{log.message}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {new Date(log.created_date).toLocaleString()} • {log.path || 'N/A'}
                      </div>
                      {log.details && (
                        <div className="text-xs text-gray-700 mt-1 font-mono bg-white p-2 rounded">
                          {log.details.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction Details Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Letzte Transaktionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Datum</th>
                    <th className="text-left py-2 px-2">Typ</th>
                    <th className="text-left py-2 px-2">Benutzer</th>
                    <th className="text-left py-2 px-2">Provider</th>
                    <th className="text-right py-2 px-2">Betrag</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.slice(0, 20).map((t, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{new Date(t.created_date).toLocaleDateString()}</td>
                      <td className="py-2 px-2">{t.kind}</td>
                      <td className="py-2 px-2 text-xs">{t.userId}</td>
                      <td className="py-2 px-2">{t.provider}</td>
                      <td className="py-2 px-2 text-right font-semibold">€{t.amount?.toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          t.status === 'paid' ? 'bg-green-100 text-green-800' :
                          t.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}