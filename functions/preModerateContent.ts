import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const POLICY_CATEGORIES = {
  prohibited_items: ['armi', 'droghe', 'contraffazione', 'prodotti illegali'],
  misleading: ['clickbait', 'informazioni false', 'spam'],
  inappropriate: ['contenuto esplicito', 'linguaggio offensivo', 'hate speech'],
  safety: ['informazioni personali', 'link sospetti', 'frodi']
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, price } = await req.json();

    const prompt = `Analizza questo annuncio per potenziali violazioni delle policy PRIMA della pubblicazione.

ANNUNCIO:
- Titolo: ${title}
- Descrizione: ${description}
- Categoria: ${category}
- Prezzo: ${price}€

POLICY DA VERIFICARE:
1. Articoli proibiti (armi, droghe, contraffazione)
2. Contenuto ingannevole o spam
3. Linguaggio inappropriato
4. Rischi per la sicurezza

Fornisci un'analisi dettagliata con:
- Livello di rischio (low/medium/high/critical)
- Categorie di rischio identificate
- Problemi specifici trovati
- Suggerimenti per migliorare
- Se l'annuncio dovrebbe essere approvato, rivisto o rifiutato`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          riskCategories: {
            type: "array",
            items: { type: "string" }
          },
          violations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" },
                location: { type: "string" }
              }
            }
          },
          improvements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                issue: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          },
          recommendation: {
            type: "string",
            enum: ["approve", "review", "reject"]
          },
          score: { type: "number" },
          detailedAnalysis: { type: "string" }
        }
      }
    });

    // Create moderation event for tracking
    await base44.asServiceRole.entities.ModerationEvent.create({
      entityType: 'listing',
      entityId: 'pre-submit',
      action: 'reviewed',
      severity: analysis.riskLevel,
      reason: `Pre-moderation: ${analysis.recommendation}`,
      moderatorId: 'AI_SYSTEM',
      details: JSON.stringify(analysis)
    });

    return Response.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Pre-moderation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});