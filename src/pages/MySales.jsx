import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DollarSign, Package, TrendingUp, Clock, XCircle, Check, Archive, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '../components/LanguageProvider';

export default function MySales() {
  const { t } = useLanguage();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
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
    queryKey: ['myListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user,
  });

  const markAsSoldMutation = useMutation({
    mutationFn: async (listingId) => {
      return await base44.entities.Listing.update(listingId, { status: 'sold' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      toast.success('✓ Anzeige als verkauft markiert');
    },
    onError: (error) => {
      toast.error('Fehler: ' + error.message);
    }
  });

  const archiveListingMutation = useMutation({
    mutationFn: async (listingId) => {
      return await base44.entities.Listing.update(listingId, { status: 'archived' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] });
      toast.success('Anzeige archiviert');
    },
    onError: (error) => {
      toast.error('Fehler: ' + error.message);
    }
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

  const updateShippingMutation = useMutation({
    mutationFn: async ({ shippingId, data }) => {
      return base44.entities.Shipping.update(shippingId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippings'] });
      toast.success('Spedizione aggiornata!');
      setTrackingNumber('');
      setSelectedChatId(null);
    }
  });

  const mySales = chats.filter(c => c.sellerId === user?.email);
  
  const salesStats = {
    total: mySales.filter(c => ['pagamento_in_escrow', 'completata'].includes(c.status)).length,
    revenue: payments
      .filter(p => p.sellerId === user?.email && ['released_to_seller', 'completed'].includes(p.status))
      .reduce((sum, p) => sum + p.amount, 0),
    inEscrow: payments
      .filter(p => p.sellerId === user?.email && p.status === 'held_in_escrow')
      .reduce((sum, p) => sum + p.amount, 0),
    pending: mySales.filter(c => c.status === 'pagamento_in_escrow').length
  };

  const handleAddTracking = (chatId) => {
    if (!trackingNumber.trim()) return;
    
    const shipping = shippings.find(s => s.chatId === chatId);
    if (shipping) {
      updateShippingMutation.mutate({
        shippingId: shipping.id,
        data: {
          trackingNumber,
          status: 'shipped',
          trackingUrl: `https://track.example.com/${trackingNumber}`
        }
      });
    }
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{t('mySales')}</h2>
        <Link to={createPageUrl('RejectedListings')}>
          <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
            <XCircle className="h-4 w-4 mr-2" />
            Annunci rifiutati
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalSales')}</p>
                <p className="text-2xl font-bold">{salesStats.total}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('totalRevenue')}</p>
                <p className="text-2xl font-bold">{salesStats.revenue.toFixed(2)}€</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('inEscrow')}</p>
                <p className="text-2xl font-bold">{salesStats.inEscrow.toFixed(2)}€</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t('toShip')}</p>
                <p className="text-2xl font-bold">{salesStats.pending}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mySales.map(chat => {
          const listing = listings.find(l => l.id === chat.listingId);
          const payment = payments.find(p => p.chatId === chat.id);
          const shipping = shippings.find(s => s.chatId === chat.id);
          
          return (
            <Card key={chat.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {listing?.images?.[0] && (
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full md:w-32 h-32 object-cover rounded"
                    />
                  )}
                  
                  <div className="flex-1 space-y-2">
                   <div className="flex justify-between items-start">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                         <h3 className="font-bold text-lg">{listing?.title}</h3>
                         {listing?.status === 'sold' && (
                           <Badge className="bg-red-600 text-white">✓ Verkauft</Badge>
                         )}
                         {listing?.status === 'archived' && (
                           <Badge variant="secondary">Archiviert</Badge>
                         )}
                       </div>
                       <p className="text-sm text-slate-600">{t('buyer')}: {chat.buyerId}</p>
                       <p className="text-lg font-bold text-red-600 mt-1">
                         {chat.lastPrice || listing?.price}€
                       </p>
                     </div>
                      <div className="text-right">
                        <Badge className={
                          payment?.status === 'held_in_escrow' ? 'bg-yellow-100 text-yellow-800' :
                          payment?.status === 'released_to_seller' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {payment?.status === 'held_in_escrow' ? `🔒 ${t('inEscrow')}` :
                           payment?.status === 'released_to_seller' ? `✅ ${t('fundsReceived')}` :
                           payment?.status || t('pending')}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {format(new Date(chat.created_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>

                    {shipping && (
                      <div className="p-3 bg-slate-50 rounded space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{t('shipping')}:</span>
                          <Badge variant="outline">{shipping.status}</Badge>
                        </div>
                        {shipping.trackingNumber && (
                          <p className="text-sm">
                            {t('tracking')}: <span className="font-mono font-bold">{shipping.trackingNumber}</span>
                          </p>
                        )}
                        {shipping.method !== 'ritiro_persona' && !shipping.trackingNumber && (
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder={`${t('tracking')}...`}
                              value={selectedChatId === chat.id ? trackingNumber : ''}
                              onChange={(e) => {
                                setSelectedChatId(chat.id);
                                setTrackingNumber(e.target.value);
                              }}
                              className="flex-1"
                            />
                            <Button 
                              onClick={() => handleAddTracking(chat.id)}
                              disabled={!trackingNumber.trim()}
                              size="sm"
                            >
                              {t('add')}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      <Link to={createPageUrl('Messages')}>
                        <Button variant="outline" size="sm">
                          {t('goToChat')}
                        </Button>
                      </Link>
                      
                      {listing?.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('Möchtest du diese Anzeige als verkauft markieren? Sie wird aus den öffentlichen Suchergebnissen entfernt.')) {
                              markAsSoldMutation.mutate(listing.id);
                            }
                          }}
                          disabled={markAsSoldMutation.isPending}
                        >
                          {markAsSoldMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Als verkauft
                        </Button>
                      )}
                      
                      {listing?.status === 'sold' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Möchtest du diese verkaufte Anzeige archivieren?')) {
                              archiveListingMutation.mutate(listing.id);
                            }
                          }}
                          disabled={archiveListingMutation.isPending}
                        >
                          {archiveListingMutation.isPending ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Archive className="h-3 w-3 mr-1" />
                          )}
                          Archivieren
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {mySales.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('noSalesYet')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}