import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me || me.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const chats = await base44.asServiceRole.entities.Chat.list();
    let processed = 0, updated = 0, failures = [];

    for (const ch of chats || []) {
      processed++;
      const patch = {};

      async function resolveToUserId(val) {
        if (!val) return null;
        if (typeof val === 'string' && val.includes('@')) {
          try {
            const users = await base44.asServiceRole.entities.User.filter({ email: val });
            if (users?.[0]?.id) return users[0].id;
          } catch (_) {}
        }
        return val;
      }

      const newBuyer = await resolveToUserId(ch.buyerId);
      const newSeller = await resolveToUserId(ch.sellerId);

      if (newBuyer && newBuyer !== ch.buyerId) patch.buyerId = newBuyer;
      if (newSeller && newSeller !== ch.sellerId) patch.sellerId = newSeller;

      if (Object.keys(patch).length) {
        try {
          await base44.asServiceRole.entities.Chat.update(ch.id, patch);
          updated++;
        } catch (e) {
          failures.push({ chatId: ch.id, error: e.message });
        }
      }
    }

    return Response.json({ status: 'ok', processed, updated, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});