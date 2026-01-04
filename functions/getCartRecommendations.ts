import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cartItems } = await req.json();

    // Get user's purchase history
    const orders = await base44.entities.Order.filter({ userId: user.email }, '-created_date', 10);
    const orderItems = [];
    for (const order of orders) {
      const items = await base44.entities.OrderItem.filter({ orderId: order.id });
      orderItems.push(...items);
    }

    // Get user activity
    const activities = await base44.entities.UserActivity.filter({ 
      userId: user.email,
      activityType: 'view'
    }, '-created_date', 20);

    const cartItemsInfo = cartItems.map(item => ({
      title: item.listingTitle,
      category: item.category || 'generale',
      price: item.price
    }));

    const purchaseHistory = orderItems.map(item => ({
      title: item.listingTitle,
      category: item.category || 'generale'
    }));

    const viewedItems = activities.map(a => ({
      category: a.category
    }));

    const prompt = `Analizza il carrello dell'utente e suggerisci prodotti correlati o complementari.

ARTICOLI NEL CARRELLO:
${JSON.stringify(cartItemsInfo, null, 2)}

CRONOLOGIA ACQUISTI PASSATI:
${JSON.stringify(purchaseHistory.slice(0, 5), null, 2)}

CATEGORIE VISUALIZZATE RECENTEMENTE:
${JSON.stringify(viewedItems.slice(0, 10), null, 2)}

Fornisci raccomandazioni intelligenti considerando:
1. Prodotti complementari (es. se compra telefono, suggerisci cover/auricolari)
2. Prodotti correlati della stessa categoria
3. Prodotti frequentemente acquistati insieme
4. Pattern di acquisto dell'utente

Per ogni raccomandazione specifica: categoria, tipo prodotto, motivo, priorità (high/medium/low)`;

    const recommendations = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                productType: { type: "string" },
                reason: { type: "string" },
                priority: { type: "string" },
                estimatedPrice: { type: "string" }
              }
            }
          },
          crossSellOpportunities: {
            type: "array",
            items: { type: "string" }
          },
          personalizedMessage: { type: "string" }
        }
      }
    });

    // Find actual listings matching recommendations
    const allListings = await base44.entities.Listing.filter({ 
      status: 'active',
      moderationStatus: 'approved'
    }, '-created_date', 50);

    const matchedProducts = [];
    for (const rec of recommendations.recommendations.slice(0, 6)) {
      const matches = allListings.filter(l => 
        l.category?.toLowerCase().includes(rec.category.toLowerCase()) &&
        !cartItems.some(ci => ci.listingId === l.id)
      ).slice(0, 2);
      
      if (matches.length > 0) {
        matchedProducts.push({
          ...rec,
          listings: matches
        });
      }
    }

    return Response.json({
      success: true,
      recommendations: matchedProducts,
      crossSellOpportunities: recommendations.crossSellOpportunities,
      personalizedMessage: recommendations.personalizedMessage
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});