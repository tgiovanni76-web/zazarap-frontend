import React from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SelectListingModal({ open, onClose, listings = [], packageName, days, price, onConfirm }) {
  const { t } = useLanguage();
  const [selected, setSelected] = React.useState("");

  React.useEffect(() => {
    if (!open) setSelected("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t('ads.modal.select.title', { pkg: packageName, days, price: price.toFixed(2) })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {listings.length === 0 ? (
            <div className="text-sm text-slate-600">
              Non hai annunci attivi. Crea un nuovo annuncio e riprova.
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium mb-1 block">{t('ads.modal.select.chooseListing')}</label>
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger>
                  <SelectValue placeholder={t('ads.modal.select.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {listings.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={() => onConfirm && selected && onConfirm(selected)} disabled={!selected || listings.length === 0} className="bg-[#d62020] hover:bg-[#b91818]">Attiva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}