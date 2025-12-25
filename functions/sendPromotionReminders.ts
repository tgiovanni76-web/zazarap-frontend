import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Scheduled function to send promotion expiration reminders
 * Run daily via cron job
 * Sends reminders 3 days before expiration
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Get all active promotions
    const promotions = await base44.asServiceRole.entities.ListingPromotion.filter({
      status: { $in: ['paid', 'active'] }
    });

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    let remindersSent = 0;

    for (const promo of promotions) {
      if (!promo.endDate) continue;

      const endDate = new Date(promo.endDate);
      
      // Check if expiring in 3 days (within 1 hour window for daily job)
      const timeDiff = Math.abs(endDate.getTime() - threeDaysFromNow.getTime());
      const oneHour = 60 * 60 * 1000;
      
      if (timeDiff < oneHour) {
        // Get listing details
        const listing = await base44.asServiceRole.entities.Listing.filter({ id: promo.listingId });
        if (!listing || listing.length === 0) continue;

        const listingData = listing[0];
        const ownerEmail = listingData.created_by;

        // Send email notification
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: ownerEmail,
          subject: '⏰ Deine Anzeigen-Promotion läuft bald ab',
          body: `
Hallo,

Deine Promotion für "${listingData.title}" läuft in 3 Tagen ab (${endDate.toLocaleDateString('de-DE')}).

Promotion-Details:
- Typ: ${promo.type === 'featured' ? 'Hervorgehoben' : 'TOP-Anzeige'}
- Ende: ${endDate.toLocaleDateString('de-DE')}

Um die Sichtbarkeit deiner Anzeige zu erhalten, kannst du die Promotion verlängern:
https://zazarap.de/promotions

Mit freundlichen Grüßen,
Das Zazarap Team
          `.trim()
        });

        // Create in-app notification
        await base44.asServiceRole.entities.Notification.create({
          userId: ownerEmail,
          type: 'reminder',
          title: '⏰ Promotion läuft bald ab',
          message: `Deine ${promo.type === 'featured' ? 'Hervorgehobene' : 'TOP'}-Promotion für "${listingData.title}" endet am ${endDate.toLocaleDateString('de-DE')}. Jetzt verlängern!`,
          linkUrl: `/promotions`,
          relatedId: promo.id
        });

        remindersSent++;

        // Log event
        await base44.asServiceRole.entities.SystemLog.create({
          level: 'info',
          message: 'Promotion expiration reminder sent',
          details: JSON.stringify({ promotionId: promo.id, listingId: promo.listingId, ownerEmail }),
          source: 'backend'
        });
      }
    }

    return Response.json({
      success: true,
      remindersSent,
      message: `Sent ${remindersSent} promotion reminders`
    });

  } catch (error) {
    console.error('Error sending promotion reminders:', error);
    
    await base44?.asServiceRole.entities.SystemLog.create({
      level: 'error',
      message: 'Failed to send promotion reminders',
      details: error.message,
      source: 'backend'
    }).catch(() => {});

    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});