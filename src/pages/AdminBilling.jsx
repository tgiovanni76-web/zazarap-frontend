import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Euro, TrendingUp, Users, CreditCard, Search, 
  Download, Calendar, RotateCw, CheckCircle, XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function AdminBilling() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: billingData, isLoading } = useQuery({
    queryKey: ['adminBillingData'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getAdminBillingData', {});
      return res.data;
    },
    enabled: !!user && user.role === 'admin',
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Accesso negato</h2>
        <Button onClick={() => base44.auth.redirectToLogin()}>Login</Button>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Solo per amministratori</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-slate-600">Caricamento dati billing...</p>
      </div>
    );
  }

  const stats = billingData?.stats || {};
  const recentTransactions = billingData?.recentTransactions || [];
  const recentPromotions = billingData?.recentPromotions || [];
  const userPaymentMethodsSummary = billingData?.userPaymentMethodsSummary || [];
  const invoices = billingData?.invoices || [];

  const filteredUsers = searchTerm
    ? userPaymentMethodsSummary.filter(u => 
        u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : userPaymentMethodsSummary;

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Billing Admin</h1>
        <p className="text-slate-600">Gestione completa transazioni, abbonamenti e metodi di pagamento</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Euro className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">€{stats.totalRevenue?.toFixed(0)}</div>
            <div className="text-sm text-slate-600">Ricavi Totali</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">€{stats.monthlyRecurringRevenue?.toFixed(0)}</div>
            <div className="text-sm text-slate-600">MRR</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <RotateCw className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.activeSubscriptions}</div>
            <div className="text-sm text-slate-600">Abbonamenti Attivi</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.totalUsers}</div>
            <div className="text-sm text-slate-600">Utenti Totali</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.payingUsers}</div>
            <div className="text-sm text-slate-600">Utenti Paganti</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.conversionRate}%</div>
            <div className="text-sm text-slate-600">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transazioni</TabsTrigger>
          <TabsTrigger value="subscriptions">Abbonamenti</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="invoices">Fatture</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transazioni Recenti</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(recentTransactions, 'transazioni.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Data</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Utente</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Provider</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Importo</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 text-sm">
                          {format(new Date(tx.created_date), 'dd/MM/yyyy HH:mm', { locale: it })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-sm">{tx.userName}</div>
                          <div className="text-xs text-slate-500">{tx.userId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{tx.kind}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm">{tx.provider}</td>
                        <td className="py-3 px-4 font-bold text-green-600">€{tx.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge className={
                            tx.status === 'paid' || tx.status === 'captured' 
                              ? 'bg-green-100 text-green-800' 
                              : tx.status === 'failed' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }>
                            {tx.status === 'paid' || tx.status === 'captured' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {tx.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Abbonamenti Attivi e Recenti</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(recentPromotions, 'abbonamenti.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Utente</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Listing</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Auto-Rinnovo</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Scadenza</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Importo</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPromotions.map((promo) => {
                      const isActive = promo.status === 'paid' && new Date(promo.endDate) > new Date();
                      return (
                        <tr key={promo.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-sm">{promo.userName}</div>
                            <div className="text-xs text-slate-500">{promo.created_by}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {promo.listingId?.slice(0, 8)}...
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{promo.type}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            {promo.autoRenew ? (
                              <Badge className="bg-blue-100 text-blue-800">
                                <RotateCw className="w-3 h-3 mr-1" />
                                Attivo
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-sm">No</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {format(new Date(promo.endDate), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-4 font-bold text-green-600">€{promo.amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-slate-100 text-slate-800'
                            }>
                              {isActive ? 'Attivo' : 'Scaduto'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Utenti e Metodi di Pagamento</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Cerca utente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportToCSV(userPaymentMethodsSummary, 'utenti.csv')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Esporta
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Utente</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Metodi di Pagamento</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Totale Speso</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Ultima Transazione</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.userId} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium">{user.userName}</td>
                        <td className="py-3 px-4 text-sm text-slate-600">{user.userId}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {user.paymentMethodsCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-bold text-green-600">€{user.totalSpent.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm">
                          {user.lastTransaction 
                            ? format(new Date(user.lastTransaction), 'dd/MM/yyyy HH:mm', { locale: it })
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Fatture Recenti</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(invoices, 'fatture.csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Esporta CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Nessuna fattura trovata
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Numero</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Utente</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Data</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Importo</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">IVA</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium">{invoice.invoiceNumber}</td>
                          <td className="py-3 px-4 text-sm">{invoice.userId}</td>
                          <td className="py-3 px-4 text-sm">
                            {format(new Date(invoice.issueDate), 'dd/MM/yyyy')}
                          </td>
                          <td className="py-3 px-4 font-bold text-green-600">
                            €{invoice.amount.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            €{(invoice.vatAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : invoice.status === 'issued'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-800'
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}