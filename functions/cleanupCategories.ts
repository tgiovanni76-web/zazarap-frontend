import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Utility helpers
function normalize(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/&/g, ' und ')
    .replace(/\b(and)\b/g, 'und')
    .replace(/[,/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CANONICAL_MAIN = [
  { key: 'fahrzeuge', name: 'Fahrzeuge', icon: 'Car', order: 0 },
  { key: 'immobilien', name: 'Immobilien', icon: 'Home', order: 1 },
  { key: 'elektronik', name: 'Elektronik', icon: 'Laptop', order: 2 },
  { key: 'haus_garten', name: 'Haus & Garten', icon: 'Sprout', order: 3 },
  { key: 'mode_beauty', name: 'Mode & Beauty', icon: 'Shirt', order: 4 },
  { key: 'familie_baby', name: 'Familie & Baby', icon: 'Users', order: 5 },
  { key: 'freizeit_hobby', name: 'Freizeit & Hobby', icon: 'Gamepad2', order: 6 },
  { key: 'tiere', name: 'Tiere', icon: 'PawPrint', order: 7 },
  { key: 'jobs', name: 'Jobs', icon: 'Briefcase', order: 8 },
  { key: 'dienstleistungen', name: 'Dienstleistungen', icon: 'Wrench', order: 9 },
  { key: 'zu_verschenken', name: 'Zu verschenken', icon: 'Gift', order: 10 },
];

const ICON_TO_KEY = Object.fromEntries(CANONICAL_MAIN.map(c => [c.icon, c.key]));
const NAME_TO_KEY = Object.fromEntries(CANONICAL_MAIN.map(c => [normalize(c.name), c.key]));
const EXTRA_SYNONYMS = new Map([
  ['familie, kind & baby', 'familie_baby'],
  ['familie kind und baby', 'familie_baby'],
  ['familie & kind & baby', 'familie_baby'],
  ['familie & kinder', 'familie_baby'],
]);

function keyFromCategory(cat) {
  if (!cat) return null;
  if (cat.icon && ICON_TO_KEY[cat.icon]) return ICON_TO_KEY[cat.icon];
  const nameNorm = normalize(cat.name || cat.locales?.de);
  if (NAME_TO_KEY[nameNorm]) return NAME_TO_KEY[nameNorm];
  if (EXTRA_SYNONYMS.get(nameNorm)) return EXTRA_SYNONYMS.get(nameNorm);
  return null;
}

function pickSurvivor(cats, childrenByParent) {
  if (!cats || cats.length === 0) return null;
  let best = cats[0];
  let bestCount = (childrenByParent.get(best.id) || []).length;
  for (let i = 1; i < cats.length; i++) {
    const c = cats[i];
    const count = (childrenByParent.get(c.id) || []).length;
    if (count > bestCount) {
      best = c; bestCount = count;
    }
  }
  return best;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Load all categories (service role for unrestricted access)
    const cats = await base44.asServiceRole.entities.Category.list('order');

    const byId = new Map(cats.map(c => [c.id, c]));
    const roots = cats.filter(c => !c.parentId);
    const childrenByParent = new Map();
    for (const c of cats) {
      if (c.parentId) {
        if (!childrenByParent.has(c.parentId)) childrenByParent.set(c.parentId, []);
        childrenByParent.get(c.parentId).push(c);
      }
    }

    const ops = { updated: 0, created: 0, deactivated: 0, reparented: 0, mergedSubcats: 0 };

    // Ensure canonical roots exist and dedupe
    for (const canonical of CANONICAL_MAIN) {
      const group = roots.filter(r => keyFromCategory(r) === canonical.key);
      let survivor = group.length ? pickSurvivor(group, childrenByParent) : null;

      if (!survivor) {
        // Create missing canonical root
        survivor = await base44.asServiceRole.entities.Category.create({
          name: canonical.name,
          icon: canonical.icon,
          active: true,
          order: canonical.order,
        });
        byId.set(survivor.id, survivor);
        ops.created += 1;
      } else {
        // Ensure survivor has canonical props
        const patch = {};
        if (survivor.name !== canonical.name) patch.name = canonical.name;
        if (survivor.icon !== canonical.icon) patch.icon = canonical.icon;
        if (survivor.active === false) patch.active = true;
        if ((survivor.order ?? -1) !== canonical.order) patch.order = canonical.order;
        if (Object.keys(patch).length) {
          survivor = await base44.asServiceRole.entities.Category.update(survivor.id, patch);
          byId.set(survivor.id, survivor);
          ops.updated += 1;
        }
      }

      // Deactivate duplicates and move their children under survivor
      for (const dup of group.filter(x => x.id !== survivor.id)) {
        const kids = childrenByParent.get(dup.id) || [];
        for (const k of kids) {
          await base44.asServiceRole.entities.Category.update(k.id, { parentId: survivor.id, active: true });
          ops.reparented += 1;
          // Track in map for later subcat merge
          if (!childrenByParent.has(survivor.id)) childrenByParent.set(survivor.id, []);
          childrenByParent.get(survivor.id).push({ ...k, parentId: survivor.id });
        }
        await base44.asServiceRole.entities.Category.update(dup.id, { active: false });
        ops.deactivated += 1;
      }

      // Merge duplicate subcategories under this survivor
      const subs = (childrenByParent.get(survivor.id) || []).map(idOrObj => (idOrObj.id ? idOrObj : byId.get(idOrObj)) || idOrObj);
      const byNorm = new Map();
      for (const s of subs) {
        const label = normalize(s.locales?.de || s.name);
        if (!byNorm.has(label)) byNorm.set(label, []);
        byNorm.get(label).push(s);
      }
      for (const [, list] of byNorm) {
        if (list.length <= 1) continue;
        const subSurvivor = pickSurvivor(list, childrenByParent) || list[0];
        for (const d of list) {
          if (d.id === subSurvivor.id) continue;
          // Move grandchildren
          const gkids = childrenByParent.get(d.id) || [];
          for (const g of gkids) {
            await base44.asServiceRole.entities.Category.update(g.id, { parentId: subSurvivor.id, active: true });
            ops.reparented += 1;
          }
          await base44.asServiceRole.entities.Category.update(d.id, { active: false });
          ops.deactivated += 1;
          ops.mergedSubcats += 1;
        }
      }
    }

    // Optionally, deactivate any other rogue root categories that don't map to canonical set
    for (const r of roots) {
      const k = keyFromCategory(r);
      if (!k) {
        // leave them as-is but ensure only one per visible label if they collide with canonical labels via fallback
        // No-op to avoid destructive assumptions
      }
    }

    return Response.json({ status: 'ok', ...ops });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});