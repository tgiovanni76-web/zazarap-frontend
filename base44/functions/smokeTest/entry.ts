import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const isAuth = await base44.auth.isAuthenticated();
    const tests = [];

    tests.push({ name: 'auth.isAuthenticated', ok: isAuth === true || isAuth === false });

    // Entities reachable
    let categoriesOk = false;
    try {
      const cats = await base44.entities.Category.list();
      categoriesOk = Array.isArray(cats);
    } catch {}
    tests.push({ name: 'entities.Category.list', ok: categoriesOk });

    // Functions reachable (perfBeacon)
    let perfOk = false;
    try {
      const res = await base44.functions.invoke('perfBeacon', { metrics: { path: '/__selftest__' } });
      perfOk = !!res?.data?.ok;
    } catch {}
    tests.push({ name: 'functions.perfBeacon', ok: perfOk });

    const summary = {
      passed: tests.filter(t => t.ok).length,
      total: tests.length
    };

    return Response.json({ summary, tests });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});