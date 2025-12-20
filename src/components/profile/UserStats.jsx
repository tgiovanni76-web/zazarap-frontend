import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

function useCounts(userEmail) {
  const { data: activeListings = [] } = useQuery({
    queryKey: ["stats", "activeListings", userEmail],
    queryFn: () => base44.entities.Listing.filter({ created_by: userEmail, status: "active" }),
    enabled: !!userEmail,
  });
  const { data: soldListings = [] } = useQuery({
    queryKey: ["stats", "soldListings", userEmail],
    queryFn: () => base44.entities.Listing.filter({ created_by: userEmail, status: "sold" }),
    enabled: !!userEmail,
  });
  const { data: purchases = [] } = useQuery({
    queryKey: ["stats", "purchases", userEmail],
    queryFn: () => base44.entities.Payment.filter({ buyerId: userEmail }),
    enabled: !!userEmail,
  });
  const { data: ratings = [] } = useQuery({
    queryKey: ["stats", "ratings", userEmail],
    queryFn: () => base44.entities.UserRating.filter({ ratedEmail: userEmail }, "-created_date", 200),
    enabled: !!userEmail,
  });

  const avg = ratings.length ? (ratings.reduce((s, r) => s + (r.overallRating || 0), 0) / ratings.length) : 0;

  return {
    active: activeListings.length,
    sold: soldListings.length,
    purchases: purchases.length,
    avgRating: Number.isFinite(avg) ? avg.toFixed(1) : "0.0",
    reviewsCount: ratings.length,
  };
}

export default function UserStats({ userEmail }) {
  const counts = useCounts(userEmail);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Annunci attivi</div><div className="text-2xl font-bold">{counts.active}</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Vendite concluse</div><div className="text-2xl font-bold">{counts.sold}</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Acquisti</div><div className="text-2xl font-bold">{counts.purchases}</div></CardContent></Card>
      <Card><CardContent className="p-4"><div className="text-xs text-slate-500">Valutazione</div><div className="text-2xl font-bold">{counts.avgRating}<span className="text-sm text-slate-500"> /5 ({counts.reviewsCount})</span></div></CardContent></Card>
    </div>
  );
}