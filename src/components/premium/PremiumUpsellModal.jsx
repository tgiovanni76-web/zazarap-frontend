import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

export default function PremiumUpsellModal({ open, onClose, onConfirm, copy, listing }) {
  if (!copy) return null;
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> {copy.title}</DialogTitle>
          <DialogDescription>{copy.body}</DialogDescription>
        </DialogHeader>
        {listing?.images?.[0] && (
          <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded-md" />
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>Vielleicht später</Button>
          <Button onClick={onConfirm} className="bg-primary">{copy.cta || 'Vai a Premium'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}