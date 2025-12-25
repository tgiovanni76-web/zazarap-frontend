/**
 * Simple In-Memory Rate Limiting Fallback
 * 
 * This is a FALLBACK ONLY - Cloudflare handles primary rate limiting.
 * Use only when Cloudflare is not available or during local development.
 * 
 * IMPORTANT: This uses in-memory storage which resets on function restart.
 * It's NOT suitable as primary rate limiting - use Cloudflare edge rules instead.
 */

const requestCache = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCache.entries()) {
    if (now - data.windowStart > data.windowMs + 60000) {
      requestCache.delete(key);
    }
  }
}, 300000);

/**
 * Simple in-memory rate limiter
 * @param {Request} req - Incoming request
 * @param {string} identifier - Unique identifier (e.g., endpoint name)
 * @param {Object} options - Rate limit configuration
 * @returns {Object} { allowed: boolean, remaining: number }
 */
export function checkFallbackRateLimit(req, identifier, options = {}) {
  const {
    maxRequests = 100,
    windowMs = 60000 // 1 minute default
  } = options;

  // Extract IP from request
  const ip = req.headers.get('cf-connecting-ip') 
    || req.headers.get('x-forwarded-for')?.split(',')[0] 
    || req.headers.get('x-real-ip')
    || 'unknown';

  const key = `${identifier}:${ip}`;
  const now = Date.now();

  // Get or create entry
  let entry = requestCache.get(key);
  
  if (!entry || (now - entry.windowStart) > windowMs) {
    // New window
    entry = {
      count: 0,
      windowStart: now,
      windowMs
    };
    requestCache.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const allowed = entry.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - entry.count);

  return {
    allowed,
    remaining,
    limit: maxRequests,
    resetAt: entry.windowStart + windowMs
  };
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
  };
}

/**
 * Easy wrapper for common endpoints
 */
export const FALLBACK_LIMITS = {
  admin: { maxRequests: 30, windowMs: 60000 },      // 30/min
  webhook: { maxRequests: 60, windowMs: 60000 },    // 60/min
  checkout: { maxRequests: 20, windowMs: 60000 },   // 20/min
  default: { maxRequests: 100, windowMs: 60000 }    // 100/min
};

/**
 * Check if request should use fallback (no Cloudflare headers detected)
 */
export function shouldUseFallback(req) {
  return !req.headers.get('cf-ray'); // Cloudflare ray ID is always present if behind CF
}