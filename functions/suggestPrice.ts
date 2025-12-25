import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, condition, images } = await req.json();

    if (!title || !category) {
      return Response.json({ error: 'Title and category required' }, { status: 400 });
    }

    // Fetch similar listings in the same category
    const similarListings = await base44.asServiceRole.entities.Listing.filter(
      { category, status: 'active' },
      '-created_date',
      100
    );

    // Fetch sold listings for conversion analysis
    const soldListings = await base44.asServiceRole.entities.Listing.filter(
      { category, status: 'sold' },
      '-created_date',
      50
    );

    // Calculate market statistics
    const prices = similarListings.map(l => l.price).filter(p => p > 0);
    const soldPrices = soldListings.map(l => l.price).filter(p => p > 0);
    
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const medianPrice = prices.length > 0 ? prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)] : 0;
    const avgSoldPrice = soldPrices.length > 0 ? soldPrices.reduce((a, b) => a + b, 0) / soldPrices.length : 0;

    // Use AI for intelligent pricing
    let aiPrompt = `Du bist ein Preis-Experte für einen Kleinanzeigen-Marktplatz. Analysiere den Markt und schlage einen optimalen Preis vor.

Produkt:
Titel: ${title}
Beschreibung: ${description || 'Keine'}
Kategorie: ${category}
Zustand: ${condition || 'Nicht angegeben'}

Marktdaten (${category}):
- Ähnliche aktive Anzeigen: ${similarListings.length}
- Durchschnittspreis aktiv: ${avgPrice.toFixed(2)}€
- Medianpreis aktiv: ${medianPrice.toFixed(2)}€
- Verkaufte Anzeigen: ${soldListings.length}
- Durchschnittspreis verkauft: ${avgSoldPrice.toFixed(2)}€

Beispiel-Preise aus dem Markt:
${similarListings.slice(0, 10).map(l => `"${l.title}" - ${l.price}€`).join('\n')}

Aufgabe:
1. Analysiere die Marktsituation
2. Berücksichtige Zustand, Besonderheiten, Nachfrage
3. Schlage einen optimalen Preis vor (realistisch und wettbewerbsfähig)
4. Gib auch eine Min-Max Preisspanne an
5. Erkläre kurz die Preisstrategie`;

    if (images && images.length > 0) {
      aiPrompt += `\n\nProduktbild verfügbar - berücksichtige visuellen Zustand bei der Preisempfehlung.`;
    }

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      file_urls: images && images.length > 0 ? [images[0]] : undefined,
      response_json_schema: {
        type: 'object',
        properties: {
          suggestedPrice: { type: 'number', description: 'Empfohlener Preis in EUR' },
          minPrice: { type: 'number', description: 'Mindestpreis' },
          maxPrice: { type: 'number', description: 'Maximalpreis' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Vertrauensniveau' },
          strategy: { type: 'string', description: 'Preisstrategie-Erklärung' },
          marketPosition: { type: 'string', enum: ['budget', 'mid-range', 'premium'], description: 'Marktpositionierung' }
        }
      }
    });

    return Response.json({
      success: true,
      ...aiResponse,
      marketData: {
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        medianPrice: parseFloat(medianPrice.toFixed(2)),
        averageSoldPrice: parseFloat(avgSoldPrice.toFixed(2)),
        activeListingsCount: similarListings.length,
        soldListingsCount: soldListings.length
      }
    });

  } catch (error) {
    console.error('Price suggestion error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});