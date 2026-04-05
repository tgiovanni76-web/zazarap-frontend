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
            await base44.asServiceRole.entities.Offer.update(offer.id, { receiverId: computed });
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
    const title = buildTitle(offer.status, chat?.listingTitle);

    // Decide who to notify
    // On create -> receiverId; on updates where status changes -> other side if needed
    const targetUser = offer.receiverId;

    const message = offer.message || (offer.amount ? `Importo: € ${offer.amount}` : '');

    await base44.asServiceRole.entities.Notification.create({
      userId: targetUser,
      type: 'offer',
      title,
      message: safeText(message),
      linkUrl: `/messages?chatId=${offer.chatId}`,
      relatedId: offer.chatId,
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});