import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function SellerReviews({ sellerId, reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Bewertungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-slate-500 py-8">
            Noch keine Bewertungen vorhanden
          </p>
        </CardContent>
      </Card>
    );
  }

  const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  const averageCommunication = reviews.filter(r => r.communicationRating).length > 0
    ? (reviews.reduce((sum, r) => sum + (r.communicationRating || 0), 0) / reviews.filter(r => r.communicationRating).length).toFixed(1)
    : null;
  const averageShipping = reviews.filter(r => r.shippingRating).length > 0
    ? (reviews.reduce((sum, r) => sum + (r.shippingRating || 0), 0) / reviews.filter(r => r.shippingRating).length).toFixed(1)
    : null;
  const averageAccuracy = reviews.filter(r => r.accuracyRating).length > 0
    ? (reviews.reduce((sum, r) => sum + (r.accuracyRating || 0), 0) / reviews.filter(r => r.accuracyRating).length).toFixed(1)
    : null;

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: (reviews.filter(r => r.rating === stars).length / reviews.length) * 100
  }));

  const recommendCount = reviews.filter(r => r.wouldRecommend).length;
  const recommendPercentage = ((recommendCount / reviews.length) * 100).toFixed(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          Bewertungen ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <div className="text-4xl font-bold mb-1">{averageRating}</div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-slate-600">{reviews.length} Bewertungen</div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {ratingDistribution.map(({ stars, count, percentage }) => (
            <div key={stars} className="flex items-center gap-2">
              <span className="text-sm w-12">{stars} Stern{stars > 1 ? 'e' : ''}</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-slate-600 w-12 text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* Detailed Ratings */}
        {(averageCommunication || averageShipping || averageAccuracy) && (
          <div className="grid grid-cols-1 gap-2 text-sm">
            {averageCommunication && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kommunikation</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageCommunication}</span>
                </div>
              </div>
            )}
            {averageShipping && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Versand</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageShipping}</span>
                </div>
              </div>
            )}
            {averageAccuracy && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Beschreibung</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageAccuracy}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        <div className="p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <ThumbsUp className="w-4 h-4" />
            <span className="font-medium">
              {recommendPercentage}% würden empfehlen
            </span>
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold">Neueste Bewertungen</h4>
          {reviews.slice(0, 3).map(review => (
            <div key={review.id} className="p-3 bg-slate-50 rounded-lg space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {review.buyerId.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {review.buyerId.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(review.created_date), {
                        addSuffix: true,
                        locale: de
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{review.rating}</span>
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-slate-700">{review.comment}</p>
              )}
              {review.verified && (
                <Badge variant="outline" className="text-xs">
                  Verifizierter Kauf
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}