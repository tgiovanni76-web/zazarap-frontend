import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminCampaigns() {
  const qc = useQueryClient();
  const { data: campaigns = [] } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: () => base44.entities.BusinessAdCampaign.list("-created_date", 200)
  });

  const update = useMutation({
    mutationFn: ({ id, patch }) => base44.entities.BusinessAdCampaign.update(id, patch),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-campaigns"]}); toast.success("Aggiornato"); }
  });

  const upload = async (id, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    update.mutate({ id, patch: { imageUrl: file_url } });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Gestione campagne Business</h1>
      <div className="grid gap-4">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{c.title || c.advertiserName || c.id}</CardTitle>
                <Select value={c.status} onValueChange={(v) => update.mutate({ id: c.id, patch: { status: v } })}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">In revisione</SelectItem>
                    <SelectItem value="approved">Approvata</SelectItem>
                    <SelectItem value="active">Attiva</SelectItem>
                    <SelectItem value="paused">Pausa</SelectItem>
                    <SelectItem value="rejected">Rifiutata</SelectItem>
                    <SelectItem value="ended">Terminata</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-sm">Start</label>
                  <Input type="date" defaultValue={c.startDate || ""} onChange={(e) => update.mutate({ id: c.id, patch: { startDate: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm">Fine</label>
                  <Input type="date" defaultValue={c.endDate || ""} onChange={(e) => update.mutate({ id: c.id, patch: { endDate: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm">Prezzo mensile (€)</label>
                  <Input type="number" defaultValue={c.monthlyFlatPrice || ""} onChange={(e) => update.mutate({ id: c.id, patch: { monthlyFlatPrice: Number(e.target.value) } })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">Target URL</label>
                  <Input defaultValue={c.targetUrl || ""} onChange={(e) => update.mutate({ id: c.id, patch: { targetUrl: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm">Asset immagine</label>
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && upload(c.id, e.target.files[0])} />
                  {c.imageUrl && <img src={c.imageUrl} alt="asset" className="mt-2 h-24 rounded-md object-cover border" />}
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">Impressions: {c.impressionCount || 0} • Click: {c.clickCount || 0}</div>
              <div className="mt-2">
                <Button variant="outline" className="mr-2" onClick={() => update.mutate({ id: c.id, patch: { status: "approved" } })}>Approva</Button>
                <Button onClick={() => update.mutate({ id: c.id, patch: { status: "active" } })}>Pubblica</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}