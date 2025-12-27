import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listings } = await req.json();

    if (!listings || listings.length === 0) {
      return Response.json({ 
        error: 'Keine Listings zum Analysieren',
        success: false 
      }, { status: 400 });
    }

    // Fetch full listing data with activities
    const analysisPromises = listings.map(async (listing) => {
      const fullListing = await base44.asServiceRole.entities.Listing.filter({ id: listing.id });
      if (!fullListing || fullListing.length === 0) return null;
      
      const l = fullListing[0];
      
      // Get engagement data
      const views = listing.views || 0;
      const clicks = listing.clicks || 0;
      const offers = listing.offers || 0;
      
      return {
        id: l.id,
        title: l.title,
        description: l.description,
        price: l.price,
        category: l.category,
        images: l.images || [],
        views,
        clicks,
        offers,
        engagement: views > 0 ? (clicks / views) * 100 : 0
      };
    });

    const listingsData = (await Promise.all(analysisPromises)).filter(Boolean);

    if (listingsData.length === 0) {
      return Response.json({ 
        error: 'Keine gültigen Listings gefunden',
        success: false 
      }, { status: 400 });
    }

    // Analyze with AI
    const prompt = `Analysiere diese ${listingsData.length} Listings eines Online-Marktplatz-Verkäufers und gib konkrete Verbesserungsvorschläge.

Listings:
${listingsData.map((l, i) => `
${i + 1}. "${l.title}" (${l.price}€)
   Kategorie: ${l.category}
   Beschreibung: ${l.description?.substring(0, 150) || 'Keine'}
   Bilder: ${l.images.length}
   Performance: ${l.views} Aufrufe, ${l.clicks} Klicks, ${l.offers} Angebote
   Engagement-Rate: ${l.engagement.toFixed(1)}%
`).join('\n')}

Analysiere:
1. Welche Listings haben schlechte Performance?
2. Was könnte verbessert werden (Titel, Beschreibung, Preis, Bilder)?
3. Welche Quick Wins gibt es?
4. Priorisiere die Vorschläge nach Wirkung

Gib konkrete, umsetzbare Empfehlungen.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          overallScore: {
            type: 'number',
            description: 'Gesamtbewertung 0-100 aller Listings'
          },
          suggestions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                listingId: { type: 'string' },
                listingTitle: { type: 'string' },
                type: {
                  type: 'string',
                  enum: ['price', 'description', 'images', 'title', 'general'],
                  description: 'Art der Verbesserung'
                },
                priority: {
                  type: 'string',
                  enum: ['high', 'medium', 'low'],
                  description: 'Priorität'
                },
                suggestion: {
                  type: 'string',
                  description: 'Konkreter Verbesserungsvorschlag'
                },
                impact: {
                  type: 'string',
                  description: 'Erwartete Auswirkung (z.B. +20% Aufrufe)'
                }
              }
            }
          },
          quickWins: {
            type: 'array',
            items: { type: 'string' },
            description: 'Schnell umsetzbare Verbesserungen'
          },
          summary: {
            type: 'string',
            description: 'Zusammenfassung der Analyse'
          }
        }
      }
    });

    // Map listing IDs back
    const suggestionsWithIds = result.suggestions.map(sug => {
      const listing = listingsData.find(l => 
        l.title.toLowerCase().includes(sug.listingTitle.toLowerCase()) ||
        sug.listingTitle.toLowerCase().includes(l.title.toLowerCase())
      );
      
      return {
        ...sug,
        listingId: listing?.id || sug.listingId
      };
    });

    return Response.json({
      success: true,
      overallScore: result.overallScore,
      suggestions: suggestionsWithIds,
      quickWins: result.quickWins || [],
      summary: result.summary,
      analyzedCount: listingsData.length
    });

  } catch (error) {
    console.error('Listing improvements generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});