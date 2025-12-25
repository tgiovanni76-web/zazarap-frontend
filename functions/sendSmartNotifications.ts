import { createClient } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async () => {
  try {
    const base44 = createClient(Deno.env.get('BASE44_SERVICE_ROLE_KEY'));

    // Get active chats that need follow-up
    const activeChats = await base44.asServiceRole.entities.Chat.filter({
      status: { $in: ['in_attesa', 'accettata'] }
    });

    const now = new Date();
    const notifications = [];

    for (const chat of activeChats) {
      const lastUpdate = new Date(chat.updated_date);
      const hoursSinceUpdate = (now - lastUpdate) / (1000 * 60 * 60);

      // Get last message
      const messages = await base44.entities.ChatMessage.filter({ chatId: chat.id }, '-created_date', 1);
      if (messages.length === 0) continue;
      
      const lastMessage = messages[0];
      const lastMessageFromBuyer = lastMessage.senderId === chat.buyerId;

      // Get listing
      const listings = await base44.entities.Listing.filter({ id: chat.listingId });
      if (listings.length === 0) continue;
      const listing = listings[0];

      // Check if seller needs reminder
      if (lastMessageFromBuyer && hoursSinceUpdate >= 24) {
        // Buyer sent last message over 24h ago, remind seller
        const existingNotifs = await base44.asServiceRole.entities.Notification.filter({
          userId: chat.sellerId,
          relatedId: chat.id,
          type: 'reminder',
          created_date: { $gte: new Date(now - 24 * 60 * 60 * 1000).toISOString() }
        });

        if (existingNotifs.length === 0) {
          await base44.asServiceRole.entities.Notification.create({
            userId: chat.sellerId,
            type: 'reminder',
            title: '⏰ Acquirente in attesa di risposta',
            message: `L'acquirente sta aspettando la tua risposta per "${listing.title}". Rispondi ora per non perdere la vendita!`,
            linkUrl: `/messages?chatId=${chat.id}`
          });

          notifications.push({
            type: 'seller_reminder',
            chatId: chat.id,
            hoursSinceUpdate
          });

          // Send email if >48h
          if (hoursSinceUpdate >= 48) {
            await base44.integrations.Core.SendEmail({
              to: chat.sellerId,
              subject: '⚠️ Opportunità di vendita in scadenza - Zazarap',
              body: `
Ciao,

Un acquirente sta aspettando la tua risposta per "${listing.title}" da più di 48 ore.

Ultima offerta: ${chat.lastPrice ? `€${chat.lastPrice}` : 'In discussione'}

Rispondi subito per non perdere questa opportunità:
${Deno.env.get('BASE_URL') || 'https://zazarap.de'}/messages?chatId=${chat.id}

Cordiali saluti,
Il team Zazarap
              `
            });
          }
        }
      }

      // Check if negotiation is stalling
      if (chat.status === 'in_attesa' && hoursSinceUpdate >= 72) {
        // Negotiation stalled for 3+ days
        const existingStallNotifs = await base44.asServiceRole.entities.Notification.filter({
          userId: chat.sellerId,
          relatedId: chat.id,
          type: 'reminder',
          message: { $regex: 'trattativa ferma' }
        });

        if (existingStallNotifs.length === 0) {
          await base44.asServiceRole.entities.Notification.create({
            userId: chat.sellerId,
            type: 'reminder',
            title: '🔄 Riattiva la trattativa',
            message: `La trattativa per "${listing.title}" è ferma da ${Math.floor(hoursSinceUpdate / 24)} giorni. Proponi un'offerta per chiudere la vendita!`,
            linkUrl: `/messages?chatId=${chat.id}`
          });

          notifications.push({
            type: 'stalled_negotiation',
            chatId: chat.id,
            daysSinceUpdate: Math.floor(hoursSinceUpdate / 24)
          });
        }
      }

      // Smart suggestions based on buyer behavior
      if (lastMessageFromBuyer && hoursSinceUpdate >= 12 && hoursSinceUpdate < 24) {
        // Buyer is engaged, suggest quick response
        const quickResponseNotifs = await base44.asServiceRole.entities.Notification.filter({
          userId: chat.sellerId,
          relatedId: chat.id,
          type: 'reminder',
          created_date: { $gte: new Date(now - 12 * 60 * 60 * 1000).toISOString() }
        });

        if (quickResponseNotifs.length === 0) {
          await base44.asServiceRole.entities.Notification.create({
            userId: chat.sellerId,
            type: 'reminder',
            title: '💡 Acquirente interessato',
            message: `L'acquirente sembra molto interessato a "${listing.title}". Una risposta rapida potrebbe chiudere la vendita!`,
            linkUrl: `/messages?chatId=${chat.id}`
          });

          notifications.push({
            type: 'opportunity_alert',
            chatId: chat.id
          });
        }
      }
    }

    return Response.json({
      success: true,
      notificationsSent: notifications.length,
      details: notifications
    });

  } catch (error) {
    console.error('Smart notifications error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});