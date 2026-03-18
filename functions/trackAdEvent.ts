import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Validate auth (may be null for anonymous views)
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { /* public view allowed */ }

    const { campaignId, eventType } = await req.json();
    if (!campaignId || !['impression', 'click'].includes(eventType)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Fetch current to avoid overwriting
    const [campaign] = await base44.asServiceRole.entities.BusinessAdCampaign.filter({ id: campaignId });
    if (!campaign) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    const patch = {};
    if (eventType === 'impression') {
      patch.impressionCount = (campaign.impressionCount || 0) + 1;
    } else if (eventType === 'click') {
      patch.clickCount = (campaign.clickCount || 0) + 1;
    }

    await base44.asServiceRole.entities.BusinessAdCampaign.update(campaignId, patch);

    // Optional lightweight analytics event
    try {
      await base44.analytics.track({
        eventName: `ad_${eventType}`,
        properties: { campaign_id: campaignId, user: user?.email || 'anon' }
      });
    } catch (_) {}

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});