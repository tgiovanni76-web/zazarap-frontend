import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, ShoppingBag } from 'lucide-react';

export default function AIRecommendations({ cartItems }) {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      loadRecommendations();
    }
  }, [cartItems]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('getCartRecommendations', {
        cartItems: cartItems.map(item => ({
          listingId: item.listingId,
          listingTitle: item.listingTitle,
          category: item.category,
          price: item.price
        }))
      });
      if (response.data?.recommendations) {
        setRecommendations(response.data);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Caricamento raccomandazioni AI...</p>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.recommendations.length === 0) return null;

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Consigliati per te
        </CardTitle>
        {recommendations.personalizedMessage && (
          <p className="text-sm text-slate-600 mt-2">{recommendations.personalizedMessage}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.recommendations.map((rec, idx) => (
          <div key={idx} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={
                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }>
                {rec.category}
              </Badge>
              <span className="text-sm font-medium">{rec.productType}</span>
            </div>
            <p className="text-sm text-slate-600">{rec.reason}</p>
            
            {rec.listings && rec.listings.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {rec.listings.map(listing => (
                  <Link 
                    key={listing.id} 
                    to={createPageUrl('ListingDetail') + '?id=' + listing.id}
                    className="block"
                  >
                    <div className="bg-white rounded-lg p-2 border hover:shadow-md transition-shadow">
                      {listing.images?.[0] && (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.title}
                          className="w-full h-24 object-cover rounded mb-2"
                        />
                      )}
                      <p className="text-xs font-medium line-clamp-2">{listing.title}</p>
                      <p className="text-sm font-bold text-red-600 mt-1">{listing.price}€</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {recommendations.crossSellOpportunities && recommendations.crossSellOpportunities.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <p className="text-sm font-semibold">Acquisti frequenti insieme:</p>
            </div>
            <div className="space-y-1">
              {recommendations.crossSellOpportunities.map((opp, idx) => (
                <p key={idx} className="text-xs text-slate-600">• {opp}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}