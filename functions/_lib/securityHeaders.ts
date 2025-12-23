export function getSecurityHeaders() {
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: https:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https:",
    "frame-ancestors 'none'"
  ].join('; ');

  return {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',(void 0),
    'Content-Security-Policy': csp
  };
}

export function withSecurityHeaders(init = {}) {
  const headers = new Headers(init.headers || {});
  const sec = getSecurityHeaders();
  for (const [k, v] of Object.entries(sec)) headers.set(k, v);
  return { ...init, headers };
}