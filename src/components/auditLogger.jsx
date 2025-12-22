export function initAuditLogger(base44) {
  try {
    if (!base44 || !base44.entities) return;
    if (base44.__auditWrapped) return;
    base44.__auditWrapped = true;

    const entities = base44.entities;

    Object.keys(entities).forEach((name) => {
      // Avoid recursion and skip non-entity helpers
      if (name === 'ChangeLog') return;
      const api = entities[name];
      if (!api || typeof api !== 'object') return;

      const originalCreate = api.create?.bind(api);
      const originalUpdate = api.update?.bind(api);
      const originalDelete = api.delete?.bind(api);

      // Wrap create
      if (originalCreate) {
        api.create = async (data) => {
          const user = await base44.auth.me().catch(() => null);
          const res = await originalCreate(data);
          const created = Array.isArray(res) ? res[0] : res;
          base44.entities.ChangeLog.create({
            entityName: name,
            entityId: created?.id || '',
            action: 'create',
            changedBy: user?.email || 'anonymous',
            beforeSnapshot: '',
            afterSnapshot: JSON.stringify(created ?? {})
          }).catch(() => {});
          return res;
        };
      }

      // Wrap update
      if (originalUpdate) {
        api.update = async (id, data) => {
          const user = await base44.auth.me().catch(() => null);
          const beforeArr = await entities[name].filter({ id }).catch(() => []);
          const before = beforeArr?.[0] ?? null;
          const res = await originalUpdate(id, data);
          const afterArr = await entities[name].filter({ id }).catch(() => []);
          const after = afterArr?.[0] ?? null;

          base44.entities.ChangeLog.create({
            entityName: name,
            entityId: id,
            action: 'update',
            changedBy: user?.email || 'anonymous',
            beforeSnapshot: JSON.stringify(before ?? {}),
            afterSnapshot: JSON.stringify(after ?? {})
          }).catch(() => {});

          return res;
        };
      }

      // Wrap delete
      if (originalDelete) {
        api.delete = async (id) => {
          const user = await base44.auth.me().catch(() => null);
          const beforeArr = await entities[name].filter({ id }).catch(() => []);
          const before = beforeArr?.[0] ?? null;
          const res = await originalDelete(id);

          base44.entities.ChangeLog.create({
            entityName: name,
            entityId: id,
            action: 'delete',
            changedBy: user?.email || 'anonymous',
            beforeSnapshot: JSON.stringify(before ?? {}),
            afterSnapshot: ''
          }).catch(() => {});

          return res;
        };
      }
    });
  } catch (_e) {
    // Do not block the app if audit fails
  }
}