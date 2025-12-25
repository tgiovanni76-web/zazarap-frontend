import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/components/LanguageProviderV2';

export default function CreateAdModalV2({ open, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [title, setTitle] = React.useState('');
  const [targetUrl, setTargetUrl] = React.useState('');
  const [placement, setPlacement] = React.useState('');
  const [mediaAssetId, setMediaAssetId] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');

  const { data: mediaAssets = [] } = useQuery({
    queryKey: ['mediaAssets'],
    queryFn: async () => {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return [];
      return base44.entities.MediaAsset.filter({ created_by: user.email });
    },
    enabled: open
  });

  const handleCreate = async () => {
    if (!title || !targetUrl || !placement || !mediaAssetId) {
      setError(t('ads.create.error'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      await base44.functions.invoke('createAdvertisingAd', {
        title, targetUrl, placement, mediaAssetId, startDate, endDate
      });
      toast.success(t('ads.create.success'));
      onSuccess?.();
      onClose();
      setTitle('');
      setTargetUrl('');
      setPlacement('');
      setMediaAssetId('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(t('ads.create.error'));
      toast.error(t('ads.create.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('ads.create.newAd')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('ads.create.adTitle')}</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ads.create.targetUrl')}</label>
            <Input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ads.create.placement')}</label>
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger>
                <SelectValue placeholder={t('ads.create.selectPlacement')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage">{t('ads.create.placement.homepage')}</SelectItem>
                <SelectItem value="category">{t('ads.create.placement.category')}</SelectItem>
                <SelectItem value="search">{t('ads.create.placement.search')}</SelectItem>
                <SelectItem value="sidebar">{t('ads.create.placement.sidebar')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('ads.create.mediaAsset')}</label>
            <Select value={mediaAssetId} onValueChange={setMediaAssetId}>
              <SelectTrigger>
                <SelectValue placeholder={t('ads.create.selectMedia')} />
              </SelectTrigger>
              <SelectContent>
                {mediaAssets.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {t('ads.create.noMedia')}
                  </div>
                )}
                {mediaAssets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.originalName || asset.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('ads.create.startDate')}</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('ads.create.endDate')}</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              {t('ads.create.cancel')}
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={saving || !title || !targetUrl || !placement || !mediaAssetId}
              className="bg-[#d62020] hover:bg-[#b91818]"
            >
              {saving ? t('common.loading') : t('ads.create.submit')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}