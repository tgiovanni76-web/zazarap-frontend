import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { paypalWebhookSchema } from './_lib/validation.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate webhook signature
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    const clientId = Deno.env.get('REACT_APP_PAYPAL_CLIENT_ID');
    const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
    
    if (!webhookId || !clientId || !clientSecret) {
      return new Response(JSON.stringify({ error: 'PayPal credentials not configured' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    const payload = await req.json().catch(() => ({}));
    const parsed = paypalWebhookSchema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    const webhookEvent = parsed.data;

    const rl = await checkRateLimit(req, 'paypalWebhook', { limit: 60, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Zu viele Anfragen', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }
    
    // Get PayPal access token
    const authString = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    
    const { access_token } = await tokenResponse.json();

    // Verify webhook signature
    const verifyData = {
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      cert_url: req.headers.get('paypal-cert-url'),
      auth_algo: req.headers.get('paypal-auth-algo'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      webhook_id: webhookId,
      webhook_event: webhookEvent
    };

    const verifyResponse = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });

    const verifyResult = await verifyResponse.json();
    
    if (verifyResult.verification_status !== 'SUCCESS') {
      console.error('Webhook verification failed:', verifyResult);
      return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));
    }

    // Process webhook event
    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    console.log('Processing PayPal webhook:', eventType);

    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        // Payment captured successfully
        const orderId = resource.supplementary_data?.related_ids?.order_id;
        const captureId = resource.id;
        const amount = parseFloat(resource.amount.value);

        // Find payment by PayPal order ID
        const payments = await base44.asServiceRole.entities.Payment.filter({ 
          paypalOrderId: orderId 
        });

        if (payments.length > 0) {
          const payment = payments[0];
          
          // Update payment status
          await base44.asServiceRole.entities.Payment.update(payment.id, {
            status: 'held_in_escrow',
            paypalTransactionId: captureId
          });

          // Update chat status
          await base44.asServiceRole.entities.Chat.update(payment.chatId, {
            status: 'pagamento_completato'
          });

          // Notify both users
          await base44.asServiceRole.entities.Notification.create({
            userId: payment.buyerId,
            type: 'status_update',
            title: '✅ Pagamento Completato',
            message: `Il tuo pagamento di ${amount}€ è stato confermato e trattenuto in escrow.`,
            linkUrl: `/messages?chatId=${payment.chatId}`,
            relatedId: payment.chatId
          });

          await base44.asServiceRole.entities.Notification.create({
            userId: payment.sellerId,
            type: 'status_update',
            title: '💰 Pagamento Ricevuto',
            message: `Hai ricevuto un pagamento di ${amount}€. Procedi con la spedizione!`,
            linkUrl: `/messages?chatId=${payment.chatId}`,
            relatedId: payment.chatId
          });
        }
        break;
      }

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        // Payment failed
        const orderId = resource.supplementary_data?.related_ids?.order_id;

        const payments = await base44.asServiceRole.entities.Payment.filter({ 
          paypalOrderId: orderId 
        });

        if (payments.length > 0) {
          const payment = payments[0];
          
          await base44.asServiceRole.entities.Payment.update(payment.id, {
            status: 'failed'
          });

          await base44.asServiceRole.entities.Notification.create({
            userId: payment.buyerId,
            type: 'status_update',
            title: '❌ Pagamento Fallito',
            message: 'Il pagamento non è andato a buon fine. Riprova o usa un altro metodo.',
            linkUrl: `/messages?chatId=${payment.chatId}`,
            relatedId: payment.chatId
          });
        }
        break;
      }

      case 'CHECKOUT.ORDER.APPROVED': {
        // Order approved by buyer
        const orderId = resource.id;
        console.log('Order approved:', orderId);
        break;
      }

      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    return new Response(JSON.stringify({ received: true, event_type: eventType }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message
    }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});