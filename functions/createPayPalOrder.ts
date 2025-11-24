import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, chatId, listingId } = await req.json();

    const PAYPAL_CLIENT_ID = Deno.env.get("REACT_APP_PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      return Response.json({ 
        error: 'PayPal credentials not configured',
        details: 'PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET devono essere configurati nei secrets'
      }, { status: 500 });
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
      return Response.json({ 
        error: 'PayPal authentication failed',
        details: authData.error_description || 'Verifica che PAYPAL_CLIENT_ID e PAYPAL_CLIENT_SECRET siano corretti'
      }, { status: 500 });
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
      return Response.json({ 
        error: 'Failed to create PayPal order',
        details: order.message || order.error_description || 'Errore sconosciuto'
      }, { status: 500 });
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