import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { query } = await req.json();

    if (!query || query.length < 5) {
      return Response.json({ error: 'Query too short' }, { status: 400 });
    }

    // Get all active listings
    const allListings = await base44.asServiceRole.entities.Listing.filter(
      { status: 'active', moderationStatus: 'approved' },
      '-created_date',
      500
    );

    // AI interpretation of search query
    const interpretationPrompt = `Sei un assistente AI per ricerca prodotti in un marketplace.

QUERY UTENTE: "${query}"

COMPITO:
Analizza la query e estrai:
1. Categoria prodotto
2. Range di prezzo (se menzionato)
3. Condizione (nuovo/usato)
4. Caratteristiche specifiche
5. Località preferita (se menzionata)

Interpreta intenzioni implicite (es: "economico" = prezzo basso, "buone condizioni" = usato ma ben tenuto).

Rispondi in italiano con interpretazione user-friendly.`;

    const interpretation = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: interpretationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          interpretation: { type: "string" },
          category: { type: "string" },
          priceRange: {
            type: "object",
            properties: {
              min: { type: "number" },
              max: { type: "number" }
            }
          },
          condition: { type: "string" },
          keywords: {
            type: "array",
            items: { type: "string" }
          },
          location: { type: "string" }
        }
      }
    });

    // Score products based on relevance
    const scoringPrompt = `Valuta la rilevanza di questi prodotti per la query: "${query}"

INTERPRETAZIONE: ${interpretation.interpretation}

PRODOTTI:
${allListings.slice(0, 100).map(l => 
  `ID: ${l.id}, Titolo: ${l.title}, Categoria: ${l.category}, Prezzo: ${l.price}€, Desc: ${(l.description || '').substring(0, 100)}`
).join('\n')}

Assegna un punteggio 0-1 a ciascun prodotto basato su:
- Corrispondenza parole chiave
- Categoria appropriata
- Range di prezzo
- Descrizione pertinente

Restituisci max 20 prodotti più rilevanti.`;

    const scoring = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: scoringPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          productScores: {
            type: "array",
            items: {
              type: "object",
              properties: {
                listingId: { type: "string" },
                score: { type: "number" }
              }
            }
          },
          suggestions: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Build results
    const scoredProducts = scoring.productScores
      .map(ps => {
        const listing = allListings.find(l => l.id === ps.listingId);
        return listing ? { ...listing, relevanceScore: ps.score } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    // Track search if user is logged in
    if (user) {
      base44.entities.UserActivity.create({
        userId: user.email,
        activityType: 'search',
        searchTerm: query
      }).catch(() => {});
    }

    return Response.json({
      success: true,
      interpretation: interpretation.interpretation,
      filters: {
        category: interpretation.category,
        priceRange: interpretation.priceRange,
        condition: interpretation.condition,
        location: interpretation.location
      },
      products: scoredProducts,
      suggestions: scoring.suggestions || [],
      totalResults: scoredProducts.length
    });

  } catch (error) {
    console.error('Intelligent search error:', error);
    return Response.json({ 
      error: error.message,
      products: []
    }, { status: 500 });
  }
});