import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active carts
    const carts = await base44.asServiceRole.entities.Cart.filter({
      status: 'active'
    });

    const now = Date.now();
    const reminderThresholds = [
      { hours: 24, sent: false },
      { hours: 72, sent: false }
    ];

    let notificationsSent = 0;

    for (const cart of carts) {
      const cartAge = now - new Date(cart.updated_date || cart.created_date).getTime();
      const hoursOld = cartAge / (1000 * 60 * 60);

      // Check if cart has items
      const cartItems = await base44.asServiceRole.entities.CartItem.filter({
        cartId: cart.id
      });

      if (cartItems.length === 0) continue;

      // Check if we should send a reminder
      for (const threshold of reminderThresholds) {
        if (hoursOld >= threshold.hours && !threshold.sent) {
          const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
          
          await base44.functions.invoke('generateSmartNotifications', {
            userId: cart.userId,
            type: 'cart_reminder',
            context: {
              itemCount,
              totalAmount: cart.totalAmount,
              hoursAbandoned: Math.floor(hoursOld),
              actionUrl: '/cart',
              items: cartItems.map(item => ({
                title: item.listingTitle,
                price: item.price
              }))
            }
          });

          notificationsSent++;
          threshold.sent = true;
        }
      }
    }

    return Response.json({
      success: true,
      cartsChecked: carts.length,
      notificationsSent
    });

  } catch (error) {
    console.error('Abandoned carts check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});