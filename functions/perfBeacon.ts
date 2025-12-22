import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { metrics } = await req.json();
    if (!metrics || typeof metrics !== 'object') {
      return Response.json({ ok: false, error: 'invalid payload' }, { status: 400 });
    }

    await base44.asServiceRole.entities.PerformanceEvent.create({
      path: String(metrics.path || ''),
      userId: user?.email || 'anon',
      userAgent: String(metrics.userAgent || ''),
      viewport: JSON.stringify(metrics.viewport || {}),
      connection: JSON.stringify(metrics.connection || {}),
      navigation: JSON.stringify(metrics.navigation || {}),
      fcp: typeof metrics.fcp === 'number' ? metrics.fcp : null,
      lcp: typeof metrics.lcp === 'number' ? metrics.lcp : null,
      cls: typeof metrics.cls === 'number' ? metrics.cls : null,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});