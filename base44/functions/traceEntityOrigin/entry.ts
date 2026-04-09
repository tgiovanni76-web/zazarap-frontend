import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function toTs(d) { try { return new Date(d).getTime(); } catch { return 0; } }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { entity_name, entity_id, window_seconds = 180 } = await req.json();
    if (!entity_name || !entity_id) {
      return Response.json({ error: 'Missing entity_name or entity_id' }, { status: 400 });
    }

    // 1) Fetch the target entity
    let entity = null;
    try {
      const arr = await base44.asServiceRole.entities[entity_name]?.filter({ id: entity_id });
      entity = Array.isArray(arr) ? arr[0] : null;
    } catch (e) {
      // ignore
    }
    if (!entity) {
      return Response.json({ error: 'Entity not found', entity_name, entity_id }, { status: 404 });
    }

    const createdTs = toTs(entity.created_date);
    const startTs = createdTs - window_seconds * 1000;
    const endTs = createdTs + window_seconds * 1000;

    // Helper to check time window
    const inWindow = (d) => {
      const t = toTs(d);
      return t >= startTs && t <= endTs;
    };

    // 2) Pull recent logs and performance events, then correlate
    let sysLogs = [];
    let perfEvents = [];
    try {
      sysLogs = await base44.asServiceRole.entities.SystemLog.list('-created_date', 400);
    } catch (_) {}
    try {
      perfEvents = await base44.asServiceRole.entities.PerformanceEvent.list('-created_date', 400);
    } catch (_) {}

    const entityIdStr = String(entity_id);
    const entityNameStr = String(entity_name);

    // Narrow down by time window and occurrence of entity id/name in serialized payload
    const matchLog = (rec) => {
      try {
        const blob = JSON.stringify(rec || {});
        return inWindow(rec?.created_date) && (blob.includes(entityIdStr) || blob.includes(entityNameStr));
      } catch {
        return false;
      }
    };

    const relatedSys = (sysLogs || []).filter(matchLog).slice(0, 50);
    const relatedPerf = (perfEvents || []).filter(matchLog).slice(0, 50);

    // Try to extract probable function names / run ids
    const candidates = [];
    for (const p of relatedPerf) {
      const blob = JSON.stringify(p || {});
      // naive extraction hints
      const fn = p?.metadata?.function_name || p?.function_name || (/function_name\":\"([^\"]+)/.exec(blob)?.[1]);
      const runId = p?.metadata?.runId || p?.runId || p?.requestId || (/requestId\":\"([^\"]+)/.exec(blob)?.[1]);
      const evt = p?.eventName || p?.name || p?.type;
      candidates.push({ source: 'PerformanceEvent', when: p?.created_date, function_name: fn || null, run_id: runId || null, event: evt || null });
    }
    for (const s of relatedSys) {
      const blob = JSON.stringify(s || {});
      const fn = s?.context?.function_name || (/function_name\":\"([^\"]+)/.exec(blob)?.[1]);
      const runId = s?.context?.requestId || s?.requestId || (/requestId\":\"([^\"]+)/.exec(blob)?.[1]);
      const lvl = s?.level || s?.severity;
      candidates.push({ source: 'SystemLog', when: s?.created_date, function_name: fn || null, run_id: runId || null, level: lvl || null });
    }

    // Heuristic best guess: prefer explicit api.function.call events or records with function_name present
    const best = candidates
      .filter(c => c.function_name || (c.event && /api\.function\.call/i.test(c.event)))
      .sort((a, b) => Math.abs(toTs(a.when) - createdTs) - Math.abs(toTs(b.when) - createdTs))[0] || null;

    // Return summary
    return Response.json({
      target: { entity_name, entity_id, created_date: entity.created_date, created_by: entity.created_by, data: entity },
      window_seconds,
      related: { system: relatedSys, perf: relatedPerf },
      best_guess: best,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});