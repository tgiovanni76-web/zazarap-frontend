import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, category, condition, price, images = [], features = '' } = await req.json();

    const { data: bundle } = await base44.functions.invoke('generateListingBundle', {
      title, category, condition, price, images, features, include: ['description', 'imageAnalysis']
    });

    const d = bundle?.description || {};
    return Response.json({
      success: true,
      description: d.description || '',
      highlights: d.highlights || [],
      keywords: d.keywords || [],
      callToAction: d.callToAction || '',
      imageInsights: d.imageInsights || null,
      marketPosition: d.marketPosition || null
    });
  } catch (error) {
    return Response.json({ error: error.message, description: '' }, { status: 500 });
  }
});