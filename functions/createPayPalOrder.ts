import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';
import { createPayPalOrderSchema } from './_lib/validation.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));
    }

    // Rate limiting
    const rl = await checkRateLimit(req, 'createPayPalOrder', { limit: 10, windowSec: 60 });
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded', resetAt: rl.resetAt }, { status: 429 });
    }

    const payload = await req.json().catch(() => ({}));
    const parsed = createPayPalOrderSchema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    const { amount, chatId, listingId } = parsed.data;

    const PAYPAL_CLIENT_ID = Deno.env.get("REACT_APP_PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ 
        error: 'PayPal credentials not configured',
        details: 'PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET devono essere configurati nei secrets'
      }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Sandbox per test - cambia a https://api-m.paypal.com per produzione

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    
    if (!authResponse.ok) {
      console.error('PayPal auth error:', authData);
      return new Response(JSON.stringify({ 
        error: 'PayPal authentication failed',
        details: authData.error_description || 'Verifica che PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET siano corretti'
      }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    const { access_token } = authData;

    // Get app URL for return
    const appUrl = req.headers.get('origin') || 'https://your-app-url.com';
    
    // Create PayPal order
    const orderResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: amount.toFixed(2)
          },
          description: `Zazarap - Acquisto articolo`,
          custom_id: `${chatId}_${listingId}`
        }],
        application_context: {
          return_url: `${appUrl}/PayPalSuccess?chatId=${chatId}&listingId=${listingId}`,
          cancel_url: `${appUrl}/Messages`
        }
      })
    });

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('PayPal order creation error:', order);
      return new Response(JSON.stringify({ 
        error: 'Failed to create PayPal order',
        details: order.message || order.error_description || 'Errore sconosciuto'
      }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    if (order.id) {
      // Save order ID in database
      await base44.entities.Payment.create({
        chatId: chatId,
        buyerId: user.email,
        sellerId: '',
        amount: amount,
        method: 'paypal',
        status: 'pending',
        paypalOrderId: order.id
      });

      return new Response(JSON.stringify({ 
        orderId: order.id,
        approveUrl: order.links.find(link => link.rel === 'approve')?.href
      }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
    }

    return new Response(JSON.stringify({ error: 'Failed to create order' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return new Response(JSON.stringify({ error: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});