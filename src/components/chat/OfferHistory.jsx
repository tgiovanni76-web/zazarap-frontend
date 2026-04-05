import React from 'react';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Check, X, RotateCcw, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

const statusConfig = {
  pending: { label: 'In attesa', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  accepted: { label: 'Accettata', color: 'bg-green-100 text-green-800', icon: Check },
  accepted_reserved: { label: 'Accettata (riservato)', color: 'bg-green-100 text-green-800', icon: Check },
  rejected: { label: 'Rifiutata', color: 'bg-red-100 text-red-800', icon: X },
  countered: { label: 'Contro-offerta', color: 'bg-blue-100 text-blue-800', icon: RotateCcw },
  withdrawn: { label: 'Ritirata', color: 'bg-slate-100 text-slate-700', icon: RotateCcw },
  expired: { label: 'Scaduta', color: 'bg-slate-100 text-slate-600', icon: Clock }
};

export default function OfferHistory({ offers, userEmail, listingPrice, lastOfferId }) {
  const { t } = useLanguage();

  if (!offers || offers.length === 0) {
    return (
      <div className="text-center text-slate-400 py-4 text-sm">
        Nessuna offerta ancora
      </div>
    );
  }

  const sortedOffers = [...offers].sort((a, b) => 
    new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date)
  );

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      <div className="text-xs text-slate-500 mb-2 flex justify-between">
        <span>Storico offerte ({offers.length})</span>
        <span>Prezzo originale: <strong>{listingPrice}€</strong></span>
      </div>
      
      {sortedOffers.map((offer, index) => {
        const isOwn = offer.senderId === userEmail;
        const config = statusConfig[offer.status] || statusConfig.pending;
        const StatusIcon = config.icon;
        const priceDiff = offer.previousAmount 
          ? ((offer.amount - offer.previousAmount) / offer.previousAmount * 100).toFixed(0)
          : ((offer.amount - listingPrice) / listingPrice * 100).toFixed(0);
        const isIncrease = parseFloat(priceDiff) > 0;

        return (
          <div 
            key={offer.id} 
            className={`p-2 rounded-lg border text-sm ${
              isOwn ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'
            } ${lastOfferId === offer.id ? 'ring-2 ring-green-500 shadow' : ''}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{offer.amount}€</span>
                {priceDiff !== '0' && (
                  <span className={`text-xs flex items-center gap-0.5 ${
                    isIncrease ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isIncrease ? '+' : ''}{priceDiff}%
                  </span>
                )}
              </div>
              <Badge className={`${config.color} text-xs flex items-center gap-1`}>
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{isOwn ? 'Tu' : offer.senderId.split('@')[0]}</span>
              <span>{format(new Date(offer.created_date), 'dd/MM HH:mm')}</span>
            </div>
            
            {offer.message && (
              <p className="text-xs text-slate-600 mt-1 italic">"{offer.message}"</p>
            )}
          </div>
        );
      })}
    </div>
  );
}