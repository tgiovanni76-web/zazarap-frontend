import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId } = await req.json();

    if (!listingId) {
      return Response.json({ 
        error: 'Listing ID erforderlich',
        success: false 
      }, { status: 400 });
    }

    // Get listing
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    if (!listings || listings.length === 0) {
      return Response.json({ 
        error: 'Listing nicht gefunden',
        success: false 
      }, { status: 404 });
    }

    const listing = listings[0];

    // Check ownership
    if (listing.created_by !== user.email) {
      return Response.json({ 
        error: 'Keine Berechtigung',
        success: false 
      }, { status: 403 });
    }

    // Get performance metrics
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { listingId },
      '-created_date',
      1000
    );

    const views = activities.filter(a => a.activityType === 'view').length;
    const clicks = activities.filter(a => a.activityType === 'click').length;
    const engagement = views > 0 ? (clicks / views) * 100 : 0;

    // Get market data
    const similarListings = await base44.asServiceRole.entities.Listing.filter(
      { category: listing.category, status: 'active' },
      '-created_date',
      50
    );

    const soldListings = await base44.asServiceRole.entities.Listing.filter(
      { category: listing.category, status: 'sold' },
      '-created_date',
      30
    );

    // Get trending searches in category
    const recentSearches = await base44.asServiceRole.entities.UserActivity.filter(
      { 
        activityType: 'search',
        category: listing.category,
        created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
      },
      '-created_date',
      100
    );

    const searchTerms = recentSearches
      .map(a => a.searchTerm)
      .filter(Boolean);

    // Count search frequency
    const searchFrequency = {};
    searchTerms.forEach(term => {
      searchFrequency[term] = (searchFrequency[term] || 0) + 1;
    });

    const trendingSearches = Object.entries(searchFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([term]) => term);

    // Get successful listing titles for inspiration
    const successfulTitles = soldListings
      .slice(0, 10)
      .map(l => l.title)
      .filter(Boolean);

    // Calculate performance score
    let performanceScore = 50;
    if (views > 20) performanceScore += 15;
    if (engagement > 5) performanceScore += 15;
    if (listing.images && listing.images.length >= 3) performanceScore += 10;
    if (listing.description && listing.description.length > 100) performanceScore += 10;

    // AI Analysis
    const prompt = `Analysiere und optimiere dieses Listing eines Online-Marktplatzes.

LISTING:
Titel: ${listing.title}
Beschreibung: ${listing.description || 'Keine'}
Preis: ${listing.price}€
Kategorie: ${listing.category}
Bilder: ${listing.images?.length || 0}

PERFORMANCE:
- ${views} Aufrufe
- ${clicks} Klicks
- ${engagement.toFixed(1)}% Engagement-Rate
- Performance-Score: ${performanceScore}/100

MARKTDATEN:
- ${similarListings.length} aktive ähnliche Listings
- Durchschnittspreis aktiv: ${(similarListings.reduce((sum, l) => sum + l.price, 0) / similarListings.length).toFixed(2)}€
- ${soldListings.length} verkaufte Listings
- Durchschnittspreis verkauft: ${soldListings.length > 0 ? (soldListings.reduce((sum, l) => sum + l.price, 0) / soldListings.length).toFixed(2) : 'N/A'}€

ERFOLGREICHE TITEL-BEISPIELE:
${successfulTitles.slice(0, 5).map((t, i) => `${i + 1}. ${t}`).join('\n')}

TRENDING SUCHANFRAGEN:
${trendingSearches.join(', ')}

AUFGABE:
Gib konkrete, umsetzbare Optimierungsvorschläge für:
1. Titel (SEO-optimiert, verkaufsfördernd)
2. Beschreibung (strukturiert, überzeugend)
3. Keywords (basierend auf Suchanfragen)
4. Preis (wettbewerbsfähig)

Jeder Vorschlag muss die erwartete Verbesserung in % enthalten.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          summary: {
            type: 'string',
            description: 'Kurze Zusammenfassung der Analyse'
          },
          titleSuggestion: {
            type: 'object',
            properties: {
              currentTitle: { type: 'string' },
              newTitle: { type: 'string' },
              reason: { type: 'string' },
              improvement: { 
                type: 'number',
                description: 'Erwartete Verbesserung in %'
              }
            }
          },
          descriptionSuggestion: {
            type: 'object',
            properties: {
              currentDescription: { type: 'string' },
              newDescription: { type: 'string' },
              improvements: {
                type: 'array',
                items: { type: 'string' }
              },
              improvement: { type: 'number' }
            }
          },
          keywordsSuggestion: {
            type: 'object',
            properties: {
              keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Liste empfohlener Keywords'
              },
              trendingSearches: {
                type: 'array',
                items: { type: 'string' }
              },
              basedOn: { type: 'string' },
              improvement: { type: 'number' }
            }
          },
          priceSuggestion: {
            type: 'object',
            properties: {
              currentPrice: { type: 'number' },
              suggestedPrice: { type: 'number' },
              strategy: { type: 'string' },
              marketData: {
                type: 'object',
                properties: {
                  averagePrice: { type: 'number' },
                  competingListings: { type: 'number' }
                }
              },
              improvement: { type: 'number' }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      performanceScore,
      currentMetrics: {
        views,
        clicks,
        engagement
      },
      ...result
    });

  } catch (error) {
    console.error('Listing optimization error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});