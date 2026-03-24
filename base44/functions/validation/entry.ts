import { z } from 'npm:zod@3.24.2';

export { z };

export function validate(schema, payload) {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const errors = parsed.error.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
    return { ok: false, errors };
  }
  return { ok: true, data: parsed.data };
}