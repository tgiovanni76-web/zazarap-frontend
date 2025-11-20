import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from 'lucide-react';

export default function Favorites() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: favorites = [], isLoading: favLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list(),
  });

  if (favLoading || listingsLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const favoriteListings = listings.filter(listing =>
    favorites.some(fav => fav.listing_id === listing.id)
  );

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">Preferiti</h2>

      {favoriteListings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun annuncio salvato</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {favoriteListings.map(listing => (
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