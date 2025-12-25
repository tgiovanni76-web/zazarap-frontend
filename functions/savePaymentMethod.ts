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
    const { paymentMethodId, nickname, isDefault } = await req.json();

    // Retrieve payment method from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!paymentMethod.customer) {
      return Response.json({ error: 'Payment method not attached to customer' }, { status: 400 });
    }

    // If setting as default, remove default from others
    if (isDefault) {
      const existingMethods = await base44.entities.PaymentMethod.filter({ 
        userId: user.email, 
        isDefault: true 
      });
      for (const method of existingMethods) {
        await base44.entities.PaymentMethod.update(method.id, { isDefault: false });
      }
    }

    // Save to database
    const paymentMethodData = {
      userId: user.email,
      type: paymentMethod.type === 'paypal' ? 'paypal' : 'card',
      stripePaymentMethodId: paymentMethod.id,
      stripeCustomerId: paymentMethod.customer,
      isDefault: isDefault || false,
      nickname: nickname || null
    };

    if (paymentMethod.type === 'card') {
      paymentMethodData.cardBrand = paymentMethod.card.brand;
      paymentMethodData.cardLast4 = paymentMethod.card.last4;
      paymentMethodData.cardExpMonth = paymentMethod.card.exp_month;
      paymentMethodData.cardExpYear = paymentMethod.card.exp_year;
    } else if (paymentMethod.type === 'paypal') {
      paymentMethodData.paypalEmail = paymentMethod.paypal?.payer_email;
    }

    const savedMethod = await base44.entities.PaymentMethod.create(paymentMethodData);

    return Response.json({ 
      success: true, 
      paymentMethod: savedMethod 
    });

  } catch (error) {
    console.error('Save payment method error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});