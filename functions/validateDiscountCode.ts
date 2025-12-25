import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';

const payloadSchema = z.object({
  code: z.string(),
  amount: z.number().positive()
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { code, amount } = payloadSchema.parse(payload);

    const codes = await base44.entities.DiscountCode.filter({
      code: code.toUpperCase(),
      active: true
    });

    if (codes.length === 0) {
      return Response.json({
        valid: false,
        message: 'Ungültiger Rabattcode'
      });
    }

    const discountCode = codes[0];
    const now = new Date();
    const validFrom = discountCode.validFrom ? new Date(discountCode.validFrom) : null;
    const validUntil = discountCode.validUntil ? new Date(discountCode.validUntil) : null;

    // Check validity
    if (validFrom && now < validFrom) {
      return Response.json({
        valid: false,
        message: 'Code noch nicht gültig'
      });
    }

    if (validUntil && now > validUntil) {
      return Response.json({
        valid: false,
        message: 'Code abgelaufen'
      });
    }

    if (discountCode.maxUses && discountCode.currentUses >= discountCode.maxUses) {
      return Response.json({
        valid: false,
        message: 'Code bereits vollständig verwendet'
      });
    }

    if (discountCode.minAmount && amount < discountCode.minAmount) {
      return Response.json({
        valid: false,
        message: `Mindestbestellwert: €${discountCode.minAmount.toFixed(2)}`
      });
    }

    const discountAmount = (amount * discountCode.discountPercent) / 100;
    const finalAmount = amount - discountAmount;

    return Response.json({
      valid: true,
      discountPercent: discountCode.discountPercent,
      discountAmount,
      finalAmount,
      message: `${discountCode.discountPercent}% Rabatt angewendet`
    });

  } catch (error) {
    console.error('Validate discount code error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});