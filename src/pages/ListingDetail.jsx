import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{listing.title}</h2>
      {listing.image && (
        <img 
          src={listing.image} 
          alt={listing.title} 
          className="w-full max-w-md mb-4"
        />
      )}
      <p className="text-slate-700 mb-4">{listing.description}</p>
      <p className="text-lg mb-4"><strong>{listing.price} €</strong></p>
      <p className="text-slate-600 mb-6">{listing.city}</p>
      <Link to={createPageUrl('Marketplace')}>Torna indietro</Link>
    </div>
  );
}