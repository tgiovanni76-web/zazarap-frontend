import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { listingId, companyName, phone, message } = body || {};

    if (!listingId) {
      return Response.json({ error: 'Missing listingId' }, { status: 400 });
    }

    const email = user.email;
    const name = user.full_name || user.email;

    // Normalize and build idempotency key
    const idKey = `pr:${String(listingId).trim().toLowerCase()}:${String(email).trim().toLowerCase()}:pending`;

    // Check for existing pending request for this (listingId, requesterEmail)
    const existing = await base44.asServiceRole.entities.PremiumRequest.filter({
      listingId,
      requesterEmail: email,
      status: 'pending'
    }, '-created_date', 1);

    if (existing && existing.length > 0) {
      return Response.json({ status: 'exists', request: existing[0] }, { status: 200 });
    }

    // Create new request (best-effort idempotency via pre-check + idKey)
    const created = await base44.asServiceRole.entities.PremiumRequest.create({
      listingId,
      requesterEmail: email,
      requesterName: name,
      companyName: companyName || undefined,
      phone: phone || undefined,
      message: message || '',
      status: 'pending',
      idempotencyKey: idKey
    });

    return Response.json({ status: 'created', request: created }, { status: 200 });
  } catch (error) {
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
});