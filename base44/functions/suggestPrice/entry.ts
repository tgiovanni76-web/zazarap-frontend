import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, category, condition, images = [] } = await req.json();

    const { data: bundle } = await base44.functions.invoke('generateListingBundle', {
      title, description, category, condition, images, include: ['pricing', 'imageAnalysis']
    });

    const p = bundle?.pricing || {};
    return Response.json({
      success: true,
      prices: p.prices || { competitive: 0, optimal: 0, premium: 0 },
      reasoning: p.reasoning || '',
      marketAnalysis: p.marketAnalysis || { avgPrice: 0, medianPrice: 0, priceRange: { min: 0, max: 0 }, activeListings: 0, recentSales: 0, conversionRate: 0, trend: 'stable', demand: 'medium' },
      recommendations: p.recommendations || [],
      imageQualityScore: p.imageQualityScore || 0
    });
  } catch (error) {
    return Response.json({ error: error.message, prices: { competitive: 0, optimal: 0, premium: 0 } }, { status: 500 });
  }
});