import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { variantUrl } from './variantUrl';

export default function ImageLightbox({ open, onOpenChange, images = [], index = 0, onIndexChange, title = '' }) {
  const count = images.length || 0;
  const goPrev = () => onIndexChange((index - 1 + count) % count);
  const goNext = () => onIndexChange((index + 1) % count);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, count]);

  if (!count) return null;
  const current = images[index];
  const src = variantUrl(current, 'full') || current;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen bg-black p-0 border-0 text-white">
        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenChange(false)}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/70 text-white rounded-full"
          aria-label="Chiudi"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Prev */}
        {count > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/70 text-white rounded-full"
            aria-label="Immagine precedente"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}

        {/* Next */}
        {count > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/70 text-white rounded-full"
            aria-label="Immagine successiva"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        )}

        <div className="w-full h-full flex items-center justify-center select-none">
          <img
            src={src}
            alt={`${title} ${index + 1} / ${count}`}
            className="max-w-[calc(100vw-96px)] max-h-[calc(100vh-96px)] object-contain"
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}