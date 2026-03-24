import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CARRIERS = [
  { name: 'Poste Italiane', baseRate: 5, speed: 'standard', reliability: 0.85 },
  { name: 'BRT', baseRate: 7, speed: 'fast', reliability: 0.90 },
  { name: 'GLS', baseRate: 6.5, speed: 'fast', reliability: 0.88 },
  { name: 'DHL Express', baseRate: 12, speed: 'express', reliability: 0.95 },
  { name: 'UPS', baseRate: 10, speed: 'express', reliability: 0.93 }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { destination, weight, totalValue, urgency } = await req.json();

    // Get user's shipping history
    const orders = await base44.entities.Order.filter({ 
      userId: user.email 
    }, '-created_date', 10);

    const shippingHistory = orders.map(o => ({
      carrier: o.carrier,
      delivered: o.status === 'delivered',
      estimatedDays: o.estimatedDelivery ? 
        Math.ceil((new Date(o.deliveredAt || Date.now()) - new Date(o.created_date)) / (1000 * 60 * 60 * 24)) : 
        null
    }));

    const prompt = `Ottimizza le opzioni di spedizione per questo ordine usando AI.

DETTAGLI ORDINE:
- Destinazione: ${destination?.city || 'Italia'}, ${destination?.postalCode || ''}
- Peso stimato: ${weight || 1}kg
- Valore totale: ${totalValue}€
- Urgenza: ${urgency || 'normale'}

CORRIERI DISPONIBILI:
${JSON.stringify(CARRIERS, null, 2)}

STORICO SPEDIZIONI UTENTE:
${JSON.stringify(shippingHistory, null, 2)}

Analizza e fornisci:
1. Raccomandazione principale con motivazione
2. Ordine ottimale dei corrieri (migliore a peggiore)
3. Stima costi e tempi per destinazione
4. Fattori di rischio per ogni corriere
5. Suggerimenti per risparmiare`;

    const optimization = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          recommendedCarrier: { type: "string" },
          recommendation: { type: "string" },
          rankedCarriers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                estimatedCost: { type: "number" },
                estimatedDays: { type: "number" },
                reliability: { type: "number" },
                riskFactors: {
                  type: "array",
                  items: { type: "string" }
                },
                pros: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          savingTips: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({
      success: true,
      optimization
    });

  } catch (error) {
    console.error('Shipping optimization error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});