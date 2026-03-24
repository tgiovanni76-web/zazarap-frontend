import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import Stripe from 'npm:stripe@17.5.0';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

const schema = z.object({
  promotionId: z.string(),
  cancelAtPeriodEnd: z.boolean().optional().default(true)
});

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    const base44 = createClientFromRequest(req);
    const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();

    const rl = await checkRateLimit(req, 'cancelRecurringPromotion', { limit: 10, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Too Many Requests' }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    const user = await base44.auth.me().catch(() => null);
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) return new Response(JSON.stringify({ error: 'Invalid payload' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));

    const { promotionId, cancelAtPeriodEnd } = parsed.data;

    // Get promotion record
    const promotions = await base44.entities.ListingPromotion.filter({ id: promotionId });
    if (!promotions.length || !promotions[0].stripeSubscriptionId) {
      return new Response(JSON.stringify({ error: 'Promotion not found or not recurring' }), withSecurityHeaders({ status: 404, headers: { 'Content-Type': 'application/json' } }));
    }

    const promotion = promotions[0];

    // Verify ownership
    const listings = await base44.entities.Listing.filter({ id: promotion.listingId, created_by: user.email });
    if (!listings.length) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), withSecurityHeaders({ status: 403, headers: { 'Content-Type': 'application/json' } }));
    }

    // Cancel Stripe subscription
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), withSecurityHeaders({ status: 503, headers: { 'Content-Type': 'application/json' } }));
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

    if (cancelAtPeriodEnd) {
      await stripe.subscriptions.update(promotion.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    } else {
      await stripe.subscriptions.cancel(promotion.stripeSubscriptionId);
    }

    // Update promotion record
    await base44.entities.ListingPromotion.update(promotionId, {
      autoRenew: false,
      status: cancelAtPeriodEnd ? 'pending_cancellation' : 'cancelled'
    });

    // Send notification
    await base44.asServiceRole.entities.Notification.create({
      userId: user.email,
      type: 'status_update',
      title: 'Promotion Auto-Renewal Cancelled',
      message: cancelAtPeriodEnd 
        ? 'Your promotion will expire at the end of the current period.' 
        : 'Your recurring promotion has been cancelled immediately.',
      linkUrl: `/listing/${promotion.listingId}`,
      relatedId: promotionId
    }).catch(() => {});

    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info',
      message: 'RECURRING_PROMOTION_CANCELLED',
      details: JSON.stringify({ subscriptionId: promotion.stripeSubscriptionId, cancelAtPeriodEnd }),
      context: JSON.stringify({ user: user.email, promotionId, correlationId }),
      path: '/functions/cancelRecurringPromotion',
      source: 'backend'
    }).catch(() => {});

    return new Response(JSON.stringify({
      success: true,
      cancelAtPeriodEnd,
      message: cancelAtPeriodEnd ? 'Cancellation scheduled' : 'Cancelled immediately'
    }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));

  } catch (error) {
    console.error('cancelRecurringPromotion error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});