import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get recent follows (last 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const allFollows = await base44.asServiceRole.entities.Follow.list('-created_date');
    const recentFollows = allFollows.filter(f => f.created_date >= oneDayAgo);

    for (const follow of recentFollows) {
      if (follow.targetType === 'user') {
        // Notify seller about new follower
        const followerInfo = await base44.asServiceRole.entities.User.filter({
          email: follow.userId
        });

        await base44.functions.invoke('generateSmartNotifications', {
          userId: follow.targetId,
          type: 'new_offer',
          context: {
            followerName: followerInfo[0]?.full_name || 'Un utente',
            message: `${followerInfo[0]?.full_name || 'Un utente'} ha iniziato a seguirti!`,
            actionUrl: `/profile?user=${follow.userId}`
          }
        });

        // Get seller's new listings
        const newListings = await base44.asServiceRole.entities.Listing.filter({
          created_by: follow.targetId
        });

        const veryRecentListings = newListings.filter(l => 
          new Date(l.created_date) >= new Date(oneDayAgo)
        );

        // Notify follower about new listings
        for (const listing of veryRecentListings) {
          await base44.functions.invoke('generateSmartNotifications', {
            userId: follow.userId,
            type: 'new_offer',
            context: {
              listingTitle: listing.title,
              listingPrice: listing.price,
              listingCategory: listing.category,
              actionUrl: `/listing?id=${listing.id}`
            }
          });
        }
      }
    }

    return Response.json({ 
      success: true,
      processed: recentFollows.length
    });

  } catch (error) {
    console.error('Notify followers error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});