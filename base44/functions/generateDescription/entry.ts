import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, category, condition, price, images, features } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Analyze images if provided
    let imageInsights = '';
    if (images && images.length > 0) {
      try {
        const imageAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analizza queste immagini di prodotto e descrivi cosa vedi in modo conciso.`,
          file_urls: images.slice(0, 2),
          response_json_schema: {
            type: "object",
            properties: {
              description: { type: "string" }
            }
          }
        });
        imageInsights = imageAnalysis.description;
      } catch (err) {
        console.error('Image analysis failed:', err);
      }
    }

    // Get market insights for better descriptions
    const allListings = await base44.asServiceRole.entities.Listing.list();
    const categoryListings = allListings
      .filter(l => l.category === category && l.status === 'active')
      .slice(0, 20);

    const avgPrice = categoryListings.length > 0
      ? categoryListings.reduce((sum, l) => sum + (l.price || 0), 0) / categoryListings.length
      : price;

    const pricePosition = price < avgPrice * 0.8 ? 'ottimo affare' :
                          price > avgPrice * 1.2 ? 'premium' : 'competitivo';

    // AI prompt for persuasive description
    const prompt = `Sei un copywriter esperto di e-commerce. Crea una descrizione di prodotto PERSUASIVA e DETTAGLIATA.

PRODOTTO:
Titolo: ${title}
Categoria: ${category}
Condizione: ${condition || 'usato'}
Prezzo: ${price}€ (${pricePosition} - media categoria: ${avgPrice.toFixed(2)}€)
${features ? `Caratteristiche specifiche: ${features}` : ''}
${imageInsights ? `Dalle immagini: ${imageInsights}` : ''}

OBIETTIVO:
Creare una descrizione che:
1. Catturi l'attenzione nei primi 2 secondi
2. Evidenzi i benefici chiave (non solo caratteristiche)
3. Crei urgenza e desiderio
4. Anticipi e risolva obiezioni comuni
5. Includa call-to-action efficace

STRUTTURA:
- Hook iniziale accattivante (1 frase)
- Descrizione dettagliata con benefici
- Specifiche tecniche (se pertinenti)
- Condizioni e dettagli d'uso
- Invito all'azione

TONO:
- Professionale ma amichevole
- Onesto e trasparente
- Entusiasta ma credibile
- Ottimizzato per conversione

LUNGHEZZA: 150-250 parole

Scrivi SOLO la descrizione, senza titoli o formattazione speciale.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          description: { type: "string" },
          highlights: {
            type: "array",
            items: { type: "string" }
          },
          keywords: {
            type: "array",
            items: { type: "string" }
          },
          callToAction: { type: "string" }
        }
      }
    });

    return Response.json({
      success: true,
      description: aiResponse.description,
      highlights: aiResponse.highlights || [],
      keywords: aiResponse.keywords || [],
      callToAction: aiResponse.callToAction,
      imageInsights: imageInsights || null,
      marketPosition: pricePosition
    });

  } catch (error) {
    console.error('Description generation error:', error);
    return Response.json({ 
      error: error.message,
      description: ''
    }, { status: 500 });
  }
});