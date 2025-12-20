import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function UserReviews({ userEmail }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["userReviews", userEmail],
    queryFn: () => base44.entities.UserRating.filter({ ratedEmail: userEmail }, "-created_date", 50),
    enabled: !!userEmail,
  });

  if (isLoading) return null;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + (r.overallRating || 0), 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recensioni ({reviews.length}) • Media {avg}/5</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 && <div className="text-slate-500">Ancora nessuna recensione</div>}
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border-b pb-3">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < (r.overallRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <div className="text-xs text-slate-500">da {r.raterEmail} • ruolo {r.raterRole}</div>
              {r.comment && <div className="text-sm mt-1">{r.comment}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}