export function variantUrl(url, variant) {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin);
    const m = u.pathname.match(/^(.*)-(thumb|card|full)\.(webp|jpg|jpeg|png)$/i);
    if (m) {
      const base = m[1];
      const ext = m[3];
      u.pathname = `${base}-${variant}.${ext}`;
      return u.toString();
    }
    return url; // unknown pattern fallback
  } catch {
    return url;
  }
}