import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerReviewForm({ chat, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    shipping: 0,
    accuracy: 0
  });
  const [comment, setComment] = useState('');
  const [recommend, setRecommend] = useState(true);

  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.SellerReview.create(data);
    },
    onSuccess: () => {
      toast.success('Bewertung abgegeben!');
      queryClient.invalidateQueries(['sellerReviews']);
      queryClient.invalidateQueries(['myChats']);
      onClose();
    },
    onError: (error) => {
      toast.error('Fehler: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (ratings.overall === 0) {
      toast.error('Bitte gib eine Gesamtbewertung ab');
      return;
    }

    createReviewMutation.mutate({
      sellerId: chat.sellerId,
      buyerId: chat.buyerId,
      chatId: chat.id,
      rating: ratings.overall,
      communicationRating: ratings.communication,
      shippingRating: ratings.shipping,
      accuracyRating: ratings.accuracy,
      comment,
      wouldRecommend: recommend,
      verified: true
    });
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="mb-4">
      <Label className="mb-2 block">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Verkäufer bewerten</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating
            label="Gesamtbewertung *"
            value={ratings.overall}
            onChange={(v) => setRatings(prev => ({ ...prev, overall: v }))}
          />

          <StarRating
            label="Kommunikation"
            value={ratings.communication}
            onChange={(v) => setRatings(prev => ({ ...prev, communication: v }))}
          />

          <StarRating
            label="Versand / Lieferung"
            value={ratings.shipping}
            onChange={(v) => setRatings(prev => ({ ...prev, shipping: v }))}
          />

          <StarRating
            label="Artikelbeschreibung"
            value={ratings.accuracy}
            onChange={(v) => setRatings(prev => ({ ...prev, accuracy: v }))}
          />

          <div>
            <Label htmlFor="comment">Kommentar (optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Teile deine Erfahrungen..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="recommend"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="recommend" className="cursor-pointer flex items-center gap-2">
              <ThumbsUp className="w-4 h-4" />
              Ich würde diesen Verkäufer empfehlen
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={createReviewMutation.isPending || ratings.overall === 0}
              className="flex-1"
            >
              {createReviewMutation.isPending ? 'Wird gespeichert...' : 'Bewertung abgeben'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}