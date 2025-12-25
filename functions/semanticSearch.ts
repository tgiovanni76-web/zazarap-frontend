import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, limit = 20 } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query required' }, { status: 400 });
    }

    // Fetch all active listings
    const allListings = await base44.asServiceRole.entities.Listing.filter(
      { status: 'active', moderationStatus: 'approved' },
      '-created_date',
      500
    );

    // Use AI to understand search intent and match listings
    const searchPrompt = `Du bist ein intelligenter Produktsuch-Assistent für einen Kleinanzeigen-Marktplatz.

Suchanfrage: "${query}"

Verfügbare Produkte (JSON):
${JSON.stringify(allListings.slice(0, 100).map(l => ({
  id: l.id,
  title: l.title,
  description: l.description,
  category: l.category,
  price: l.price,
  city: l.city
})))}

Aufgabe:
1. Verstehe die Suchintention des Nutzers (auch bei Tippfehlern, Synonymen, umgangssprachlichen Begriffen)
2. Finde die relevantesten Produkte, die zur Suchanfrage passen
3. Berücksichtige semantische Ähnlichkeit, nicht nur exakte Wortübereinstimmungen
4. Sortiere nach Relevanz

Beispiele:
- "Handy" → findet "Smartphone", "iPhone", "Samsung Galaxy"
- "Fahrrad" → findet "Bike", "Mountainbike", "Rennrad"
- "Auto billig" → findet günstige Autos
- "Couch rot" → findet rote Sofas

Gib die IDs der passenden Produkte zurück, sortiert nach Relevanz (höchste zuerst).`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          matchedIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs der relevanten Listings, sortiert nach Relevanz'
          },
          searchIntent: {
            type: 'string',
            description: 'Erkannte Suchintention'
          },
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Alternative Suchvorschläge'
          }
        }
      }
    });

    // Filter and sort listings based on AI results
    const rankedListings = aiResponse.matchedIds
      .map(id => allListings.find(l => l.id === id))
      .filter(Boolean)
      .slice(0, limit);

    return Response.json({
      success: true,
      results: rankedListings,
      searchIntent: aiResponse.searchIntent,
      suggestions: aiResponse.suggestions,
      totalResults: rankedListings.length
    });

  } catch (error) {
    console.error('Semantic search error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});