import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const as = base44.asServiceRole;

    const now = new Date();
    const days = (n) => new Date(now.getTime() - n*24*60*60*1000).toISOString();
    const olderThan30 = days(30);
    const olderThan2 = days(2);

    // Delete originals older than 30d (we only track private originals in MediaAsset)
    const oldAssets = await as.entities.MediaAsset.filter({ created_date: { $lt: olderThan30 } }, undefined, 500);
    let deletedOld = 0;
    for (const a of (oldAssets || [])) {
      try {
        await as.entities.MediaAsset.delete(a.id);
        deletedOld += 1;
      } catch (_) {}
    }

    // Delete orphan assets (no correlationId) older than 2d
    const orphanAssets = await as.entities.MediaAsset.filter({ $and: [ { $or: [ { correlationId: null }, { correlationId: '' }, { correlationId: undefined } ] }, { created_date: { $lt: olderThan2 } } ] }, undefined, 500);
    let deletedOrphans = 0;
    for (const a of (orphanAssets || [])) {
      try { await as.entities.MediaAsset.delete(a.id); deletedOrphans += 1; } catch (_) {}
    }

    const summary = { deletedOld, deletedOrphans, at: now.toISOString() };
    try {
      await as.entities.SystemLog.create({ level: 'info', message: 'cleanup_media', details: JSON.stringify(summary), source: 'backend' });
    } catch (_) {}

    return Response.json({ status: 'ok', ...summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});