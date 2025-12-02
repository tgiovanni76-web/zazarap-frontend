import React from 'react';
import { Star, Shield, MessageSquare, Package, ThumbsUp } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function AggregatedRating({ ratings, showDetails = false }) {
  if (!ratings || ratings.length === 0) {
    return (
      <div className="text-sm text-slate-400">
        Nessuna recensione ancora
      </div>
    );
  }

  const avgOverall = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length;
  const avgReliability = ratings.filter(r => r.reliabilityRating).reduce((sum, r) => sum + r.reliabilityRating, 0) / ratings.filter(r => r.reliabilityRating).length || 0;
  const avgCommunication = ratings.filter(r => r.communicationRating).reduce((sum, r) => sum + r.communicationRating, 0) / ratings.filter(r => r.communicationRating).length || 0;
  const avgProductQuality = ratings.filter(r => r.productQualityRating).reduce((sum, r) => sum + r.productQualityRating, 0) / ratings.filter(r => r.productQualityRating).length || 0;

  // Count ratings distribution
  const distribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: ratings.filter(r => r.overallRating === star).length,
    percentage: (ratings.filter(r => r.overallRating === star).length / ratings.length) * 100
  }));

  // Collect all tags
  const allTags = ratings.flatMap(r => r.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Main Rating */}
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-800">{avgOverall.toFixed(1)}</div>
          <div className="flex justify-center mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.round(avgOverall) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="text-xs text-slate-500 mt-1">{ratings.length} recensioni</div>
        </div>

        {showDetails && (
          <div className="flex-1 space-y-1">
            {distribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-3">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Progress value={percentage} className="h-2 flex-1" />
                <span className="w-8 text-xs text-slate-500">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Ratings */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          {avgReliability > 0 && (
            <div className="text-center">
              <Shield className="h-5 w-5 mx-auto text-blue-500 mb-1" />
              <div className="text-lg font-semibold">{avgReliability.toFixed(1)}</div>
              <div className="text-xs text-slate-500">Affidabilità</div>
            </div>
          )}
          {avgCommunication > 0 && (
            <div className="text-center">
              <MessageSquare className="h-5 w-5 mx-auto text-green-500 mb-1" />
              <div className="text-lg font-semibold">{avgCommunication.toFixed(1)}</div>
              <div className="text-xs text-slate-500">Comunicazione</div>
            </div>
          )}
          {avgProductQuality > 0 && (
            <div className="text-center">
              <Package className="h-5 w-5 mx-auto text-purple-500 mb-1" />
              <div className="text-lg font-semibold">{avgProductQuality.toFixed(1)}</div>
              <div className="text-xs text-slate-500">Qualità Prodotto</div>
            </div>
          )}
        </div>
      )}

      {/* Top Tags */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2">
          {topTags.map(([tag, count]) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag.replace('_', ' ')} ({count})
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompactRating({ ratings }) {
  if (!ratings || ratings.length === 0) {
    return <span className="text-xs text-slate-400">Nuovo utente</span>;
  }

  const avg = ratings.reduce((sum, r) => sum + r.overallRating, 0) / ratings.length;

  return (
    <div className="flex items-center gap-1">
      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      <span className="font-semibold">{avg.toFixed(1)}</span>
      <span className="text-xs text-slate-500">({ratings.length})</span>
    </div>
  );
}

export function ReviewCard({ review }) {
  const tagLabels = {
    puntuale: '⏰ Puntuale',
    cordiale: '😊 Cordiale',
    affidabile: '✅ Affidabile',
    comunicativo: '💬 Comunicativo',
    prodotto_conforme: '📦 Prodotto conforme',
    spedizione_veloce: '🚀 Spedizione veloce',
    imballaggio_curato: '📦 Imballaggio curato',
    consigliato: '👍 Consigliato',
  };

  return (
    <div className="p-4 bg-white rounded-lg border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{review.raterEmail?.split('@')[0]}</span>
            <Badge variant="outline" className="text-xs">
              {review.raterRole === 'buyer' ? 'Acquirente' : 'Venditore'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-slate-400">
          {new Date(review.created_date).toLocaleDateString('it-IT')}
        </span>
      </div>

      {/* Sub-ratings */}
      <div className="flex gap-4 text-xs text-slate-500 mb-2">
        {review.reliabilityRating && (
          <span className="flex items-center gap-1">
            <Shield className="h-3 w-3" /> {review.reliabilityRating}/5
          </span>
        )}
        {review.communicationRating && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" /> {review.communicationRating}/5
          </span>
        )}
        {review.productQualityRating && (
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" /> {review.productQualityRating}/5
          </span>
        )}
      </div>

      {/* Tags */}
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {review.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tagLabels[tag] || tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
      )}
    </div>
  );
}