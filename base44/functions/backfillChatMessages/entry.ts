/* global Deno */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Admin-only backfill to fix historical ChatMessage.senderId/receiverId
 * so they always belong to the chat buyer/seller (never admin).
 *
 * Payload (JSON):
 * {
 *   chatId?: string,       // optional: restrict to a single chat
 *   run?: 'dry'|'apply',   // default 'dry' (no writes)
 *   limitChats?: number    // optional safety cap (default 200)
 * }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user?.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    const { chatId, run = 'dry', limitChats = 200 } = await (async () => {
      try { return await req.json(); } catch { return {}; }
    })();

    const APPLY = run === 'apply';

    // Helper to fetch chats
    async function listAllChats() {
      if (chatId) {
        const byId = await base44.asServiceRole.entities.Chat.filter({ id: chatId });
        return byId || [];
      }
      const all = await base44.asServiceRole.entities.Chat.list('-updated_date', limitChats);
      return all || [];
    }

    async function listChatMessages(cId) {
      return await base44.asServiceRole.entities.ChatMessage.filter({ chatId: cId }, 'created_date');
    }

    async function listChatOffers(cId) {
      return await base44.asServiceRole.entities.Offer.filter({ chatId: cId }, 'created_date');
    }

    function pickFallbackSender(chat, msg) {
      if (msg?.created_by === chat.buyerId) return { sender: chat.buyerId, receiver: chat.sellerId };
      if (msg?.created_by === chat.sellerId) return { sender: chat.sellerId, receiver: chat.buyerId };
      if ([chat.buyerId, chat.sellerId].includes(msg?.senderId)) {
        const sender = msg.senderId;
        const receiver = sender === chat.buyerId ? chat.sellerId : chat.buyerId;
        return { sender, receiver };
      }
      return { sender: chat.sellerId, receiver: chat.buyerId };
    }

    function whoForWelcome(chat) {
      return { sender: chat.sellerId, receiver: chat.buyerId };
    }

    const re = {
      welcome: /chat\s+(gestartet|started|avviat|iniziat)|benvenut|willkommen|welcome/i,
      accepted: /(angenommen|accepted|accettata|reserviert|reserved)/i,
      rejected: /(abgelehnt|rejected|rifiutata)/i,
      unreserve: /(reservierung).*aufgehoben|unreserve|reservation.*removed/i,
      sold: /(verkauft|venduto|sold)/i,
      offerId: /\[OFFER_ID:([^\]]+)\]/
    };

    const chats = await listAllChats();
    const summary = {
      mode: APPLY ? 'apply' : 'dry',
      chatsScanned: 0,
      messagesScanned: 0,
      messagesNeedingFix: 0,
      messagesFixed: 0,
      perChat: {}
    };

    for (const chat of chats) {
      if (!chat?.id || !chat?.buyerId || !chat?.sellerId) continue;
      const per = { scanned: 0, needingFix: 0, fixed: 0 };
      const msgs = await listChatMessages(chat.id);
      const offers = await listChatOffers(chat.id);

      for (const msg of (msgs || [])) {
        per.scanned++; summary.messagesScanned++;
        const isSenderValid = [chat.buyerId, chat.sellerId].includes(msg?.senderId);
        const isReceiverValid = [chat.buyerId, chat.sellerId].includes(msg?.receiverId);
        if (isSenderValid && isReceiverValid) continue;

        per.needingFix++; summary.messagesNeedingFix++;

        let newSender = msg.senderId;
        let newReceiver = msg.receiverId;

        try {
          if (msg.messageType === 'offer') {
            let off = null;
            const m = typeof msg.text === 'string' ? msg.text.match(re.offerId) : null;
            if (m && m[1]) {
              const list = await base44.asServiceRole.entities.Offer.filter({ id: m[1] });
              off = Array.isArray(list) ? list[0] : null;
            }
            if (!off && msg.price) {
              off = (offers || []).find(o => Number(o.amount) === Number(msg.price));
            }
            if (off?.senderId && off?.receiverId) {
              newSender = off.senderId;
              newReceiver = off.receiverId;
            } else {
              const fb = pickFallbackSender(chat, msg);
              newSender = fb.sender; newReceiver = fb.receiver;
            }
          } else if (msg.messageType === 'system') {
            const txt = msg.text || '';
            if (re.welcome.test(txt)) {
              const fb = whoForWelcome(chat);
              newSender = fb.sender; newReceiver = fb.receiver;
            } else if (re.accepted.test(txt) || re.rejected.test(txt) || re.unreserve.test(txt) || re.sold.test(txt)) {
              newSender = chat.sellerId; newReceiver = chat.buyerId;
            } else {
              const fb = pickFallbackSender(chat, msg);
              newSender = fb.sender; newReceiver = fb.receiver;
            }
          } else {
            const fb = pickFallbackSender(chat, msg);
            newSender = fb.sender; newReceiver = fb.receiver;
          }
        } catch {
          const fb = pickFallbackSender(chat, msg);
          newSender = fb.sender; newReceiver = fb.receiver;
        }

        if (!APPLY) continue;

        await base44.asServiceRole.entities.ChatMessage.update(msg.id, {
          senderId: newSender,
          receiverId: newReceiver
        });
        per.fixed++; summary.messagesFixed++;
      }

      summary.chatsScanned++;
      if (per.needingFix > 0) summary.perChat[chat.id] = {
        needingFix: per.needingFix,
        fixed: per.fixed,
        title: chat.listingTitle || '',
        buyerId: chat.buyerId,
        sellerId: chat.sellerId
      };
    }

    return Response.json(summary);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});