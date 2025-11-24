import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, chatId, listingId } = await req.json();

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_API = "https://api-m.paypal.com"; // Usa https://api-m.sandbox.paypal.com per test

    // Get PayPal access token
    const authResponse = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const { access_token } = await authResponse.json();

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
        }]
      })
    });

    const order = await orderResponse.json();

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

      return Response.json({ 
        orderId: order.id,
        approveUrl: order.links.find(link => link.rel === 'approve')?.href
      });
    }

    return Response.json({ error: 'Failed to create order' }, { status: 500 });
    
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});