import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OffersList({ offers = [] }) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">Offerte in corso</h3>
        {offers.length === 0 && <div className="text-sm text-slate-400">Nessuna offerta in attesa</div>}
        <ul className="divide-y">
          {offers.map(o => (
            <li key={o.id} className="py-2 flex items-center justify-between">
              <div>
                <div className="font-medium">{o.listingTitle || o.listingId}</div>
                <div className="text-xs text-slate-500">Acquirente: {o.buyerId} • Ultimo prezzo: {o.lastPrice ? `${o.lastPrice}€` : '—'} • {new Date(o.updatedAt).toLocaleString()}</div>
              </div>
              <Link to={createPageUrl('Messages') + `?chatId=${o.id}`} className="text-indigo-600 text-sm">Vai alla chat</Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}