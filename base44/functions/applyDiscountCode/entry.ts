import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Discount codes configuration
const DISCOUNT_CODES = {
  'WELCOME10': { type: 'percentage', value: 10, minAmount: 20 },
  'SAVE20': { type: 'percentage', value: 20, minAmount: 50 },
  'FIRST15': { type: 'percentage', value: 15, minAmount: 30 },
  'FLAT5': { type: 'fixed', value: 5, minAmount: 25 }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ 
        success: false,
        message: 'Non autenticato' 
      }, { status: 401 });
    }

    const { cartId, code } = await req.json();

    if (!cartId || !code) {
      return Response.json({ 
        success: false,
        message: 'Parametri mancanti' 
      }, { status: 400 });
    }

    // Get cart
    const carts = await base44.asServiceRole.entities.Cart.filter({ id: cartId });
    if (!carts || carts.length === 0) {
      return Response.json({ 
        success: false,
        message: 'Carrello non trovato' 
      }, { status: 404 });
    }

    const cart = carts[0];

    // Check ownership
    if (cart.userId !== user.email) {
      return Response.json({ 
        success: false,
        message: 'Non autorizzato' 
      }, { status: 403 });
    }

    // Check if discount already applied
    if (cart.discountCode) {
      return Response.json({ 
        success: false,
        message: 'Sconto già applicato' 
      }, { status: 400 });
    }

    // Validate discount code
    const discount = DISCOUNT_CODES[code.toUpperCase()];
    if (!discount) {
      return Response.json({ 
        success: false,
        message: 'Codice sconto non valido' 
      }, { status: 400 });
    }

    // Check minimum amount
    if (cart.totalAmount < discount.minAmount) {
      return Response.json({ 
        success: false,
        message: `Importo minimo richiesto: ${discount.minAmount}€` 
      }, { status: 400 });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (cart.totalAmount * discount.value) / 100;
    } else if (discount.type === 'fixed') {
      discountAmount = discount.value;
    }

    // Apply discount
    await base44.asServiceRole.entities.Cart.update(cartId, {
      discountCode: code.toUpperCase(),
      discountAmount: parseFloat(discountAmount.toFixed(2))
    });

    return Response.json({ 
      success: true,
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      message: 'Sconto applicato con successo'
    });

  } catch (error) {
    console.error('Discount application error:', error);
    return Response.json({ 
      success: false,
      message: error.message 
    }, { status: 500 });
  }
});