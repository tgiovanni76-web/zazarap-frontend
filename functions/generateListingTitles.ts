import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, description, price, keywords } = await req.json();

    if (!category) {
      return Response.json({ 
        error: 'Kategorie erforderlich',
        success: false 
      }, { status: 400 });
    }

    // Hole ähnliche erfolgreiche Listings für Inspiration
    const similarListings = await base44.asServiceRole.entities.Listing.filter(
      { 
        category,
        status: 'sold'
      },
      '-created_date',
      10
    );

    const successfulTitles = similarListings
      .map(l => l.title)
      .filter(Boolean)
      .slice(0, 5);

    // Generiere Titel mit KI
    const prompt = `Generiere 5 ansprechende, SEO-optimierte Produkttitel für einen Online-Marktplatz.

Produktdetails:
- Kategorie: ${category}
${description ? `- Beschreibung: ${description.substring(0, 200)}` : ''}
${price ? `- Preis: ${price}€` : ''}
${keywords ? `- Schlagwörter: ${keywords}` : ''}

${successfulTitles.length > 0 ? `Erfolgreiche Beispiele aus der Kategorie:
${successfulTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : ''}

Anforderungen:
- 40-70 Zeichen optimal
- Wichtigste Infos vorne
- Suchmaschinenfreundlich
- Ansprechend und verkaufsfördernd
- Keine Übertreibungen
- Keine Emojis

Generiere 5 verschiedene Titel mit unterschiedlichen Ansätzen (z.B. informativ, emotional, feature-fokussiert).`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          titles: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Der generierte Titel'
                },
                style: {
                  type: 'string',
                  enum: ['informativ', 'emotional', 'feature-fokussiert', 'preis-orientiert', 'qualitäts-orientiert'],
                  description: 'Stil des Titels'
                },
                reason: {
                  type: 'string',
                  description: 'Warum dieser Titel gut ist (1 Satz)'
                }
              }
            },
            minItems: 5,
            maxItems: 5
          }
        }
      }
    });

    // Berechne SEO-Score und Länge für jeden Titel
    const titlesWithMetrics = result.titles.map(titleObj => {
      const length = titleObj.title.length;
      let seoScore = 50;

      // Bewerte Länge
      if (length >= 40 && length <= 70) seoScore += 20;
      else if (length >= 30 && length <= 80) seoScore += 10;

      // Bewerte Keywords
      if (keywords) {
        const keywordList = keywords.toLowerCase().split(/[,\s]+/);
        const titleLower = titleObj.title.toLowerCase();
        const keywordMatches = keywordList.filter(kw => titleLower.includes(kw)).length;
        seoScore += Math.min(keywordMatches * 10, 30);
      }

      // Bewerte Kategorie-Erwähnung
      if (titleObj.title.toLowerCase().includes(category.toLowerCase())) {
        seoScore += 10;
      }

      return {
        ...titleObj,
        length,
        seoScore: Math.min(seoScore, 100)
      };
    });

    // Sortiere nach SEO-Score
    titlesWithMetrics.sort((a, b) => b.seoScore - a.seoScore);

    return Response.json({
      success: true,
      titles: titlesWithMetrics,
      count: titlesWithMetrics.length
    });

  } catch (error) {
    console.error('Title generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});