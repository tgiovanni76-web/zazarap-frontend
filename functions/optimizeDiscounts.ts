import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const DISCOUNT_CODES = {
  'WELCOME10': { type: 'percentage', value: 10, minAmount: 20, stackable: true, priority: 3 },
  'SAVE20': { type: 'percentage', value: 20, minAmount: 50, stackable: false, priority: 1 },
  'FIRST15': { type: 'percentage', value: 15, minAmount: 30, stackable: true, priority: 2 },
  'FLAT5': { type: 'fixed', value: 5, minAmount: 25, stackable: true, priority: 4 },
  'FLAT10': { type: 'fixed', value: 10, minAmount: 40, stackable: true, priority: 3 },
  'VIP30': { type: 'percentage', value: 30, minAmount: 100, stackable: false, priority: 1 }
};

function calculateDiscount(code, amount) {
  const discount = DISCOUNT_CODES[code];
  if (!discount) return 0;
  
  if (discount.type === 'percentage') {
    return (amount * discount.value) / 100;
  }
  return discount.value;
}

function findBestDiscountCombination(codes, totalAmount) {
  const validCodes = codes
    .filter(code => DISCOUNT_CODES[code] && totalAmount >= DISCOUNT_CODES[code].minAmount)
    .sort((a, b) => DISCOUNT_CODES[a].priority - DISCOUNT_CODES[b].priority);

  if (validCodes.length === 0) return { codes: [], total: 0, details: [] };

  let bestCombination = { codes: [], total: 0, details: [] };

  // Try single non-stackable discounts
  for (const code of validCodes) {
    const discount = DISCOUNT_CODES[code];
    if (!discount.stackable) {
      const amount = calculateDiscount(code, totalAmount);
      if (amount > bestCombination.total) {
        bestCombination = {
          codes: [code],
          total: amount,
          details: [{ code, amount, type: discount.type, value: discount.value }]
        };
      }
    }
  }

  // Try stackable combinations
  const stackable = validCodes.filter(c => DISCOUNT_CODES[c].stackable);
  if (stackable.length > 0) {
    let remainingAmount = totalAmount;
    let stackedTotal = 0;
    let stackedDetails = [];
    
    for (const code of stackable) {
      const amount = calculateDiscount(code, remainingAmount);
      stackedTotal += amount;
      stackedDetails.push({
        code,
        amount,
        type: DISCOUNT_CODES[code].type,
        value: DISCOUNT_CODES[code].value
      });
      remainingAmount -= amount;
    }

    if (stackedTotal > bestCombination.total) {
      bestCombination = {
        codes: stackable,
        total: stackedTotal,
        details: stackedDetails
      };
    }
  }

  return bestCombination;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ success: false, message: 'Non autenticato' }, { status: 401 });
    }

    const { cartId, codes } = await req.json();

    if (!cartId || !codes || !Array.isArray(codes)) {
      return Response.json({ success: false, message: 'Parametri non validi' }, { status: 400 });
    }

    const carts = await base44.asServiceRole.entities.Cart.filter({ id: cartId });
    if (!carts || carts.length === 0) {
      return Response.json({ success: false, message: 'Carrello non trovato' }, { status: 404 });
    }

    const cart = carts[0];
    if (cart.userId !== user.email) {
      return Response.json({ success: false, message: 'Non autorizzato' }, { status: 403 });
    }

    const bestCombination = findBestDiscountCombination(codes, cart.totalAmount);

    if (bestCombination.total === 0) {
      return Response.json({
        success: false,
        message: 'Nessuno sconto applicabile',
        applied: []
      });
    }

    await base44.asServiceRole.entities.Cart.update(cartId, {
      discountAmount: parseFloat(bestCombination.total.toFixed(2)),
      discountCode: bestCombination.codes.join(',')
    });

    return Response.json({
      success: true,
      totalDiscount: parseFloat(bestCombination.total.toFixed(2)),
      appliedCodes: bestCombination.codes,
      details: bestCombination.details,
      message: `${bestCombination.codes.length} sconto/i applicato/i`
    });

  } catch (error) {
    console.error('Optimize discounts error:', error);
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});