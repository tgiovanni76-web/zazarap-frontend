import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, TrendingUp, RefreshCw, Loader2, Zap, Target, Clock } from 'lucide-react';
import { useLanguage } from '../LanguageProvider';

const recTranslations = {
  de: {
    title: 'Für Sie empfohlen',
    generating: 'Empfehlungen werden generiert...',
    generate: 'Empfehlungen abrufen',
    refresh: 'Aktualisieren',
    basedOn: 'Basierend auf',
    viewHistory: 'Ihrem Suchverlauf',
    searches: 'Ihren Suchen',
    favorites: 'Ihren Favoriten',
    suggestedCategories: 'Empfohlene Kategorien',
    trending: 'Beliebt in Ihrer Nähe',
    similar: 'Ähnliche Artikel',
    noActivity: 'Erkunden Sie einige Anzeigen, um personalisierte Empfehlungen zu erhalten',
    match: 'Übereinstimmung',
    newForYou: 'Neu für Sie',
    priceAlert: 'Preisalarm'
  },
  en: {
    title: 'Recommended for you',
    generating: 'Generating recommendations...',
    generate: 'Get recommendations',
    refresh: 'Refresh',
    basedOn: 'Based on',
    viewHistory: 'your browsing history',
    searches: 'your searches',
    favorites: 'your favorites',
    suggestedCategories: 'Suggested categories',
    trending: 'Trending near you',
    similar: 'Similar items',
    noActivity: 'Explore some listings to get personalized recommendations',
    match: 'Match',
    newForYou: 'New for you',
    priceAlert: 'Price alert'
  },
  it: {
    title: 'Consigliati per te',
    generating: 'Generando raccomandazioni...',
    generate: 'Ottieni raccomandazioni',
    refresh: 'Aggiorna',
    basedOn: 'Basato su',
    viewHistory: 'la tua cronologia',
    searches: 'le tue ricerche',
    favorites: 'i tuoi preferiti',
    suggestedCategories: 'Categorie suggerite',
    trending: 'Popolari nella tua zona',
    similar: 'Articoli simili',
    noActivity: 'Esplora alcuni annunci per ottenere raccomandazioni personalizzate',
    match: 'Affinità',
    newForYou: 'Nuovo per te',
    priceAlert: 'Allerta prezzo'
  },
  tr: {
    title: 'Sizin için önerilen',
    generating: 'Öneriler oluşturuluyor...',
    generate: 'Önerileri al',
    refresh: 'Yenile',
    basedOn: 'Dayalı',
    viewHistory: 'gezinme geçmişinize',
    searches: 'aramalarınıza',
    favorites: 'favorilerinize',
    suggestedCategories: 'Önerilen kategoriler',
    trending: 'Yakınınızda trend',
    similar: 'Benzer ürünler',
    noActivity: 'Kişiselleştirilmiş öneriler almak için bazı ilanları keşfedin',
    match: 'Eşleşme',
    newForYou: 'Sizin için yeni',
    priceAlert: 'Fiyat uyarısı'
  },
  uk: {
    title: 'Рекомендовано для вас',
    generating: 'Генерування рекомендацій...',
    generate: 'Отримати рекомендації',
    refresh: 'Оновити',
    basedOn: 'На основі',
    viewHistory: 'вашої історії перегляду',
    searches: 'ваших пошуків',
    favorites: 'ваших обраних',
    suggestedCategories: 'Рекомендовані категорії',
    trending: 'Популярне поруч',
    similar: 'Схожі товари',
    noActivity: 'Перегляньте деякі оголошення, щоб отримати персоналізовані рекомендації',
    match: 'Відповідність',
    newForYou: 'Нове для вас',
    priceAlert: 'Сповіщення про ціну'
  },
  fr: {
    title: 'Recommandé pour vous',
    generating: 'Génération des recommandations...',
    generate: 'Obtenir des recommandations',
    refresh: 'Actualiser',
    basedOn: 'Basé sur',
    viewHistory: 'votre historique de navigation',
    searches: 'vos recherches',
    favorites: 'vos favoris',
    suggestedCategories: 'Catégories suggérées',
    trending: 'Tendances près de chez vous',
    similar: 'Articles similaires',
    noActivity: 'Explorez quelques annonces pour obtenir des recommandations personnalisées',
    match: 'Correspondance',
    newForYou: 'Nouveau pour vous',
    priceAlert: 'Alerte prix'
  },
  pl: {
    title: 'Polecane dla Ciebie',
    generating: 'Generowanie rekomendacji...',
    generate: 'Pobierz rekomendacje',
    refresh: 'Odśwież',
    basedOn: 'Na podstawie',
    viewHistory: 'Twojej historii przeglądania',
    searches: 'Twoich wyszukiwań',
    favorites: 'Twoich ulubionych',
    suggestedCategories: 'Sugerowane kategorie',
    trending: 'Popularne w Twojej okolicy',
    similar: 'Podobne przedmioty',
    noActivity: 'Przeglądaj ogłoszenia, aby otrzymać spersonalizowane rekomendacje',
    match: 'Dopasowanie',
    newForYou: 'Nowe dla Ciebie',
    priceAlert: 'Alert cenowy'
  }
};

