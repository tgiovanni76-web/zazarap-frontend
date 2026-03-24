import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { images, category, productType } = await req.json();

    if (!images || images.length === 0) {
      return Response.json({ 
        error: 'Almeno un\'immagine è richiesta',
        success: false 
      }, { status: 400 });
    }

    // Analyze each image in detail
    const imageAnalyses = await Promise.all(images.map(async (imageUrl, index) => {
      try {
        const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Sei un esperto fotografo di prodotti per e-commerce. Analizza questa immagine in modo dettagliato.

VALUTA (0-100):
1. Qualità tecnica (risoluzione, nitidezza, rumore)
2. Illuminazione (distribuzione, ombre, riflessi)
3. Composizione (inquadratura, regola dei terzi, spazio negativo)
4. Sfondo (pulizia, distrazione, professionalità)
5. Presentazione prodotto (visibilità dettagli, angolazione)
6. Appeal commerciale (attrattività per l'acquisto)

Per ogni aspetto, fornisci:
- Punteggio
- Cosa funziona bene
- Cosa migliorare
- Come migliorarlo praticamente`,
          file_urls: [imageUrl],
          response_json_schema: {
            type: 'object',
            properties: {
              overallScore: { type: 'number' },
              technicalQuality: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  strengths: { type: 'array', items: { type: 'string' } },
                  issues: { type: 'array', items: { type: 'string' } },
                  howToFix: { type: 'array', items: { type: 'string' } }
                }
              },
              lighting: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  type: { type: 'string', enum: ['naturale', 'artificiale', 'mista', 'flash'] },
                  quality: { type: 'string', enum: ['ottima', 'buona', 'sufficiente', 'scarsa'] },
                  issues: { type: 'array', items: { type: 'string' } },
                  suggestions: { type: 'array', items: { type: 'string' } }
                }
              },
              composition: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  angle: { type: 'string' },
                  framing: { type: 'string', enum: ['ottimo', 'buono', 'troppo_stretto', 'troppo_largo'] },
                  issues: { type: 'array', items: { type: 'string' } },
                  suggestions: { type: 'array', items: { type: 'string' } }
                }
              },
              background: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  type: { type: 'string' },
                  isClean: { type: 'boolean' },
                  distractions: { type: 'array', items: { type: 'string' } },
                  suggestions: { type: 'array', items: { type: 'string' } }
                }
              },
              productPresentation: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  visibleDetails: { type: 'array', items: { type: 'string' } },
                  missingDetails: { type: 'array', items: { type: 'string' } },
                  suggestions: { type: 'array', items: { type: 'string' } }
                }
              },
              commercialAppeal: {
                type: 'object',
                properties: {
                  score: { type: 'number' },
                  strengths: { type: 'array', items: { type: 'string' } },
                  weaknesses: { type: 'array', items: { type: 'string' } }
                }
              },
              isMainPhotoWorthy: { type: 'boolean' }
            }
          }
        });

        return {
          imageIndex: index,
          imageUrl,
          ...analysis
        };
      } catch (err) {
        console.error(`Error analyzing image ${index}:`, err);
        return {
          imageIndex: index,
          imageUrl,
          overallScore: 50,
          error: 'Analisi non disponibile'
        };
      }
    }));

    // Determine best main photo
    const bestMainPhoto = imageAnalyses.reduce((best, current) => 
      (current.overallScore > (best?.overallScore || 0)) ? current : best
    , null);

    // Generate recommended shots based on category
    const recommendedAngles = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Sei un esperto di fotografia di prodotti. Basandoti sulle immagini fornite e sulla categoria "${category || 'generale'}", 
suggerisci quali angolazioni e tipi di foto sono MANCANTI e sarebbero ESSENZIALI per vendere meglio questo prodotto.

Immagini attuali analizzate: ${images.length}
Punteggi: ${imageAnalyses.map((a, i) => `Foto ${i+1}: ${a.overallScore}/100`).join(', ')}

Per ogni tipo di foto mancante, spiega:
1. Quale angolazione/tipo di foto
2. Perché è importante
3. Come scattarla (setup pratico)
4. Esempio di composizione`,
      file_urls: images.slice(0, 2),
      response_json_schema: {
        type: 'object',
        properties: {
          existingAngles: {
            type: 'array',
            items: { type: 'string' },
            description: 'Angolazioni già presenti'
          },
          missingEssentialShots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: { type: 'string' },
                importance: { type: 'string', enum: ['critica', 'alta', 'media'] },
                reason: { type: 'string' },
                howToShoot: { type: 'string' },
                compositionTip: { type: 'string' }
              }
            }
          },
          recommendedPhotoOrder: {
            type: 'array',
            items: { type: 'string' },
            description: 'Ordine ottimale delle foto nell\'annuncio'
          },
          lifestyleShots: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suggerimenti per foto lifestyle/in uso'
          }
        }
      }
    });

    // Generate quick improvement tips
    const quickFixes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Basandoti sull'analisi delle immagini, fornisci 5 miglioramenti RAPIDI e PRATICI che il venditore può fare SUBITO senza attrezzatura professionale.

Problemi principali rilevati:
${imageAnalyses.flatMap(a => a.technicalQuality?.issues || []).slice(0, 5).join('\n')}
${imageAnalyses.flatMap(a => a.lighting?.issues || []).slice(0, 3).join('\n')}

Ogni suggerimento deve essere:
- Fattibile con uno smartphone
- Completabile in meno di 5 minuti
- Senza costi aggiuntivi`,
      response_json_schema: {
        type: 'object',
        properties: {
          quickFixes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                impact: { type: 'string', enum: ['alto', 'medio', 'basso'] },
                timeRequired: { type: 'string' },
                steps: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          smartphoneTips: {
            type: 'array',
            items: { type: 'string' }
          },
          freeTools: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                purpose: { type: 'string' },
                platform: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Calculate overall statistics
    const avgScore = imageAnalyses.reduce((sum, a) => sum + (a.overallScore || 0), 0) / imageAnalyses.length;
    
    let overallRating = 'da_migliorare';
    if (avgScore >= 85) overallRating = 'eccellente';
    else if (avgScore >= 70) overallRating = 'buono';
    else if (avgScore >= 55) overallRating = 'sufficiente';

    return Response.json({
      success: true,
      overallScore: Math.round(avgScore),
      overallRating,
      imageCount: images.length,
      analyses: imageAnalyses,
      bestMainPhoto: {
        index: bestMainPhoto?.imageIndex,
        score: bestMainPhoto?.overallScore,
        url: bestMainPhoto?.imageUrl
      },
      recommendations: recommendedAngles,
      quickFixes: quickFixes.quickFixes,
      smartphoneTips: quickFixes.smartphoneTips,
      freeTools: quickFixes.freeTools,
      summary: {
        strengths: imageAnalyses.flatMap(a => a.commercialAppeal?.strengths || []).slice(0, 5),
        criticalIssues: imageAnalyses.flatMap(a => [
          ...(a.technicalQuality?.issues || []),
          ...(a.lighting?.issues || [])
        ]).slice(0, 5),
        missingShots: recommendedAngles.missingEssentialShots?.filter(s => s.importance === 'critica') || []
      }
    });

  } catch (error) {
    console.error('Image suggestions error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});