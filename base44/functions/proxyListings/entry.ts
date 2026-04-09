import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, id, filter = {}, sort = '-created_date', limit = 50, data = {} } = await req.json().catch(() => ({}));

    if (!action) {
      return Response.json({ error: 'Missing action' }, { status: 400 });
    }

    // Identify user (do not require auth for read operations)
    const user = await base44.auth.me().catch(() => null);

    // Write ops require auth
    const writeOps = new Set(['create', 'update', 'delete']);
    if (writeOps.has(action) && !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let result = null;

    switch (action) {
      case 'list': {
        result = await base44.entities.Listing.list(sort, limit);
        break;
      }
      case 'filter': {
        result = await base44.entities.Listing.filter(filter, sort, limit);
        break;
      }
      case 'get': {
        if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
        const rows = await base44.entities.Listing.filter({ id });
        result = rows?.[0] ?? null;
        break;
      }
      case 'create': {
        result = await base44.entities.Listing.create(data);
        break;
      }
      case 'update': {
        if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
        result = await base44.entities.Listing.update(id, data);
        break;
      }
      case 'delete': {
        if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
        result = await base44.entities.Listing.delete(id);
        break;
      }
      default:
        return Response.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }

    return Response.json({ ok: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});