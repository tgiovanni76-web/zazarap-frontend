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
    const { paymentMethodId } = await req.json();

    // Get payment method from DB
    const methods = await base44.entities.PaymentMethod.filter({ 
      id: paymentMethodId,
      userId: user.email 
    });

    if (methods.length === 0) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    const method = methods[0];

    // Detach from Stripe
    if (method.stripePaymentMethodId) {
      await stripe.paymentMethods.detach(method.stripePaymentMethodId);
    }

    // Delete from DB
    await base44.entities.PaymentMethod.delete(paymentMethodId);

    return Response.json({ success: true });

  } catch (error) {
    console.error('Delete payment method error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});