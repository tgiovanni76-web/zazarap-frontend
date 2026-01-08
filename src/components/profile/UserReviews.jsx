import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function UserReviews({ userId, canReview = false, orderId = null }) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewType, setReviewType] = useState('seller');
  const [selectedBadges, setSelectedBadges] = useState([]);
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['userRatings', userId],
    queryFn: () => base44.entities.UserRating.filter({ reviewedUserId: userId }, '-created_date'),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return base44.entities.UserRating.create(reviewData);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['userRatings'] });
      
      // Update user stats
      const avgRating = [...reviews, { rating }].reduce((sum, r) => sum + r.rating, 0) / (reviews.length + 1);
      const userToUpdate = await base44.asServiceRole.entities.User.filter({ email: userId });
      
      if (userToUpdate.length > 0) {
        const stats = reviewType === 'seller' ? 'sellerStats' : 'buyerStats';
        await base44.asServiceRole.entities.User.update(userToUpdate[0].id, {
          [stats]: {
            ...userToUpdate[0][stats],
            averageRating: avgRating,
            totalReviews: reviews.length + 1
          }
        });
      }

      // Recalculate badges
      await base44.functions.invoke('calculateUserBadges', { targetUserId: userId });

      toast.success('Recensione pubblicata!');
      setShowReviewForm(false);
      setRating(0);
      setComment('');
      setSelectedBadges([]);
    },
    onError: () => {
      toast.error('Errore nella pubblicazione della recensione');
    }
  });

  const handleSubmitReview = () => {
    if (rating === 0) {
      toast.error('Seleziona una valutazione');
      return;
    }

    addReviewMutation.mutate({
      reviewerId: currentUser.email,
      reviewedUserId: userId,
      orderId,
      rating,
      comment: comment.trim(),
      reviewType,
      badges: selectedBadges
    });
  };

  const badgeOptions = [
    { id: 'veloce', label: '⚡ Veloce', type: 'seller' },
    { id: 'affidabile', label: '✅ Affidabile', type: 'both' },
    { id: 'comunicativo', label: '💬 Comunicativo', type: 'both' },
    { id: 'puntuale', label: '⏰ Puntuale', type: 'buyer' },
    { id: 'cortese', label: '😊 Cortese', type: 'both' },
    { id: 'professionale', label: '👔 Professionale', type: 'seller' },
  ];

  const toggleBadge = (badgeId) => {
    setSelectedBadges(prev => 
      prev.includes(badgeId) 
        ? prev.filter(b => b !== badgeId)
        : [...prev, badgeId]
    );
  };

  if (isLoading) {
    return <div className="animate-pulse bg-slate-100 h-32 rounded-lg"></div>;
  }

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recensioni ({reviews.length})
          </CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {canReview && !showReviewForm && (
          <Button onClick={() => setShowReviewForm(true)} className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Lascia una recensione
          </Button>
        )}

        {showReviewForm && (
          <div className="border-2 border-slate-200 rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo recensione</label>
              <div className="flex gap-2">
                <Button
                  variant={reviewType === 'seller' ? 'default' : 'outline'}
                  onClick={() => setReviewType('seller')}
                >
                  Come Venditore
                </Button>
                <Button
                  variant={reviewType === 'buyer' ? 'default' : 'outline'}
                  onClick={() => setReviewType('buyer')}
                >
                  Come Acquirente
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Valutazione</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`h-8 w-8 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Badge (opzionale)</label>
              <div className="flex flex-wrap gap-2">
                {badgeOptions
                  .filter(b => b.type === 'both' || b.type === reviewType)
                  .map(badge => (
                    <Badge
                      key={badge.id}
                      variant={selectedBadges.includes(badge.id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleBadge(badge.id)}
                    >
                      {badge.label}
                    </Badge>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Commento</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Racconta la tua esperienza..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} disabled={addReviewMutation.isPending}>
                Pubblica
              </Button>
              <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                Annulla
              </Button>
            </div>
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-center text-slate-500 py-8">Nessuna recensione ancora</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.reviewerId}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">
                      {review.reviewType === 'seller' ? 'Venditore' : 'Acquirente'}
                    </Badge>
                    <p className="text-xs text-slate-500 mt-1">
                      {format(new Date(review.created_date), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
                
                {review.badges && review.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {review.badges.map((badge, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {badgeOptions.find(b => b.id === badge)?.label || badge}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {review.comment && (
                  <p className="text-sm text-slate-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}