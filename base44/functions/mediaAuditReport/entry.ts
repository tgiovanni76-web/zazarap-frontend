import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Service role for scheduled/reporting
    const as = base44.asServiceRole;

    // Pull all MediaAsset in pages (paginate)
    const pageSize = 200;
    let skip = 0;
    let totalSize = 0;
    let images = 0;
    let videos = 0;
    let fetched = 0;

    while (true) {
      const batch = await as.entities.MediaAsset.list('-created_date', pageSize, skip);
      if (!batch || batch.length === 0) break;
      fetched += batch.length;
      for (const a of batch) {
        totalSize += Number(a.size || 0);
        if (a.kind === 'video' || (a.contentType || '').startsWith('video/')) videos += 1; else images += 1;
      }
      if (batch.length < pageSize) break;
      skip += pageSize;
    }

    // Rough bandwidth estimate (lists use thumb/card; detail uses full)
    // Assume per-day: 8 thumb views + 3 card views + 0.5 full views per image
    const avgThumbKB = 120; // conservative webp
    const avgCardKB = 420;
    const avgFullKB = 900;
    const dailyEgressBytes = images * ((8*avgThumbKB + 3*avgCardKB + 0.5*avgFullKB) * 1024);

    const report = {
      generatedAt: new Date().toISOString(),
      totals: {
        assets: images + videos,
        images,
        videos,
        storageBytes: totalSize,
        storageGB: +(totalSize / (1024**3)).toFixed(2),
        estDailyEgressGB: + (dailyEgressBytes / (1024**3)).toFixed(2),
      }
    };

    // Persist to SystemLog for auditing
    try {
      await as.entities.SystemLog.create({
        level: 'info',
        message: 'media_audit_report',
        details: JSON.stringify(report),
        source: 'backend'
      });
    } catch (_) {}

    // Try emailing first admin (optional)
    try {
      const users = await as.entities.User.list();
      const admin = users.find(u => (u.role || '').toLowerCase() === 'admin');
      if (admin?.email) {
        await as.integrations.Core.SendEmail({
          to: admin.email,
          subject: 'Daily Media Report',
          body: `Assets: ${report.totals.assets}\nImages: ${images}\nVideos: ${videos}\nStorage: ${report.totals.storageGB} GB\nEst. Daily Egress: ${report.totals.estDailyEgressGB} GB\nGenerated: ${report.generatedAt}`
        });
      }
    } catch (_) {}

    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});