import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { images = [] } = await req.json();
    if (!images || images.length === 0) return Response.json({ error: 'Mindestens ein Bild erforderlich', success: false }, { status: 400 });

    const { data: bundle } = await base44.functions.invoke('generateListingBundle', { images, include: ['imageAnalysis'] });
    const img = bundle?.image || {};
    return Response.json({
      success: true,
      qualityScore: img.qualityScore || 0,
      overallQuality: img.overallQuality || 'poor',
      imageAnalysis: img.imageAnalysis || [],
      strengths: img.strengths || [],
      improvements: img.improvements || [],
      tips: img.tips || '',
      imageCount: img.imageCount || images.length
    });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});