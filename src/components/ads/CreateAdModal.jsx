import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

export default function CreateAdModal({ open, onClose, canCreate = false }) {
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [placement, setPlacement] = React.useState('homepage');
  const [mediaId, setMediaId] = React.useState('');
  const [dates, setDates] = React.useState({ start: '', end: '' });
  const [media, setMedia] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && canCreate) {
      base44.entities.MediaAsset.filter({}).then(setMedia).catch(() => setMedia([]));
    }
    if (!open) {
      setTitle(''); setUrl(''); setPlacement('homepage'); setMediaId(''); setDates({ start: '', end: '' }); setError('');
    }
  }, [open, canCreate]);

  const handleCreate = async () => {
    try {
      setSaving(true); setError('');
      const { data } = await base44.functions.invoke('createAdvertisingAd', {
        title,
        targetUrl: url,
        placement,
        mediaAssetId: mediaId,
        startDate: dates.start || undefined,
        endDate: dates.end || undefined
      });
      onClose(true, data.ad);
    } catch (e) {
      setError(e?.response?.data?.error || 'Fehler beim Erstellen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Werbeinserat erstellen</DialogTitle>
        </DialogHeader>
        {!canCreate ? (
          <p className="text-slate-600">Nur für Abonnenten · Upgrade erforderlich</p>
        ) : (
          <div className="space-y-3">
            <Input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Ziel-URL (https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <Select value={placement} onValueChange={setPlacement}>
              <SelectTrigger><SelectValue placeholder="Platzierung" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="homepage">Startseite</SelectItem>
                <SelectItem value="category">Kategorie</SelectItem>
                <SelectItem value="search">Suche</SelectItem>
                <SelectItem value="sidebar">Sidebar</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="text-sm text-slate-600">Medien-Asset</label>
              <select className="w-full border rounded px-3 py-2" value={mediaId} onChange={(e) => setMediaId(e.target.value)}>
                <option value="">Wähle ein Asset...</option>
                {media.map(m => (
                  <option key={m.id} value={m.id}>{m.originalName} · {m.kind}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" value={dates.start} onChange={(e) => setDates(s => ({ ...s, start: e.target.value }))} />
              <Input type="date" value={dates.end} onChange={(e) => setDates(s => ({ ...s, end: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onClose(false)}>Abbrechen</Button>
          <Button onClick={handleCreate} disabled={!canCreate || saving} className="bg-[#d62020] hover:bg-[#b91818]">Erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}