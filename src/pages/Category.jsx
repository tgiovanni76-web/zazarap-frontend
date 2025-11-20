import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

export default function Category() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('name') || 'animali';

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const categoryListings = listings.filter(
    listing => listing.category === category && listing.status === 'active'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to={createPageUrl('Marketplace')}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold capitalize">{category}</h2>
      </div>

      {categoryListings.length === 0 ? (
        <p className="text-slate-500">Nessun annuncio in questa categoria</p>
      ) : (
        <div className="space-y-4">
          {categoryListings.map(listing => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3">{listing.title}</h3>
                {listing.image && (
                  <img 
                    src={listing.image} 
                    alt={listing.title} 
                    className="w-full max-w-md mb-4 rounded"
                  />
                )}
                <p className="text-slate-700 mb-3">{listing.description}</p>
                <p className="text-lg font-bold mb-3">{listing.price} €</p>
                <Link to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
                  <Button variant="outline">Dettagli</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}