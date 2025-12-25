import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create Stripe customer
    const existingMethods = await base44.entities.PaymentMethod.filter({
      userId: user.email,
      type: 'card',
      isActive: true
    });

    let customerId = existingMethods[0]?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name,
        metadata: {
          userId: user.email
        }
      });
      customerId = customer.id;
    }

    // Create setup intent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
    });

    return Response.json({
      clientSecret: setupIntent.client_secret,
      customerId: customerId
    });
  } catch (error) {
    console.error('Error creating setup intent:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});