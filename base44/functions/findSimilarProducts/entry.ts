import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { listingId, limit = 6 } = await req.json();

    if (!listingId) {
      return Response.json({ error: 'listingId required' }, { status: 400 });
    }

    // Fetch the reference listing
    const referenceListings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    const referenceListing = referenceListings[0];

    if (!referenceListing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Fetch candidate listings (same category, active)
    const candidates = await base44.asServiceRole.entities.Listing.filter({
      category: referenceListing.category,
      status: 'active',
      moderationStatus: 'approved'
    }, '-created_date', 100);

    // Remove the reference listing itself
    const filteredCandidates = candidates.filter(l => l.id !== listingId);

    if (filteredCandidates.length === 0) {
      return Response.json({
        success: true,
        similar: [],
        message: 'Keine ähnlichen Produkte gefunden'
      });
    }

    // Use AI for similarity analysis
    let similarityPrompt = `Du bist ein Produktvergleichs-Assistent. Finde die ähnlichsten Produkte zum Referenzprodukt.

Referenzprodukt:
Titel: ${referenceListing.title}
Beschreibung: ${referenceListing.description || 'Keine'}
Kategorie: ${referenceListing.category}
Preis: ${referenceListing.price}€

Vergleichsprodukte:
${filteredCandidates.slice(0, 50).map((l, idx) => `
${idx + 1}. ID: ${l.id}
   Titel: ${l.title}
   Beschreibung: ${l.description?.substring(0, 100) || 'Keine'}
   Preis: ${l.price}€
`).join('\n')}

Aufgabe: Finde die ${limit} ähnlichsten Produkte basierend auf:
- Produkttyp und Eigenschaften
- Beschreibungsinhalt
- Preisklasse (±30% vom Referenzpreis)
- Verwendungszweck

Sortiere nach Ähnlichkeit (höchste zuerst).`;

    // If reference has images, analyze them
    if (referenceListing.images && referenceListing.images.length > 0) {
      similarityPrompt += `\n\nReferenzbild verfügbar. Berücksichtige auch visuelle Ähnlichkeit bei der Bewertung.`;
      
      const imageAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analysiere dieses Produktbild und beschreibe: Produkttyp, Farbe, Zustand, Stil, Besonderheiten.`,
        file_urls: [referenceListing.images[0]],
        response_json_schema: {
          type: 'object',
          properties: {
            productType: { type: 'string' },
            colors: { type: 'array', items: { type: 'string' } },
            condition: { type: 'string' },
            style: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      similarityPrompt += `\n\nBildanalyse: ${JSON.stringify(imageAnalysis)}`;
    }

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: similarityPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          similarIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs der ähnlichsten Listings'
          },
          reasons: {
            type: 'array',
            items: { type: 'string' },
            description: 'Gründe für Ähnlichkeit (ein Grund pro ID)'
          }
        }
      }
    });

    // Build result with similarity reasons
    const similarListings = aiResponse.similarIds
      .map((id, idx) => {
        const listing = filteredCandidates.find(l => l.id === id);
        if (!listing) return null;
        return {
          ...listing,
          similarityReason: aiResponse.reasons[idx] || 'Ähnliches Produkt'
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return Response.json({
      success: true,
      similar: similarListings,
      totalFound: similarListings.length
    });

  } catch (error) {
    console.error('Similar products error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});