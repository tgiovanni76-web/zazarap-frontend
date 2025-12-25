import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';
import { z } from 'npm:zod@3.24.2';

const payloadSchema = z.object({
  listingId: z.string(),
  promotionType: z.enum(['featured', 'top', 'daily_highlight', 'premium_boost', 'turbo']),
  durationDays: z.number().min(1).max(90),
  discountCode: z.string().optional()
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const validated = payloadSchema.parse(payload);

    // Verify listing ownership
    const listing = await base44.entities.Listing.filter({ 
      id: validated.listingId, 
      created_by: user.email 
    });
    if (!listing || listing.length === 0) {
      return Response.json({ error: 'Listing not found or not owned by user' }, { status: 404 });
    }

    // Define pricing
    const basePrices = {
      featured: 5.99,
      top: 9.99,
      daily_highlight: 14.99,
      premium_boost: 19.99,
      turbo: 29.99
    };

    let amount = basePrices[validated.promotionType] * validated.durationDays;
    let originalAmount = amount;

    // Apply duration discount
    if (validated.durationDays >= 30) {
      amount *= 0.80; // 20% off
    } else if (validated.durationDays >= 14) {
      amount *= 0.90; // 10% off
    } else if (validated.durationDays >= 7) {
      amount *= 0.95; // 5% off
    }

    // Apply discount code
    let discountPercent = 0;
    if (validated.discountCode) {
      const codes = await base44.entities.DiscountCode.filter({
        code: validated.discountCode.toUpperCase(),
        active: true
      });
      
      if (codes.length > 0) {
        const code = codes[0];
        const now = new Date();
        const validFrom = code.validFrom ? new Date(code.validFrom) : null;
        const validUntil = code.validUntil ? new Date(code.validUntil) : null;
        
        const isValid = (!validFrom || now >= validFrom) && 
                       (!validUntil || now <= validUntil) &&
                       (!code.maxUses || code.currentUses < code.maxUses) &&
                       (!code.minAmount || amount >= code.minAmount) &&
                       (!code.applicableTypes || code.applicableTypes.length === 0 || 
                        code.applicableTypes.includes(validated.promotionType));
        
        if (isValid) {
          discountPercent = code.discountPercent;
          amount *= (1 - discountPercent / 100);
          
          await base44.asServiceRole.entities.DiscountCode.update(code.id, {
            currentUses: (code.currentUses || 0) + 1
          });
        }
      }
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia'
    });

    // Get or create Stripe customer
    let customerId;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ 
        email: user.email, 
        name: user.full_name 
      });
      customerId = customer.id;
    }

    // Promotion type labels
    const typeLabels = {
      featured: 'Hervorgehoben',
      top: 'TOP-Anzeige',
      daily_highlight: 'Highlight des Tages',
      premium_boost: 'Premium Boost',
      turbo: 'Turbo Promotion'
    };

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'paypal'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `${typeLabels[validated.promotionType]}`,
            description: `${validated.durationDays} Tage für "${listing[0].title}"`
          },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/listing/${validated.listingId}?promotion=success`,
      cancel_url: `${req.headers.get('origin')}/listing/${validated.listingId}?promotion=canceled`,
      metadata: {
        type: 'direct_promotion',
        listingId: validated.listingId,
        promotionType: validated.promotionType,
        durationDays: validated.durationDays.toString(),
        userId: user.email,
        discountCode: validated.discountCode || ''
      }
    });

    // Create ListingPromotion record
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + validated.durationDays * 24 * 60 * 60 * 1000);

    const promotion = await base44.entities.ListingPromotion.create({
      listingId: validated.listingId,
      type: validated.promotionType,
      billing: 'day',
      quantity: validated.durationDays,
      durationDays: validated.durationDays,
      amount,
      originalAmount,
      discountPercent,
      discountCode: validated.discountCode?.toUpperCase() || null,
      isCustomPackage: false,
      currency: 'EUR',
      status: 'pending',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    // Create transaction
    await base44.entities.Transaction.create({
      userId: user.email,
      kind: 'promotion',
      provider: 'stripe',
      amount,
      currency: 'EUR',
      status: 'pending',
      externalOrderId: session.id,
      description: `${typeLabels[validated.promotionType]}: ${validated.durationDays} Tage`,
      relatedEntity: 'ListingPromotion',
      relatedId: promotion.id,
      metadata: JSON.stringify({
        listingId: validated.listingId,
        promotionType: validated.promotionType
      })
    });

    return Response.json({
      checkoutUrl: session.url,
      amount,
      originalAmount,
      savedAmount: originalAmount - amount,
      promotionId: promotion.id
    });

  } catch (error) {
    console.error('Direct promotion purchase error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});