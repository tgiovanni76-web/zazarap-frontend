import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { days = 14, keywords = ['/api/apps/', 'x-api-key', 'entities/Listing'] } = await req.json().catch(() => ({}));
    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const take = 500; // cap per batch
    const [sysLogs, auditLogs] = await Promise.all([
      base44.asServiceRole.entities.SystemLog.list('-created_date', take).catch(() => []),
      base44.asServiceRole.entities.IntegrationAuditLog.list('-created_date', take).catch(() => []),
    ]);

    const matchText = (txt = '') => keywords.some(k => (txt || '').toLowerCase().includes(String(k).toLowerCase()));

    const sysFindings = (sysLogs || []).filter(l => {
      const t = new Date(l.created_date || l.timestamp || 0);
      const msg = `${l.message || ''} ${l.details || ''} ${l.context || ''}`;
      return t >= since && matchText(msg);
    });

    const auditFindings = (auditLogs || []).filter(l => {
      const t = new Date(l.created_date || l.timestamp || 0);
      const msg = `${l.functionName || ''} ${l.metadata || ''} ${l.integration || ''}`;
      return t >= since && matchText(msg);
    });

    const summary = {
      scanned: { system: sysLogs?.length || 0, audit: auditLogs?.length || 0 },
      since: since.toISOString(),
      keywords,
      counts: { system: sysFindings.length, audit: auditFindings.length },
    };

    return Response.json({ ok: true, summary, systemMatches: sysFindings, auditMatches: auditFindings });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});