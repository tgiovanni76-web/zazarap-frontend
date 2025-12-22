import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './rateLimiter.js';

function asISODate(date) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const rl = checkRateLimit(req, user, 'sellerAnalytics', { limit: 12, windowSeconds: 60 });
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded', resetAt: rl.resetAt }, { status: 429 });
    }

    // Get seller listings
    const listings = await base44.asServiceRole.entities.Listing.filter({ created_by: user.email }, '-created_date', 500);

    // Init aggregates
    const byDay = {};
    const last30Start = new Date();
    last30Start.setDate(last30Start.getDate() - 29);

    let totalViews = 0;
    let totalClicks = 0;
    let totalOffers = 0;

    const listingStats = [];
    const events = [];

    // Helper to add day bucket
    const addToDay = (dateStr, field) => {
      if (!dateStr) return;
      if (!byDay[dateStr]) byDay[dateStr] = { date: dateStr, views: 0, clicks: 0, offers: 0 };
      byDay[dateStr][field] += 1;
    };

    // For each listing, compute activities and offers
    for (const l of listings) {
      // Activities
      let views = 0, clicks = 0;
      const activities = await base44.asServiceRole.entities.UserActivity.filter({ listingId: l.id }, '-created_date', 5000);
      for (const a of activities) {
        if (a.activityType === 'view') {
          views += 1; totalViews += 1;
          const ds = asISODate(a.created_date);
          if (new Date(ds) >= last30Start) addToDay(ds, 'views');
        }
        if (a.activityType === 'click') {
          clicks += 1; totalClicks += 1;
          const ds = asISODate(a.created_date);
          if (new Date(ds) >= last30Start) addToDay(ds, 'clicks');
        }
      }

      // Chats and offers
      let offers = 0;
      const chats = await base44.asServiceRole.entities.Chat.filter({ listingId: l.id, sellerId: user.email }, '-updatedAt', 500);
      for (const c of chats) {
        // ongoing offers for calendar
        if (c.status === 'in_attesa') {
          events.push({ date: asISODate(c.updatedAt || c.created_date), type: 'offer', title: `Offerta in attesa • ${l.title}`, refId: c.id });
        }
        const msgs = await base44.asServiceRole.entities.ChatMessage.filter({ chatId: c.id, messageType: 'offer' }, '-created_date', 1000);
        offers += msgs.length;
        for (const m of msgs) {
          const ds = asISODate(m.created_date);
          if (new Date(ds) >= last30Start) addToDay(ds, 'offers');
        }
      }
      totalOffers += offers;

      // Expiration event
      if (l.expiresAt) {
        events.push({ date: asISODate(l.expiresAt), type: 'expiry', title: `Scadenza annuncio • ${l.title}`, refId: l.id });
      }

      listingStats.push({
        id: l.id,
        title: l.title,
        price: l.price,
        offerPrice: l.offerPrice,
        featured: !!l.featured,
        featuredUntil: l.featuredUntil || null,
        expiresAt: l.expiresAt || null,
        views, clicks, offers
      });
    }

    // Sales performance (payments)
    const payments = await base44.asServiceRole.entities.Payment.filter({ sellerId: user.email }, '-created_date', 2000);
    const validStatuses = new Set(['completed', 'released_to_seller']);
    const monthlyMap = new Map();
    let totalRevenue = 0; let totalOrders = 0;
    for (const p of payments) {
      if (!validStatuses.has(p.status)) continue;
      const d = new Date(p.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const prev = monthlyMap.get(key) || { month: key, revenue: 0, orders: 0 };
      prev.revenue += Number(p.amount || 0);
      prev.orders += 1;
      monthlyMap.set(key, prev);
      totalRevenue += Number(p.amount || 0);
      totalOrders += 1;
    }

    // Last 6 months sorted
    const monthly = Array.from(monthlyMap.values()).sort((a,b) => a.month.localeCompare(b.month)).slice(-6);

    // Build 30d timeseries
    const series30 = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(last30Start);
      d.setDate(last30Start.getDate() + i);
      const key = d.toISOString().slice(0,10);
      const bucket = byDay[key] || { date: key, views: 0, clicks: 0, offers: 0 };
      series30.push(bucket);
    }

    // Ongoing offers list (compact) from chats where seller is owner
    const pendingChats = await base44.asServiceRole.entities.Chat.filter({ sellerId: user.email, status: 'in_attesa' }, '-updatedAt', 100);
    const offersList = pendingChats.map(c => ({
      id: c.id,
      listingId: c.listingId,
      buyerId: c.buyerId,
      lastPrice: c.lastPrice || null,
      updatedAt: c.updatedAt || c.created_date,
      listingTitle: c.listingTitle || ''
    }));

    return Response.json({
      summary: { totalViews, totalClicks, totalOffers },
      listings: listingStats,
      engagement30d: series30,
      sales: { monthly, totals: { revenue: totalRevenue, orders: totalOrders } },
      events,
      offers: offersList
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});