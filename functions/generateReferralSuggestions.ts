import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's activity and interests
    const activities = await base44.entities.UserActivity.filter({
      userId: user.email
    }, '-created_date', 50);

    const listings = await base44.entities.Listing.filter({
      created_by: user.email
    });

    const favorites = await base44.entities.Favorite.filter({
      user_email: user.email
    });

    // Get categories of interest
    const categories = [...new Set([
      ...activities.map(a => a.category).filter(Boolean),
      ...listings.map(l => l.category).filter(Boolean)
    ])];

    const prompt = `Analizza il profilo utente e suggerisci a chi potrebbe invitare sulla piattaforma.

PROFILO UTENTE:
- Categorie di interesse: ${categories.join(', ')}
- Annunci pubblicati: ${listings.length}
- Preferiti salvati: ${favorites.length}
- Attività recenti: ${activities.length} azioni

OBIETTIVO: Suggerisci 5-8 tipologie di persone che potrebbero essere interessate al marketplace, basandoti sugli interessi dell'utente.

Per ogni suggerimento fornisci:
1. Tipologia persona (es: "Appassionati di fotografia")
2. Perché sarebbe interessata
3. Messaggio personalizzato da usare nell'invito
4. Score di compatibilità (0-100)`;

    const suggestions = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                targetType: { type: "string" },
                reason: { type: "string" },
                inviteMessage: { type: "string" },
                compatibilityScore: { type: "number" }
              }
            }
          },
          personalizedIntro: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      suggestions: suggestions.suggestions,
      personalizedIntro: suggestions.personalizedIntro
    });

  } catch (error) {
    console.error('Referral suggestions error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});