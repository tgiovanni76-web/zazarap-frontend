import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, chatId, listingId, sellerId, shippingMethod, shippingAddress } = await req.json();

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

    // Capture PayPal order
    const captureResponse = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    const capture = await captureResponse.json();

    if (capture.status === 'COMPLETED') {
      const transactionId = capture.purchase_units[0].payments.captures[0].id;
      const amount = parseFloat(capture.purchase_units[0].payments.captures[0].amount.value);

      // Update payment record
      const payments = await base44.asServiceRole.entities.Payment.filter({ paypalOrderId: orderId });
      
      if (payments.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'held_in_escrow',
          paypalTransactionId: transactionId,
          sellerId: sellerId,
          escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          buyerConfirmedReceipt: false
        });
      } else {
        await base44.asServiceRole.entities.Payment.create({
          chatId: chatId,
          buyerId: user.email,
          sellerId: sellerId,
          amount: amount,
          method: 'paypal',
          status: 'held_in_escrow',
          paypalOrderId: orderId,
          paypalTransactionId: transactionId,
          escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          buyerConfirmedReceipt: false
        });
      }

      // Create shipping record
      const shippingCosts = {
        ritiro_persona: 0,
        corriere: 10,
        posta: 5
      };

      await base44.asServiceRole.entities.Shipping.create({
        chatId: chatId,
        method: shippingMethod,
        address: shippingAddress,
        status: shippingMethod === 'ritiro_persona' ? 'delivered' : 'pending',
        cost: shippingCosts[shippingMethod] || 0,
        carrier: shippingMethod === 'corriere' ? 'DHL' : shippingMethod === 'posta' ? 'Poste Italiane' : undefined,
        estimatedDelivery: shippingMethod !== 'ritiro_persona' ? 
          new Date(Date.now() + (shippingMethod === 'corriere' ? 2 : 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : 
          undefined
      });

      // Get listing details
      const allListings = await base44.asServiceRole.entities.Listing.list();
      const listing = allListings.find(l => l.id === listingId);
      
      if (listing) {
        await base44.asServiceRole.entities.Listing.update(listingId, {
          status: 'sold'
        });
      }

      // Update chat
      const allChats = await base44.asServiceRole.entities.Chat.list();
      const chat = allChats.find(c => c.id === chatId);
      
      if (chat) {
        await base44.asServiceRole.entities.Chat.update(chatId, {
          status: 'pagamento_in_escrow',
          lastMessage: 'Pagamento in escrow - in attesa di spedizione',
          updatedAt: new Date().toISOString()
        });
      }

      // Notify seller
      const listingTitle = listing ? listing.title : 'l\'articolo';
      await base44.asServiceRole.entities.Notification.create({
        userId: sellerId,
        type: 'status_update',
        title: '💰 Fondi in Escrow',
        message: `Fondi per "${listingTitle}" trattenuti in sicurezza. Spedisci l'articolo per riceverli.`,
        linkUrl: '/MySales',
        relatedId: chatId
      });

      // Notify buyer
      await base44.asServiceRole.entities.Notification.create({
        userId: user.email,
        type: 'status_update',
        title: '🔒 Pagamento Protetto',
        message: `I tuoi fondi sono trattenuti in sicurezza fino alla consegna di "${listingTitle}"`,
        linkUrl: '/MyPurchases',
        relatedId: chatId
      });

      return Response.json({ 
        success: true,
        transactionId: transactionId,
        status: 'held_in_escrow'
      });
    }

    return Response.json({ error: 'Payment capture failed' }, { status: 500 });
    
  } catch (error) {
    console.error('PayPal capture error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});