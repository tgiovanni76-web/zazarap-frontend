import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      cartValue, 
      shippingAddress, 
      paymentMethod,
      sessionData 
    } = await req.json();

    // Get user's account info
    const accounts = await base44.entities.LoyaltyAccount.filter({ userId: user.email });
    const loyaltyAccount = accounts[0];

    // Get user's order history
    const orders = await base44.entities.Order.filter({ 
      userId: user.email 
    }, '-created_date', 20);

    // Get recent activity
    const recentActivity = await base44.entities.UserActivity.filter({
      userId: user.email
    }, '-created_date', 50);

    // Get user transactions
    const transactions = await base44.entities.Transaction.filter({
      userId: user.email
    }, '-created_date', 10);

    const failedTransactions = transactions.filter(t => t.status === 'failed').length;

    const accountAge = user.created_date ? 
      Math.ceil((Date.now() - new Date(user.created_date)) / (1000 * 60 * 60 * 24)) : 
      0;

    const prompt = `Analizza questo checkout per potenziali frodi in tempo reale.

INFORMAZIONI UTENTE:
- Email: ${user.email}
- Account creato: ${accountAge} giorni fa
- Ordini completati: ${orders.length}
- Livello fedeltà: ${loyaltyAccount?.tier || 'bronze'}
- Transazioni fallite recenti: ${failedTransactions}

DETTAGLI CHECKOUT:
- Valore carrello: ${cartValue}€
- Indirizzo spedizione: ${shippingAddress?.city || 'N/A'}, ${shippingAddress?.country || 'N/A'}
- Metodo pagamento: ${paymentMethod || 'N/A'}
- Attività recenti: ${recentActivity.length} azioni

INDICATORI DA ANALIZZARE:
1. Valore anomalo rispetto allo storico
2. Indirizzo nuovo/sospetto
3. Pattern di comportamento inusuali
4. Velocità di checkout
5. Dispositivo/localizzazione

Fornisci analisi dettagliata del rischio frode.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          riskScore: { type: "number" },
          redFlags: {
            type: "array",
            items: {
              type: "object",
              properties: {
                flag: { type: "string" },
                severity: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          recommendation: {
            type: "string",
            enum: ["proceed", "additional_verification", "manual_review", "block"]
          },
          verificationSuggestions: {
            type: "array",
            items: { type: "string" }
          },
          reasoning: { type: "string" }
        }
      }
    });

    // Log the fraud check
    await base44.asServiceRole.entities.ModerationEvent.create({
      entityType: 'user',
      entityId: user.email,
      action: 'reviewed',
      severity: analysis.riskLevel,
      reason: `Fraud detection: ${analysis.recommendation}`,
      moderatorId: 'AI_SYSTEM',
      details: JSON.stringify({
        ...analysis,
        cartValue,
        timestamp: new Date().toISOString()
      })
    });

    return Response.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Fraud detection error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});