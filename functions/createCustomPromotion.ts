import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';
import { z } from 'npm:zod@3.24.2';

const payloadSchema = z.object({
  listingId: z.string(),
  promotionTypes: z.array(z.enum(['featured', 'top', 'daily_highlight', 'premium_boost', 'turbo'])),
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
    const listing = await base44.entities.Listing.filter({ id: validated.listingId, created_by: user.email });
    if (!listing || listing.length === 0) {
      return Response.json({ error: 'Listing not found or not owned by user' }, { status: 404 });
    }

    // Calculate pricing for custom package
    const basePrices = {
      featured: 5.99,
      top: 9.99,
      daily_highlight: 14.99,
      premium_boost: 19.99,
      turbo: 29.99
    };

    let totalAmount = 0;
    validated.promotionTypes.forEach(type => {
      totalAmount += basePrices[type] * validated.durationDays;
    });

    // Apply volume discount (more types = more discount)
    const volumeDiscount = validated.promotionTypes.length > 1 ? 0.15 : 0;
    const durationDiscount = validated.durationDays >= 30 ? 0.20 : validated.durationDays >= 14 ? 0.10 : 0;
    
    let originalAmount = totalAmount;
    totalAmount *= (1 - Math.max(volumeDiscount, durationDiscount));

    // Apply discount code if provided
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
                       (!code.minAmount || totalAmount >= code.minAmount);
        
        if (isValid) {
          discountPercent = code.discountPercent;
          totalAmount *= (1 - discountPercent / 100);
          
          // Update usage count
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
      const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'paypal'],
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'Custom Promotion Package',
            description: `${validated.promotionTypes.join(' + ')} for ${validated.durationDays} days`
          },
          unit_amount: Math.round(totalAmount * 100)
        },
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/promotion-manager?success=true`,
      cancel_url: `${req.headers.get('origin')}/promotion-manager?canceled=true`,
      metadata: {
        type: 'custom_promotion',
        listingId: validated.listingId,
        promotionTypes: validated.promotionTypes.join(','),
        durationDays: validated.durationDays.toString(),
        userId: user.email,
        discountCode: validated.discountCode || ''
      }
    });

    // Create ListingPromotion records for each type
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + validated.durationDays * 24 * 60 * 60 * 1000);

    const promotions = [];
    for (const type of validated.promotionTypes) {
      const promo = await base44.entities.ListingPromotion.create({
        listingId: validated.listingId,
        type,
        billing: 'day',
        quantity: validated.durationDays,
        durationDays: validated.durationDays,
        amount: totalAmount / validated.promotionTypes.length,
        originalAmount: originalAmount / validated.promotionTypes.length,
        discountPercent,
        discountCode: validated.discountCode?.toUpperCase() || null,
        isCustomPackage: true,
        customPackageConfig: JSON.stringify({
          types: validated.promotionTypes,
          volumeDiscount,
          durationDiscount
        }),
        currency: 'EUR',
        status: 'pending',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });
      promotions.push(promo);
    }

    // Create transaction
    await base44.entities.Transaction.create({
      userId: user.email,
      kind: 'promotion',
      provider: 'stripe',
      amount: totalAmount,
      currency: 'EUR',
      status: 'pending',
      externalOrderId: session.id,
      description: `Custom promotion: ${validated.promotionTypes.join(' + ')} for ${validated.durationDays} days`,
      relatedEntity: 'ListingPromotion',
      relatedId: promotions[0].id,
      metadata: JSON.stringify({
        customPackage: true,
        promotionIds: promotions.map(p => p.id)
      })
    });

    return Response.json({
      checkoutUrl: session.url,
      amount: totalAmount,
      originalAmount,
      savedAmount: originalAmount - totalAmount,
      promotions: promotions.map(p => ({ id: p.id, type: p.type }))
    });

  } catch (error) {
    console.error('Custom promotion error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});