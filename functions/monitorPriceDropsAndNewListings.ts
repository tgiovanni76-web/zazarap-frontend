import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with activity
    const allActivities = await base44.asServiceRole.entities.UserActivity.list('-created_date', 1000);
    const users = [...new Set(allActivities.map(a => a.userId))];

    // Get all favorites
    const allFavorites = await base44.asServiceRole.entities.Favorite.list();

    // Get all follows
    const allFollows = await base44.asServiceRole.entities.Follow.list();

    // Get all listings
    const allListings = await base44.asServiceRole.entities.Listing.filter(
      { status: 'active', moderationStatus: 'approved' }
    );

    const notifications = [];
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    for (const userEmail of users) {
      const userActivities = allActivities.filter(a => a.userId === userEmail);
      const userFavorites = allFavorites.filter(f => f.user_email === userEmail);
      const userFollows = allFollows.filter(f => f.userId === userEmail);

      // Check price drops on favorites
      for (const favorite of userFavorites) {
        const listing = allListings.find(l => l.id === favorite.listingId);
        if (!listing) continue;

        // Check if price dropped
        if (favorite.price && listing.price < favorite.price * 0.9) {
          const dropPercentage = Math.round((1 - listing.price / favorite.price) * 100);
          
          await base44.asServiceRole.entities.Notification.create({
            userId: userEmail,
            type: 'price_drop',
            title: '💰 Calo di Prezzo!',
            message: `${listing.title} è sceso del ${dropPercentage}%! Ora a ${listing.price}€`,
            relatedEntity: 'Listing',
            relatedId: listing.id,
            read: false,
            priority: 'high'
          });

          notifications.push({
            userId: userEmail,
            type: 'price_drop',
            listingId: listing.id
          });

          // Update favorite price
          await base44.asServiceRole.entities.Favorite.update(favorite.id, {
            price: listing.price
          });
        }
      }

      // Check new listings in followed categories
      const followedCategories = userFollows
        .filter(f => f.targetType === 'category')
        .map(f => f.targetId);

      for (const category of followedCategories) {
        const newListings = allListings.filter(l => 
          l.category === category &&
          new Date(l.created_date) > oneDayAgo
        );

        if (newListings.length > 0) {
          // AI to summarize new listings
          const aiPrompt = `Riassumi questi nuovi annunci in ${category} in modo accattivante:

${newListings.slice(0, 5).map(l => `- ${l.title} (${l.price}€)`).join('\n')}

Crea un messaggio breve (max 100 caratteri) che invogli l'utente a dare un'occhiata.`;

          const aiSummary = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: aiPrompt,
            response_json_schema: {
              type: "object",
              properties: {
                message: { type: "string" }
              }
            }
          });

          await base44.asServiceRole.entities.Notification.create({
            userId: userEmail,
            type: 'new_listings',
            title: `🆕 Nuovi in ${category}!`,
            message: aiSummary.message,
            relatedEntity: 'Category',
            relatedId: category,
            read: false,
            priority: 'normal'
          });

          notifications.push({
            userId: userEmail,
            type: 'new_listings',
            category,
            count: newListings.length
          });
        }
      }

      // Check new listings from followed sellers
      const followedSellers = userFollows
        .filter(f => f.targetType === 'user')
        .map(f => f.targetId);

      for (const sellerEmail of followedSellers) {
        const newListings = allListings.filter(l =>
          l.created_by === sellerEmail &&
          new Date(l.created_date) > oneDayAgo
        );

        if (newListings.length > 0) {
          await base44.asServiceRole.entities.Notification.create({
            userId: userEmail,
            type: 'new_from_followed_seller',
            title: '⭐ Nuovo da un venditore che segui!',
            message: `${newListings[0].title} e altri ${newListings.length - 1} nuovi annunci`,
            relatedEntity: 'Listing',
            relatedId: newListings[0].id,
            read: false,
            priority: 'normal'
          });

          notifications.push({
            userId: userEmail,
            type: 'new_from_seller',
            sellerId: sellerEmail,
            count: newListings.length
          });
        }
      }

      // AI-powered opportunity detection based on search history
      const recentSearches = userActivities
        .filter(a => a.activityType === 'search' && a.searchTerm)
        .slice(0, 10)
        .map(a => a.searchTerm);

      if (recentSearches.length > 0) {
        const matchingListings = allListings.filter(l => {
          const createdDate = new Date(l.created_date);
          if (createdDate < oneDayAgo) return false;

          return recentSearches.some(search =>
            l.title.toLowerCase().includes(search.toLowerCase()) ||
            l.description?.toLowerCase().includes(search.toLowerCase())
          );
        });

        if (matchingListings.length > 0) {
          await base44.asServiceRole.entities.Notification.create({
            userId: userEmail,
            type: 'matching_search',
            title: '🎯 Trovato quello che cercavi!',
            message: `Nuovi annunci corrispondono alle tue ricerche: "${recentSearches[0]}"`,
            relatedEntity: 'Listing',
            relatedId: matchingListings[0].id,
            read: false,
            priority: 'high'
          });

          notifications.push({
            userId: userEmail,
            type: 'search_match',
            count: matchingListings.length
          });
        }
      }
    }

    return Response.json({
      success: true,
      notificationsSent: notifications.length,
      notifications
    });

  } catch (error) {
    console.error('Monitoring error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});