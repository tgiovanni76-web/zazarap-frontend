import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export default function BusinessForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    advertiserName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    goal: "",
    budget: "",
    format: "banner",
    placement: "home_banner",
    imageUrl: "",
    targetUrl: ""
  });

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange("imageUrl", file_url);
      toast.success("Bild hochgeladen");
    } catch (e) {
      toast.error("Upload fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : undefined,
        status: "draft"
      };
      await base44.entities.BusinessAdCampaign.create(payload);
      toast.success("Anfrage gesendet: Entwurf erstellt. Ein Admin prüft sie.");
      setForm({
        advertiserName: "",
        contactName: "",
        email: "",
        phone: "",
        website: "",
        goal: "",
        budget: "",
        format: "banner",
        placement: "home_banner",
        imageUrl: "",
        targetUrl: ""
      });
    } catch (e) {
      toast.error("Fehler beim Senden der Anfrage");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-card p-4 md:p-6 rounded-xl border">
      <div>
        <Label>Firmenname</Label>
        <Input value={form.advertiserName} onChange={(e) => handleChange("advertiserName", e.target.value)} required />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Referente</Label>
          <Input value={form.contactName} onChange={(e) => handleChange("contactName", e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Telefono</Label>
          <Input value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>
        <div>
          <Label>Sito web</Label>
          <Input value={form.website} onChange={(e) => handleChange("website", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>Obiettivo campagna</Label>
        <Textarea value={form.goal} onChange={(e) => handleChange("goal", e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Budget indicativo (€)</Label>
          <Input type="number" min="0" value={form.budget} onChange={(e) => handleChange("budget", e.target.value)} />
        </div>
        <div>
          <Label>Formato</Label>
          <Select value={form.format} onValueChange={(v) => handleChange("format", v)}>
            <SelectTrigger><SelectValue placeholder="Formato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner</SelectItem>
              <SelectItem value="card">Card sponsorizzata</SelectItem>
              <SelectItem value="image">Immagine</SelectItem>
              <SelectItem value="video">Video (futuro)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Placement</Label>
          <Select value={form.placement} onValueChange={(v) => handleChange("placement", v)}>
            <SelectTrigger><SelectValue placeholder="Placement" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="home_banner">Home - Banner</SelectItem>
              <SelectItem value="category_banner">Categoria - Banner</SelectItem>
              <SelectItem value="feed_card">Feed/Card</SelectItem>
              <SelectItem value="search_card">Ricerca/Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Target URL</Label>
          <Input value={form.targetUrl} onChange={(e) => handleChange("targetUrl", e.target.value)} />
        </div>
        <div>
          <Label>Immagine (jpg/png/webp)</Label>
          <Input type="file" accept="image/*" onChange={handleFile} />
          {form.imageUrl && <img src={form.imageUrl} alt="preview" className="mt-2 h-24 rounded-md object-cover border" />}
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full md:w-auto">{loading ? "Invio..." : "Richiedi campagna"}</Button>
    </form>
  );
}