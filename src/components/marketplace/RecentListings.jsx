import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../LanguageProvider';

const statusColors = {
  active: 'bg-green-100 text-green-800 border-green-200',
  sold: 'bg-blue-100 text-blue-800 border-blue-200',
  expired: 'bg-gray-100 text-gray-800 border-gray-200'
};

export default function RecentListings({ listings }) {
  const { t } = useLanguage();
  const recentListings = listings.slice(0, 5);

  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t('dashboard.recentListings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentListings.map((listing) => (
            <div 
              key={listing.id} 
              className="flex items-center gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-slate-400">📦</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{listing.title}</h4>
                <p className="text-sm text-slate-500">{format(new Date(listing.created_date), 'MMM d, yyyy')}</p>
                {listing.city && (
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{listing.city}</span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-lg font-bold text-slate-900">€{listing.price}</p>
                <Badge className={`${statusColors[listing.status] || statusColors.active} border mt-1`}>
                  {t(listing.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}