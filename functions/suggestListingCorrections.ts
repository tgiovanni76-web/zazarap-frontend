import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId } = await req.json();

    const listings = await base44.entities.Listing.filter({ id: listingId });
    if (!listings || listings.length === 0) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listings[0];
    if (listing.created_by !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const prompt = `Sei un esperto di marketplace e moderazione contenuti. Un annuncio è stato rifiutato per il seguente motivo:

MOTIVO RIFIUTO: ${listing.rejectionReason || 'Non specificato'}

NOTE MODERAZIONE: ${listing.moderationNotes || 'Nessuna nota'}

ANNUNCIO ORIGINALE:
- Titolo: ${listing.title}
- Descrizione: ${listing.description}
- Categoria: ${listing.category}
- Prezzo: ${listing.price}€

Analizza i problemi e fornisci:
1. Una spiegazione chiara del problema
2. Suggerimenti specifici per il titolo
3. Suggerimenti specifici per la descrizione
4. Altri miglioramenti necessari
5. Priorità delle correzioni (alta/media/bassa)

Sii specifico e costruttivo.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          problemExplanation: { type: "string" },
          titleSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          descriptionSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          otherImprovements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                suggestion: { type: "string" },
                priority: { type: "string" }
              }
            }
          },
          estimatedApprovalChance: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      corrections: response
    });

  } catch (error) {
    console.error('Suggestion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});