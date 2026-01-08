import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      title, 
      category, 
      condition, 
      keywords, 
      features,
      price, 
      images,
      targetAudience,
      tone,
      language = 'de'
    } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Analyze images for product details
    let imageInsights = null;
    let detectedFeatures = [];
    
    if (images && images.length > 0) {
      try {
        imageInsights = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Analizza dettagliatamente queste immagini del prodotto. Identifica:
1. Tipo di prodotto e marca (se visibile)
2. Condizione fisica (usura, graffi, danni)
3. Colori e materiali
4. Caratteristiche tecniche visibili
5. Accessori inclusi
6. Punti di forza visivi
7. Potenziali punti deboli

Sii molto dettagliato e preciso.`,
          file_urls: images.slice(0, 3),
          response_json_schema: {
            type: 'object',
            properties: {
              productType: { type: 'string' },
              brand: { type: 'string' },
              model: { type: 'string' },
              physicalCondition: { 
                type: 'object',
                properties: {
                  overall: { type: 'string', enum: ['nuovo', 'come_nuovo', 'buono', 'discreto', 'usato'] },
                  details: { type: 'array', items: { type: 'string' } }
                }
              },
              colors: { type: 'array', items: { type: 'string' } },
              materials: { type: 'array', items: { type: 'string' } },
              visibleFeatures: { type: 'array', items: { type: 'string' } },
              accessories: { type: 'array', items: { type: 'string' } },
              strengths: { type: 'array', items: { type: 'string' } },
              weaknesses: { type: 'array', items: { type: 'string' } }
            }
          }
        });
        
        detectedFeatures = [
          ...(imageInsights.visibleFeatures || []),
          ...(imageInsights.accessories || [])
        ];
      } catch (err) {
        console.error('Image analysis error:', err);
      }
    }

    // Determine tone and style
    const toneGuide = {
      professionale: 'formale, tecnico, affidabile',
      amichevole: 'conversazionale, caloroso, accessibile',
      urgente: 'dinamico, con senso di urgenza, esclusivo',
      lusso: 'elegante, esclusivo, sofisticato',
      giovane: 'fresco, moderno, diretto'
    };

    const selectedTone = toneGuide[tone] || toneGuide.amichevole;

    // Generate multiple description variants
    const descriptionPrompt = `Sei un copywriter esperto di e-commerce. Crea una descrizione prodotto eccezionale.

PRODOTTO:
- Titolo: ${title}
- Categoria: ${category || 'Non specificata'}
- Condizione: ${condition || 'Usato'}
- Prezzo: ${price ? price + '€' : 'Da definire'}
- Parole chiave fornite: ${keywords || 'Nessuna'}
- Caratteristiche indicate: ${features || 'Nessuna'}
- Target: ${targetAudience || 'Generale'}

${imageInsights ? `ANALISI IMMAGINI:
- Tipo: ${imageInsights.productType}
- Marca: ${imageInsights.brand || 'Non riconosciuta'}
- Condizione fisica: ${JSON.stringify(imageInsights.physicalCondition)}
- Caratteristiche visibili: ${imageInsights.visibleFeatures?.join(', ')}
- Accessori: ${imageInsights.accessories?.join(', ')}
- Punti di forza: ${imageInsights.strengths?.join(', ')}` : ''}

REQUISITI:
1. TONO: ${selectedTone}
2. Lunghezza: 150-200 parole
3. Struttura:
   - Hook iniziale accattivante
   - Descrizione caratteristiche principali
   - Benefici per l'acquirente
   - Condizioni e inclusioni
   - Call-to-action convincente
4. Usa emoji strategicamente (max 5)
5. Crea paragrafi brevi e leggibili
6. Includi parole chiave SEO naturalmente
7. Evidenzia il valore del prodotto

Genera 3 versioni diverse:
1. Versione BREVE (50-80 parole) - per descrizioni rapide
2. Versione STANDARD (120-150 parole) - equilibrata
3. Versione DETTAGLIATA (180-220 parole) - completa`;

    const descriptionsResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: descriptionPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          shortVersion: { 
            type: 'object',
            properties: {
              text: { type: 'string' },
              wordCount: { type: 'number' }
            }
          },
          standardVersion: { 
            type: 'object',
            properties: {
              text: { type: 'string' },
              wordCount: { type: 'number' }
            }
          },
          detailedVersion: { 
            type: 'object',
            properties: {
              text: { type: 'string' },
              wordCount: { type: 'number' }
            }
          },
          headline: { type: 'string', description: 'Titolo accattivante alternativo' },
          highlights: { 
            type: 'array', 
            items: { type: 'string' },
            description: '5 punti chiave di vendita'
          },
          targetEmotions: {
            type: 'array',
            items: { type: 'string' },
            description: 'Emozioni che la descrizione mira a suscitare'
          }
        }
      }
    });

    // Generate SEO optimization
    const seoResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Genera ottimizzazioni SEO per questo prodotto:
Titolo: ${title}
Categoria: ${category}
Descrizione: ${descriptionsResponse.standardVersion?.text || ''}

Crea:
1. 10 parole chiave rilevanti per la ricerca
2. Meta title ottimizzato (max 60 caratteri)
3. Meta description (max 160 caratteri)
4. 5 hashtag per social media
5. Long-tail keywords (frasi di 3-4 parole)`,
      response_json_schema: {
        type: 'object',
        properties: {
          primaryKeywords: { type: 'array', items: { type: 'string' } },
          longTailKeywords: { type: 'array', items: { type: 'string' } },
          metaTitle: { type: 'string' },
          metaDescription: { type: 'string' },
          hashtags: { type: 'array', items: { type: 'string' } },
          searchTerms: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'Termini che gli acquirenti potrebbero cercare'
          }
        }
      }
    });

    // Generate persuasion elements
    const persuasionResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Crea elementi persuasivi per questo annuncio:
Prodotto: ${title}
Prezzo: ${price}€
Condizione: ${condition}

Genera:
1. 3 urgency triggers (frasi che creano urgenza)
2. 3 social proof suggestions (come aggiungere credibilità)
3. 3 obiezioni comuni e relative risposte
4. 2 garanzie/rassicurazioni da evidenziare`,
      response_json_schema: {
        type: 'object',
        properties: {
          urgencyTriggers: { type: 'array', items: { type: 'string' } },
          socialProof: { type: 'array', items: { type: 'string' } },
          objectionHandlers: { 
            type: 'array', 
            items: { 
              type: 'object',
              properties: {
                objection: { type: 'string' },
                response: { type: 'string' }
              }
            }
          },
          trustSignals: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      success: true,
      descriptions: {
        short: descriptionsResponse.shortVersion,
        standard: descriptionsResponse.standardVersion,
        detailed: descriptionsResponse.detailedVersion
      },
      headline: descriptionsResponse.headline,
      highlights: descriptionsResponse.highlights,
      targetEmotions: descriptionsResponse.targetEmotions,
      seo: seoResponse,
      persuasion: persuasionResponse,
      imageInsights,
      detectedFeatures
    });

  } catch (error) {
    console.error('Advanced description generation error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});