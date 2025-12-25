import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Run this periodically to check for price drops on favorited listings
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active listings with offerPrice
    const listings = await base44.asServiceRole.entities.Listing.filter({
      status: 'active',
    });

    const priceDropListings = listings.filter(l => l.offerPrice && l.offerPrice < l.price);

    for (const listing of priceDropListings) {
      // Find all users who favorited this listing
      const favorites = await base44.asServiceRole.entities.Favorite.filter({
        listing_id: listing.id,
      });

      for (const fav of favorites) {
        // Send notification
        await base44.asServiceRole.functions.invoke('sendNotification', {
          userId: fav.user_email,
          type: 'price_drop',
          title: 'Preissenkung!',
          message: `"${listing.title}" ist jetzt günstiger: €${listing.offerPrice} (vorher €${listing.price})`,
          linkUrl: `/listing/${listing.id}`,
          relatedId: listing.id,
          sendEmail: true,
        });
      }
    }

    return Response.json({ 
      success: true, 
      checked: listings.length,
      notified: priceDropListings.length 
    });
  } catch (error) {
    console.error('checkPriceDrops error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});