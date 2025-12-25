import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return Response.json({ error: 'Payment method ID required' }, { status: 400 });
    }

    // Get all user payment methods
    const allMethods = await base44.entities.PaymentMethod.filter({
      userId: user.email,
      isActive: true
    });

    // Update all to not default
    for (const method of allMethods) {
      if (method.isDefault) {
        await base44.entities.PaymentMethod.update(method.id, {
          isDefault: false
        });
      }
    }

    // Set the selected one as default
    await base44.entities.PaymentMethod.update(paymentMethodId, {
      isDefault: true
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});