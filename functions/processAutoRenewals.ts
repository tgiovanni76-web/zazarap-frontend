import { createClient } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.4.0';

Deno.serve(async () => {
  try {
    const base44 = createClient(Deno.env.get('BASE44_SERVICE_ROLE_KEY'));
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia'
    });

    // Find promotions expiring in 3 days with auto-renewal enabled
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysEnd = new Date(threeDaysFromNow);
    threeDaysEnd.setHours(23, 59, 59, 999);

    const expiringPromos = await base44.asServiceRole.entities.ListingPromotion.filter({
      status: 'paid',
      autoRenew: true
    });

    const promosToRenew = expiringPromos.filter(promo => {
      const endDate = new Date(promo.endDate);
      return endDate >= threeDaysFromNow && endDate <= threeDaysEnd;
    });

    console.log(`Found ${promosToRenew.length} promotions to auto-renew`);

    for (const promo of promosToRenew) {
      try {
        // Get listing details
        const listings = await base44.entities.Listing.filter({ id: promo.listingId });
        if (!listings || listings.length === 0) continue;
        const listing = listings[0];

        // Get user's Stripe customer
        const customers = await stripe.customers.list({ 
          email: promo.created_by, 
          limit: 1 
        });
        if (customers.data.length === 0) {
          console.log(`No Stripe customer for ${promo.created_by}, skipping renewal`);
          continue;
        }

        const customer = customers.data[0];
        
        // Get default payment method
        const paymentMethods = await stripe.paymentMethods.list({
          customer: customer.id,
          type: 'card'
        });

        if (paymentMethods.data.length === 0) {
          // No payment method, send notification
          await base44.asServiceRole.entities.Notification.create({
            userId: promo.created_by,
            type: 'reminder',
            title: 'Rinnovo automatico non riuscito',
            message: `Non è stato possibile rinnovare automaticamente la promozione per "${listing.title}". Aggiungi un metodo di pagamento.`,
            linkUrl: `/listing/${promo.listingId}`
          });
          continue;
        }

        // Calculate renewal amount
        const dailyRate = promo.amount / promo.durationDays;
        const renewalAmount = dailyRate * promo.durationDays;

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(renewalAmount * 100),
          currency: 'eur',
          customer: customer.id,
          payment_method: paymentMethods.data[0].id,
          off_session: true,
          confirm: true,
          metadata: {
            type: 'auto_renewal',
            promotionId: promo.id,
            listingId: promo.listingId,
            userId: promo.created_by
          }
        });

        if (paymentIntent.status === 'succeeded') {
          // Extend promotion
          const currentEndDate = new Date(promo.endDate);
          const newEndDate = new Date(currentEndDate.getTime() + promo.durationDays * 24 * 60 * 60 * 1000);

          await base44.asServiceRole.entities.ListingPromotion.update(promo.id, {
            endDate: newEndDate.toISOString()
          });

          // Update listing expiry if needed
          if (promo.type === 'featured' || promo.type === 'daily_highlight') {
            await base44.asServiceRole.entities.Listing.update(listing.id, {
              featuredUntil: newEndDate.toISOString()
            });
          }
          if (promo.type === 'top' || promo.type === 'turbo') {
            await base44.asServiceRole.entities.Listing.update(listing.id, {
              topAdUntil: newEndDate.toISOString()
            });
          }

          // Create transaction record
          await base44.asServiceRole.entities.Transaction.create({
            userId: promo.created_by,
            kind: 'promotion',
            provider: 'stripe',
            amount: renewalAmount,
            currency: 'EUR',
            status: 'paid',
            externalOrderId: paymentIntent.id,
            externalTransactionId: paymentIntent.id,
            description: `Rinnovo automatico: ${promo.type} per ${promo.durationDays} giorni`,
            relatedEntity: 'ListingPromotion',
            relatedId: promo.id,
            metadata: JSON.stringify({ autoRenewal: true })
          });

          // Send success notification
          await base44.asServiceRole.entities.Notification.create({
            userId: promo.created_by,
            type: 'status_update',
            title: 'Promozione rinnovata automaticamente',
            message: `La promozione per "${listing.title}" è stata rinnovata fino al ${newEndDate.toLocaleDateString('it-IT')}. Importo: €${renewalAmount.toFixed(2)}`,
            linkUrl: `/listing/${promo.listingId}`
          });

          // Send email
          await base44.integrations.Core.SendEmail({
            to: promo.created_by,
            subject: 'Promozione rinnovata automaticamente - Zazarap',
            body: `
Ciao,

La tua promozione per "${listing.title}" è stata rinnovata automaticamente.

Dettagli rinnovo:
- Tipo: ${promo.type}
- Durata: ${promo.durationDays} giorni
- Importo: €${renewalAmount.toFixed(2)}
- Nuova scadenza: ${newEndDate.toLocaleDateString('it-IT')}

Puoi gestire i rinnovi automatici nella sezione Promotion Manager.

Grazie,
Il team Zazarap
            `
          });

          console.log(`Successfully renewed promotion ${promo.id}`);
        }

      } catch (error) {
        console.error(`Failed to renew promotion ${promo.id}:`, error);
        
        // Send failure notification
        await base44.asServiceRole.entities.Notification.create({
          userId: promo.created_by,
          type: 'reminder',
          title: 'Rinnovo automatico non riuscito',
          message: `Non è stato possibile rinnovare la promozione. Verifica il tuo metodo di pagamento.`,
          linkUrl: `/promotion-manager`
        });

        // Log error
        await base44.asServiceRole.entities.SystemLog.create({
          level: 'error',
          message: 'Auto-renewal failed',
          details: error.message,
          context: JSON.stringify({ promotionId: promo.id }),
          userId: promo.created_by,
          source: 'backend'
        });
      }
    }

    return Response.json({ 
      success: true, 
      processed: promosToRenew.length,
      message: `Processed ${promosToRenew.length} auto-renewals`
    });

  } catch (error) {
    console.error('Auto-renewal process error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});