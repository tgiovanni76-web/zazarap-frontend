import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, CreditCard, Clock } from 'lucide-react';

export default function TransactionVolume({ transactions }) {
  // Total volume and stats
  const totalVolume = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const completedTransactions = transactions.filter(t => t.status === 'paid' || t.status === 'captured');
  const completedVolume = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingVolume = transactions
    .filter(t => t.status === 'pending' || t.status === 'authorized')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Transaction trend (last 30 days)
  const dailyData = {};
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  transactions.forEach(t => {
    const date = new Date(t.created_date);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split('T')[0];
      if (!dailyData[dateStr]) {
        dailyData[dateStr] = { date: dateStr, amount: 0, count: 0 };
      }
      dailyData[dateStr].amount += t.amount || 0;
      dailyData[dateStr].count += 1;
    }
  });

  const trendData = Object.values(dailyData)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      Umsatz: d.amount,
      Anzahl: d.count
    }));

  // Status breakdown
  const statusData = [
    { name: 'Abgeschlossen', value: completedTransactions.length, color: '#22c55e' },
    { name: 'Ausstehend', value: transactions.filter(t => t.status === 'pending').length, color: '#eab308' },
    { name: 'Fehlgeschlagen', value: transactions.filter(t => t.status === 'failed').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Gesamt Umsatz</p>
                <p className="text-2xl font-bold text-green-600">{totalVolume.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Abgeschlossen</p>
                <p className="text-2xl font-bold text-blue-600">{completedVolume.toFixed(2)}€</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Ausstehend</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingVolume.toFixed(2)}€</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Transaktionen</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Umsatztrend (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="Umsatz" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-20">Keine Transaktionsdaten</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status-Verteilung</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500 text-center py-20">Keine Daten</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}