import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, FileText, TrendingUp, Receipt } from 'lucide-react';
import PaymentMethodsManager from '../components/billing/PaymentMethodsManager';
import InvoicesList from '../components/billing/InvoicesList';

export default function Billing() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['userTransactions'],
    queryFn: async () => {
      return await base44.entities.Transaction.filter({}, '-created_date', 100);
    },
    enabled: !!user
  });

  const stats = {
    totalSpent: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
    completedPayments: transactions.filter(t => t.status === 'paid' || t.status === 'captured').length,
    pendingPayments: transactions.filter(t => t.status === 'pending' || t.status === 'authorized').length
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <CardContent>
            <p className="text-center">Effettua l'accesso per visualizzare la fatturazione</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Fatturazione e Pagamenti</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Spesa Totale</div>
                <div className="text-2xl font-bold">€{stats.totalSpent.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Pagamenti Completati</div>
                <div className="text-2xl font-bold">{stats.completedPayments}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">In Attesa</div>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="methods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methods">
            <CreditCard className="w-4 h-4 mr-2" />
            Metodi di Pagamento
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="w-4 h-4 mr-2" />
            Fatture
          </TabsTrigger>
          <TabsTrigger value="history">
            <Receipt className="w-4 h-4 mr-2" />
            Storico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="methods" className="mt-6">
          <PaymentMethodsManager />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesList />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Nessuna transazione
                  </div>
                ) : (
                  transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{transaction.description || 'Transazione'}</div>
                        <div className="text-sm text-slate-600">
                          {new Date(transaction.created_date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">€{transaction.amount.toFixed(2)}</div>
                        <div className="text-xs text-slate-500">{transaction.status}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}