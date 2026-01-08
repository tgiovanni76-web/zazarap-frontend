import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { listingId } = await req.json();

    if (!listingId) {
      return Response.json({ error: 'listingId required' }, { status: 400 });
    }

    // Get listing
    const listings = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
    const listing = listings[0];

    if (!listing) {
      return Response.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Comprehensive AI moderation
    const moderationPrompt = `Sei un sistema di moderazione AI avanzato per marketplace.

ANNUNCIO DA ANALIZZARE:
Titolo: ${listing.title}
Descrizione: ${listing.description || 'N/A'}
Categoria: ${listing.category}
Prezzo: ${listing.price}€
Città: ${listing.city || 'N/A'}

COMPITI:
1. RILEVAMENTO FRODI E NON CONFORMITÀ
   - Identifica segnali di potenziale frode (prezzi irrealistici, richieste sospette, promesse irrealistiche)
   - Rileva contenuti vietati (armi, droghe, prodotti contraffatti, servizi illegali)
   - Verifica coerenza tra titolo, descrizione e prezzo
   - Identifica pattern di spam o annunci duplicati

2. SUGGERIMENTI CATEGORIE E TAG
   - Suggerisci la categoria più appropriata se quella attuale non è corretta
   - Genera 5-10 tag pertinenti per migliorare la ricercabilità
   - Verifica la coerenza della categorizzazione

3. ANALISI QUALITÀ
   - Valuta la completezza delle informazioni
   - Suggerisci miglioramenti per titolo e descrizione
   - Identifica informazioni mancanti importanti

Fornisci un'analisi dettagliata e actionable.`;

    const moderationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: moderationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          fraudIndicators: {
            type: "array",
            items: { type: "string" }
          },
          prohibitedContent: {
            type: "array",
            items: { type: "string" }
          },
          isCompliant: { type: "boolean" },
          recommendedAction: {
            type: "string",
            enum: ["approve", "review", "reject"]
          },
          suggestedCategory: { type: "string" },
          suggestedTags: {
            type: "array",
            items: { type: "string" }
          },
          qualityScore: { type: "number" },
          improvements: {
            type: "array",
            items: { type: "string" }
          },
          moderatorNotes: { type: "string" }
        }
      }
    });

    // Analyze images if present
    let imageAnalysis = null;
    if (listing.images && listing.images.length > 0) {
      const imagePrompt = `Analizza queste immagini di prodotto per moderazione:

CONTESTO:
Titolo: ${listing.title}
Categoria: ${listing.category}

COMPITI:
1. Identifica contenuti inappropriati (violenza, nudità, contenuti offensivi)
2. Rileva immagini di bassa qualità (sfocate, scure, irrilevanti)
3. Verifica che le immagini corrispondano alla descrizione del prodotto
4. Identifica immagini stock o rubate da altri siti
5. Suggerisci se servono più immagini o angolazioni diverse

Fornisci un'analisi dettagliata della qualità e appropriatezza delle immagini.`;

      imageAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: imagePrompt,
        file_urls: listing.images.slice(0, 4),
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            hasInappropriateContent: { type: "boolean" },
            inappropriateReasons: {
              type: "array",
              items: { type: "string" }
            },
            qualityIssues: {
              type: "array",
              items: { type: "string" }
            },
            matchesDescription: { type: "boolean" },
            suspiciousImages: {
              type: "array",
              items: { type: "string" }
            },
            imageQualityScore: { type: "number" },
            recommendations: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });
    }

    // Calculate overall moderation score
    let finalRiskLevel = moderationResult.riskLevel;
    let finalAction = moderationResult.recommendedAction;

    if (imageAnalysis?.hasInappropriateContent) {
      finalRiskLevel = 'critical';
      finalAction = 'reject';
    }

    // Auto-apply suggestions if listing is low risk
    const updates = {};
    if (finalRiskLevel === 'low' && moderationResult.isCompliant) {
      if (moderationResult.suggestedTags && moderationResult.suggestedTags.length > 0) {
        updates.tags = moderationResult.suggestedTags;
      }
    }

    // Update listing moderation status
    const moderationStatus = finalAction === 'approve' ? 'approved' : 
                            finalAction === 'reject' ? 'rejected' : 'pending';

    await base44.asServiceRole.entities.Listing.update(listingId, {
      moderationStatus,
      ...updates,
      ...(finalAction === 'reject' && {
        rejectionReason: moderationResult.moderatorNotes
      })
    });

    // Create moderation event log
    await base44.asServiceRole.entities.ModerationEvent.create({
      listingId,
      moderatorId: 'AI_SYSTEM',
      action: finalAction,
      reason: moderationResult.moderatorNotes,
      aiAnalysis: JSON.stringify({
        riskLevel: finalRiskLevel,
        fraudIndicators: moderationResult.fraudIndicators,
        prohibitedContent: moderationResult.prohibitedContent,
        qualityScore: moderationResult.qualityScore,
        imageAnalysis
      }),
      automatedDecision: true
    });

    // Notify seller if rejected or needs review
    if (finalAction === 'reject') {
      await base44.asServiceRole.entities.Notification.create({
        userId: listing.created_by,
        type: 'listing_rejected',
        title: '❌ Annuncio Non Approvato',
        message: `Il tuo annuncio "${listing.title}" non è stato approvato: ${moderationResult.moderatorNotes}`,
        relatedEntity: 'Listing',
        relatedId: listingId,
        priority: 'high'
      });
    } else if (finalAction === 'review') {
      await base44.asServiceRole.entities.Notification.create({
        userId: listing.created_by,
        type: 'listing_review',
        title: '⚠️ Annuncio in Revisione',
        message: `Il tuo annuncio "${listing.title}" è in revisione manuale. Ti contatteremo presto.`,
        relatedEntity: 'Listing',
        relatedId: listingId,
        priority: 'normal'
      });
    }

    return Response.json({
      success: true,
      listingId,
      moderation: {
        riskLevel: finalRiskLevel,
        action: finalAction,
        status: moderationStatus,
        fraudIndicators: moderationResult.fraudIndicators,
        prohibitedContent: moderationResult.prohibitedContent,
        qualityScore: moderationResult.qualityScore,
        suggestedCategory: moderationResult.suggestedCategory,
        suggestedTags: moderationResult.suggestedTags,
        improvements: moderationResult.improvements,
        moderatorNotes: moderationResult.moderatorNotes
      },
      imageAnalysis: imageAnalysis ? {
        hasInappropriateContent: imageAnalysis.hasInappropriateContent,
        inappropriateReasons: imageAnalysis.inappropriateReasons,
        qualityIssues: imageAnalysis.qualityIssues,
        imageQualityScore: imageAnalysis.imageQualityScore,
        recommendations: imageAnalysis.recommendations
      } : null,
      appliedUpdates: updates
    });

  } catch (error) {
    console.error('Auto moderation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});