import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user activities (views, searches, favorites)
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { userId: user.email },
      '-created_date',
      100
    );

    const favorites = await base44.asServiceRole.entities.Favorite.filter(
      { user_email: user.email }
    );

    // Get all active listings
    const allListings = await base44.asServiceRole.entities.Listing.filter({
      status: 'active',
      moderationStatus: 'approved'
    });

    if (allListings.length === 0) {
      return Response.json({ recommendations: [] });
    }

    // Extract user preferences
    const viewedCategories = activities
      .filter(a => a.activityType === 'view' && a.category)
      .map(a => a.category);
    
    const searchedTerms = activities
      .filter(a => a.activityType === 'search' && a.searchTerm)
      .map(a => a.searchTerm);
    
    const favoritedCategories = await Promise.all(
      favorites.map(async (fav) => {
        const listing = allListings.find(l => l.id === fav.listing_id);
        return listing?.category;
      })
    ).then(cats => cats.filter(Boolean));

    const viewedListingIds = activities
      .filter(a => a.activityType === 'view' && a.listingId)
      .map(a => a.listingId);

    const favoriteListingIds = favorites.map(f => f.listing_id);

    // Build user profile for AI
    const userProfile = {
      viewedCategories: [...new Set(viewedCategories)],
      searchedTerms: [...new Set(searchedTerms)],
      favoritedCategories: [...new Set(favoritedCategories)],
      priceRange: activities
        .filter(a => a.priceRange)
        .map(a => a.priceRange)
        .slice(0, 5),
      cities: [...new Set(activities.filter(a => a.city).map(a => a.city))].slice(0, 5),
      recentActivity: activities.slice(0, 20).map(a => ({
        type: a.activityType,
        category: a.category,
        searchTerm: a.searchTerm,
        date: a.created_date
      }))
    };

    // Prepare listings data for AI
    const listingsForAI = allListings
      .filter(l => !viewedListingIds.includes(l.id) && !favoriteListingIds.includes(l.id))
      .slice(0, 50)
      .map(l => ({
        id: l.id,
        title: l.title,
        category: l.category,
        price: l.price,
        city: l.city,
        description: l.description?.substring(0, 200)
      }));

    // Use AI to generate personalized recommendations
    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Du bist ein Empfehlungsalgorithmus für einen Kleinanzeigen-Marktplatz. Analysiere das Nutzerprofil und wähle die 6 besten Listings aus, die dem Nutzer am ehesten gefallen würden.

Nutzerprofil:
${JSON.stringify(userProfile, null, 2)}

Verfügbare Listings:
${JSON.stringify(listingsForAI, null, 2)}

Bewertungskriterien:
1. Übereinstimmung mit angesehenen/favorisierten Kategorien (40%)
2. Relevanz zu Suchbegriffen (30%)
3. Preisbereich und Stadt (20%)
4. Aktualität der Interessen (10%)

WICHTIG: 
- Wähle NUR aus den bereitgestellten Listings
- Diversifiziere die Empfehlungen (nicht alle aus derselben Kategorie)
- Priorisiere Listings mit höherer Relevanz
- Gib GENAU 6 Listing-IDs zurück

Antwortformat (JSON):
{
  "recommendations": [
    {
      "listingId": "...",
      "score": 0.95,
      "reason": "Passt perfekt zu deinen Suchbegriffen 'auto kaufen' und du hast häufig die Kategorie 'Motoren' angesehen"
    }
  ]
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                listingId: { type: 'string' },
                score: { type: 'number' },
                reason: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Validate and enrich recommendations
    const validRecommendations = (aiResponse?.recommendations || [])
      .filter(rec => allListings.some(l => l.id === rec.listingId))
      .slice(0, 6)
      .map(rec => {
        const listing = allListings.find(l => l.id === rec.listingId);
        return {
          ...listing,
          recommendationScore: rec.score,
          recommendationReason: rec.reason
        };
      });

    // Fallback: If AI returned fewer than 3, add some based on simple rules
    if (validRecommendations.length < 3) {
      const categoryScores = {};
      viewedCategories.forEach(cat => {
        categoryScores[cat] = (categoryScores[cat] || 0) + 1;
      });
      favoritedCategories.forEach(cat => {
        categoryScores[cat] = (categoryScores[cat] || 0) + 2;
      });

      const topCategory = Object.keys(categoryScores).sort((a, b) => categoryScores[b] - categoryScores[a])[0];

      const fallbackListings = allListings
        .filter(l => 
          !validRecommendations.some(r => r.id === l.id) &&
          !viewedListingIds.includes(l.id) &&
          !favoriteListingIds.includes(l.id) &&
          (topCategory ? l.category === topCategory : true)
        )
        .slice(0, 6 - validRecommendations.length)
        .map(l => ({
          ...l,
          recommendationScore: 0.7,
          recommendationReason: topCategory ? `Basierend auf deinem Interesse an ${topCategory}` : 'Beliebte Anzeige'
        }));

      validRecommendations.push(...fallbackListings);
    }

    return Response.json({ 
      recommendations: validRecommendations.slice(0, 6),
      userProfile: {
        topCategories: Object.entries(
          viewedCategories.concat(favoritedCategories).reduce((acc, cat) => {
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {})
        ).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([cat]) => cat),
        searchTerms: searchedTerms.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return Response.json({ 
      error: error.message,
      recommendations: [] 
    }, { status: 500 });
  }
});