import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service role per accedere a tutte le spedizioni
    const shippings = await base44.asServiceRole.entities.Shipping.list('-updated_date', 100);
    const now = new Date();
    const issues = [];

    for (const shipping of shippings) {
      if (!shipping.trackingNumber || shipping.status === 'delivered') continue;

      const order = (await base44.asServiceRole.entities.Order.filter({ id: shipping.orderId }))[0];
      if (!order) continue;

      // Calcola ritardo
      const updatedDate = new Date(shipping.updated_date);
      const hoursSinceUpdate = (now - updatedDate) / (1000 * 60 * 60);

      // Analisi AI per problemi
      let shouldAlert = false;
      let alertReason = '';

      if (shipping.status === 'pending' && hoursSinceUpdate > 48) {
        shouldAlert = true;
        alertReason = 'Spedizione non ancora avviata dopo 48 ore';
      } else if (shipping.status === 'shipped' && hoursSinceUpdate > 72) {
        shouldAlert = true;
        alertReason = 'Nessun aggiornamento tracciamento da oltre 72 ore';
      }

      if (shipping.estimatedDelivery) {
        const estimatedDate = new Date(shipping.estimatedDelivery);
        if (now > estimatedDate && shipping.status !== 'delivered') {
          shouldAlert = true;
          alertReason = 'Consegna stimata superata';
        }
      }

      if (shouldAlert) {
        // AI per generare messaggio personalizzato
        const aiPrompt = `Sei un assistente AI per un marketplace. Analizza questa situazione di spedizione:

Ordine: ${order.orderNumber}
Stato: ${shipping.status}
Ultimo aggiornamento: ${hoursSinceUpdate.toFixed(0)} ore fa
Tracking: ${shipping.trackingNumber}
Corriere: ${shipping.carrier || 'Non specificato'}
Problema: ${alertReason}

Genera un messaggio personalizzato e rassicurante per l'utente che:
1. Spiega la situazione
2. Suggerisce azioni concrete
3. Offre supporto

Rispondi in italiano, max 200 caratteri.`;

        const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: aiPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              message: { type: "string" },
              actionRequired: { type: "boolean" },
              severity: { 
                type: "string",
                enum: ["low", "medium", "high"]
              }
            }
          }
        });

        // Crea notifica
        await base44.asServiceRole.entities.Notification.create({
          userId: order.userId,
          type: 'shipping_issue',
          title: '📦 Aggiornamento Spedizione',
          message: aiResponse.message,
          relatedEntity: 'Order',
          relatedId: order.id,
          read: false,
          priority: aiResponse.severity === 'high' ? 'high' : 'normal'
        });

        // Invia email se gravità alta
        if (aiResponse.severity === 'high') {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: order.userId,
            subject: `Aggiornamento importante - Ordine ${order.orderNumber}`,
            body: `${aiResponse.message}\n\nTracking: ${shipping.trackingNumber}\nOrdine: ${order.orderNumber}`
          });
        }

        issues.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          issue: alertReason,
          severity: aiResponse.severity,
          notified: true
        });
      }
    }

    return Response.json({
      success: true,
      issuesDetected: issues.length,
      issues
    });

  } catch (error) {
    console.error('Monitoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});