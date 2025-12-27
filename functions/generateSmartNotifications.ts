import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // 1. VERKÄUFER: Neue Nachrichten/Angebote
    const recentChats = await base44.asServiceRole.entities.Chat.filter(
      { updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } },
      '-updatedAt',
      100
    );

    for (const chat of recentChats) {
      if (chat.unreadSeller > 0) {
        const listing = await base44.asServiceRole.entities.Listing.filter({ id: chat.listingId });
        if (listing[0]) {
          await base44.asServiceRole.functions.invoke('sendNotification', {
            userId: chat.sellerId,
            type: 'message',
            title: '💬 Neue Nachricht zu deiner Anzeige',
            message: `"${listing[0].title}" - ${chat.unreadSeller} neue Nachricht(en)`,
            linkUrl: `/Messages?chatId=${chat.id}`
          });
        }
      }
    }

    // 2. NUTZER: Ähnliche Produkte zu Interessen
    const users = await base44.asServiceRole.entities.User.list();
    const activities = await base44.asServiceRole.entities.UserActivity.filter(
      { created_date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } },
      '-created_date',
      1000
    );

    // Gruppiere Activities nach Nutzer
    const userInterests = {};
    for (const activity of activities) {
      if (!userInterests[activity.userId]) {
        userInterests[activity.userId] = { categories: new Set(), searches: [] };
      }
      if (activity.category) userInterests[activity.userId].categories.add(activity.category);
      if (activity.searchTerm) userInterests[activity.userId].searches.push(activity.searchTerm);
    }

    // Neue Listings der letzten 24h
    const newListings = await base44.asServiceRole.entities.Listing.filter(
      { 
        created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        status: 'active',
        moderationStatus: 'approved'
      },
      '-created_date',
      50
    );

    for (const [userId, interests] of Object.entries(userInterests)) {
      const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ userId });
      if (prefs.length === 0 || !prefs[0].emailNotifications) continue;

      // Finde relevante neue Listings
      const relevantListings = newListings.filter(listing => 
        listing.created_by !== userId && 
        (interests.categories.has(listing.category) || 
         interests.searches.some(search => 
           listing.title.toLowerCase().includes(search.toLowerCase())
         ))
      );

      if (relevantListings.length > 0) {
        // KI entscheidet welches Listing am relevantesten ist
        const aiPrompt = `Analysiere diese Listings und wähle die 3 relevantesten für den Nutzer aus.

Nutzer-Interessen:
- Kategorien: ${Array.from(interests.categories).join(', ')}
- Suchanfragen: ${interests.searches.slice(0, 5).join(', ')}

Neue Listings:
${relevantListings.slice(0, 10).map(l => `- "${l.title}" (${l.category}, ${l.price}€)`).join('\n')}

Wähle die Top 3 relevantesten aus.`;

        try {
          const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: aiPrompt,
            response_json_schema: {
              type: 'object',
              properties: {
                selectedTitles: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'Titles der Top 3 Listings'
                },
                reason: { type: 'string', description: 'Begründung' }
              }
            }
          });

          const topListings = relevantListings.filter(l => 
            aiResult.selectedTitles?.some(title => l.title.includes(title))
          ).slice(0, 3);

          if (topListings.length > 0) {
            await base44.asServiceRole.functions.invoke('sendNotification', {
              userId,
              type: 'offer',
              title: '✨ Neue Produkte für dich',
              message: `${topListings.length} neue Anzeigen passend zu deinen Interessen: ${topListings.map(l => l.title).join(', ')}`,
              linkUrl: '/Marketplace'
            });
          }
        } catch (err) {
          console.error('AI matching error:', err);
        }
      }
    }

    // 3. ERINNERUNGEN: Auslaufende Listings
    const expiringListings = await base44.asServiceRole.entities.Listing.filter({
      status: 'active',
      expiresAt: {
        $gte: new Date().toISOString(),
        $lte: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      expiryReminderSent: false
    });

    for (const listing of expiringListings) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: listing.created_by,
        type: 'reminder',
        title: '⏰ Anzeige läuft bald ab',
        message: `"${listing.title}" läuft in weniger als 48 Stunden ab. Verlängern oder neue Anzeige erstellen?`,
        linkUrl: `/EditListing?id=${listing.id}`
      });

      await base44.asServiceRole.entities.Listing.update(listing.id, { 
        expiryReminderSent: true 
      });
    }

    // Auslaufende Promotions
    const expiringPromos = await base44.asServiceRole.entities.ListingPromotion.filter({
      status: 'paid',
      endDate: {
        $gte: new Date().toISOString(),
        $lte: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      }
    });

    for (const promo of expiringPromos) {
      await base44.asServiceRole.functions.invoke('sendNotification', {
        userId: promo.created_by,
        type: 'reminder',
        title: '⭐ Promotion läuft bald ab',
        message: `Deine ${promo.type}-Promotion endet in weniger als 48 Stunden. Jetzt verlängern?`,
        linkUrl: `/MySubscriptions`
      });
    }

    // 4. PRICE DROPS auf Favoriten
    const favorites = await base44.asServiceRole.entities.Favorite.list();
    const userFavorites = {};
    for (const fav of favorites) {
      if (!userFavorites[fav.user_email]) userFavorites[fav.user_email] = [];
      userFavorites[fav.user_email].push(fav.listing_id);
    }

    for (const [userEmail, listingIds] of Object.entries(userFavorites)) {
      const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ userId: userEmail });
      if (prefs.length === 0 || !prefs[0].priceDropNotifications) continue;

      for (const listingId of listingIds) {
        const listing = await base44.asServiceRole.entities.Listing.filter({ id: listingId });
        if (listing[0] && listing[0].offerPrice && listing[0].offerPrice < listing[0].price) {
          await base44.asServiceRole.functions.invoke('sendNotification', {
            userId: userEmail,
            type: 'offer',
            title: '💰 Preissenkung bei Favorit!',
            message: `"${listing[0].title}" - Jetzt ${listing[0].offerPrice}€ statt ${listing[0].price}€!`,
            linkUrl: `/ListingDetail?id=${listingId}`
          });
        }
      }
    }

    return Response.json({ 
      success: true,
      processed: {
        sellerNotifications: recentChats.length,
        userRecommendations: Object.keys(userInterests).length,
        expiryReminders: expiringListings.length + expiringPromos.length
      }
    });

  } catch (error) {
    console.error('Smart notifications error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});