import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (me.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const [chats, messages] = await Promise.all([
      base44.asServiceRole.entities.Chat.list(),
      base44.asServiceRole.entities.ChatMessage.list(),
    ]);

    const chatsById = new Map(chats.map((c) => [c.id, c]));

    const hasEmailLike = (v) => typeof v === 'string' && v.includes('@');

    // Basic legacy/email counts
    const chatsWithEmailIds = chats.reduce((n, c) => n + (hasEmailLike(c.buyerId) || hasEmailLike(c.sellerId) ? 1 : 0), 0);
    let messagesWithEmailIds = 0;
    let messagesMissingBuyerSeller = 0;

    // participants/orphans/duplicates
    let participantsMismatch = 0;
    let orphanMessage = 0;

    const dupKey = (m) => `${m.chatId}|${m.senderId}|${m.created_date || ''}|${(m.text || '').slice(0, 200)}`;
    const seen = new Map();
    let duplicates = 0;

    for (const m of messages) {
      if (hasEmailLike(m.senderId) || hasEmailLike(m.receiverId)) messagesWithEmailIds++;
      if (!m.buyerId || !m.sellerId) messagesMissingBuyerSeller++;

      const chat = chatsById.get(m.chatId);
      if (!chat) {
        orphanMessage++;
      } else {
        if (m.buyerId !== chat.buyerId || m.sellerId !== chat.sellerId) participantsMismatch++;
      }

      const k = dupKey(m);
      const v = seen.get(k) || 0;
      if (v === 1) duplicates++;
      seen.set(k, v + 1);
    }

    // unread mismatches
    let unreadMismatches = 0;
    const msgsByChat = new Map();
    for (const m of messages) {
      if (!msgsByChat.has(m.chatId)) msgsByChat.set(m.chatId, []);
      msgsByChat.get(m.chatId).push(m);
    }
    for (const c of chats) {
      const arr = msgsByChat.get(c.id) || [];
      const buyerUnread = arr.filter((m) => m.read === false && m.receiverId === c.buyerId).length;
      const sellerUnread = arr.filter((m) => m.read === false && m.receiverId === c.sellerId).length;
      if ((c.unreadBuyer ?? 0) !== buyerUnread || (c.unreadSeller ?? 0) !== sellerUnread) unreadMismatches++;
    }

    return Response.json({
      generatedAt: new Date().toISOString(),
      totals: { chats: chats.length, messages: messages.length },
      counters: {
        chatsWithEmailIds,
        messagesWithEmailIds,
        messagesMissingBuyerSeller,
        participantsMismatch,
        orphanMessage,
        unreadMismatches,
        duplicates,
      },
      batchLimits: { backfillChatsChunked: 50, backfillChatMessagesChunked: 30 },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});