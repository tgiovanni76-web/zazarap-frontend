import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function safeText(t, max = 140) {
  if (!t) return '';
  const s = String(t).trim();
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { event, data, old_data, changed_fields, payload_too_large } = body || {};
    const evtType = event?.type;
    if (!event || event.entity_name !== 'ChatMessage') {
      return Response.json({ ok: true, skipped: true, reason: 'not ChatMessage event' });
    }

    // Ensure we have the message data
    let message = data;
    if (!message || payload_too_large) {
      if (!event?.entity_id) return Response.json({ ok: true, skipped: true, reason: 'missing entity_id' });
      try {
        const arr = await base44.asServiceRole.entities.ChatMessage.filter({ id: event.entity_id });
        message = Array.isArray(arr) ? arr[0] : null;
      } catch (_) {
        message = null;
      }
    }
    if (!message) return Response.json({ ok: true, skipped: true, reason: 'message not found' });

    if (!message?.chatId || !message?.senderId) {
      return Response.json({ ok: true, skipped: true, reason: 'missing chatId or senderId' });
    }

    // Fetch chat to determine participants
    let chat = null;
    try {
      const arr = await base44.asServiceRole.entities.Chat.filter({ id: message.chatId });
      chat = Array.isArray(arr) ? arr[0] : null;
    } catch (_) {
      chat = null;
    }
    if (!chat) {
      return Response.json({ ok: true, skipped: true, reason: 'chat not found' });
    }

    const buyer = chat.buyerId;
    const seller = chat.sellerId;

    // Determine receiver
    const computedReceiver = message.senderId === buyer ? seller : buyer;

    // Backfill receiverId if missing or incorrect
    if (evtType === 'create' && (!message.receiverId || (computedReceiver && message.receiverId !== computedReceiver))) {
      await base44.asServiceRole.entities.ChatMessage.update(message.id, { receiverId: computedReceiver });
    }

    // Create notification for the receiver
    if (computedReceiver) {
      const title = chat.listingTitle ? `Nuovo messaggio su "${chat.listingTitle}"` : 'Nuovo messaggio';
      const note = {
        userId: computedReceiver,
        type: 'message',
        title,
        message: safeText(message.text || message.message || ''),
        linkUrl: `/messages?chatId=${message.chatId}`,
        relatedId: message.chatId,
      };
      await base44.asServiceRole.entities.Notification.create(note);
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});