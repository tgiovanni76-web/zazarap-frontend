import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function safeText(t, max = 140) {
  if (!t) return '';
  const s = String(t).trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

function buildTitle(status, listingTitle) {
  const base = listingTitle ? `Offerta • ${listingTitle}` : 'Offerta aggiornata';
  switch (status) {
    case 'accepted_reserved': return `${base}: accettata`;
    case 'rejected': return `${base}: rifiutata`;
    case 'countered': return `${base}: controfferta`;
    case 'withdrawn': return `${base}: ritirata`;
    default: return listingTitle ? `Nuova offerta • ${listingTitle}` : 'Nuova offerta';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data, changed_fields, payload_too_large } = body || {};
    const evtType = event?.type;
    if (!event || event.entity_name !== 'Offer') {
      return Response.json({ ok: true, skipped: true, reason: 'not Offer event' });
    }

    // Ensure we have the offer data
    let offer = data;
    if (!offer || payload_too_large) {
      if (!event?.entity_id) return Response.json({ ok: true, skipped: true, reason: 'missing entity_id' });
      try {
        const arr = await base44.asServiceRole.entities.Offer.filter({ id: event.entity_id });
        offer = Array.isArray(arr) ? arr[0] : null;
      } catch (_) {
        offer = null;
      }
    }
    if (!offer) return Response.json({ ok: true, skipped: true, reason: 'offer not found' });

    if (!offer?.chatId || !offer?.senderId || (evtType === 'create' && !offer?.receiverId)) {
      // Try to compute missing ends using Chat
      if (offer?.chatId) {
        let chat = null;
        try {
          const arr = await base44.asServiceRole.entities.Chat.filter({ id: offer.chatId });
          chat = Array.isArray(arr) ? arr[0] : null;
        } catch (_) {
          chat = null;
        }
        if (chat) {
          const buyer = chat.buyerId;
          const seller = chat.sellerId;
          if (!offer.receiverId) {
            const computed = offer.senderId === buyer ? seller : buyer;
            // mark as automated to prevent noisy update-triggered notifications
            await base44.asServiceRole.entities.Offer.update(offer.id, { receiverId: computed, _backfill: true });
            offer.receiverId = computed;
          }
        }
      } else {
        return Response.json({ ok: true, skipped: true, reason: 'missing chatId/sender/receiver' });
      }
    }

    // Fetch chat for listing title
    let chat = null;
    try {
      const arr = await base44.asServiceRole.entities.Chat.filter({ id: offer.chatId });
      chat = Array.isArray(arr) ? arr[0] : null;
    } catch (_) {
      chat = null;
    }
    // Trigger only on real changes
    if (evtType === 'update') {
      const fields = Array.isArray(changed_fields) ? changed_fields : [];
      const interesting = ['status', 'amount', 'message'];
      const hasInteresting = fields.some(f => interesting.includes(f));
      const onlyTechnical = fields.length > 0 && fields.every(f => ['receiverId', 'previousAmount', 'updated_date', 'created_date'].includes(f));
      if (!hasInteresting || onlyTechnical) {
        return Response.json({ ok: true, skipped: true, reason: 'no_material_change' });
      }
    }

    const title = buildTitle(offer.status, chat?.listingTitle);

    // Decide who to notify (create -> receiver)
    const targetUser = offer.receiverId;

    // Rate limit per user (max 10/60s)
    try {
      const recentForUser = await base44.asServiceRole.entities.Notification.filter({ userId: targetUser }, '-created_date', 25);
      const nowMs = Date.now();
      const cnt60 = (recentForUser || []).filter(n => n?.created_date && (nowMs - new Date(n.created_date).getTime()) < 60000).length;
      if (cnt60 >= 10) {
        return Response.json({ ok: true, skipped: true, reason: 'user_rate_limited_60s' });
      }
    } catch (_) {}

    // Idempotency key for offer events
    const idempotencyKey = `offer:${offer.id}:${evtType}:${offer.status || 'na'}:${targetUser}`;
    try {
      const exist = await base44.asServiceRole.entities.Notification.filter({ idempotencyKey }, '-created_date', 1);
      if (Array.isArray(exist) && exist.length > 0) {
        return Response.json({ ok: true, skipped: true, reason: 'idempotent_duplicate' });
      }
    } catch (_) {}

    const message = offer.message || (offer.amount ? `Importo: € ${offer.amount}` : '');

    await base44.asServiceRole.entities.Notification.create({
      userId: targetUser,
      type: 'offer',
      title,
      message: safeText(message),
      linkUrl: `/messages?chatId=${offer.chatId}`,
      relatedId: offer.chatId,
      idempotencyKey,
      source: 'onOfferEvent'
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});