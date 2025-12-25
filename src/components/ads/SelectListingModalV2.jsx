import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageProviderV2';

export default function SelectListingModalV2({ open, onClose, listings, packageName, days, price, onConfirm }) {
  const { t } = useLanguage();
  const [selectedListing, setSelectedListing] = React.useState('');

  const handleConfirm = () => {
    if (!selectedListing) return;
    onConfirm(selectedListing);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ads.modal.select.title', { pkg: packageName, days, price })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('ads.modal.select.chooseListing')}</label>
            <Select value={selectedListing} onValueChange={setSelectedListing}>
              <SelectTrigger>
                <SelectValue placeholder={t('ads.modal.select.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {listings.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {t('ads.modal.select.noListings')}
                  </div>
                )}
                {listings.map(listing => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedListing}
              className="bg-[#d62020] hover:bg-[#b91818]"
            >
              {t('ads.modal.select.activate')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}