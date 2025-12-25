import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, Loader2 } from 'lucide-react';

export default function SimilarProducts({ listingId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['similarProducts', listingId],
    queryFn: async () => {
      const response = await base44.functions.invoke('findSimilarProducts', {
        listingId,
        limit: 6
      });
      return response.data;
    },
    enabled: !!listingId,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-purple-500" />
          <p className="text-sm text-slate-600 mt-2">Finde ähnliche Produkte...</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.similar || data.similar.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Ähnliche Produkte
          <Badge variant="secondary" className="ml-2">KI-gestützt</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.similar.map(listing => (
            <Link 
              key={listing.id} 
              to={createPageUrl('ListingDetail') + '?id=' + listing.id}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden border hover:shadow-lg transition-shadow">
                {listing.images?.[0] ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-sm line-clamp-2 mb-1">{listing.title}</p>
                  <p className="text-lg font-bold text-green-600 mb-2">{listing.price}€</p>
                  {listing.similarityReason && (
                    <p className="text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 line-clamp-2">
                      💡 {listing.similarityReason}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}