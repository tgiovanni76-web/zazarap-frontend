import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Package, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function UserStats({ user, isOwnProfile }) {
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
              Statistiche Venditore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Vendite</p>
                <p className="text-2xl font-bold">{sellerStats.totalSales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Fatturato</p>
                <p className="text-2xl font-bold">{(sellerStats.totalRevenue || 0).toFixed(0)}€</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Valutazione</p>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-2xl font-bold">{(sellerStats.averageRating || 0).toFixed(1)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Recensioni</p>
                <p className="text-2xl font-bold">{sellerStats.totalReviews || 0}</p>
              </div>
            </div>
            {sellerStats.responseTime && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                Tempo di risposta medio: {sellerStats.responseTime}
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
              Statistiche Acquirente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-slate-600">Acquisti</p>
                <p className="text-2xl font-bold">{buyerStats.totalPurchases || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Speso</p>
                <p className="text-2xl font-bold">{(buyerStats.totalSpent || 0).toFixed(0)}€</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Valutazione</p>
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <p className="text-2xl font-bold">{(buyerStats.averageRating || 0).toFixed(1)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600">Recensioni</p>
                <p className="text-2xl font-bold">{buyerStats.totalReviews || 0}</p>
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
              Badge e Riconoscimenti
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