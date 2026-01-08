import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { limit = 12 } = await req.json().catch(() => ({}));

    // Get user activity history
    const activities = await base44.entities.UserActivity.filter(
      { userId: user.email },
      '-created_date',
      200
    );

    // Get user orders for purchase history
    const orders = await base44.entities.Order.filter(
      { userId: user.email },
      '-created_date',
      50
    );

    // Get user's favorites
    const favorites = await base44.entities.Favorite.filter({ user_email: user.email });

    // Analyze user preferences
    const viewedCategories = {};
    const viewedCities = {};
    const searchedTerms = [];
    const priceRange = { min: 0, max: Infinity, avg: 0 };

    activities.forEach(activity => {
      if (activity.category) {
        viewedCategories[activity.category] = (viewedCategories[activity.category] || 0) + 1;
      }
      if (activity.city) {
        viewedCities[activity.city] = (viewedCities[activity.city] || 0) + 1;
      }
      if (activity.searchTerm) {
        searchedTerms.push(activity.searchTerm);
      }
    });

    const purchasedItems = await base44.entities.OrderItem.filter({}, '-created_date', 100);
    const userPurchases = purchasedItems.filter(item => 
      orders.some(order => order.id === item.orderId)
    );

    if (userPurchases.length > 0) {
      const prices = userPurchases.map(p => p.price);
      priceRange.min = Math.min(...prices) * 0.7;
      priceRange.max = Math.max(...prices) * 1.3;
      priceRange.avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
    }

    // Get all active listings
    const allListings = await base44.asServiceRole.entities.Listing.filter(
      { status: 'active', moderationStatus: 'approved' },
      '-created_date',
      500
    );

    // AI-powered recommendation scoring
    const prompt = `Sei un sistema di raccomandazione AI per marketplace.

PROFILO UTENTE:
- Categorie visualizzate: ${JSON.stringify(viewedCategories)}
- Città preferite: ${JSON.stringify(viewedCities)}
- Ricerche recenti: ${searchedTerms.slice(0, 10).join(', ')}
- Range prezzo: ${priceRange.min.toFixed(2)}€ - ${priceRange.max.toFixed(2)}€
- Acquisti precedenti: ${userPurchases.length}
- Preferiti: ${favorites.length}

COMPITO:
Analizza il profilo utente e genera criteri di raccomandazione intelligenti.

Considera:
1. Affinità con categorie visualizzate
2. Pattern di prezzo
3. Località preferite
4. Interessi emergenti dalle ricerche
5. Diversificazione (non solo la stessa categoria)

Fornisci pesi per ogni fattore e suggerimenti specifici.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          categoryWeights: { 
            type: "object",
            additionalProperties: { type: "number" }
          },
          priceWeight: { type: "number" },
          locationWeight: { type: "number" },
          noveltyWeight: { type: "number" },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Score listings based on AI weights
    const scoredListings = allListings.map(listing => {
      let score = 0;

      // Category affinity
      const categoryWeight = aiResponse.categoryWeights?.[listing.category] || 0;
      score += categoryWeight * 100;

      // Price preference
      if (listing.price >= priceRange.min && listing.price <= priceRange.max) {
        score += aiResponse.priceWeight * 50;
      }

      // Location preference
      if (viewedCities[listing.city]) {
        score += aiResponse.locationWeight * viewedCities[listing.city] * 20;
      }

      // Recently created (novelty)
      const daysOld = (Date.now() - new Date(listing.created_date)) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) {
        score += aiResponse.noveltyWeight * (7 - daysOld) * 10;
      }

      // Boost if similar to searches
      searchedTerms.forEach(term => {
        if (listing.title?.toLowerCase().includes(term.toLowerCase())) {
          score += 30;
        }
      });

      // Penalize already viewed
      const viewed = activities.find(a => a.listingId === listing.id);
      if (viewed) score *= 0.5;

      return { ...listing, score };
    });

    // Sort by score and get top recommendations
    const recommendations = scoredListings
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ score, ...listing }) => listing);

    return Response.json({
      success: true,
      recommendations,
      insights: {
        topCategories: Object.entries(viewedCategories)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat),
        priceRange,
        aiSuggestions: aiResponse.recommendations
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    return Response.json({ 
      error: error.message,
      recommendations: []
    }, { status: 500 });
  }
});