import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles, TrendingUp, Brain, RefreshCw, Heart, Eye, Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../LanguageProvider';

export default function AIRecommendations({ user }) {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: recommendationsData, isLoading, refetch } = useQuery({
    queryKey: ['aiRecommendations', user?.email],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateRecommendations', {});
      return response.data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Empfehlungen aktualisiert!');
    } catch (error) {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
            <span className="text-slate-600">AI analysiert deine Interessen...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const recommendations = recommendationsData?.recommendations || [];
  const userProfile = recommendationsData?.userProfile || {};

  if (recommendations.length === 0) return null;

  return (
    <Card className="mb-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-purple-600 animate-pulse" />
                <Brain className="h-3 w-3 text-pink-600 absolute -top-1 -right-1" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                KI-Empfehlungen für dich
              </span>
              <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <TrendingUp className="h-3 w-3 mr-1" />
                Personalisiert
              </Badge>
            </CardTitle>
            <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
              <Eye className="h-3 w-3" />
              Basierend auf {userProfile.topCategories?.length > 0 ? (
                <>deinem Interesse an: <strong>{userProfile.topCategories.slice(0, 2).map(c => t(c)).join(', ')}</strong></>
              ) : 'deiner Aktivität'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-purple-600 hover:bg-purple-100"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recommendations.map((listing) => (
            <Link 
              key={listing.id} 
              to={createPageUrl('ListingDetail') + '?id=' + listing.id}
              className="group relative"
              onClick={() => {
                // Track recommendation click
                if (user) {
                  base44.entities.UserActivity.create({
                    userId: user.email,
                    activityType: 'click',
                    listingId: listing.id,
                    category: listing.category,
                    source: 'recommendation'
                  });
                }
              }}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-purple-100">
                {listing.recommendationScore >= 0.9 && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                      ⭐ Top Match
                    </Badge>
                  </div>
                )}
                {listing.images?.[0] ? (
                  <img 
                    src={listing.images[0]} 
                    alt={listing.title}
                    className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
                <div className="p-3">
                  <div className="text-xs font-semibold text-slate-800 line-clamp-2 h-8">
                    {listing.title}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm font-bold text-green-600">
                      {listing.price}€
                    </div>
                    {listing.recommendationScore >= 0.85 && (
                      <Heart className="h-3 w-3 text-pink-500" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {t(listing.category)}
                  </div>
                  {listing.recommendationReason && (
                    <div className="mt-2 text-xs text-purple-600 bg-purple-50 rounded px-2 py-1 line-clamp-2">
                      💡 {listing.recommendationReason}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {userProfile.searchTerms && userProfile.searchTerms.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-200">
            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
              <Brain className="h-3 w-3 text-purple-500" />
              <span>Deine letzten Suchen:</span>
              {userProfile.searchTerms.slice(0, 3).map((term, idx) => (
                <Badge key={idx} variant="outline" className="text-xs border-purple-200 text-purple-700">
                  {term}
                </Badge>
              ))}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}