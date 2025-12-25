import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from '@/components/LanguageProviderV2';

export default function RequestAdModalV2({ open, onClose, packageId, packages, onSubmit }) {
  const { t } = useLanguage();
  const [message, setMessage] = React.useState('');
  const pkg = packages?.[packageId];

  const handleSubmit = () => {
    onSubmit({ message });
    setMessage('');
  };

  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('ads.modal.request.title', { 
              pkg: pkg.packageCode ? t(`pricing.${pkg.packageCode}.title`) : pkg.name,
              price: pkg.displayPrice 
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('ads.modal.request.desc')}</p>
          
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('ads.modal.request.placeholder')}
            rows={5}
          />

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleSubmit}
              className="bg-[#d62020] hover:bg-[#b91818]"
            >
              {t('ads.modal.request.submit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}