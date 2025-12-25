import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  TrendingUp, Package, Euro, AlertCircle, RefreshCw, Plus, 
  Eye, Star, Clock, CheckCircle, RotateCw, Zap, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import QuickPromoteButton from '../components/promotions/QuickPromoteButton';

export default function Dashboard() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: myListings = [] } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: () => base44.entities.Listing.filter({ 
      created_by: user.email,
      status: 'active'
    }),
    enabled: !!user
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['myPromotions', user?.email],
    queryFn: async () => {
      const promos = await base44.entities.ListingPromotion.filter({
        created_by: user.email
      }, '-created_date');
      
      // Enrich with listing data
      const enriched = await Promise.all(promos.map(async promo => {
        const listings = await base44.entities.Listing.filter({ id: promo.listingId });
        return {
          ...promo,
          listingTitle: listings[0]?.title || 'Unknown',
          listingImage: listings[0]?.images?.[0]
        };
      }));
      
      return enriched;
    },
    enabled: !!user
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['myTransactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      userId: user.email,
      kind: 'promotion'
    }, '-created_date', 10),
    enabled: !!user
  });

  const { data: chats = [] } = useQuery({
    queryKey: ['myChats', user?.email],
    queryFn: () => base44.entities.Chat.filter({ 
      sellerId: user.email,
      status: { $ne: 'rifiutata' }
    }, '-updated_date', 10),
    enabled: !!user
  });

  const toggleAutoRenewalMutation = useMutation({
    mutationFn: async ({ promotionId, autoRenew }) => {
      const res = await base44.functions.invoke('toggleAutoRenewal', {
        promotionId,
        autoRenew
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Einstellung gespeichert');
      queryClient.invalidateQueries(['myPromotions']);
    }
  });

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Bitte anmelden</h2>
        <Button onClick={() => base44.auth.redirectToLogin()}>
          Anmelden
        </Button>
      </div>
    );
  }

  // Calculate metrics
  const activePromotions = promotions.filter(p => 
    p.status === 'paid' && new Date(p.endDate) > new Date()
  );
  
  const expiringPromotions = activePromotions.filter(p => {
    const daysUntilExpiry = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  });

  const totalSpent = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedSales = chats.filter(c => c.status === 'completata').length;

  const recentEarnings = chats
    .filter(c => c.status === 'completata' && c.lastPrice)
    .slice(0, 5)
    .reduce((sum, c) => sum + (c.lastPrice || 0), 0);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Willkommen zurück, {user.full_name}!</h1>
        <p className="text-slate-600">Verwalte deine Anzeigen, Promotions und Verkäufe</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <Badge variant="outline">{myListings.length}</Badge>
            </div>
            <div className="text-2xl font-bold">{myListings.length}</div>
            <div className="text-sm text-slate-600">Aktive Anzeigen</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-600" />
              <Badge variant="outline">{activePromotions.length}</Badge>
            </div>
            <div className="text-2xl font-bold">{activePromotions.length}</div>
            <div className="text-sm text-slate-600">Aktive Promotions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <Badge variant="outline">{completedSales}</Badge>
            </div>
            <div className="text-2xl font-bold">€{recentEarnings.toFixed(0)}</div>
            <div className="text-sm text-slate-600">Verkaufserlöse</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Euro className="w-8 h-8 text-purple-600" />
              <Badge variant="outline">Gesamt</Badge>
            </div>
            <div className="text-2xl font-bold">€{totalSpent.toFixed(0)}</div>
            <div className="text-sm text-slate-600">Promotions Ausgaben</div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Promotions Alert */}
      {expiringPromotions.length > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5" />
              {expiringPromotions.length} Promotion{expiringPromotions.length > 1 ? 's' : ''} läuft bald ab
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringPromotions.map(promo => {
                const daysLeft = Math.ceil((new Date(promo.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={promo.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      {promo.listingImage && (
                        <img src={promo.listingImage} alt="" className="w-12 h-12 object-cover rounded" />
                      )}
                      <div>
                        <div className="font-medium">{promo.listingTitle}</div>
                        <div className="text-sm text-slate-600">
                          Läuft in {daysLeft} Tag{daysLeft > 1 ? 'en' : ''} ab
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toggleAutoRenewalMutation.mutate({
                            promotionId: promo.id,
                            autoRenew: !promo.autoRenew
                          });
                        }}
                      >
                        <RotateCw className="w-4 h-4 mr-1" />
                        Auto-Renewal {promo.autoRenew ? 'Aus' : 'An'}
                      </Button>
                      <Link to={createPageUrl('PromotionManager')}>
                        <Button size="sm">
                          <RefreshCw className="w-4 h-4 mr-1" />
                          Verlängern
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="promotions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="promotions">Meine Promotions</TabsTrigger>
          <TabsTrigger value="listings">Meine Anzeigen</TabsTrigger>
          <TabsTrigger value="sales">Verkäufe</TabsTrigger>
        </TabsList>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Aktive Promotions</h3>
            <Link to={createPageUrl('PromotionManager')}>
              <Button variant="outline">
                Alle anzeigen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {activePromotions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="mb-4">Keine aktiven Promotions</p>
                <p className="text-sm mb-4">Hebe deine Anzeigen hervor für mehr Sichtbarkeit</p>
                {myListings.length > 0 && (
                  <QuickPromoteButton
                    listingId={myListings[0].id}
                    listingTitle={myListings[0].title}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activePromotions.slice(0, 4).map(promo => {
                const daysLeft = Math.ceil((new Date(promo.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                const isExpiring = daysLeft <= 3;
                
                return (
                  <Card key={promo.id} className={isExpiring ? 'border-orange-200' : ''}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {promo.listingImage && (
                            <img src={promo.listingImage} alt="" className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <CardTitle className="text-base">{promo.listingTitle}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{promo.type}</Badge>
                              {promo.autoRenew && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <RotateCw className="w-3 h-3 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">Läuft ab:</span>
                        <span className={`font-medium ${isExpiring ? 'text-orange-600' : ''}`}>
                          <Clock className="w-3 h-3 inline mr-1" />
                          {daysLeft} Tag{daysLeft > 1 ? 'e' : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Investiert:</span>
                        <span className="font-medium">€{promo.amount.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Listings Tab */}
        <TabsContent value="listings" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Meine Anzeigen</h3>
            <Link to={createPageUrl('NewListing')}>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Neue Anzeige
              </Button>
            </Link>
          </div>

          {myListings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="mb-4">Noch keine Anzeigen</p>
                <Link to={createPageUrl('NewListing')}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Anzeige erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map(listing => {
                const activePromo = activePromotions.find(p => p.listingId === listing.id);
                
                return (
                  <Card key={listing.id}>
                    <CardContent className="pt-4">
                      {listing.images?.[0] && (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-40 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h4 className="font-semibold mb-1 line-clamp-2">{listing.title}</h4>
                      <div className="text-lg font-bold text-green-600 mb-2">
                        €{listing.price}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {listing.featured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {activePromo && (
                          <Badge className="bg-blue-100 text-blue-800">
                            Promoted
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Link to={createPageUrl('ListingDetail') + `?id=${listing.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="w-3 h-3 mr-1" />
                            Ansehen
                          </Button>
                        </Link>
                        {!activePromo && (
                          <QuickPromoteButton
                            listingId={listing.id}
                            listingTitle={listing.title}
                            variant="outline"
                            size="sm"
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Verkäufe & Verhandlungen</h3>
            <Link to={createPageUrl('MySales')}>
              <Button variant="outline">
                Alle anzeigen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {chats.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Noch keine Verkäufe</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {chats.slice(0, 5).map(chat => {
                const statusColors = {
                  in_attesa: 'bg-yellow-100 text-yellow-800',
                  accettata: 'bg-green-100 text-green-800',
                  completata: 'bg-blue-100 text-blue-800',
                  rifiutata: 'bg-red-100 text-red-800'
                };
                
                return (
                  <Card key={chat.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {chat.listingImage && (
                            <img src={chat.listingImage} alt="" className="w-12 h-12 object-cover rounded" />
                          )}
                          <div>
                            <div className="font-medium">{chat.listingTitle}</div>
                            <div className="text-sm text-slate-600">
                              Käufer: {chat.buyerId}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[chat.status]}>
                            {chat.status === 'completata' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {chat.status}
                          </Badge>
                          {chat.lastPrice && (
                            <div className="text-lg font-bold text-green-600 mt-1">
                              €{chat.lastPrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}