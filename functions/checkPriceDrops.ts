import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all favorites
    const favorites = await base44.asServiceRole.entities.Favorite.list();
    
    let notificationsSent = 0;

    for (const fav of favorites) {
      // Get current listing
      const listings = await base44.asServiceRole.entities.Listing.filter({
        id: fav.listing_id
      });

      if (listings.length === 0) continue;
      const listing = listings[0];

      // Check if price dropped
      if (fav.price && listing.price < fav.price) {
        const priceDrop = fav.price - listing.price;
        const percentDrop = ((priceDrop / fav.price) * 100).toFixed(0);

        await base44.functions.invoke('generateSmartNotifications', {
          userId: fav.user_email,
          type: 'price_drop',
          context: {
            listingTitle: listing.title,
            oldPrice: fav.price,
            newPrice: listing.price,
            priceDrop,
            percentDrop,
            actionUrl: `/listing?id=${listing.id}`
          }
        });

        // Update favorite with new price
        await base44.asServiceRole.entities.Favorite.update(fav.id, {
          price: listing.price
        });

        notificationsSent++;
      }
    }

    return Response.json({
      success: true,
      favoritesChecked: favorites.length,
      notificationsSent
    });

  } catch (error) {
    console.error('Price drops check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});