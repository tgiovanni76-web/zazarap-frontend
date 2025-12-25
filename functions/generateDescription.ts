import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, category, condition, features, price, images } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Analyze image if provided
    let imageInsights = null;
    if (images && images.length > 0) {
      try {
        imageInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analysiere dieses Produktbild detailliert. Beschreibe: Produkttyp, Zustand, Farbe, Besonderheiten, sichtbare Features, Marke (falls erkennbar).`,
          file_urls: [images[0]],
          response_json_schema: {
            type: 'object',
            properties: {
              productType: { type: 'string' },
              condition: { type: 'string' },
              colors: { type: 'array', items: { type: 'string' } },
              features: { type: 'array', items: { type: 'string' } },
              brand: { type: 'string' }
            }
          }
        });
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    }

    // Generate compelling description
    const descriptionPrompt = `Du bist ein professioneller Texter für Kleinanzeigen. Erstelle eine überzeugende, verkaufsstarke Produktbeschreibung.

Produkt:
Titel: ${title}
Kategorie: ${category || 'Nicht angegeben'}
Zustand: ${condition || 'Gebraucht'}
Preis: ${price ? price + '€' : 'Zu verhandeln'}
Features: ${features || 'Keine angegeben'}

${imageInsights ? `Bildanalyse: ${JSON.stringify(imageInsights)}` : ''}

Anforderungen:
1. Schreibe einen ansprechenden, informativen Text (ca. 100-150 Wörter)
2. Hebe wichtige Features und Vorteile hervor
3. Beschreibe den Zustand ehrlich
4. Verwende verkaufsfördernde, aber authentische Sprache
5. Füge einen Call-to-Action am Ende hinzu
6. Nutze Emojis sparsam für wichtige Punkte
7. Strukturiere mit Absätzen für bessere Lesbarkeit

Stil: Freundlich, professionell, vertrauenswürdig`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: descriptionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string', description: 'Generierte Beschreibung' },
          highlights: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Wichtigste Verkaufsargumente (3-5 Punkte)' 
          },
          seoKeywords: {
            type: 'array',
            items: { type: 'string' },
            description: 'SEO-Keywords für bessere Auffindbarkeit'
          }
        }
      }
    });

    return Response.json({
      success: true,
      ...aiResponse,
      imageInsights
    });

  } catch (error) {
    console.error('Description generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});