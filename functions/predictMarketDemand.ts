import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      productTitle, 
      category, 
      currentPrice,
      condition,
      location 
    } = await req.json();

    if (!productTitle) {
      return Response.json({ 
        error: 'Titolo prodotto richiesto',
        success: false 
      }, { status: 400 });
    }

    // Fetch recent listings in same category for market analysis
    const recentListings = await base44.asServiceRole.entities.Listing.filter(
      category ? { category, moderationStatus: 'approved', status: 'active' } : { moderationStatus: 'approved', status: 'active' },
      '-created_date',
      100
    );

    // Calculate market statistics
    const categoryListings = recentListings.filter(l => 
      l.title?.toLowerCase().includes(productTitle.toLowerCase().split(' ')[0]) ||
      l.category === category
    );

    const prices = categoryListings.map(l => l.price).filter(p => p > 0);
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Fetch user activities for demand signals
    const recentSearches = await base44.asServiceRole.entities.UserActivity.filter(
      { activityType: 'search' },
      '-created_date',
      500
    );

    const recentViews = await base44.asServiceRole.entities.UserActivity.filter(
      { activityType: 'view' },
      '-created_date',
      500
    );

    // Analyze search trends
    const searchTerms = recentSearches.map(s => s.searchTerm?.toLowerCase() || '');
    const productKeywords = productTitle.toLowerCase().split(' ');
    const relevantSearches = searchTerms.filter(term => 
      productKeywords.some(kw => term.includes(kw))
    ).length;

    // Analyze view trends for similar products
    const relevantViews = recentViews.filter(v => 
      v.category === category || 
      categoryListings.some(l => l.id === v.listingId)
    ).length;

    // Get AI market prediction
    const marketPrediction = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Sei un analista di mercato e-commerce. Analizza la domanda di mercato per questo prodotto.

PRODOTTO:
- Titolo: ${productTitle}
- Categoria: ${category || 'Non specificata'}
- Prezzo attuale: ${currentPrice ? currentPrice + '€' : 'Non definito'}
- Condizione: ${condition || 'Usato'}
- Località: ${location || 'Italia'}

DATI DI MERCATO:
- Annunci simili attivi: ${categoryListings.length}
- Prezzo medio di mercato: ${avgPrice.toFixed(2)}€
- Range prezzi: ${minPrice}€ - ${maxPrice}€
- Ricerche recenti correlate: ${relevantSearches}
- Visualizzazioni prodotti simili: ${relevantViews}

Fornisci:
1. Stima della domanda (scala 1-10)
2. Velocità di vendita prevista
3. Prezzo ottimale suggerito
4. Migliori momenti per pubblicare
5. Fattori stagionali
6. Trend del mercato
7. Strategie di pricing
8. Rischi e opportunità`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          demandScore: { 
            type: 'number',
            description: 'Punteggio domanda 1-10'
          },
          demandLevel: {
            type: 'string',
            enum: ['molto_alta', 'alta', 'media', 'bassa', 'molto_bassa']
          },
          expectedSaleTime: {
            type: 'object',
            properties: {
              optimistic: { type: 'string' },
              realistic: { type: 'string' },
              pessimistic: { type: 'string' }
            }
          },
          pricingStrategy: {
            type: 'object',
            properties: {
              recommendedPrice: { type: 'number' },
              quickSalePrice: { type: 'number' },
              premiumPrice: { type: 'number' },
              priceJustification: { type: 'string' }
            }
          },
          bestTimeToSell: {
            type: 'object',
            properties: {
              bestDays: { type: 'array', items: { type: 'string' } },
              bestHours: { type: 'array', items: { type: 'string' } },
              seasonalFactors: { type: 'string' }
            }
          },
          marketTrend: {
            type: 'object',
            properties: {
              direction: { type: 'string', enum: ['crescente', 'stabile', 'decrescente'] },
              reason: { type: 'string' },
              forecast3Months: { type: 'string' }
            }
          },
          competitionAnalysis: {
            type: 'object',
            properties: {
              level: { type: 'string', enum: ['alta', 'media', 'bassa'] },
              activeCompetitors: { type: 'number' },
              differentiationTips: { type: 'array', items: { type: 'string' } }
            }
          },
          buyerPersona: {
            type: 'object',
            properties: {
              typicalBuyer: { type: 'string' },
              buyingMotivations: { type: 'array', items: { type: 'string' } },
              priceExpectations: { type: 'string' }
            }
          },
          risks: { type: 'array', items: { type: 'string' } },
          opportunities: { type: 'array', items: { type: 'string' } },
          actionableInsights: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                action: { type: 'string' },
                impact: { type: 'string', enum: ['alto', 'medio', 'basso'] },
                effort: { type: 'string', enum: ['facile', 'medio', 'difficile'] }
              }
            }
          }
        }
      }
    });

    // Generate inventory recommendations
    const inventoryAdvice = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Basandoti sull'analisi di mercato per "${productTitle}" in categoria "${category}", fornisci consigli specifici per la gestione delle scorte.

Domanda stimata: ${marketPrediction.demandLevel}
Trend: ${marketPrediction.marketTrend?.direction}
Concorrenza: ${marketPrediction.competitionAnalysis?.level}

Consiglia:
1. Quantità ottimale da tenere in stock
2. Quando rifornirsi
3. Prodotti complementari da considerare
4. Strategie di bundle
5. Alert di prezzo da impostare`,
      response_json_schema: {
        type: 'object',
        properties: {
          stockRecommendation: {
            type: 'object',
            properties: {
              optimalQuantity: { type: 'string' },
              restockTrigger: { type: 'string' },
              seasonalAdjustments: { type: 'array', items: { type: 'string' } }
            }
          },
          complementaryProducts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product: { type: 'string' },
                synergy: { type: 'string' },
                bundleIdea: { type: 'string' }
              }
            }
          },
          priceAlerts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                condition: { type: 'string' },
                action: { type: 'string' }
              }
            }
          },
          marketingTiming: {
            type: 'object',
            properties: {
              promotionPeriods: { type: 'array', items: { type: 'string' } },
              avoidPeriods: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    });

    return Response.json({
      success: true,
      product: {
        title: productTitle,
        category,
        currentPrice,
        condition
      },
      marketData: {
        similarListings: categoryListings.length,
        averagePrice: Math.round(avgPrice * 100) / 100,
        priceRange: { min: minPrice, max: maxPrice },
        recentSearches: relevantSearches,
        recentViews: relevantViews
      },
      prediction: marketPrediction,
      inventory: inventoryAdvice,
      confidence: {
        level: categoryListings.length >= 10 ? 'alta' : categoryListings.length >= 5 ? 'media' : 'bassa',
        dataPoints: categoryListings.length + relevantSearches + relevantViews,
        note: categoryListings.length < 5 
          ? 'Dati limitati disponibili, le previsioni potrebbero essere meno accurate'
          : 'Previsioni basate su dati di mercato sufficienti'
      },
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Market prediction error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});