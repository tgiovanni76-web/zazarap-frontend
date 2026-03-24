import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const RESERVATION_TIMEOUT_HOURS = 48; // Configurable

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all reserved listings
    const reservedListings = await base44.asServiceRole.entities.Listing.filter({ 
      status: 'reserved' 
    });

    console.log(`Found ${reservedListings.length} reserved listings`);

    const now = new Date();
    const expiredReservations = [];

    for (const listing of reservedListings) {
      // Check if listing has been reserved for more than RESERVATION_TIMEOUT_HOURS
      const reservedDate = new Date(listing.updated_date);
      const hoursSinceReserved = (now - reservedDate) / (1000 * 60 * 60);

      if (hoursSinceReserved >= RESERVATION_TIMEOUT_HOURS) {
        console.log(`Reservation expired for listing ${listing.id} (${hoursSinceReserved.toFixed(1)}h)`);

        // Set listing back to active
        await base44.asServiceRole.entities.Listing.update(listing.id, {
          status: 'active'
        });

        // Find associated offers and set to expired
        const offers = await base44.asServiceRole.entities.Offer.filter({
          listingId: listing.id,
          status: 'accepted_reserved'
        });

        for (const offer of offers) {
          await base44.asServiceRole.entities.Offer.update(offer.id, {
            status: 'expired'
          });

          // Create system message in chat
          const chats = await base44.asServiceRole.entities.Chat.filter({
            listingId: listing.id,
            id: offer.chatId
          });

          if (chats.length > 0) {
            const chat = chats[0];

            await base44.asServiceRole.entities.ChatMessage.create({
              chatId: chat.id,
              senderId: 'system@zazarap.com',
              text: `⏰ Reservierung abgelaufen nach ${RESERVATION_TIMEOUT_HOURS}h ohne Abschluss. Anzeige ist wieder verfügbar.`,
              messageType: 'system'
            });

            // Notify both buyer and seller
            await base44.asServiceRole.entities.Notification.create({
              userId: chat.buyerId,
              type: 'status_update',
              title: '⏰ Reservierung abgelaufen',
              message: `Die Reservierung für "${listing.title}" ist nach ${RESERVATION_TIMEOUT_HOURS} Stunden abgelaufen. Die Anzeige ist wieder verfügbar.`,
              linkUrl: '/Messages?chatId=' + chat.id,
              relatedId: chat.id
            });

            await base44.asServiceRole.entities.Notification.create({
              userId: chat.sellerId,
              type: 'status_update',
              title: '⏰ Reservierung abgelaufen',
              message: `Die Reservierung für "${listing.title}" ist nach ${RESERVATION_TIMEOUT_HOURS} Stunden abgelaufen. Die Anzeige ist wieder verfügbar.`,
              linkUrl: '/Messages?chatId=' + chat.id,
              relatedId: chat.id
            });
          }
        }

        expiredReservations.push({
          listingId: listing.id,
          title: listing.title,
          hoursSinceReserved: hoursSinceReserved.toFixed(1)
        });
      }
    }

    return Response.json({
      success: true,
      checked: reservedListings.length,
      expired: expiredReservations.length,
      details: expiredReservations
    });
  } catch (error) {
    console.error('Error checking reservation timeouts:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});