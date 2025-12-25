import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

/**
 * Extend an existing promotion
 * Creates a new promotion period based on the original pricing
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promotionId, extensionDays } = await req.json();

    if (!promotionId || !extensionDays) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get existing promotion
    const promotions = await base44.entities.ListingPromotion.filter({ id: promotionId });
    if (!promotions || promotions.length === 0) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }

    const promo = promotions[0];

    // Verify ownership
    const listing = await base44.entities.Listing.filter({ id: promo.listingId });
    if (!listing || listing.length === 0 || listing[0].created_by !== user.email) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Calculate new price based on original pricing
    const dailyRate = promo.amount / promo.durationDays;
    const extensionAmount = dailyRate * extensionDays;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia'
    });

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { zazarap_user_id: user.email }
      });
      customerId = customer.id;
      await base44.asServiceRole.entities.User.update(user.id, {
        stripeCustomerId: customerId
      });
    }

    // Create Stripe Checkout Session for extension
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'paypal'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Promotion Extension: ${promo.type}`,
            description: `Extend promotion for ${extensionDays} days`
          },
          unit_amount: Math.round(extensionAmount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/promotion-manager?success=true`,
      cancel_url: `${req.headers.get('origin')}/promotion-manager?canceled=true`,
      metadata: {
        type: 'promotion_extension',
        promotionId: promo.id,
        listingId: promo.listingId,
        extensionDays: extensionDays.toString(),
        userId: user.email
      }
    });

    // Create transaction record
    await base44.entities.Transaction.create({
      userId: user.email,
      kind: 'promotion',
      provider: 'stripe',
      amount: extensionAmount,
      currency: 'EUR',
      status: 'pending',
      externalOrderId: session.id,
      description: `Promotion extension: ${promo.type} for ${extensionDays} days`,
      relatedEntity: 'ListingPromotion',
      relatedId: promo.id,
      metadata: JSON.stringify({ extensionDays, originalPromotionId: promo.id })
    });

    return Response.json({
      checkoutUrl: session.url,
      amount: extensionAmount,
      extensionDays
    });

  } catch (error) {
    console.error('Error extending promotion:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});