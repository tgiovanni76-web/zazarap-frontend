import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: bundle } = await base44.functions.invoke('generateListingBundle', { include: ['recommendations'] });
    const r = bundle?.recommendations || { recommendations: [], userProfile: { topCategories: [], searchTerms: [] } };
    return Response.json({ recommendations: r.recommendations || [], userProfile: r.userProfile || { topCategories: [], searchTerms: [] } });
  } catch (error) {
    return Response.json({ error: error.message, recommendations: [] }, { status: 500 });
  }
});