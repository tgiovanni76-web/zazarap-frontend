import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    let body = {};
    try { body = await req.json(); } catch (_) { body = {}; }

    const url = new URL(req.url);
    const path = body.path || url.searchParams.get('path') || '';
    const ua = req.headers.get('user-agent') || '';

    // Try to identify user, but allow unauthenticated logging
    const user = await base44.auth.me().catch(() => null);

    const payload = {
      level: body.level || 'info',
      message: body.message || 'log',
      details: typeof body.details === 'string' ? body.details : JSON.stringify(body.details || {}),
      context: typeof body.context === 'string' ? body.context : JSON.stringify(body.context || {}),
      path,
      userAgent: ua,
      userId: user?.email || body.userId || 'anonymous',
      source: body.source || 'frontend'
    };

    await base44.asServiceRole.entities.SystemLog.create(payload);

    return Response.json({ status: 'ok' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});