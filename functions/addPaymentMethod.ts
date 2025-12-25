import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return Response.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    const { type, nickname } = await req.json();

    // Get or create Stripe customer
    let stripeCustomerId;
    const existingMethods = await base44.entities.PaymentMethod.filter({ userId: user.email });
    
    if (existingMethods.length > 0 && existingMethods[0].stripeCustomerId) {
      stripeCustomerId = existingMethods[0].stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: { userId: user.email }
      });
      stripeCustomerId = customer.id;
    }

    if (type === 'card') {
      // Create Setup Intent for card
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        metadata: { userId: user.email }
      });

      return Response.json({
        clientSecret: setupIntent.client_secret,
        stripeCustomerId
      });
    } else if (type === 'paypal') {
      // For PayPal, create Setup Intent
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['paypal'],
        metadata: { userId: user.email }
      });

      return Response.json({
        clientSecret: setupIntent.client_secret,
        stripeCustomerId
      });
    }

    return Response.json({ error: 'Invalid payment method type' }, { status: 400 });

  } catch (error) {
    console.error('Add payment method error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});