import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function fmt(n) { return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n || 0); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Admin-only
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { days = 7 } = await req.json().catch(() => ({}));
    const since = Date.now() - days * 24 * 60 * 60 * 1000;

    const guardCfgs = await base44.asServiceRole.entities.IntegrationGuardConfig.list();
    const guard = (guardCfgs && guardCfgs[0]) || {};
    const recipients = Array.isArray(guard.alertEmails) && guard.alertEmails.length ? guard.alertEmails : [];

    const usage = await base44.asServiceRole.entities.IntegrationUsage.list();
    const audit = await base44.asServiceRole.entities.IntegrationAuditLog.list();

    const recentUsage = (usage || []).filter(u => {
      const d = Date.parse(u.date || u.created_date);
      return Number.isFinite(d) && d >= since;
    });
    const recentAudit = (audit || []).filter(a => {
      const d = Date.parse(a.timestamp || a.created_date);
      return Number.isFinite(d) && d >= since;
    });

    const byFunction = new Map();
    for (const u of recentUsage) {
      const k = `${u.functionName || 'unknown'}|${u.integration || 'n/a'}`;
      const prev = byFunction.get(k) || { count: 0, cost: 0 };
      byFunction.set(k, { count: prev.count + (u.count || 0), cost: prev.cost + (u.costUnits || 0) });
    }

    const topLines = Array.from(byFunction.entries())
      .sort((a,b) => b[1].cost - a[1].cost)
      .slice(0, 15)
      .map(([k, v]) => {
        const [fn, integ] = k.split('|');
        return `- ${fn} • ${integ} → calls: ${fmt(v.count)} | cost: ${fmt(v.cost)}`;
      })
      .join('\n');

    const totalCalls = recentUsage.reduce((s,u)=> s + (u.count||0), 0);
    const totalCost = recentUsage.reduce((s,u)=> s + (u.costUnits||0), 0);

    const subject = `Weekly integration report — last ${days}d`;
    const body = `Hello Admins,\n\nHere is the usage summary for the last ${days} days:\n\nTotal calls: ${fmt(totalCalls)}\nTotal cost units: ${fmt(totalCost)}\n\nTop functions by cost:\n${topLines || '- (no data)'}\n\nEntries in audit log considered: ${fmt(recentAudit.length)}\n\n— Base44 Integration Guard`;

    if (recipients.length) {
      for (const to of recipients) {
        await base44.asServiceRole.integrations.Core.SendEmail({ to, subject, body });
      }
    }

    return Response.json({ sent: recipients.length, subject, preview: body.slice(0, 500) });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});