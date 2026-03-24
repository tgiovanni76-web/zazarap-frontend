import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, condition, images } = await req.json();

    if (!title) {
      return Response.json({ error: 'Title required' }, { status: 400 });
    }

    // Market analysis - get similar listings
    const allListings = await base44.asServiceRole.entities.Listing.list();
    const categoryListings = allListings.filter(l => 
      l.category === category && 
      l.status === 'active' && 
      l.price > 0
    );

    // Calculate market statistics
    const prices = categoryListings.map(l => l.price).sort((a, b) => a - b);
    const avgPrice = prices.length > 0 
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
      : 0;
    const medianPrice = prices.length > 0 
      ? prices[Math.floor(prices.length / 2)] 
      : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    // Get recently sold items (from orders) for demand analysis
    const recentOrders = await base44.asServiceRole.entities.Order.filter(
      { status: 'delivered' },
      '-created_date',
      100
    );
    
    const orderItems = await base44.asServiceRole.entities.OrderItem.list();
    const soldItems = orderItems.filter(item => 
      recentOrders.some(order => order.id === item.orderId)
    );

    // Calculate conversion rate
    const categoryViews = categoryListings.length;
    const categorySales = soldItems.length;
    const conversionRate = categoryViews > 0 ? (categorySales / categoryViews) * 100 : 0;

    // Analyze image quality for value assessment
    let imageQualityScore = 5;
    if (images && images.length > 0) {
      try {
        const imageAnalysis = await base44.integrations.Core.InvokeLLM({
          prompt: `Analizza la qualità di queste immagini di prodotto. Valuta su scala 1-10.`,
          file_urls: images.slice(0, 2),
          response_json_schema: {
            type: "object",
            properties: {
              score: { type: "number" },
              feedback: { type: "string" }
            }
          }
        });
        imageQualityScore = imageAnalysis.score;
      } catch (err) {
        console.error('Image quality check failed:', err);
      }
    }

    // AI-powered price suggestion with market context
    const prompt = `Sei un esperto di pricing per marketplace e-commerce. Suggerisci un prezzo ottimale.

PRODOTTO:
Titolo: ${title}
Descrizione: ${description || 'Non fornita'}
Categoria: ${category}
Condizione: ${condition || 'usato'}
Qualità immagini: ${imageQualityScore}/10
Numero immagini: ${images?.length || 0}

ANALISI DI MERCATO:
- Annunci attivi categoria: ${categoryListings.length}
- Prezzo medio: ${avgPrice.toFixed(2)}€
- Prezzo mediano: ${medianPrice.toFixed(2)}€
- Range prezzi: ${minPrice.toFixed(2)}€ - ${maxPrice.toFixed(2)}€
- Tasso conversione: ${conversionRate.toFixed(1)}%
- Vendite recenti: ${categorySales}

OBIETTIVO:
Suggerisci 3 prezzi strategici:
1. Prezzo COMPETITIVO: massimizza velocità di vendita
2. Prezzo OTTIMALE: bilancia valore e velocità
3. Prezzo PREMIUM: massimizza profitto

CONSIDERA:
- Condizioni del prodotto
- Qualità della presentazione
- Domanda di mercato
- Stagionalità
- Competizione

Fornisci anche una spiegazione dettagliata della strategia di pricing.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          competitive: { type: "number" },
          optimal: { type: "number" },
          premium: { type: "number" },
          reasoning: { type: "string" },
          marketTrend: { 
            type: "string",
            enum: ["growing", "stable", "declining"]
          },
          demandLevel: {
            type: "string", 
            enum: ["low", "medium", "high"]
          },
          recommendations: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      prices: {
        competitive: Math.round(aiResponse.competitive * 100) / 100,
        optimal: Math.round(aiResponse.optimal * 100) / 100,
        premium: Math.round(aiResponse.premium * 100) / 100
      },
      reasoning: aiResponse.reasoning,
      marketAnalysis: {
        avgPrice: Math.round(avgPrice * 100) / 100,
        medianPrice: Math.round(medianPrice * 100) / 100,
        priceRange: { min: minPrice, max: maxPrice },
        activeListings: categoryListings.length,
        recentSales: categorySales,
        conversionRate: Math.round(conversionRate * 10) / 10,
        trend: aiResponse.marketTrend,
        demand: aiResponse.demandLevel
      },
      recommendations: aiResponse.recommendations || [],
      imageQualityScore
    });

  } catch (error) {
    console.error('Price suggestion error:', error);
    return Response.json({ 
      error: error.message,
      prices: { competitive: 0, optimal: 0, premium: 0 }
    }, { status: 500 });
  }
});