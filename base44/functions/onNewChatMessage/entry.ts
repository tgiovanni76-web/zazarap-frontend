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

    // Anti-loop guards
    const fromUser = message.from_user;
    if (fromUser !== true) {
      return Response.json({ ok: true, skipped: true, reason: 'non-user message' });
    }
    const src = (message.source || '').toLowerCase();
    if (src === 'ai' || src === 'system') {
      return Response.json({ ok: true, skipped: true, reason: 'ai/system source' });
    }
    if (message.is_automated) {
      return Response.json({ ok: true, skipped: true, reason: 'automated message' });
    }
    if (message.processed_by_notify) {
      return Response.json({ ok: true, skipped: true, reason: 'already processed' });
    }

    // Soft rate limit per chat: skip if a notify ran in last 20s for same chat
    try {
      const recent = await base44.asServiceRole.entities.Notification.filter({ relatedId: message.chatId }, '-created_date', 1);
      const last = Array.isArray(recent) ? recent[0] : null;
      if (last?.created_date) {
        const dt = Date.now() - new Date(last.created_date).getTime();
        if (dt < 20000) {
          return Response.json({ ok: true, skipped: true, reason: 'rate_limited_20s' });
        }
      }
    } catch (_) {}

    // Burst fail-safe: block if too many notifications in last 2 minutes
    try {
      const recentMany = await base44.asServiceRole.entities.Notification.filter({ relatedId: message.chatId }, '-created_date', 20);
      const nowMs = Date.now();
      const burst = (recentMany || []).filter(n => n?.created_date && (nowMs - new Date(n.created_date).getTime()) < 120000).length;
      if (burst >= 6) {
        return Response.json({ ok: true, skipped: true, reason: 'burst_block' });
      }
    } catch (_) {}

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
      // Mark message processed to avoid re-processing
      try { await base44.asServiceRole.entities.ChatMessage.update(message.id, { processed_by_notify: true }); } catch (_) {}
      }

      return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
});