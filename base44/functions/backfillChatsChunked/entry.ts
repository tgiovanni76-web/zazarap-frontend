import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Admin-only chunked backfill for Chat records
// - Normalize buyerId/sellerId from email to user.id
// - Recalculate unreadBuyer/unreadSeller, lastMessage, lastPrice, updatedAt
// - Processes up to BATCH_LIMIT problematic chats per invocation
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const BATCH_LIMIT = 50;

    const emailCache = new Map();
    const resolveUserIdByEmail = async (email) => {
      if (!email || typeof email !== 'string') return null;
      if (!email.includes('@')) return null;
      if (emailCache.has(email)) return emailCache.get(email);
      const users = await base44.asServiceRole.entities.User.filter({ email });
      const id = users && users.length > 0 ? users[0].id : null;
      emailCache.set(email, id);
      return id;
    };

    // Load a window of recent chats, then filter in-memory for those needing migration
    const windowSize = 400; // safety: large enough window, still bounded
    const chatsWindow = await base44.asServiceRole.entities.Chat.list('-updated_date', windowSize);

    const needsMigration = [];
    for (const c of chatsWindow || []) {
      const buyerRaw = c?.buyerId;
      const sellerRaw = c?.sellerId;
      const buyerIsEmail = typeof buyerRaw === 'string' && buyerRaw.includes('@');
      const sellerIsEmail = typeof sellerRaw === 'string' && sellerRaw.includes('@');
      if (buyerIsEmail || sellerIsEmail) needsMigration.push(c);
      if (needsMigration.length >= BATCH_LIMIT) break;
    }

    const processed = [];
    const notMigratable = [];

    for (const chat of needsMigration) {
      let buyerId = chat.buyerId;
      let sellerId = chat.sellerId;

      // Normalize buyerId/sellerId
      if (typeof buyerId === 'string' && buyerId.includes('@')) {
        const mapped = await resolveUserIdByEmail(buyerId);
        if (mapped) buyerId = mapped; else notMigratable.push({ chatId: chat.id, field: 'buyerId', value: chat.buyerId });
      }
      if (typeof sellerId === 'string' && sellerId.includes('@')) {
        const mapped = await resolveUserIdByEmail(sellerId);
        if (mapped) sellerId = mapped; else notMigratable.push({ chatId: chat.id, field: 'sellerId', value: chat.sellerId });
      }

      // If neither could be mapped, skip recalcs but record notMigratable
      const canUpdate = (!!buyerId && !!sellerId && typeof buyerId === 'string' && typeof sellerId === 'string' && !buyerId.includes('@') && !sellerId.includes('@'));

      const patch = {};
      if (canUpdate) {
        patch.buyerId = buyerId;
        patch.sellerId = sellerId;
      }

      // Recalculate counters and last fields based on messages
      // We proceed even if IDs unchanged (could still need recalc)
      const msgs = await base44.asServiceRole.entities.ChatMessage.filter({ chatId: chat.id }, '-created_date');
      // Sort ascending by created_date to derive last
      const sorted = (msgs || []).slice().sort((a, b) => {
        const da = new Date(a.created_date || a.updated_date || 0).getTime();
        const db = new Date(b.created_date || b.updated_date || 0).getTime();
        return da - db;
      });

      let lastMessage = undefined;
      let lastPrice = undefined;
      let unreadBuyer = 0;
      let unreadSeller = 0;

      const buyerFinal = canUpdate ? buyerId : chat.buyerId;
      const sellerFinal = canUpdate ? sellerId : chat.sellerId;

      for (const m of sorted) {
        // Track last message text and price
        if (m?.text) lastMessage = m.text;
        if (typeof m?.price === 'number') lastPrice = m.price;
        // unread counters
        const read = !!m.read;
        const receiver = m?.receiverId;
        if (!read) {
          if (receiver === buyerFinal) unreadBuyer += 1;
          else if (receiver === sellerFinal) unreadSeller += 1;
        }
      }

      patch.lastMessage = lastMessage ?? null;
      patch.lastPrice = typeof lastPrice === 'number' ? lastPrice : null;
      patch.unreadBuyer = unreadBuyer;
      patch.unreadSeller = unreadSeller;
      patch.updatedAt = new Date().toISOString();

      await base44.asServiceRole.entities.Chat.update(chat.id, patch);
      processed.push({ chatId: chat.id });
    }

    return Response.json({
      processedCount: processed.length,
      notMigratableCount: notMigratable.length,
      notMigratable: notMigratable.slice(0, 50), // cap output
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});