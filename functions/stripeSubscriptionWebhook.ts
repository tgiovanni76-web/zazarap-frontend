import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';
import { checkFallbackRateLimit, shouldUseFallback, FALLBACK_LIMITS, createRateLimitResponse } from './_lib/fallbackRateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

Deno.serve(async (req) => {
  try {
    // Fallback rate limiting for webhooks (high limit + auto-skip for known webhooks)
    if (shouldUseFallback(req)) {
      const rateLimitResult = checkFallbackRateLimit(req, 'stripeWebhook', FALLBACK_LIMITS.webhook);
      
      if (!rateLimitResult.allowed && !rateLimitResult.skipped) {
        return createRateLimitResponse(rateLimitResult);
      }
    }

    const base44 = createClientFromRequest(req);
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !webhookSecret) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), withSecurityHeaders({ status: 503, headers: { 'Content-Type': 'application/json' } }));
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });

    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    const correlationId = event.id;

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) break;

        // Find promotion by subscription ID
        const promotions = await base44.asServiceRole.entities.ListingPromotion.filter({ stripeSubscriptionId: subscriptionId });
        if (!promotions.length) break;

        const promotion = promotions[0];
        const listing = (await base44.asServiceRole.entities.Listing.filter({ id: promotion.listingId }))[0];

        if (!listing) break;

        // Extend promotion period
        const daysMap = { weekly: 7, monthly: 30 };
        const durationDays = daysMap[promotion.renewalFrequency] || 7;
        const newEndDate = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

        await base44.asServiceRole.entities.ListingPromotion.update(promotion.id, {
          status: 'paid',
          endDate: newEndDate
        });

        // Update listing
        const updateData = promotion.type === 'featured' 
          ? { featured: true, featuredUntil: newEndDate }
          : { topAdUntil: newEndDate };

        await base44.asServiceRole.entities.Listing.update(promotion.listingId, updateData);

        // Create transaction record
        await base44.asServiceRole.entities.Transaction.create({
          userId: listing.created_by,
          kind: 'promotion',
          provider: 'stripe',
          amount: invoice.amount_paid / 100,
          currency: invoice.currency.toUpperCase(),
          status: 'paid',
          externalOrderId: subscriptionId,
          externalTransactionId: invoice.payment_intent,
          description: `Recurring promotion renewal - ${promotion.type}`,
          relatedEntity: 'ListingPromotion',
          relatedId: promotion.id,
          correlationId
        }).catch(() => {});

        // Send success notification
        await base44.asServiceRole.entities.Notification.create({
          userId: listing.created_by,
          type: 'status_update',
          title: 'Promotion Renewed Successfully',
          message: `Your ${promotion.type} promotion for "${listing.title}" has been renewed until ${new Date(newEndDate).toLocaleDateString()}.`,
          linkUrl: `/listing/${promotion.listingId}`,
          relatedId: promotion.id
        }).catch(() => {});

        await base44.asServiceRole.entities.SystemLog.create({
          level: 'info',
          message: 'RECURRING_PROMOTION_RENEWED',
          details: JSON.stringify({ invoiceId: invoice.id, amount: invoice.amount_paid / 100 }),
          context: JSON.stringify({ subscriptionId, listingId: promotion.listingId, correlationId }),
          path: '/functions/stripeSubscriptionWebhook',
          source: 'backend'
        }).catch(() => {});

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) break;

        const promotions = await base44.asServiceRole.entities.ListingPromotion.filter({ stripeSubscriptionId: subscriptionId });
        if (!promotions.length) break;

        const promotion = promotions[0];
        const listing = (await base44.asServiceRole.entities.Listing.filter({ id: promotion.listingId }))[0];

        if (!listing) break;

        // Create failed transaction
        await base44.asServiceRole.entities.Transaction.create({
          userId: listing.created_by,
          kind: 'promotion',
          provider: 'stripe',
          amount: invoice.amount_due / 100,
          currency: invoice.currency.toUpperCase(),
          status: 'failed',
          externalOrderId: subscriptionId,
          externalTransactionId: invoice.payment_intent,
          description: `Recurring promotion renewal failed - ${promotion.type}`,
          relatedEntity: 'ListingPromotion',
          relatedId: promotion.id,
          correlationId
        }).catch(() => {});

        // Send failure notification
        await base44.asServiceRole.entities.Notification.create({
          userId: listing.created_by,
          type: 'status_update',
          title: 'Promotion Renewal Failed',
          message: `Payment for your ${promotion.type} promotion renewal failed. Please update your payment method.`,
          linkUrl: `/listing/${promotion.listingId}`,
          relatedId: promotion.id
        }).catch(() => {});

        await base44.asServiceRole.entities.SystemLog.create({
          level: 'error',
          message: 'RECURRING_PROMOTION_PAYMENT_FAILED',
          details: JSON.stringify({ invoiceId: invoice.id, reason: invoice.last_finalization_error?.message }),
          context: JSON.stringify({ subscriptionId, listingId: promotion.listingId, correlationId }),
          path: '/functions/stripeSubscriptionWebhook',
          source: 'backend'
        }).catch(() => {});

        break;
      }

      case 'invoice.upcoming': {
        // Send reminder 3 days before renewal
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (!subscriptionId) break;

        const promotions = await base44.asServiceRole.entities.ListingPromotion.filter({ stripeSubscriptionId: subscriptionId });
        if (!promotions.length) break;

        const promotion = promotions[0];
        const listing = (await base44.asServiceRole.entities.Listing.filter({ id: promotion.listingId }))[0];

        if (!listing) break;

        await base44.asServiceRole.entities.Notification.create({
          userId: listing.created_by,
          type: 'reminder',
          title: 'Upcoming Promotion Renewal',
          message: `Your ${promotion.type} promotion for "${listing.title}" will renew in 3 days for €${(invoice.amount_due / 100).toFixed(2)}.`,
          linkUrl: `/listing/${promotion.listingId}`,
          relatedId: promotion.id
        }).catch(() => {});

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        const promotions = await base44.asServiceRole.entities.ListingPromotion.filter({ stripeSubscriptionId: subscription.id });
        if (!promotions.length) break;

        const promotion = promotions[0];
        const listing = (await base44.asServiceRole.entities.Listing.filter({ id: promotion.listingId }))[0];

        await base44.asServiceRole.entities.ListingPromotion.update(promotion.id, {
          autoRenew: false,
          status: 'cancelled'
        });

        if (listing) {
          await base44.asServiceRole.entities.Notification.create({
            userId: listing.created_by,
            type: 'status_update',
            title: 'Promotion Auto-Renewal Ended',
            message: `Your recurring promotion for "${listing.title}" has ended.`,
            linkUrl: `/listing/${promotion.listingId}`,
            relatedId: promotion.id
          }).catch(() => {});
        }

        await base44.asServiceRole.entities.SystemLog.create({
          level: 'info',
          message: 'RECURRING_PROMOTION_SUBSCRIPTION_DELETED',
          details: JSON.stringify({ subscriptionId: subscription.id }),
          context: JSON.stringify({ listingId: promotion.listingId, correlationId }),
          path: '/functions/stripeSubscriptionWebhook',
          source: 'backend'
        }).catch(() => {});

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));

  } catch (error) {
    console.error('stripeSubscriptionWebhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});