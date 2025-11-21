import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from 'lucide-react';

export default function FeaturedListings({ listings }) {
  const now = new Date();
  const featuredListings = listings.filter(l => 
    l.featured && 
    l.status === 'active' && 
    (!l.featuredUntil || new Date(l.featuredUntil) > now)
  ).slice(0, 6);

  if (featuredListings.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        <h3 className="text-2xl font-bold">Annunci in Evidenza</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {featuredListings.map(listing => (
          <Link key={listing.id} to={createPageUrl('ListingDetail') + '?id=' + listing.id}>
            <Card className="h-full hover:shadow-lg transition-shadow border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-white">
              <CardContent className="p-0">
                {listing.images?.[0] && (
                  <div className="relative">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t"
                    />
                    <Badge className="absolute top-2 right-2 bg-yellow-500 text-black">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      In Evidenza
                    </Badge>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">{listing.title}</h4>
                  <p className="text-2xl font-bold text-red-600 mb-2">{listing.price} €</p>
                  {listing.city && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {listing.city}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}