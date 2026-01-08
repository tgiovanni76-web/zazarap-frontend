import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all pending listings
    const pendingListings = await base44.asServiceRole.entities.Listing.filter({
      moderationStatus: 'pending'
    });

    console.log(`Found ${pendingListings.length} pending listings to moderate`);

    const results = [];
    let approved = 0;
    let rejected = 0;
    let needsReview = 0;

    for (const listing of pendingListings.slice(0, 50)) { // Process max 50 at a time
      try {
        const response = await base44.asServiceRole.functions.invoke('autoModerateAndSuggest', {
          listingId: listing.id
        });

        if (response.data?.success) {
          const action = response.data.moderation.action;
          if (action === 'approve') approved++;
          else if (action === 'reject') rejected++;
          else if (action === 'review') needsReview++;

          results.push({
            listingId: listing.id,
            title: listing.title,
            action,
            riskLevel: response.data.moderation.riskLevel
          });
        }
      } catch (error) {
        console.error(`Error moderating listing ${listing.id}:`, error);
        results.push({
          listingId: listing.id,
          title: listing.title,
          error: error.message
        });
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return Response.json({
      success: true,
      totalProcessed: results.length,
      approved,
      rejected,
      needsReview,
      results
    });

  } catch (error) {
    console.error('Bulk moderation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});