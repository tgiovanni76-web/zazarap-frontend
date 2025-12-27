import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Calendar, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function PromotionsManager({ listings }) {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['userPromotions', user?.email],
    queryFn: () => base44.entities.ListingPromotion.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user
  });

  const cancelPromotionMutation = useMutation({
    mutationFn: async (promoId) => {
      await base44.functions.invoke('cancelRecurringPromotion', { promotionId: promoId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPromotions'] });
      queryClient.invalidateQueries({ queryKey: ['sellerAnalytics'] });
      toast.success('Promotion storniert');
    }
  });

  const activePromotions = promotions.filter(p => 
    p.status === 'paid' && 
    p.endDate && 
    new Date(p.endDate) > new Date()
  );

  const expiringSoon = activePromotions.filter(p => {
    const daysUntilExpiry = Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3;
  });

  const featuredListings = listings?.filter(l => l.featured) || [];
  const nonFeaturedListings = listings?.filter(l => !l.featured) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Promotions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xs text-yellow-600 mb-1">Aktiv</div>
              <div className="text-2xl font-bold text-yellow-700">{activePromotions.length}</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-xs text-orange-600 mb-1">Featured</div>
              <div className="text-2xl font-bold text-orange-700">{featuredListings.length}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xs text-red-600 mb-1">Läuft ab</div>
              <div className="text-2xl font-bold text-red-700">{expiringSoon.length}</div>
            </div>
          </div>

          {/* Active Promotions */}
          {activePromotions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Aktive Promotions:</h4>
              {activePromotions.map(promo => {
                const listing = listings?.find(l => l.id === promo.listingId);
                const daysLeft = Math.ceil((new Date(promo.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={promo.id} className="border rounded-lg p-3 bg-slate-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">
                          {listing?.title || 'Listing'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <Badge variant="outline" className="text-xs">
                            {promo.type === 'featured' ? '⭐ Featured' : '🔝 Top'}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {daysLeft} Tage übrig
                          </span>
                        </div>
                        {promo.autoRenew && (
                          <Badge className="mt-1 bg-green-100 text-green-800 text-xs">
                            Auto-Renewal aktiv
                          </Badge>
                        )}
                      </div>
                      {promo.autoRenew && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelPromotionMutation.mutate(promo.id)}
                          className="text-xs h-7"
                        >
                          Stornieren
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expiring Soon Warning */}
          {expiringSoon.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-900 mb-1">
                ⚠️ {expiringSoon.length} Promotion(s) läuft bald ab
              </p>
              <p className="text-xs text-red-700">
                Verlängere sie, um deine Sichtbarkeit zu behalten
              </p>
            </div>
          )}

          {/* Call to Action */}
          {nonFeaturedListings.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">Erhöhe deine Verkaufschancen!</p>
                  <p className="text-xs text-slate-600 mb-3">
                    Du hast {nonFeaturedListings.length} nicht-beworbene Listings. Featured Listings erhalten 
                    durchschnittlich <strong>5x mehr Aufrufe</strong>.
                  </p>
                  <Link to={createPageUrl('NewListing')}>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                      <Plus className="h-4 w-4 mr-1" />
                      Listing bewerben
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activePromotions.length === 0 && (
            <div className="text-center py-6">
              <Zap className="h-8 w-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm text-slate-500 mb-3">Keine aktiven Promotions</p>
              <Link to={createPageUrl('Werbung')}>
                <Button size="sm" variant="outline">
                  Promotion starten
                </Button>
              </Link>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}