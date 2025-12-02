import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2, ThumbsUp, MessageSquare, Package, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const ratingCategories = [
  { key: 'overallRating', label: 'Valutazione Complessiva', icon: Star, required: true },
  { key: 'reliabilityRating', label: 'Affidabilità', icon: Shield },
  { key: 'communicationRating', label: 'Comunicazione', icon: MessageSquare },
];

const sellerOnlyCategories = [
  { key: 'productQualityRating', label: 'Qualità Prodotto', icon: Package },
];

const positiveTags = [
  { value: 'puntuale', label: '⏰ Puntuale' },
  { value: 'cordiale', label: '😊 Cordiale' },
  { value: 'affidabile', label: '✅ Affidabile' },
  { value: 'comunicativo', label: '💬 Comunicativo' },
  { value: 'prodotto_conforme', label: '📦 Prodotto conforme' },
  { value: 'spedizione_veloce', label: '🚀 Spedizione veloce' },
  { value: 'imballaggio_curato', label: '📦 Imballaggio curato' },
  { value: 'consigliato', label: '👍 Consigliato' },
];

function StarRating({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0);
  const starSize = size === 'lg' ? 'h-8 w-8' : 'h-5 w-5';
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star 
            className={`${starSize} ${
              star <= (hover || value) 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`} 
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ 
  open, 
  onClose, 
  chatId,
  listingId,
  ratedEmail,
  raterEmail,
  raterRole,
  listingTitle,
  transactionAmount
}) {
  const queryClient = useQueryClient();
  const isRatingSeller = raterRole === 'buyer';
  
  const [ratings, setRatings] = useState({
    overallRating: 0,
    reliabilityRating: 0,
    communicationRating: 0,
    productQualityRating: 0,
  });
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const categories = isRatingSeller 
    ? [...ratingCategories, ...sellerOnlyCategories]
    : ratingCategories;

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      const review = await base44.entities.UserRating.create({
        chatId,
        listingId,
        raterEmail,
        ratedEmail,
        raterRole,
        overallRating: ratings.overallRating,
        reliabilityRating: ratings.reliabilityRating || null,
        communicationRating: ratings.communicationRating || null,
        productQualityRating: isRatingSeller ? ratings.productQualityRating || null : null,
        comment: comment.trim(),
        tags: selectedTags,
        transactionAmount
      });

      // Send notification to rated user
      await base44.entities.Notification.create({
        userId: ratedEmail,
        type: 'message',
        title: '⭐ Hai ricevuto una recensione!',
        message: `${raterEmail.split('@')[0]} ti ha lasciato una recensione di ${ratings.overallRating} stelle`,
        linkUrl: '/UserProfile?email=' + encodeURIComponent(ratedEmail),
        relatedId: chatId
      });

      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRatings'] });
      toast.success('Recensione inviata con successo!');
      onClose();
    },
    onError: () => {
      toast.error('Errore nell\'invio della recensione');
    }
  });

  const canSubmit = ratings.overallRating > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Lascia una recensione
          </DialogTitle>
          <DialogDescription>
            {isRatingSeller ? 'Valuta il venditore' : 'Valuta l\'acquirente'} per "{listingTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Categories */}
          {categories.map(({ key, label, icon: Icon, required }) => (
            <div key={key} className="space-y-2">
              <Label className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-slate-500" />
                {label}
                {required && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex items-center gap-3">
                <StarRating 
                  value={ratings[key]} 
                  onChange={(val) => setRatings(prev => ({ ...prev, [key]: val }))}
                  size={key === 'overallRating' ? 'lg' : 'md'}
                />
                {ratings[key] > 0 && (
                  <span className="text-sm text-slate-500">
                    {ratings[key]}/5
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tag (opzionale)</Label>
            <div className="flex flex-wrap gap-2">
              {positiveTags
                .filter(tag => isRatingSeller || !['prodotto_conforme', 'spedizione_veloce', 'imballaggio_curato'].includes(tag.value))
                .map(({ value, label }) => (
                <Badge
                  key={value}
                  variant={selectedTags.includes(value) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(value) 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'hover:bg-slate-100'
                  }`}
                  onClick={() => toggleTag(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label>Commento (opzionale)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descrivi la tua esperienza..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-slate-400 text-right">{comment.length}/500</p>
          </div>

          {/* Preview */}
          {ratings.overallRating > 0 && (
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Anteprima recensione:</p>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < ratings.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
                <span className="font-bold">{ratings.overallRating}/5</span>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {positiveTags.find(t => t.value === tag)?.label}
                    </Badge>
                  ))}
                </div>
              )}
              {comment && <p className="text-sm text-slate-600 italic">"{comment}"</p>}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button 
            onClick={() => createReviewMutation.mutate()}
            disabled={!canSubmit || createReviewMutation.isPending}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            {createReviewMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Star className="h-4 w-4 mr-2" />
            )}
            Invia Recensione
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}