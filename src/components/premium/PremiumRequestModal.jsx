import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PremiumRequestModal({ open, onClose, listing, user }) {
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.email || !listing?.id) return;
    setIsSubmitting(true);
    try {
      // Verhindere doppelte gleichzeitige "pending"-Anfragen pro Nutzer & Anzeige
      const existing = await base44.entities.PremiumRequest.filter({
        listingId: listing.id,
        requesterEmail: user.email,
        status: 'pending'
      });
      if (existing && existing.length > 0) {
        toast.info('Es besteht bereits eine offene Anfrage für diese Anzeige.');
        return;
      }

      await base44.entities.PremiumRequest.create({
        listingId: listing.id,
        requesterEmail: user.email,
        requesterName: user.full_name || user.email,
        companyName: companyName || undefined,
        phone: phone || undefined,
        message: message || '',
        status: 'pending'
      });
      toast.success('Anfrage gesendet – wir melden uns!');
      onClose?.();
      setCompanyName(''); setPhone(''); setMessage('');
    } catch (e) {
      toast.error('Senden fehlgeschlagen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Premium anfragen</DialogTitle>
          <DialogDescription>
            Wir prüfen Ihre Anfrage und antworten zeitnah. Für größere Kampagnen siehe
            {' '}<Link to={createPageUrl('Business')} className="text-primary underline">Business</Link>{' '}oder{' '}
            <Link to={createPageUrl('BusinessContact')} className="text-primary underline">Business-Kontakt</Link>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-sm font-medium">Ihr Name</label>
            <Input value={user?.full_name || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">E-Mail</label>
            <Input value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium">Unternehmen (optional)</label>
            <Input value={companyName} onChange={(e)=>setCompanyName(e.target.value)} placeholder="Firmenname" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefon (optional)</label>
            <Input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+49 ..." />
          </div>
          <div>
            <label className="text-sm font-medium">Nachricht</label>
            <Textarea rows={3} value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Ziel, Zeitraum, Budgetrahmen (optional)" />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-1" /> Abbrechen
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !user?.email} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black">
            {isSubmitting ? 'Wird gesendet…' : (<><Send className="h-4 w-4 mr-1" /> Senden</>)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}