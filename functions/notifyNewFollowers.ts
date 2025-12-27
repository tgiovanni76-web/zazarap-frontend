import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Neue Follower in den letzten 24h
    const recentFollows = await base44.asServiceRole.entities.Follow.filter(
      { created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() } },
      '-created_date',
      100
    );

    for (const follow of recentFollows) {
      if (follow.targetType === 'user') {
        // Benachrichtige den gefolgten Nutzer
        await base44.asServiceRole.functions.invoke('sendNotification', {
          userId: follow.targetId,
          type: 'status_update',
          title: '👤 Neuer Follower!',
          message: `${follow.created_by} folgt dir jetzt`,
          linkUrl: `/UserProfile?email=${follow.created_by}`
        });
      } else if (follow.targetType === 'category') {
        // Neue Listings in verfolgter Kategorie
        const newListingsInCategory = await base44.asServiceRole.entities.Listing.filter({
          category: follow.targetId,
          created_date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
          status: 'active',
          moderationStatus: 'approved'
        });

        if (newListingsInCategory.length > 0) {
          await base44.asServiceRole.functions.invoke('sendNotification', {
            userId: follow.created_by,
            type: 'offer',
            title: `🔔 Neue Anzeigen in "${follow.targetId}"`,
            message: `${newListingsInCategory.length} neue Anzeigen in deiner verfolgten Kategorie`,
            linkUrl: `/Marketplace?category=${follow.targetId}`
          });
        }
      }
    }

    return Response.json({
      success: true,
      processed: recentFollows.length
    });

  } catch (error) {
    console.error('Follower notification error:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});