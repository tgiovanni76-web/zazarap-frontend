import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Get analytics for user's promotions
 * Returns views, clicks, and conversion metrics
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const promotionId = url.searchParams.get('promotionId');

    // Get user's listings
    const userListings = await base44.entities.Listing.filter({ created_by: user.email });
    const listingIds = userListings.map(l => l.id);

    // Get promotions
    let promotions;
    if (promotionId) {
      promotions = await base44.entities.ListingPromotion.filter({ id: promotionId });
    } else {
      promotions = await base44.entities.ListingPromotion.filter({
        listingId: { $in: listingIds }
      });
    }

    // Get activity data for promoted listings
    const analytics = [];

    for (const promo of promotions) {
      const listing = userListings.find(l => l.id === promo.listingId);
      if (!listing) continue;

      // Get activity during promotion period
      const startDate = new Date(promo.startDate || promo.created_date);
      const endDate = promo.endDate ? new Date(promo.endDate) : new Date();

      const activities = await base44.asServiceRole.entities.UserActivity.filter({
        listingId: promo.listingId,
        created_date: {
          $gte: startDate.toISOString(),
          $lte: endDate.toISOString()
        }
      });

      // Calculate metrics
      const views = activities.filter(a => a.activityType === 'view').length;
      const clicks = activities.filter(a => a.activityType === 'click').length;
      const favorites = activities.filter(a => a.activityType === 'favorite').length;
      const messages = activities.filter(a => a.activityType === 'message').length;

      // Check if listing was sold during promotion
      const wasSold = listing.status === 'sold' && 
                      new Date(listing.updated_date) >= startDate && 
                      new Date(listing.updated_date) <= endDate;

      // Calculate conversion rate (messages / views)
      const conversionRate = views > 0 ? (messages / views * 100).toFixed(2) : 0;

      analytics.push({
        promotionId: promo.id,
        listingId: promo.listingId,
        listingTitle: listing.title,
        type: promo.type,
        status: promo.status,
        startDate: promo.startDate || promo.created_date,
        endDate: promo.endDate,
        durationDays: promo.durationDays,
        amount: promo.amount,
        metrics: {
          views,
          clicks,
          favorites,
          messages,
          conversionRate: parseFloat(conversionRate),
          wasSold,
          avgTimeSpent: activities.length > 0 
            ? Math.round(activities.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / activities.length)
            : 0
        },
        roi: wasSold ? ((listing.price - promo.amount) / promo.amount * 100).toFixed(2) : null
      });
    }

    // Sort by startDate descending
    analytics.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    // Calculate summary stats
    const summary = {
      totalPromotions: analytics.length,
      activePromotions: analytics.filter(a => a.status === 'paid').length,
      totalSpent: analytics.reduce((sum, a) => sum + a.amount, 0),
      totalViews: analytics.reduce((sum, a) => sum + a.metrics.views, 0),
      totalMessages: analytics.reduce((sum, a) => sum + a.metrics.messages, 0),
      avgConversionRate: analytics.length > 0
        ? (analytics.reduce((sum, a) => sum + a.metrics.conversionRate, 0) / analytics.length).toFixed(2)
        : 0,
      soldListings: analytics.filter(a => a.metrics.wasSold).length
    };

    return Response.json({
      summary,
      promotions: analytics
    });

  } catch (error) {
    console.error('Error getting promotion analytics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});