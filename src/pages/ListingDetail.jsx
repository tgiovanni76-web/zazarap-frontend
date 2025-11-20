import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Tag } from 'lucide-react';
import { format } from 'date-fns';

export default function ListingDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Annuncio non trovato</h2>
          <Link to={createPageUrl('Marketplace')}>
            <Button>Torna al marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link to={createPageUrl('Marketplace')}>
          <Button variant="outline" className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Torna agli annunci
          </Button>
        </Link>

        <Card className="overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-slate-200 overflow-hidden">
              {listing.image ? (
                <img 
                  src={listing.image} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl">📦</div>
              )}
            </div>

            <CardContent className="p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{listing.title}</h1>
              
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-indigo-600">€{listing.price?.toFixed(2)}</span>
              </div>

              <div className="space-y-4 mb-6">
                {listing.category && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Tag className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">Categoria:</span>
                    <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                      {listing.category}
                    </Badge>
                  </div>
                )}

                {listing.city && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span className="font-medium">Località:</span>
                    <span>{listing.city}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span className="font-medium">Pubblicato il:</span>
                  <span>{format(new Date(listing.created_date), 'dd/MM/yyyy')}</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-3">Descrizione</h2>
                <p className="text-slate-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              <div className="mt-8 pt-6 border-t">
                <p className="text-sm text-slate-500 mb-4">
                  Contatta il venditore per maggiori informazioni
                </p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6">
                  Contatta il venditore
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}