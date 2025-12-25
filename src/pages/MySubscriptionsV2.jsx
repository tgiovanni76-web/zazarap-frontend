import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProviderV2';

export default function MySubscriptionsV2() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const { data: promotions = [] } = useQuery({
    queryKey: ['myPromotions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.ListingPromotion.filter({ created_by: user.email }, '-updated_date', 100);
    },
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['myListings', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Listing.filter({ created_by: user.email }, '-updated_date', 100);
    },
    enabled: !!user,
  });

  const cancelMutation = useMutation({
    mutationFn: async (promoId) => {
      const response = await base44.functions.invoke('cancelRecurringPromotion', { promotionId: promoId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPromotions'] });
      toast.success(t('subs.cancelSuccess'));
    },
    onError: (error) => {
      toast.error(t('common.error'));
    }
  });

  const handleCancel = async (promo) => {
    if (!confirm(t('subs.confirmCancel'))) return;
    cancelMutation.mutate(promo.id);
  };

  const getListingTitle = (listingId) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || listingId;
  };

  const activeRecurring = promotions.filter(p => p.autoRenew && p.status === 'paid');
  const oneTime = promotions.filter(p => !p.autoRenew && ['paid', 'pending'].includes(p.status));

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#d62020]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-gray-600 mb-4">{t('auth.loginOrRegister')}</p>
        <Button onClick={() => base44.auth.redirectToLogin()}>{t('auth.loginOrRegister')}</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('subs.mySubscriptions')}</h1>

        {/* Premium Membership Card */}
        {user.subscriptionActive && (
          <Card className="mb-8 border-2 border-[#d62020] bg-gradient-to-br from-white to-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#d62020]">
                <Sparkles className="h-5 w-5" />
                {t('subs.premiumMember')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{user.subscriptionPlan || t('subs.upgradeToPremium')}</p>
            </CardContent>
          </Card>
        )}

        {/* Active Recurring Subscriptions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('subs.activeSubscriptions')}</h2>
          {activeRecurring.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {t('subs.noActive')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeRecurring.map(promo => (
                <Card key={promo.id} className="border-l-4 border-[#d62020]">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{getListingTitle(promo.listingId)}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-blue-100 text-blue-800">{promo.type}</Badge>
                          <Badge variant="outline">{promo.renewalFrequency}</Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCancel(promo)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        {t('subs.cancel')}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{t('subs.renewsOn')}: {promo.endDate ? format(new Date(promo.endDate), 'dd.MM.yyyy') : '-'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">€{promo.amount} / {promo.renewalFrequency === 'weekly' ? 'Woche' : 'Monat'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* One-time Promotions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('subs.oneTimePromotions')}</h2>
          {oneTime.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {t('subs.noPromos')}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {oneTime.map(promo => (
                <Card key={promo.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{getListingTitle(promo.listingId)}</CardTitle>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-purple-100 text-purple-800">{promo.type}</Badge>
                          <Badge variant="outline">{promo.durationDays} Tage</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{t('subs.expiresOn')}: {promo.endDate ? format(new Date(promo.endDate), 'dd.MM.yyyy') : '-'}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">€{promo.amount}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}