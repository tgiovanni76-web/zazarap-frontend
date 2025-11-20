import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Calendar, Tag, Heart, MessageSquare, Star } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ListingDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', listingId],
    queryFn: () => base44.entities.Review.filter({ listing_id: listingId }),
    enabled: !!listingId
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user
  });

  const isFavorite = favorites.some(fav => fav.listing_id === listingId);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const fav = favorites.find(f => f.listing_id === listingId);
        await base44.entities.Favorite.delete(fav.id);
      } else {
        await base44.entities.Favorite.create({
          listing_id: listingId,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(isFavorite ? 'Rimosso dai preferiti' : 'Aggiunto ai preferiti');
    }
  });

  const addReviewMutation = useMutation({
    mutationFn: (data) => base44.entities.Review.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setReviewComment('');
      toast.success('Recensione aggiunta');
    }
  });

  const handleAddReview = () => {
    if (!reviewComment.trim()) return;
    addReviewMutation.mutate({
      listing_id: listingId,
      reviewer_email: user.email,
      rating: reviewRating,
      comment: reviewComment
    });
  };

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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold mb-6">{listing.title}</h2>

      {listing.images && listing.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-4 max-w-2xl">
          {listing.images.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`${listing.title} ${idx + 1}`} 
              className="w-full rounded"
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 mb-4">
        {user && (
          <>
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={() => toggleFavoriteMutation.mutate()}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Salvato' : 'Salva'}
            </Button>
            {listing.created_by !== user.email && (
              <Link to={createPageUrl('Messages')}>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contatta
                </Button>
              </Link>
            )}
          </>
        )}
      </div>

      <p className="text-slate-700 mb-4">{listing.description}</p>
      <p className="text-2xl font-bold mb-2">{listing.price} €</p>
      <p className="text-slate-600 mb-6 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        {listing.city}
      </p>

      {reviews.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold">{avgRating}</span>
          <span className="text-slate-600">({reviews.length} recensioni)</span>
        </div>
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-4">Recensioni</h3>
          
          {user && (
            <div className="mb-6 p-4 bg-slate-50 rounded">
              <div className="flex items-center gap-2 mb-3">
                <label className="font-medium">Valutazione:</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="px-3 py-1 border rounded"
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n} stelle</option>
                  ))}
                </select>
              </div>
              <Textarea
                placeholder="Scrivi una recensione..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mb-3"
              />
              <Button onClick={handleAddReview} disabled={!reviewComment.trim()}>
                Aggiungi recensione
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 mb-1">{review.reviewer_email}</p>
                <p className="text-slate-700">{review.comment}</p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-slate-500">Nessuna recensione</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Link to={createPageUrl('Marketplace')} className="text-indigo-600 hover:underline">
        Torna indietro
      </Link>
    </div>
  );
}