export default function AIRecommendations({ user, compact = false }) {
  const { language } = useLanguage();
  const rt = recTranslations[language] || recTranslations.de;
  const [recommendations, setRecommendations] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [autoGenerated, setAutoGenerated] = useState(false);

  // Fetch user activities
  const { data: activities = [] } = useQuery({
    queryKey: ['userActivities', user?.email],
    queryFn: () => base44.entities.UserActivity.filter({ userId: user.email }, '-created_date', 100),
    enabled: !!user,
    staleTime: 60000,
  });

  // Fetch all active listings
  const { data: listings = [] } = useQuery({
    queryKey: ['activeListings'],
    queryFn: async () => {
      const all = await base44.entities.Listing.filter({ status: 'active', moderationStatus: 'approved' }, '-created_date', 100);
      return all;
    },
    staleTime: 60000,
  });

  // Fetch user favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: () => base44.entities.Favorite.filter({ user_email: user.email }),
    enabled: !!user,
  });

  // Auto-generate on first load if enough activity
  useEffect(() => {
    if (user && activities.length >= 3 && !recommendations && !autoGenerated && listings.length > 0) {
      setAutoGenerated(true);
      generateRecommendations();
    }
  }, [user, activities, listings, recommendations, autoGenerated]);

  const generateRecommendations = async () => {
    if (!user || listings.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Analyze user behavior
      const viewedCategories = activities
        .filter(a => a.activityType === 'view' && a.category)
        .reduce((acc, a) => {
          acc[a.category] = (acc[a.category] || 0) + 1;
          return acc;
        }, {});

      const viewedCities = activities
        .filter(a => a.city)
        .reduce((acc, a) => {
          acc[a.city] = (acc[a.city] || 0) + 1;
          return acc;
        }, {});

      const searchTerms = activities
        .filter(a => a.activityType === 'search' && a.searchTerm)
        .map(a => a.searchTerm)
        .slice(0, 10);

      const viewedListingIds = activities
        .filter(a => a.listingId)
        .map(a => a.listingId);

      const favoritedListings = favorites
        .map(f => listings.find(l => l.id === f.listing_id))
        .filter(Boolean);

      // Calculate price preferences
      const viewedPrices = activities
        .filter(a => a.listingId)
        .map(a => listings.find(l => l.id === a.listingId)?.price)
        .filter(Boolean);
      
      const avgPrice = viewedPrices.length > 0 
        ? viewedPrices.reduce((a, b) => a + b, 0) / viewedPrices.length 
        : null;

      // Build AI prompt
      const prompt = `Sei un sistema di raccomandazione AI per un marketplace. Analizza il comportamento dell'utente e suggerisci gli annunci più rilevanti.

PROFILO UTENTE:
- Categorie preferite (con frequenza): ${Object.entries(viewedCategories).map(([k, v]) => `${k}: ${v} volte`).join(', ') || 'Nessuna'}
- Città di interesse: ${Object.entries(viewedCities).map(([k, v]) => `${k}: ${v} volte`).join(', ') || 'Nessuna'}
- Termini di ricerca recenti: ${searchTerms.join(', ') || 'Nessuno'}
- Annunci preferiti: ${favoritedListings.map(l => `"${l.title}" (${l.category}, ${l.price}€)`).join(', ') || 'Nessuno'}
- Fascia di prezzo media: ${avgPrice ? `${Math.round(avgPrice)}€` : 'Non determinata'}
- Annunci già visualizzati: ${viewedListingIds.length} annunci

ANNUNCI DISPONIBILI (escludi quelli già visualizzati molte volte):
${listings
  .filter(l => !viewedListingIds.includes(l.id) || viewedListingIds.filter(id => id === l.id).length < 3)
  .slice(0, 40)
  .map(l => `ID:${l.id}|${l.title}|${l.category}|${l.price}€|${l.city || 'N/D'}`)
  .join('\n')}

COMPITO:
1. Seleziona 6 annunci che corrispondono meglio al profilo utente
2. Per ogni annuncio spiega BREVEMENTE perché è rilevante
3. Assegna un punteggio di affinità 0-100
4. Suggerisci 3 categorie che potrebbero interessare l'utente
5. Identifica se ci sono annunci "nuovi" nelle categorie preferite`;

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
                  matchScore: { type: "number" },
                  isNew: { type: "boolean" },
                  matchType: { type: "string" }
                }
              }
            },
            suggestedCategories: {
              type: "array",
              items: { type: "string" }
            },
            userProfile: {
              type: "object",
              properties: {
                topInterest: { type: "string" },
                pricePreference: { type: "string" },
                locationPreference: { type: "string" }
              }
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

  // Compact loading state
  if (isGenerating && compact) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    );
  }

  // Not enough activity
  if (activities.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="py-8 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          <h3 className="text-lg font-bold mb-2 text-purple-800">{rt.title}</h3>
          <p className="text-purple-600">{rt.noActivity}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 border-purple-200 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <span className="text-purple-800">{rt.title}</span>
          </div>
          {recommendations && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateRecommendations}
              disabled={isGenerating}
              className="text-purple-600 hover:text-purple-800"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}
        </CardTitle>
        
        {recommendations?.userProfile && (
          <div className="flex flex-wrap gap-2 mt-2">
            {recommendations.userProfile.topInterest && (
              <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                <Target className="h-3 w-3 mr-1" />
                {recommendations.userProfile.topInterest}
              </Badge>
            )}
            {recommendations.userProfile.pricePreference && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                € {recommendations.userProfile.pricePreference}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-3" />
            <p className="text-purple-600 text-sm">{rt.generating}</p>
          </div>
        ) : !recommendations ? (
          <div className="text-center py-4">
            <Button
              onClick={generateRecommendations}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {rt.generate}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Recommendations Grid */}
            <div className={`grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {recommendations.recommendations?.slice(0, compact ? 4 : 6).map((rec) => {
                const listing = listings.find(l => l.id === rec.listingId);
                if (!listing) return null;

                return (
                  <Link
                    key={rec.listingId}
                    to={createPageUrl('ListingDetail') + '?id=' + rec.listingId + '&source=recommendation'}
                    className="block group"
                  >
                    <div className="bg-white rounded-xl border border-purple-100 overflow-hidden hover:shadow-lg hover:border-purple-300 transition-all duration-300">
                      {/* Image */}
                      <div className="relative aspect-[4/3]">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-purple-300" />
                          </div>
                        )}
                        
                        {/* Match Score Badge */}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-purple-600/90 text-white text-xs">
                            {rec.matchScore}% {rt.match}
                          </Badge>
                        </div>

                        {/* New Badge */}
                        {rec.isNew && (
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-green-500 text-white text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {rt.newForYou}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-3">
                        <h4 className="font-semibold text-sm truncate text-slate-800 group-hover:text-purple-700">
                          {listing.title}
                        </h4>
                        <p className="text-purple-600 font-bold text-lg">{listing.price} €</p>
                        {!compact && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rec.reason}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Suggested Categories */}
            {recommendations.suggestedCategories?.length > 0 && !compact && (
              <div className="pt-4 border-t border-purple-100">
                <p className="text-sm font-medium mb-2 text-purple-700 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {rt.suggestedCategories}
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendations.suggestedCategories.map((cat) => (
                    <Link key={cat} to={createPageUrl('Category') + '?name=' + encodeURIComponent(cat)}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="capitalize border-purple-200 hover:bg-purple-100 hover:border-purple-400"
                      >
                        {cat}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}