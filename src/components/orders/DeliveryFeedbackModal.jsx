import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Star, Package, Zap, Box, User, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function DeliveryFeedbackModal({ open, onClose, order, shipping }) {
  const queryClient = useQueryClient();
  const [ratings, setRatings] = useState({
    deliveryRating: 5,
    speedRating: 5,
    packagingRating: 5,
    courierRating: 5
  });
  const [comment, setComment] = useState('');
  const [issues, setIssues] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const issueOptions = [
    'Ritardo nella consegna',
    'Pacco danneggiato',
    'Imballaggio inadeguato',
    'Corriere scortese',
    'Istruzioni non seguite',
    'Pacco lasciato incustodito',
    'Altro'
  ];

  const submitFeedbackMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.DeliveryFeedback.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Feedback inviato! Grazie per la tua recensione 🙏');
      onClose();
    },
    onError: () => {
      toast.error('Errore nell\'invio del feedback');
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      }
      setPhotos([...photos, ...uploadedUrls]);
      toast.success(`${files.length} foto caricate`);
    } catch (error) {
      toast.error('Errore nel caricamento foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!ratings.deliveryRating) {
      toast.error('Inserisci almeno la valutazione generale');
      return;
    }

    submitFeedbackMutation.mutate({
      orderId: order.id,
      shippingId: shipping?.id,
      userId: order.userId,
      ...ratings,
      comment,
      issues,
      photos
    });
  };

  const StarRating = ({ label, icon: Icon, value, onChange, color }) => (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className={`h-4 w-4 ${color}`} />
        {label}
      </Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Valuta la tua esperienza di consegna</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Valutazione generale */}
          <StarRating
            label="Valutazione Complessiva"
            icon={Package}
            value={ratings.deliveryRating}
            onChange={(val) => setRatings({ ...ratings, deliveryRating: val })}
            color="text-purple-600"
          />

          {/* Valutazioni dettagliate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarRating
              label="Velocità"
              icon={Zap}
              value={ratings.speedRating}
              onChange={(val) => setRatings({ ...ratings, speedRating: val })}
              color="text-blue-600"
            />

            <StarRating
              label="Imballaggio"
              icon={Box}
              value={ratings.packagingRating}
              onChange={(val) => setRatings({ ...ratings, packagingRating: val })}
              color="text-green-600"
            />

            <StarRating
              label="Corriere"
              icon={User}
              value={ratings.courierRating}
              onChange={(val) => setRatings({ ...ratings, courierRating: val })}
              color="text-orange-600"
            />
          </div>

          {/* Problemi riscontrati */}
          <div className="space-y-2">
            <Label>Hai riscontrato problemi? (opzionale)</Label>
            <div className="flex flex-wrap gap-2">
              {issueOptions.map((issue) => (
                <Badge
                  key={issue}
                  variant={issues.includes(issue) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setIssues(
                      issues.includes(issue)
                        ? issues.filter((i) => i !== issue)
                        : [...issues, issue]
                    );
                  }}
                >
                  {issue}
                </Badge>
              ))}
            </div>
          </div>

          {/* Commento */}
          <div className="space-y-2">
            <Label>Commento (opzionale)</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Raccontaci la tua esperienza..."
              rows={4}
            />
          </div>

          {/* Upload foto */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto (opzionale)
            </Label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info ordine */}
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <p className="font-medium">Ordine: {order.orderNumber}</p>
            {shipping?.trackingNumber && (
              <p className="text-slate-600">Tracking: {shipping.trackingNumber}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitFeedbackMutation.isPending}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            {submitFeedbackMutation.isPending ? 'Invio...' : 'Invia Feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}