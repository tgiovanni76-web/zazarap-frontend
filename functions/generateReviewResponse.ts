import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { reviewId, autoPublish = false } = await req.json();

    if (!reviewId) {
      return Response.json({ error: 'reviewId required' }, { status: 400 });
    }

    // Get review
    const reviews = await base44.asServiceRole.entities.Review.filter({ id: reviewId });
    const review = reviews[0];

    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if already has response
    if (review.sellerResponse) {
      return Response.json({ 
        error: 'Review already has a response',
        existingResponse: review.sellerResponse 
      }, { status: 400 });
    }

    // Get listing context
    const listings = await base44.asServiceRole.entities.Listing.filter({ 
      id: review.listing_id 
    });
    const listing = listings[0];

    // Get seller's other reviews for context
    const sellerReviews = listing ? await base44.asServiceRole.entities.Review.filter({
      listing_id: listing.id
    }) : [];

    const avgRating = sellerReviews.length > 0
      ? sellerReviews.reduce((sum, r) => sum + r.rating, 0) / sellerReviews.length
      : 0;

    // AI response generation
    const responsePrompt = `Sei un assistente AI che genera risposte professionali a recensioni per venditori su Zazarap marketplace.

RECENSIONE DA RISPONDERE:
Valutazione: ${review.rating}/5 stelle
Commento: "${review.comment}"
Recensore: ${review.reviewer_email}

CONTESTO VENDITORE:
Prodotto: ${listing?.title || 'N/A'}
Media recensioni: ${avgRating.toFixed(1)}/5
Totale recensioni: ${sellerReviews.length}

LINEE GUIDA RISPOSTA:
1. TONO: Professionale, cordiale, empatico
2. LUNGHEZZA: 50-150 parole
3. STRUTTURA:
   - Ringraziamento per il feedback
   - Risposta specifica al commento
   - Risoluzione se problema segnalato
   - Chiusura positiva

4. GESTIONE PER RATING:
   - 5 stelle: Ringraziamento caloroso, invito a tornare
   - 4 stelle: Apprezzamento, disponibilità per migliorare
   - 3 stelle: Empatia, richiesta dettagli per migliorare
   - 1-2 stelle: Scuse sincere, offerta soluzione, contatto diretto

5. NON FARE:
   - Non essere difensivo o aggressivo
   - Non dare colpa al cliente
   - Non fare promesse impossibili
   - Non usare linguaggio troppo formale o robotico

6. OBIETTIVI:
   - Mostrare professionalità
   - Mantenere reputazione venditore
   - Risolvere problemi constructively
   - Incoraggiare futuri acquisti

Genera una risposta che rappresenti bene il brand Zazarap e il venditore.`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: responsePrompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          tone: {
            type: "string",
            enum: ["appreciative", "apologetic", "professional", "enthusiastic"]
          },
          requiresFollowup: { type: "boolean" },
          sentiment: {
            type: "string",
            enum: ["positive", "neutral", "negative"]
          },
          suggestedAction: { type: "string" }
        }
      }
    });

    // Auto-publish if requested and rating is not too low
    if (autoPublish && review.rating >= 3) {
      await base44.asServiceRole.entities.Review.update(reviewId, {
        sellerResponse: aiResponse.response,
        sellerResponseDate: new Date().toISOString(),
        sellerResponseAI: true
      });

      // Notify reviewer
      await base44.asServiceRole.entities.Notification.create({
        userId: review.reviewer_email,
        type: 'review_response',
        title: '💬 Il Venditore ha Risposto alla tua Recensione',
        message: `${listing?.title}: "${aiResponse.response.substring(0, 100)}..."`,
        relatedEntity: 'Review',
        relatedId: reviewId,
        priority: 'normal'
      });
    }

    return Response.json({
      success: true,
      reviewId,
      generatedResponse: {
        text: aiResponse.response,
        tone: aiResponse.tone,
        sentiment: aiResponse.sentiment,
        requiresFollowup: aiResponse.requiresFollowup,
        suggestedAction: aiResponse.suggestedAction
      },
      autoPublished: autoPublish && review.rating >= 3,
      reviewData: {
        rating: review.rating,
        comment: review.comment,
        listingTitle: listing?.title
      }
    });

  } catch (error) {
    console.error('Review response generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});