import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function AdminPayments() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['chats'],
    queryFn: () => base44.entities.Chat.list(),
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const releaseEscrowMutation = useMutation({
    mutationFn: async (paymentId) => {
      await base44.entities.Payment.update(paymentId, {
        status: 'released_to_seller'
      });

      const payment = payments.find(p => p.id === paymentId);
      
      await base44.entities.Notification.create({
        userId: payment.sellerId,
        type: 'status_update',
        title: '💰 Fondi Rilasciati',
        message: `I fondi di ${payment.amount}€ sono stati rilasciati sul tuo account PayPal`,
        linkUrl: '/MySales'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Fondi rilasciati');
    }
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId) => {
      await base44.entities.Payment.update(paymentId, {
        status: 'refunded'
      });

      const payment = payments.find(p => p.id === paymentId);
      
      await base44.entities.Notification.create({
        userId: payment.buyerId,
        type: 'status_update',
        title: '💰 Rimborso Effettuato',
        message: `Hai ricevuto un rimborso di ${payment.amount}€`,
        linkUrl: '/MyPurchases'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Rimborso effettuato');
    }
  });

  if (user?.role !== 'admin') {
    return <div className="py-8 text-center">Accesso negato</div>;
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    held_in_escrow: 'bg-blue-100 text-blue-800',
    released_to_seller: 'bg-green-100 text-green-800',
    refunded: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-800',
    failed: 'bg-red-100 text-red-800'
  };

  const totalEscrow = payments
    .filter(p => p.status === 'held_in_escrow')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalReleased = payments
    .filter(p => p.status === 'released_to_seller')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Gestione Pagamenti</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">In Escrow</div>
            <div className="text-3xl font-bold text-blue-600">{totalEscrow.toFixed(0)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Rilasciati</div>
            <div className="text-3xl font-bold text-green-600">{totalReleased.toFixed(0)}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-slate-500 mb-1">Totale Transazioni</div>
            <div className="text-3xl font-bold">{payments.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {payments.map(payment => {
          const chat = chats.find(c => c.id === payment.chatId);
          const listing = listings.find(l => l.id === chat?.listingId);
          
          return (
            <Card key={payment.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{listing?.title}</h3>
                    <p className="text-sm text-slate-600">
                      Da: {payment.buyerId} → A: {payment.sellerId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(payment.created_date), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {payment.amount}€
                    </div>
                    <Badge className={statusColors[payment.status]}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>

                <div className="text-sm text-slate-600 mb-3">
                  <div>Metodo: {payment.method}</div>
                  {payment.paypalOrderId && <div>PayPal Order: {payment.paypalOrderId}</div>}
                  {payment.escrowReleaseDate && (
                    <div>Rilascio previsto: {format(new Date(payment.escrowReleaseDate), 'dd/MM/yyyy')}</div>
                  )}
                </div>

                {payment.status === 'held_in_escrow' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        if (confirm('Rilasciare i fondi al venditore?')) {
                          releaseEscrowMutation.mutate(payment.id);
                        }
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Rilascia Fondi
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Rimborsare l\'acquirente?')) {
                          refundMutation.mutate(payment.id);
                        }
                      }}
                      size="sm"
                      variant="destructive"
                    >
                      Rimborsa
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          Nessun pagamento trovato
        </div>
      )}
    </div>
  );
}