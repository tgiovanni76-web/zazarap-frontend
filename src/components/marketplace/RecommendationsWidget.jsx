import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

export default function RecommendationsWidget({ user }) {
  const { t } = useLanguage();
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({ userId: user.email }, '-created_date', 50),
    enabled: !!user,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['listings'],
    queryFn: () => base44.entities.Listing.list('-created_date'),
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const viewedCategories = activities
        .filter(a => a.activityType === 'view' && a.category)
        .map(a => a.category);
      
      const searchTerms = activities
        .filter(a => a.activityType === 'search' && a.searchTerm)
        .map(a => a.searchTerm);

      const favoritedListings = favorites
        .map(f => listings.find(l => l.id === f.listing_id))
        .filter(Boolean);

      const prompt = `Sei un assistente AI per un marketplace. Analizza l'attività dell'utente e suggerisci annunci rilevanti.

Attività dell'utente:
- Categorie visualizzate: ${viewedCategories.join(', ') || 'Nessuna'}
- Termini di ricerca: ${searchTerms.join(', ') || 'Nessuno'}
- Annunci preferiti: ${favoritedListings.map(l => `${l.title} (${l.category}, ${l.price}€)`).join(', ') || 'Nessuno'}

Annunci disponibili:
${listings.filter(l => l.status === 'active').slice(0, 30).map(l => 
  `ID: ${l.id}, Titolo: ${l.title}, Categoria: ${l.category}, Prezzo: ${l.price}€, Descrizione: ${l.description?.substring(0, 100)}`
).join('\n')}

Fornisci 4-6 raccomandazioni personalizzate con ID annuncio, motivo della raccomandazione e punteggio di rilevanza (0-100).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  listingId: { type: "string" },
                  reason: { type: "string" },
                  relevanceScore: { type: "number" }
                }
              }
            },
            suggestedCategories: {
              type: "array",
              items: { type: "string" }
            },
            searchSuggestions: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setRecommendations(result);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) return null;

  if (activities.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-600" />
          <h3 className="text-lg font-bold mb-2">{t('discoverRecommendations')}</h3>
          <p className="text-slate-600 mb-4">{t('exploreToGetSuggestions')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          {t('aiRecommendations')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!recommendations ? (
          <div className="text-center">
            <Button 
              onClick={generateRecommendations} 
              disabled={isGenerating}
              className="bg-yellow-400 text-red-600 border-2 border-red-600 hover:bg-yellow-500 hover:text-red-700"
            >
              {isGenerating ? t('generating') : t('generateRecommendations')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendations.recommendations?.slice(0, 4).map((rec) => {
                const listing = listings.find(l => l.id === rec.listingId);
                if (!listing) return null;
                
                return (
                  <Link 
                    key={rec.listingId}
                    to={createPageUrl('ListingDetail') + '?id=' + rec.listingId}
                    className="block"
                  >
                    <div className="bg-white p-3 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        {listing.images?.[0] && (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{listing.title}</p>
                          <p className="text-purple-600 font-bold">{listing.price} €</p>
                          <p className="text-xs text-slate-500 mt-1">{rec.reason}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {recommendations.suggestedCategories?.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('suggestedCategories')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.suggestedCategories.map((cat) => (
                    <Link 
                      key={cat}
                      to={createPageUrl('Category') + '?name=' + cat}
                    >
                      <Button variant="outline" size="sm" className="capitalize">
                        {cat}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={generateRecommendations} 
              variant="ghost"
              size="sm"
              className="w-full"
            >
              {t('refreshRecommendations')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}