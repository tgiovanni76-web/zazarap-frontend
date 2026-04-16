import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const { event, data } = payload || {};

    // Only act when we have a PremiumRequest pending
    if (!data || data.status !== 'pending') {
      return Response.json({ ok: true, skipped: true });
    }

    const { listingId, requesterEmail } = data;
    if (!listingId || !requesterEmail) {
      return Response.json({ ok: true, skipped: 'missing keys' });
    }

    // Find all pending requests for the same (listingId, requesterEmail)
    const all = await base44.asServiceRole.entities.PremiumRequest.filter({
      listingId,
      requesterEmail,
      status: 'pending'
    }, 'created_date', 100);

    if (!Array.isArray(all) || all.length <= 1) {
      return Response.json({ ok: true, kept: data.id || null });
    }

    // Keep the oldest, reject the others
    const [keep, ...dups] = all; // sorted asc by created_date
    const updates = [];
    for (const r of dups) {
      if (r.id === keep.id) continue;
      if (r.status === 'pending') {
        updates.push(base44.asServiceRole.entities.PremiumRequest.update(r.id, {
          status: 'rejected',
          adminNotes: 'Auto-rejected duplicate pending request'
        }));
      }
    }
    if (updates.length) await Promise.allSettled(updates);

    const keptId = keep?.id || null;
    return Response.json({ ok: true, keptId, rejected: updates.length });
  } catch (error) {
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});