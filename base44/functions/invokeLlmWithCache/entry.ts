import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

async function sha256Hex(input) {
  const enc = new TextEncoder();
  const bytes = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      response_json_schema = null,
      add_context_from_internet = false,
      model = 'automatic',
      file_urls = null,
      ttl_seconds = 300,
      cache_key_extra = null
    } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const cacheKeyObj = { t: 'llm', prompt, model, add_context_from_internet, schema: !!response_json_schema, file_urls: Array.isArray(file_urls) ? file_urls : !!file_urls, extra: cache_key_extra };
    const cacheKey = await sha256Hex(JSON.stringify(cacheKeyObj));

    // Check cache
    const nowIso = new Date().toISOString();
    const matches = await base44.asServiceRole.entities.IntegrationCache.filter({ key: cacheKey });
    const hit = (matches || []).find(r => r.expiresAt && r.expiresAt > nowIso);
    if (hit) {
      const cached = (() => { try { return JSON.parse(hit.data); } catch { return hit.data; } })();
      return Response.json({ cached: true, key: cacheKey, data: cached });
    }

    // Invoke LLM (Core integration)
    const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet,
      response_json_schema,
      file_urls,
      model
    });

    const payload = res;
    const expiresAt = new Date(Date.now() + (Math.max(30, ttl_seconds) * 1000)).toISOString();

    if (matches && matches[0]) {
      await base44.asServiceRole.entities.IntegrationCache.update(matches[0].id, { data: JSON.stringify(payload), expiresAt });
    } else {
      await base44.asServiceRole.entities.IntegrationCache.create({ key: cacheKey, data: JSON.stringify(payload), expiresAt });
    }

    return Response.json({ cached: false, key: cacheKey, data: payload });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});