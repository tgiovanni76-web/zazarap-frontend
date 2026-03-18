import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/LanguageProvider";

export default function AdBanner({ placement = "home_banner" }) {
  const { currentLanguage } = useLanguage();
  const { data: campaigns = [] } = useQuery({
    queryKey: ["ad-campaigns", placement],
    queryFn: async () => {
      const nowISO = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      const all = await base44.entities.BusinessAdCampaign.filter({ status: "active", placement }, "-updated_date", 10);
      return all.filter(c => (!c.startDate || c.startDate <= nowISO) && (!c.endDate || c.endDate >= nowISO) && c.imageUrl);
    }
  });

  const campaign = campaigns[0];

  useEffect(() => { if (campaign) base44.functions.invoke('trackAdEvent', { campaignId: campaign.id, eventType: 'impression' }); }, [campaign]);

  if (!campaign) return null;

  return (
    <a href={campaign.targetUrl || "#"} target="_blank" rel="noopener" onClick={() => base44.functions.invoke('trackAdEvent', { campaignId: campaign.id, eventType: 'click' })} className="block">
      <div className="relative rounded-xl overflow-hidden border bg-card">
        <img src={campaign.imageUrl} alt={campaign.title || campaign.advertiserName} className="w-full h-36 md:h-48 object-cover" />
        <Badge className="absolute top-2 left-2 bg-black/70 text-white">{currentLanguage === 'de' ? 'Werbung' : currentLanguage === 'en' ? 'Sponsored' : 'Sponsorizzato'}</Badge>
      </div>
    </a>
  );
}