import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';

const payloadSchema = z.object({
  promotionId: z.string(),
  autoRenew: z.boolean()
});

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { promotionId, autoRenew } = payloadSchema.parse(payload);

    // Get promotion
    const promotions = await base44.entities.ListingPromotion.filter({
      id: promotionId,
      created_by: user.email
    });

    if (promotions.length === 0) {
      return Response.json({ error: 'Promotion not found' }, { status: 404 });
    }

    const promo = promotions[0];

    // Update auto-renewal setting
    await base44.entities.ListingPromotion.update(promotionId, {
      autoRenew,
      renewalFrequency: autoRenew ? (promo.durationDays >= 28 ? 'monthly' : 'weekly') : null
    });

    // Send notification
    const listings = await base44.entities.Listing.filter({ id: promo.listingId });
    const listingTitle = listings.length > 0 ? listings[0].title : 'la tua anzeige';

    await base44.asServiceRole.entities.Notification.create({
      userId: user.email,
      type: 'status_update',
      title: autoRenew ? 'Rinnovo automatico attivato' : 'Rinnovo automatico disattivato',
      message: autoRenew 
        ? `La promozione per "${listingTitle}" si rinnoverà automaticamente.`
        : `Il rinnovo automatico per "${listingTitle}" è stato disattivato.`,
      linkUrl: `/promotion-manager`
    });

    return Response.json({
      success: true,
      autoRenew,
      message: autoRenew ? 'Auto-renewal enabled' : 'Auto-renewal disabled'
    });

  } catch (error) {
    console.error('Toggle auto-renewal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});