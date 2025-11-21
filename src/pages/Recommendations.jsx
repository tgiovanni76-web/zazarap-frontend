import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Search, Heart } from 'lucide-react';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({ userId: user.email }, '-created_date', 100),
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

      const prompt = `Sei un assistente AI esperto per un marketplace italiano. Analizza in dettaglio l'attività dell'utente e fornisci raccomandazioni altamente personalizzate.

Attività dell'utente:
- Categorie visualizzate (ultimi 100 view): ${viewedCategories.join(', ') || 'Nessuna'}
- Termini di ricerca: ${searchTerms.join(', ') || 'Nessuno'}
- Annunci preferiti: ${favoritedListings.map(l => `${l.title} (${l.category}, ${l.price}€)`).join(' | ') || 'Nessuno'}

Annunci disponibili nel marketplace:
${listings.filter(l => l.status === 'active').map(l => 
  `ID: ${l.id} | ${l.title} | ${l.category} | ${l.price}€ | ${l.city || 'N/A'} | ${l.description?.substring(0, 80) || 'N/A'}`
).join('\n')}

Compiti:
1. Suggerisci 8-10 annunci altamente rilevanti per l'utente
2. Per ogni raccomandazione, fornisci un motivo specifico e convincente
3. Assegna un punteggio di rilevanza (0-100)
4. Suggerisci 3-5 categorie da esplorare basate sui pattern dell'utente
5. Proponi 3-5 termini di ricerca intelligenti che potrebbero interessare l'utente`;

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
            },
            userProfileSummary: {
              type: "string"
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

  if (!user) {
    return (
      <div className="py-8 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Accedi per vedere le raccomandazioni</h2>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            Raccomandazioni AI
          </h2>
          <p className="text-slate-600 mt-1">Annunci personalizzati in base ai tuoi interessi</p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isGenerating ? 'Generazione...' : recommendations ? 'Aggiorna' : 'Genera raccomandazioni'}
        </Button>
      </div>

      {activities.length < 3 && !recommendations && (
        <Card className="mb-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="py-12 text-center">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold mb-2">Inizia a esplorare!</h3>
            <p className="text-slate-600 mb-4">
              Visualizza alcuni annunci, aggiungi preferiti o fai qualche ricerca per ricevere raccomandazioni personalizzate.
            </p>
            <Link to={createPageUrl('Marketplace')}>
              <Button className="bg-purple-600 hover:bg-purple-700">
                Esplora il marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {recommendations && (
        <div className="space-y-6">
          {recommendations.userProfileSummary && (
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardContent className="pt-6">
                <p className="text-slate-700">
                  <strong>Il tuo profilo:</strong> {recommendations.userProfileSummary}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Annunci consigliati per te
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.recommendations?.map((rec) => {
                  const listing = listings.find(l => l.id === rec.listingId);
                  if (!listing) return null;
                  
                  return (
                    <Link 
                      key={rec.listingId}
                      to={createPageUrl('ListingDetail') + '?id=' + rec.listingId}
                      className="block group"
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          {listing.images?.[0] && (
                            <img 
                              src={listing.images[0]} 
                              alt={listing.title}
                              className="w-full h-40 object-cover rounded mb-3"
                            />
                          )}
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-bold group-hover:text-purple-600 transition-colors">
                                {listing.title}
                              </h3>
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {rec.relevanceScore}%
                              </span>
                            </div>
                            <p className="text-purple-600 font-bold text-lg">{listing.price} €</p>
                            <p className="text-sm text-slate-600 line-clamp-2">{rec.reason}</p>
                            {listing.city && (
                              <p className="text-xs text-slate-500">{listing.city}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {recommendations.suggestedCategories?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Categorie che potrebbero interessarti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {recommendations.suggestedCategories.map((cat) => (
                    <Link 
                      key={cat}
                      to={createPageUrl('Category') + '?name=' + cat}
                    >
                      <Button variant="outline" className="capitalize hover:bg-purple-50">
                        {cat}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.searchSuggestions?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-500" />
                  Ricerche suggerite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {recommendations.searchSuggestions.map((term, idx) => (
                    <Link 
                      key={idx}
                      to={createPageUrl('Marketplace')}
                    >
                      <Button variant="outline" className="hover:bg-blue-50">
                        <Search className="h-4 w-4 mr-2" />
                        {term}
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}