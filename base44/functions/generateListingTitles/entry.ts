import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, description, price, keywords } = await req.json();
    if (!category) return Response.json({ error: 'Kategorie erforderlich', success: false }, { status: 400 });

    const { data: bundle } = await base44.functions.invoke('generateListingBundle', {
      category, description, price, keywords, include: ['titles']
    });

    const t = bundle?.titles || { success: true, titles: [], count: 0 };
    return Response.json({ success: true, titles: t.titles || [], count: t.count || (t.titles?.length || 0) });
  } catch (error) {
    return Response.json({ error: error.message, success: false }, { status: 500 });
  }
});