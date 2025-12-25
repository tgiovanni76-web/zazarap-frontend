import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calendar, CreditCard, TrendingUp, XCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useLanguage } from '@/components/LanguageProvider';

export default function MySubscriptions() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['myPromotions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.ListingPromotion.filter({ created_by: user.email }, '-created_date', 100);
    },
    enabled: !!user
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['myListingsForSubs', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Listing.filter({ created_by: user.email }, '-created_date', 200);
    },
    enabled: !!user
  });

  const cancelMutation = useMutation({
    mutationFn: ({ promotionId, immediate }) => 
      base44.functions.invoke('cancelRecurringPromotion', { 
        promotionId, 
        cancelAtPeriodEnd: !immediate 
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myPromotions'] });
      toast.success(variables.immediate ? t('subscriptions.cancelledImmediately') : t('subscriptions.cancelledAtPeriodEnd'));
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || t('subscriptions.cancelFailed'));
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t('subscriptions.loginRequired')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{t('subscriptions.loginMessage')}</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="mt-4">
              {t('header.nav.login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeSubscriptions = promotions.filter(p => p.autoRenew && p.stripeSubscriptionId);
  const oneTimePromotions = promotions.filter(p => !p.autoRenew && p.status === 'paid');
  const listingMap = Object.fromEntries(listings.map(l => [l.id, l]));

  const handleCancel = (promotionId, immediate = false) => {
    if (window.confirm(immediate 
      ? t('subscriptions.confirmCancelImmediate')
      : t('subscriptions.confirmCancelPeriodEnd'))) {
      cancelMutation.mutate({ promotionId, immediate });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('subscriptions.title')}</h1>
          <p className="text-gray-600 mt-1">{t('subscriptions.subtitle')}</p>
        </div>

        {/* Active Subscriptions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#d62828]" />
            {t('subscriptions.activeRecurring')} ({activeSubscriptions.length})
          </h2>

          {activeSubscriptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{t('subscriptions.noActive')}</p>
                <Link to={createPageUrl('Werbung')}>
                  <Button className="mt-4 bg-[#d62828] hover:bg-[#b91818]">
                    {t('subscriptions.browsePackages')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeSubscriptions.map((promo) => {
                const listing = listingMap[promo.listingId];
                const nextRenewal = new Date(promo.endDate);
                const daysUntilRenewal = Math.ceil((nextRenewal - Date.now()) / (1000 * 60 * 60 * 24));
                const isPendingCancellation = promo.status === 'pending_cancellation';

                return (
                  <Card key={promo.id} className={`${isPendingCancellation ? 'border-yellow-300' : 'border-[#d62828]'}`}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {promo.type === 'featured' ? '⭐ Featured' : '🔝 TOP'} Promotion
                            {isPendingCancellation && (
                             <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                               {t('subscriptions.cancellingSoon')}
                             </Badge>
                            )}
                          </CardTitle>
                          {listing && (
                            <p className="text-sm text-gray-600 mt-1">
                              For: <Link to={createPageUrl('ListingDetail') + `?id=${listing.id}`} className="text-[#d62828] hover:underline">
                                {listing.title}
                              </Link>
                            </p>
                          )}
                        </div>
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {promo.renewalFrequency}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">{t('subscriptions.cost')}</p>
                            <p className="font-semibold">€{promo.amount?.toFixed(2)} / {promo.renewalFrequency === 'weekly' ? t('subscriptions.week') : t('subscriptions.month')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">{t('subscriptions.nextRenewal')}</p>
                            <p className="font-semibold">{nextRenewal.toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{t('subscriptions.inDays', { days: daysUntilRenewal })}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <div>
                            <p className="text-xs text-gray-500">{t('subscriptions.status')}</p>
                            <p className="font-semibold text-green-600">{t('subscriptions.active')}</p>
                          </div>
                        </div>
                      </div>

                      {!isPendingCancellation && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(promo.id, false)}
                            disabled={cancelMutation.isPending}
                          >
                            {t('subscriptions.cancelPeriodEnd')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(promo.id, true)}
                            disabled={cancelMutation.isPending}
                          >
                            {t('subscriptions.cancelImmediately')}
                          </Button>
                        </div>
                      )}

                      {isPendingCancellation && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div className="text-sm text-yellow-800">
                            <p className="font-semibold">{t('subscriptions.cancellationScheduled')}</p>
                            <p>{t('subscriptions.retainAccess', { date: nextRenewal.toLocaleDateString() })}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* One-time Promotions */}
        {oneTimePromotions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              {t('subscriptions.oneTimePromotions')} ({oneTimePromotions.length})
            </h2>

            <div className="space-y-4">
              {oneTimePromotions.map((promo) => {
                const listing = listingMap[promo.listingId];
                const endDate = new Date(promo.endDate);
                const isExpired = endDate < Date.now();

                return (
                  <Card key={promo.id} className="border-gray-300">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {promo.type === 'featured' ? '⭐ Featured' : '🔝 TOP'} Promotion
                          </CardTitle>
                          {listing && (
                            <p className="text-sm text-gray-600 mt-1">
                              For: <Link to={createPageUrl('ListingDetail') + `?id=${listing.id}`} className="text-[#d62828] hover:underline">
                                {listing.title}
                              </Link>
                            </p>
                          )}
                        </div>
                        <Badge className={isExpired ? "bg-gray-200 text-gray-700" : "bg-blue-100 text-blue-800"}>
                          {isExpired ? t('subscriptions.expired') : t('subscriptions.active')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">{t('subscriptions.duration')}</p>
                          <p className="font-semibold">{promo.durationDays} {t('subscriptions.days')}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('subscriptions.expires')}</p>
                          <p className="font-semibold">{endDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('subscriptions.cost')}</p>
                          <p className="font-semibold">€{promo.amount?.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">{t('subscriptions.payment')}</p>
                          <p className="font-semibold">{promo.paypalOrderId ? 'PayPal' : 'Stripe'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Profile Subscription Status */}
        {user.subscriptionActive && (
          <Card className="mt-8 bg-gradient-to-r from-[#d62828] to-[#f77f00] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {t('subscriptions.premiumMember')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">
                {t('subscriptions.plan')}: <span className="font-semibold">{user.subscriptionPlan || t('subscriptions.active')}</span>
              </p>
              <p className="text-xs opacity-75 mt-1">
                {t('subscriptions.premiumFeatures')}
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d62828] mx-auto"></div>
            <p className="text-gray-600 mt-2">{t('subscriptions.loading')}</p>
          </div>
        )}
      </div>
    </div>
  );
}