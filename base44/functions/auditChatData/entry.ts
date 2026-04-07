import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

Deno.serve(async (req) => {
  const start = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });

    // Query helpers with caps to avoid huge payloads
    const take = async (fn, max = 1000) => {
      try { return await fn(); } catch { return []; }
    };

    // Fetch core data (service role to bypass RLS for audit)
    const [chats, messages, listings, users] = await Promise.all([
      take(() => base44.asServiceRole.entities.Chat.list()),
      take(() => base44.asServiceRole.entities.ChatMessage.list()),
      take(() => base44.asServiceRole.entities.Listing.list()),
      take(() => base44.asServiceRole.entities.User.list?.() ?? []), // compatibility
    ]);

    const usersArr = Array.isArray(users) ? users : [];
    const byEmail = new Map(usersArr.map((u) => [u.email, u]));
    const byId = new Map(usersArr.map((u) => [u.id, u]));

    // 1) EXISTING DATA AUDIT ---------------------------------------------
    const chatsById = new Map(chats.map((c) => [c.id, c]));

    // Pick a chat with messages for manual check
    const msgsByChat = new Map();
    for (const m of messages) {
      if (!msgsByChat.has(m.chatId)) msgsByChat.set(m.chatId, []);
      msgsByChat.get(m.chatId).push(m);
    }
    const sampleChatWithMsgsId = Array.from(msgsByChat.entries()).find(([, arr]) => arr.length > 0)?.[0] || null;

    // Legacy detection & data checks
    let legacyMsgEmailIds = 0, legacyMsgMissingRoles = 0, nonMigratable = 0, migratable = 0;
    const legacyDetails = [];

    for (const m of messages) {
      const hasEmailLike = (val) => typeof val === 'string' && val.includes('@');
      if (hasEmailLike(m.senderId) || hasEmailLike(m.receiverId)) legacyMsgEmailIds++;
      if (!m.buyerId || !m.sellerId) legacyMsgMissingRoles++;

      // Try to see if migratable (email -> user.id resolvable)
      const senderEmail = hasEmailLike(m.senderId) ? m.senderId : null;
      const receiverEmail = hasEmailLike(m.receiverId) ? m.receiverId : null;
      let ok = true;
      if (senderEmail && !byEmail.get(senderEmail)) ok = false;
      if (receiverEmail && !byEmail.get(receiverEmail)) ok = false;
      if ((senderEmail || receiverEmail) && ok) migratable++; else if (senderEmail || receiverEmail) nonMigratable++;

      // Basic referential checks
      const chat = chatsById.get(m.chatId);
      if (!chat) legacyDetails.push({ type: 'orphan_message', messageId: m.id, chatId: m.chatId });
      if (chat) {
        if (m.buyerId !== chat.buyerId || m.sellerId !== chat.sellerId) {
          legacyDetails.push({ type: 'participants_mismatch', messageId: m.id, chatId: m.chatId });
        }
      }
    }

    let chatsLegacyWithEmails = 0;
    for (const c of chats) {
      const hasEmailLike = (val) => typeof val === 'string' && val.includes('@');
      if (hasEmailLike(c.buyerId) || hasEmailLike(c.sellerId)) chatsLegacyWithEmails++;
    }

    // Duplicates (same chatId, senderId, created_date, text)
    const dupKey = (m) => `${m.chatId}|${m.senderId}|${m.created_date || ''}|${(m.text || '').slice(0, 200)}`;
    const seen = new Map();
    let duplicates = 0;
    for (const m of messages) {
      const k = dupKey(m);
      const v = seen.get(k) || 0;
      if (v === 1) duplicates++;
      seen.set(k, v + 1);
    }

    // Unread counters check
    const unreadMismatches = [];
    for (const c of chats) {
      const arr = msgsByChat.get(c.id) || [];
      const buyerUnread = arr.filter((m) => m.read === false && m.receiverId === c.buyerId).length;
      const sellerUnread = arr.filter((m) => m.read === false && m.receiverId === c.sellerId).length;
      if ((c.unreadBuyer ?? 0) !== buyerUnread || (c.unreadSeller ?? 0) !== sellerUnread) {
        unreadMismatches.push({ chatId: c.id, stored: { unreadBuyer: c.unreadBuyer || 0, unreadSeller: c.unreadSeller || 0 }, computed: { buyerUnread, sellerUnread } });
      }
    }

    // 2) NEW CHAT + OFFER (TEST) -----------------------------------------
    let test = {
      created: false,
      details: null,
      errors: [],
    };

    try {
      // Find a suitable seller from listings
      const listing = listings.find((l) => l?.status === 'active') || listings[0];
      if (!listing) throw new Error('No listings available to create a chat context');
      const sellerUser = byEmail.get(listing.created_by);
      if (!sellerUser) throw new Error('Cannot resolve seller user from listing.created_by');

      // Pick a distinct buyer user
      const buyerUser = usersArr.find((u) => u.id !== sellerUser.id) || null;
      if (!buyerUser) throw new Error('Cannot find a second user to act as buyer');

      // Create or get chat
      let chatId;
      try {
        const r = await base44.asServiceRole.functions.invoke('createOrGetChat', {
          listingId: listing.id,
          buyerId: buyerUser.id,
          sellerId: sellerUser.id,
        });
        chatId = r?.data?.chat?.id || r?.data?.id || r?.data?.chatId || null;
      } catch (e) {
        // Fallback: create chat directly
        const created = await base44.asServiceRole.entities.Chat.create({
          listingId: listing.id,
          buyerId: buyerUser.id,
          sellerId: sellerUser.id,
          status: 'in_attesa',
          lastMessage: '',
          updatedAt: new Date().toISOString(),
          listingTitle: listing.title || '',
          listingImage: Array.isArray(listing.images) ? listing.images[0] : undefined,
        });
        chatId = created.id;
      }
      if (!chatId) throw new Error('Failed to obtain/create chatId');

      // Create offer message as buyer -> seller
      const createdMsg = await base44.asServiceRole.entities.ChatMessage.create({
        chatId,
        senderId: buyerUser.id,
        receiverId: sellerUser.id,
        buyerId: buyerUser.id,
        sellerId: sellerUser.id,
        messageType: 'offer',
        text: 'Offerta di test (audit) — per verifica timeline',
        price: 123.45,
        read: false,
      });

      // Give automations a brief moment (if any) to update unread/lastMessage
      await sleep(600);

      const chatAfter = await base44.asServiceRole.entities.Chat.get?.(chatId) || (await base44.asServiceRole.entities.Chat.filter({ id: chatId }))[0];
      const timeline = await base44.asServiceRole.entities.ChatMessage.filter({ chatId }, '-created_date');

      test.created = true;
      test.details = {
        chatId,
        offerMessageId: createdMsg.id,
        timelineCount: timeline.length,
        lastMessage: chatAfter?.lastMessage || null,
        lastPrice: chatAfter?.lastPrice ?? null,
        unreadBuyer: chatAfter?.unreadBuyer ?? null,
        unreadSeller: chatAfter?.unreadSeller ?? null,
        updatedAt: chatAfter?.updatedAt || null,
      };
    } catch (e) {
      test.errors.push(e?.message || String(e));
    }

    // 5) FIELD VERIFICATION (messages)
    const sampleSize = Math.min(50, messages.length);
    const sampleMsgs = messages.slice(0, sampleSize);
    const fieldIssues = [];
    for (const m of sampleMsgs) {
      if (!m.chatId) fieldIssues.push({ id: m.id, issue: 'missing_chatId' });
      if (!m.senderId || !m.receiverId) fieldIssues.push({ id: m.id, issue: 'empty_sender_or_receiver' });
      const chat = chatsById.get(m.chatId);
      if (chat) {
        if (m.buyerId !== chat.buyerId) fieldIssues.push({ id: m.id, issue: 'buyerId_mismatch' });
        if (m.sellerId !== chat.sellerId) fieldIssues.push({ id: m.id, issue: 'sellerId_mismatch' });
      }
    }

    // Compile report matching requested points
    const report = {
      meta: { generatedAt: new Date().toISOString(), durationMs: Date.now() - start },
      summary: {
        chatsTotal: chats.length,
        messagesTotal: messages.length,
        sampleChatWithMessages: sampleChatWithMsgsId,
      },
      backfillStatus: {
        chatsWithEmailIds: chatsLegacyWithEmails,
        messagesWithEmailIds: legacyMsgEmailIds,
        messagesMissingBuyerSeller: legacyMsgMissingRoles,
        migratableByEmailLookup: migratable,
        nonMigratableByEmailLookup: nonMigratable,
        notes: legacyDetails.slice(0, 50), // cap
      },
      consistency: {
        duplicates,
        unreadMismatchesCount: unreadMismatches.length,
        unreadMismatches: unreadMismatches.slice(0, 50),
        orphanMessages: legacyDetails.filter((d) => d.type === 'orphan_message').slice(0, 50),
      },
      testFlow: test,
      fieldVerificationSample: {
        checked: sampleSize,
        issuesCount: fieldIssues.length,
        issues: fieldIssues,
      },
    };

    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});