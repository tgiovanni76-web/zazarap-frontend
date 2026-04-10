// Robust date parsing to avoid timezone drift
// - Accepts ISO strings, numbers (ms), or Date
// - If string has no explicit timezone (no 'Z' or +/-HH:MM), assume UTC (append 'Z')
export function toDateFromAny(ts) {
  try {
    if (!ts) return null;
    if (ts instanceof Date) return ts;
    if (typeof ts === 'number') return new Date(ts);
    if (typeof ts === 'string') {
      const s = ts.trim();
      // If already has timezone info, trust it
      if (/Z$|[+-]\d{2}:?\d{2}$/.test(s)) return new Date(s);
      // If looks like ISO without tz, treat as UTC
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:?\d{0,2}(\.\d+)?$/.test(s)) return new Date(s + 'Z');
      // Fallback: native parse (local)
      return new Date(s);
    }
    return new Date(ts);
  } catch {
    return null;
  }
}

export function formatLocalTimeHHmm(ts) {
  const d = toDateFromAny(ts);
  if (!d) return '';
  // Use Intl for reliability across locales
  try {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}