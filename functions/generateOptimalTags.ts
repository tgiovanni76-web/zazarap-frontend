import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, price, images } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Get similar listings for trend analysis
    const allListings = await base44.asServiceRole.entities.Listing.list();
    const categoryListings = allListings.filter(l => 
      l.category === category && l.status === 'active'
    );

    // Extract common tags from similar listings
    const existingTags = categoryListings
      .flatMap(l => l.tags || [])
      .filter(Boolean);
    
    const tagFrequency = existingTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const trendingTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // AI-powered tag generation
    const prompt = `Sei un esperto SEO e marketing per marketplace online.

PRODOTTO:
Titolo: ${title}
Categoria: ${category}
Prezzo: ${price}€
Descrizione: ${description || 'Non fornita'}
${images ? `Numero immagini: ${images.length}` : ''}

TAG TRENDING NELLA CATEGORIA:
${trendingTags.join(', ')}

COMPITO:
Genera una lista di 8-12 tag ottimizzati per:
1. Massimizzare la visibilità nelle ricerche
2. Catturare diverse varianti di ricerca
3. Includere tag trending quando pertinenti
4. Bilanciare specificità e ampiezza
5. Ottimizzare per SEO

REGOLE:
- Tag in italiano
- Mix di tag generici e specifici
- Include sinonimi e varianti
- Tag single-word o max 2 parole
- Pertinenti al prodotto
- No duplicati

ESEMPI BUONI:
- Per iPhone: "smartphone", "apple", "iphone", "cellulare", "tecnologia", "ios", "usato", "garantito"
- Per bici: "bicicletta", "bike", "mountain-bike", "ciclismo", "sport", "outdoor", "adulto"

Rispondi SOLO con array JSON di tag.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" }
        }
      }
    });

    // Deduplicate and clean tags
    const cleanedTags = Array.from(new Set(
      aiResponse.tags
        .map(tag => tag.toLowerCase().trim())
        .filter(tag => tag.length > 1 && tag.length < 30)
    )).slice(0, 12);

    return Response.json({
      success: true,
      tags: cleanedTags,
      reasoning: aiResponse.reasoning,
      trendingTags: trendingTags.slice(0, 5)
    });

  } catch (error) {
    console.error('Tag generation error:', error);
    return Response.json({ 
      error: error.message,
      tags: []
    }, { status: 500 });
  }
});