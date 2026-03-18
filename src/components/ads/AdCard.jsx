import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";

export default function AdCard() {
  const { currentLanguage } = useLanguage();
  const { data: campaigns = [] } = useQuery({
    queryKey: ["ad-campaigns", "feed_card"],
    queryFn: async () => {
      const nowISO = new Date().toISOString().slice(0, 10);
      const all = await base44.entities.BusinessAdCampaign.filter({ status: "active", placement: "feed_card" }, "-updated_date", 10);
      return all.filter(c => (!c.startDate || c.startDate <= nowISO) && (!c.endDate || c.endDate >= nowISO) && c.imageUrl);
    }
  });
  const campaign = campaigns[0];

  useEffect(() => {
    if (campaign) {
      base44.functions.invoke('trackAdEvent', { campaignId: campaign.id, eventType: 'impression' });
    }
  }, [campaign]);

  if (!campaign) return null;

  return (
    <a href={campaign.targetUrl || "#"} target="_blank" rel="noopener" onClick={() => base44.functions.invoke('trackAdEvent', { campaignId: campaign.id, eventType: 'click' })}>
      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{campaign.title || campaign.advertiserName}</CardTitle>
            <Badge className="bg-black/70 text-white">{currentLanguage === 'de' ? 'Werbung' : currentLanguage === 'en' ? 'Sponsored' : 'Sponsorizzato'}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.imageUrl && <img src={campaign.imageUrl} alt={campaign.title || campaign.advertiserName} className="w-full h-40 object-cover rounded-md" />}
        </CardContent>
      </Card>
    </a>
  );
}