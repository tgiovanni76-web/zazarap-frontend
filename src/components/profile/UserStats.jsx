import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';
import { formatCurrency, formatNumber } from '@/components/utils/format';

export default function UserStats({ user, isOwnProfile }) {
  const { t, currentLanguage } = useLanguage();
  const tr = (k, fb) => { const v = t(k); return v === k ? fb : v; };
  const sellerStats = user.sellerStats || {};
  const buyerStats = user.buyerStats || {};

  return (
    <div className="space-y-4">
      {/* Seller Stats */}
      {(isOwnProfile || sellerStats.totalSales > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              {tr('profile.sellerStats','Verkäuferstatistiken')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">{tr('profile.sales','Verkäufe')}</p>
                {(sellerStats.totalSales || 0) > 0 ? (
                  <p className="text-2xl font-bold">{sellerStats.totalSales}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Verkäufe</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.revenue','Umsatz')}</p>
                {(sellerStats.totalRevenue || 0) > 0 ? (
                  <p className="text-2xl font-bold">{formatCurrency(sellerStats.totalRevenue, currentLanguage)}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Umsätze</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.rating','Bewertung')}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {(sellerStats.averageRating || 0) > 0 ? (
                    <p className="text-2xl font-bold">{formatNumber(sellerStats.averageRating, currentLanguage, 1)}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Noch keine Bewertungen</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.reviews','Bewertungen')}</p>
                {(sellerStats.totalReviews || 0) > 0 ? (
                  <p className="text-2xl font-bold">{sellerStats.totalReviews}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Bewertungen</p>
                )}
              </div>
            </div>
            {sellerStats.responseTime && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                {tr('profile.responseTime','Durchschnittliche Antwortzeit:')} {sellerStats.responseTime}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Buyer Stats */}
      {(isOwnProfile || buyerStats.totalPurchases > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-green-600" />
              {tr('profile.buyerStats','Käuferstatistiken')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">{tr('profile.purchases','Käufe')}</p>
                {(buyerStats.totalPurchases || 0) > 0 ? (
                  <p className="text-2xl font-bold">{buyerStats.totalPurchases}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Käufe</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.spent','Ausgaben')}</p>
                {(buyerStats.totalSpent || 0) > 0 ? (
                  <p className="text-2xl font-bold">{formatCurrency(buyerStats.totalSpent, currentLanguage)}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Ausgaben</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.rating','Bewertung')}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  {(buyerStats.averageRating || 0) > 0 ? (
                    <p className="text-2xl font-bold">{(buyerStats.averageRating).toFixed(1)}</p>
                  ) : (
                    <p className="text-slate-500 text-sm">Noch keine Bewertungen</p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">{tr('profile.reviews','Bewertungen')}</p>
                {(buyerStats.totalReviews || 0) > 0 ? (
                  <p className="text-2xl font-bold">{buyerStats.totalReviews}</p>
                ) : (
                  <p className="text-slate-500 text-sm">Noch keine Bewertungen</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      {user.badges && user.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              {tr('profile.badges','Badge e Riconoscimenti')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge, idx) => (
                <Badge key={idx} className="text-sm px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300">
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}