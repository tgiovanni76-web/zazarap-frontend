import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function RequestAdModal({ open, onClose, packageId, packages, onSubmit }) {
  const { t } = useLanguage();
  const [message, setMessage] = React.useState("");
  const title = React.useMemo(() => {
    if (packages && packageId && packages[packageId]) return `${packages[packageId].name} • ${packages[packageId].displayPrice}`;
    return t('ads.modal.request.title');
  }, [packages, packageId, t]);

  React.useEffect(() => {
    if (!open) setMessage("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" aria-describedby="request-ad-desc">
        <DialogHeader>
          <DialogTitle>
            {(packages && packageId && packages[packageId]) ? `${packages[packageId].name} • ${packages[packageId].displayPrice}` : t('ads.modal.request.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <p id="request-ad-desc" className="text-sm text-slate-600">{t('ads.modal.request.desc')}</p>
          <Textarea rows={5} placeholder={t('ads.modal.request.placeholder')} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button onClick={() => onSubmit && onSubmit({ message, packageId })} className="bg-[#d62020] hover:bg-[#b91818]">{t('ads.modal.request.submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}