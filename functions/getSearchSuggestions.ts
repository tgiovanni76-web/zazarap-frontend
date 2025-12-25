import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { query, limit = 8 } = await req.json();

    if (!query || query.length < 2) {
      return Response.json({ suggestions: [] });
    }

    // Get popular search terms from UserActivity
    const recentSearches = await base44.asServiceRole.entities.UserActivity.filter(
      { activityType: 'search' },
      '-created_date',
      500
    );

    // Count search frequency
    const searchFrequency = {};
    recentSearches.forEach(s => {
      if (s.searchTerm) {
        const term = s.searchTerm.toLowerCase();
        searchFrequency[term] = (searchFrequency[term] || 0) + 1;
      }
    });

    // Get all listings for product-based suggestions
    const listings = await base44.asServiceRole.entities.Listing.filter(
      { status: 'active', moderationStatus: 'approved' },
      '-created_date',
      200
    );

    // Extract keywords from listings
    const productKeywords = new Set();
    listings.forEach(l => {
      const words = (l.title + ' ' + (l.description || '')).toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 3) productKeywords.add(word);
      });
    });

    // Use AI to generate intelligent suggestions
    const suggestionPrompt = `Du bist ein Suchvorschlags-Assistent für einen Kleinanzeigen-Marktplatz.

Eingabe: "${query}"

Beliebte Suchbegriffe (mit Häufigkeit):
${Object.entries(searchFrequency).slice(0, 30).map(([term, freq]) => `${term} (${freq}x)`).join(', ')}

Verfügbare Produktkategorien und Keywords:
${Array.from(productKeywords).slice(0, 100).join(', ')}

Aufgabe:
1. Generiere ${limit} relevante Suchvorschläge basierend auf der Eingabe
2. Berücksichtige:
   - Beliebte Suchbegriffe
   - Tippfehler-Korrektur
   - Synonyme und verwandte Begriffe
   - Vervollständigung (Auto-complete)
   - Produktkategorien

Beispiele:
- Eingabe "han" → "handy", "handtasche", "handball"
- Eingabe "fahr" → "fahrrad", "fahrradhelm", "fahrzeug"
- Eingabe "auto bil" → "auto billig", "auto blau", "auto berlin"

Gib nur echte, sinnvolle Vorschläge zurück, die Nutzer wahrscheinlich suchen.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: suggestionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suchvorschläge'
          }
        }
      }
    });

    // Combine AI suggestions with popular searches
    const queryLower = query.toLowerCase();
    const popularMatches = Object.keys(searchFrequency)
      .filter(term => term.includes(queryLower))
      .sort((a, b) => searchFrequency[b] - searchFrequency[a])
      .slice(0, 3);

    const combinedSuggestions = [
      ...new Set([...popularMatches, ...aiResponse.suggestions])
    ].slice(0, limit);

    return Response.json({
      success: true,
      suggestions: combinedSuggestions
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    // Fallback: return empty suggestions on error
    return Response.json({ 
      suggestions: [],
      success: false 
    });
  }
});