import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from './LanguageProvider';

const reportReasons = [
  { value: 'illegal_content', labelKey: 'report.illegalContent' },
  { value: 'spam', labelKey: 'spam' },
  { value: 'scam', labelKey: 'scam' },
  { value: 'inappropriate', labelKey: 'inappropriate' },
  { value: 'wrong_category', labelKey: 'report.wrongCategory' },
  { value: 'fake_listing', labelKey: 'report.fakeListing' },
  { value: 'other', labelKey: 'other' }
];

export default function ReportListingModal({ open, onClose, listingId, listingTitle, sellerEmail, user }) {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Report.create(data);
    },
    onSuccess: () => {
      toast.success(t('report.success') || 'Segnalazione inviata');
      onClose();
      setReason('');
      setDescription('');
    },
    onError: () => {
      toast.error(t('error') || 'Errore nell\'invio della segnalazione');
    }
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error(t('selectReason') || 'Seleziona un motivo');
      return;
    }

    reportMutation.mutate({
      reporterId: user.email,
      reportedUserId: sellerEmail,
      chatId: listingId, // Using listingId as reference
      reason: reason,
      description: `[Listing: ${listingTitle}] ${description}`,
      status: 'pending'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('report.listing') || 'Segnala annuncio'}
          </DialogTitle>
          <DialogDescription>
            {t('report.listingDesc') || 'Segnala questo annuncio se viola le nostre regole'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('reason')}</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    {t(r.labelKey) || r.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('description')}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('report.descPlaceholder') || 'Descrivi il problema...'}
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={reportMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {reportMutation.isPending ? t('loading') : t('sendReport')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}