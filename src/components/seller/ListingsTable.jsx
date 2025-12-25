import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { BarChart3 } from 'lucide-react';

export default function ListingsTable({ listings = [], onUnfeature }) {
  return (
    <div className="overflow-auto rounded border">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-left p-3">Annuncio</th>
            <th className="text-left p-3">Prezzo</th>
            <th className="text-left p-3">Engagement</th>
            <th className="text-left p-3">Scadenza</th>
            <th className="text-left p-3">Promozione</th>
            <th className="text-right p-3">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {listings.map(l => (
            <tr key={l.id} className="border-t">
              <td className="p-3">
                <div className="font-medium truncate max-w-[260px]">{l.title}</div>
                <div className="text-xs text-slate-500">Views {l.views} • Click {l.clicks} • Offerte {l.offers}</div>
              </td>
              <td className="p-3">
                {l.offerPrice ? (
                  <div>
                    <div className="font-semibold text-green-700">{l.offerPrice}€</div>
                    <div className="text-xs line-through text-slate-400">{l.price}€</div>
                  </div>
                ) : (
                  <div className="font-semibold">{l.price}€</div>
                )}
              </td>
              <td className="p-3">
                <div className="text-xs">Views {l.views}</div>
                <div className="text-xs">Clicks {l.clicks}</div>
                <div className="text-xs">Offers {l.offers}</div>
              </td>
              <td className="p-3 text-xs">
                {l.expiresAt ? new Date(l.expiresAt).toLocaleString() : '—'}
              </td>
              <td className="p-3">
                {l.featured ? (
                  <Badge className="bg-yellow-100 text-yellow-800">In evidenza{l.featuredUntil ? ` • fino al ${new Date(l.featuredUntil).toLocaleDateString()}` : ''}</Badge>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="p-3 text-right space-x-2 whitespace-nowrap">
                <Link to={createPageUrl('PromoteListing') + `?id=${l.id}`}>
                  <Button size="sm" variant="outline">Promuovi</Button>
                </Link>
                {l.featured && (
                  <Button size="sm" variant="outline" onClick={() => onUnfeature(l.id)}>Rimuovi evidenza</Button>
                )}
                <Link to={createPageUrl('EditListing') + `?id=${l.id}`}>
                  <Button size="sm">Modifica</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}