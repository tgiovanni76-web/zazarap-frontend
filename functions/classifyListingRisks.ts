import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { listingId } = await req.json();

    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    if (!listings || listings.length === 0) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listings[0];

    // Get seller history
    const sellerListings = await base44.asServiceRole.entities.Listing.filter({ 
      created_by: listing.created_by 
    });

    const moderationEvents = await base44.asServiceRole.entities.ModerationEvent.filter({
      entityType: 'listing',
      entityId: listingId
    });

    const prompt = `Analizza questo annuncio e fornisci una classificazione dettagliata dei rischi.

ANNUNCIO:
- Titolo: ${listing.title}
- Descrizione: ${listing.description}
- Categoria: ${listing.category}
- Prezzo: ${listing.price}€
- Venditore: ${listing.created_by}
- Annunci totali venditore: ${sellerListings.length}
- Eventi moderazione passati: ${moderationEvents.length}

Fornisci:
1. Categoria di rischio principale
2. Sottocategorie specifiche
3. Punteggio di affidabilità (0-100)
4. Fattori di rischio identificati
5. Segnali positivi
6. Raccomandazioni per il moderatore`;

    const classification = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          primaryRiskCategory: { type: "string" },
          subCategories: {
            type: "array",
            items: { type: "string" }
          },
          trustScore: { type: "number" },
          riskFactors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                factor: { type: "string" },
                impact: { type: "string" },
                evidence: { type: "string" }
              }
            }
          },
          positiveSignals: {
            type: "array",
            items: { type: "string" }
          },
          moderatorRecommendations: {
            type: "array",
            items: { type: "string" }
          },
          suggestedAction: {
            type: "string",
            enum: ["approve_immediately", "standard_review", "detailed_review", "reject"]
          }
        }
      }
    });

    // Update listing with AI classification
    await base44.asServiceRole.entities.Listing.update(listingId, {
      moderationNotes: `AI Classification: ${classification.suggestedAction} (Trust: ${classification.trustScore}/100)`
    });

    return Response.json({
      success: true,
      classification
    });

  } catch (error) {
    console.error('Classification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});