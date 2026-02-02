import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { withSecurityHeaders } from './_lib/securityHeaders.js';
import { checkRateLimit } from './_lib/rateLimit.js';
import { z } from 'npm:zod@3.24.2';

const PACKAGES = {
  top_7: { price: 4.99, days: 7, type: 'top' },
  highlight: { price: 2.49, days: 7, type: 'featured' },
  premium_14: { price: 8.99, days: 14, type: 'featured' }
};

const schema = z.object({
  packageKey: z.enum(['top_7', 'highlight', 'premium_14']),
  listingId: z.string().min(1).optional()
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));
    }

    const rl = await checkRateLimit(req, 'createPremiumPackageOrder', { limit: 5, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Zu viele Anfragen', retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const payload = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    const { packageKey, listingId } = parsed.data;
    const pkg = PACKAGES[packageKey];

    const PAYPAL_CLIENT_ID = Deno.env.get('REACT_APP_PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return new Response(JSON.stringify({ error: 'PayPal credentials not configured' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    const PAYPAL_API = 'https://api-m.sandbox.paypal.com';

    // Get access token
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
      return new Response(JSON.stringify({ error: 'PayPal authentication failed', details: authData }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    const { access_token } = authData;
    const host = req.headers.get('host') || 'zazarap.com';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

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
          amount: { currency_code: 'EUR', value: pkg.price.toFixed(2) },
          description: `Zazarap Premium Package: ${packageKey}`,
          custom_id: listingId ? `${listingId}|${packageKey}` : packageKey
        }],
        application_context: {
          return_url: `${baseUrl}/Marketplace`,
          cancel_url: `${baseUrl}/Werbung`
        }
      })
    });
    const order = await orderResponse.json();
    if (!orderResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to create PayPal order', details: order }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
    }

    // Save promotion if listingId provided
    if (listingId) {
      await base44.entities.ListingPromotion.create({
        listingId,
        type: pkg.type,
        billing: 'day',
        quantity: pkg.days,
        durationDays: pkg.days,
        amount: pkg.price,
        currency: 'EUR',
        status: 'pending',
        paypalOrderId: order.id
      });
    }

    const approveUrl = order.links.find(l => l.rel === 'approve')?.href;
    return new Response(JSON.stringify({ orderId: order.id, approveUrl }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});