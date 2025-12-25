import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import Stripe from 'npm:stripe@17.5.0';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

const schema = z.object({
  listingId: z.string(),
  type: z.enum(['featured', 'top']),
  frequency: z.enum(['weekly', 'monthly']),
});

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const base44 = createClientFromRequest(req);
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

    const rl = await checkRateLimit(req, 'createRecurringPromotion', { limit: 10, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid payload', details: parsed.error.errors }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));

    const { listingId, type, frequency } = parsed.data;

    // Verify listing ownership
    const listing = await base44.entities.Listing.filter({ id: listingId, created_by: user.email });
    if (!listing.length) {
      return new Response(JSON.stringify({ error: 'Listing not found or unauthorized' }), withSecurityHeaders({ status: 404, headers: { 'Content-Type': 'application/json' } }));
    }

    // Calculate pricing
    const pricing = {
      featured: { weekly: 9.99, monthly: 34.99 },
      top: { weekly: 14.99, monthly: 49.99 }
    };
    const amount = pricing[type][frequency];

    // Initialize Stripe
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), withSecurityHeaders({ status: 503, headers: { 'Content-Type': 'application/json' } }));
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id, correlationId }
      });
      customerId = customer.id;
      await base44.auth.updateMe({ stripeCustomerId: customerId });
    }

    // Create subscription
    const intervalMap = { weekly: { interval: 'week', interval_count: 1 }, monthly: { interval: 'month', interval_count: 1 } };
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${type === 'featured' ? 'Featured' : 'TOP'} Listing - ${listing[0].title}`,
            description: `Auto-renewal ${frequency} for listing promotion`
          },
          recurring: intervalMap[frequency],
          unit_amount: Math.round(amount * 100)
        }
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { listingId, promotionType: type, userId: user.email, correlationId }
    });

    // Create initial ListingPromotion record
    const daysMap = { weekly: 7, monthly: 30 };
    const durationDays = daysMap[frequency];
    const until = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    await base44.entities.ListingPromotion.create({
      listingId,
      type,
      billing: frequency,
      quantity: 1,
      durationDays,
      amount,
      currency: 'EUR',
      status: 'pending',
      stripeSubscriptionId: subscription.id,
      autoRenew: true,
      renewalFrequency: frequency,
      startDate: new Date().toISOString(),
      endDate: until
    });

    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info',
      message: 'RECURRING_PROMOTION_CREATED',
      details: JSON.stringify({ subscriptionId: subscription.id, type, frequency }),
      context: JSON.stringify({ user: user.email, listingId, correlationId }),
      path: '/functions/createRecurringPromotion',
      source: 'backend'
    }).catch(() => {});

    const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    return new Response(JSON.stringify({
      subscriptionId: subscription.id,
      clientSecret,
      amount,
      frequency
    }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));

  } catch (error) {
    console.error('createRecurringPromotion error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});