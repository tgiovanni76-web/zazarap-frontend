import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { variantUrl } from './variantUrl';

export default function ImageLightbox({ open, onOpenChange, images = [], index = 0, onIndexChange, title = '' }) {
  const count = images.length || 0;
  const goPrev = () => count ? onIndexChange((index - 1 + count) % count) : null;
  const goNext = () => count ? onIndexChange((index + 1) % count) : null;

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
      <DialogContent className="w-screen h-[100dvh] max-w-none max-h-none left-0 top-0 translate-x-0 translate-y-0 bg-black p-0 border-0 text-white rounded-none sm:rounded-none">
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

        <div className="w-full h-full flex items-center justify-center select-none touch-pan-y">
          <img
            src={src}
            alt={`${title} ${index + 1} / ${count}`}
            className="w-auto h-auto max-w-[min(100vw-88px,1200px)] max-h-[calc(100dvh-88px)] object-contain"
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}