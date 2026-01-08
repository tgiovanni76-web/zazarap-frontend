import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Heart, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function PersonalizedRecommendations({ user }) {
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generatePersonalizedRecommendations', {
        limit: 12
      });

      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations);
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  if (!user || isLoading) {
    return (
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Consigliati per te
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRecommendations}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900 mb-1">
                    Selezionati in base ai tuoi interessi
                  </p>
                  {insights.topCategories && insights.topCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {insights.topCategories.map((cat, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {insights.aiSuggestions && insights.aiSuggestions.length > 0 && (
                    <p className="text-xs text-purple-700 mt-2">
                      💡 {insights.aiSuggestions[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="zaza-grid">
        {recommendations.map(listing => (
          <Link 
            key={listing.id} 
            to={createPageUrl('ListingDetail') + '?id=' + listing.id}
            className="zaza-card relative"
          >
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-purple-600 text-white">
                <Sparkles className="h-3 w-3 mr-1" />
                Per te
              </Badge>
            </div>
            
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title} 
                className="zaza-img"
              />
            ) : (
              <div className="zaza-img" />
            )}
            
            <div className="zaza-category">{listing.category}</div>
            <div className="zaza-title">{listing.title}</div>
            <div className="zaza-price">{listing.price} €</div>
            {listing.city && <div className="zaza-location">{listing.city}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}