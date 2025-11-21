import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ShoppingBag, Package, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import ShippingTracker from '../components/marketplace/ShippingTracker';
import { useLanguage } from '../components/LanguageProvider';

export default function MyPurchases() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['myChats'],
    queryFn: () => base44.entities.Chat.list('-updatedAt'),
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ['payments'],
    queryFn: () => base44.entities.Payment.list('-created_date'),
    enabled: !!user,
  });

  const { data: shippings = [] } = useQuery({
    queryKey: ['shippings'],
    queryFn: () => base44.entities.Shipping.list('-created_date'),
    enabled: !!user,
  });

  const confirmReceiptMutation = useMutation({
    mutationFn: async (payment) => {
      // Aggiorna pagamento
      await base44.entities.Payment.update(payment.id, {
        status: 'released_to_seller',
        buyerConfirmedReceipt: true
      });

      // Aggiorna chat
      const chat = chats.find(c => c.id === payment.chatId);
      await base44.entities.Chat.update(payment.chatId, {
        status: 'completata',
        lastMessage: 'Acquirente ha confermato la ricezione'
      });

      // Notifica venditore
      await base44.entities.Notification.create({
        userId: payment.sellerId,
        type: 'status_update',
        title: '💰 Fondi Rilasciati!',
        message: `L'acquirente ha confermato la ricezione. I fondi sono stati rilasciati.`,
        linkUrl: '/MySales',
        relatedId: payment.chatId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['myChats'] });
      toast.success('Ricezione confermata! Fondi rilasciati al venditore.');
    }
  });

  const myPurchases = chats.filter(c => c.buyerId === user?.email);
  
  const purchasesStats = {
    total: myPurchases.filter(c => ['pagamento_in_escrow', 'completata'].includes(c.status)).length,
    spent: payments
      .filter(p => p.buyerId === user?.email && ['held_in_escrow', 'released_to_seller', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0),
    inProgress: myPurchases.filter(c => c.status === 'pagamento_in_escrow').length
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">{t('myPurchases')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalPurchases')}</p>
                <p className="text-2xl font-bold">{purchasesStats.total}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalSpent')}</p>
                <p className="text-2xl font-bold">{purchasesStats.spent.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('inProgress')}</p>
                <p className="text-2xl font-bold">{purchasesStats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {myPurchases.map(chat => {
          const listing = listings.find(l => l.id === chat.listingId);
          const payment = payments.find(p => p.chatId === chat.id);
          const shipping = shippings.find(s => s.chatId === chat.id);
          
          return (
            <Card key={chat.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      {listing?.images?.[0] && (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{listing?.title}</h3>
                        <p className="text-sm text-slate-600">{t('seller')}: {chat.sellerId}</p>
                        <p className="text-lg font-bold text-red-600 mt-1">
                          {chat.lastPrice || listing?.price}€
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(chat.created_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>

                    {payment && (
                      <div className="p-3 bg-slate-50 rounded">
                        <p className="text-sm font-semibold mb-2">{t('paymentStatus')}:</p>
                        <Badge className={
                          payment.status === 'held_in_escrow' ? 'bg-yellow-100 text-yellow-800' :
                          payment.status === 'released_to_seller' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {payment.status === 'held_in_escrow' ? t('protectedInEscrow') :
                           payment.status === 'released_to_seller' ? t('completed') :
                           payment.status}
                        </Badge>
                      </div>
                    )}

                    <Link to={createPageUrl('Messages')}>
                      <Button variant="outline" size="sm" className="w-full">
                        {t('goToChat')}
                      </Button>
                    </Link>
                  </div>

                  {shipping && (
                    <div>
                      <ShippingTracker 
                        shipping={shipping} 
                        payment={payment}
                        onConfirmReceipt={() => confirmReceiptMutation.mutate(payment)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {myPurchases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noPurchasesYet')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}