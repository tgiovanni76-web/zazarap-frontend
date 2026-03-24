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
 * Extract client IP from request (trust proxy headers)
 * Priority: cf-connecting-ip > x-forwarded-for > x-real-ip > fallback
 */
function extractClientIP(req) {
  // Cloudflare connecting IP (most reliable)
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  // X-Forwarded-For (first IP in chain is original client)
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  // X-Real-IP
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp;

  // Fallback
  return 'unknown';
}

/**
 * Simple in-memory rate limiter with User-ID support
 * @param {Request} req - Incoming request
 * @param {string} identifier - Unique identifier (e.g., endpoint name)
 * @param {Object} options - Rate limit configuration
 * @param {string} options.userId - Optional user ID (preferred over IP)
 * @param {number} options.maxRequests - Max requests per window
 * @param {number} options.windowMs - Window size in milliseconds
 * @param {boolean} options.skipIfWebhook - Skip rate limiting for webhooks
 * @returns {Object} { allowed: boolean, remaining: number, limit: number, resetAt: number }
 */
export function checkFallbackRateLimit(req, identifier, options = {}) {
  const {
    userId = null,
    maxRequests = 100,
    windowMs = 60000, // 1 minute default
    skipIfWebhook = false
  } = options;

  // Skip for webhooks if requested
  if (skipIfWebhook && isWebhookRequest(req)) {
    return {
      allowed: true,
      remaining: maxRequests,
      limit: maxRequests,
      resetAt: Date.now() + windowMs,
      skipped: true
    };
  }

  // Prefer User-ID over IP
  const clientIdentifier = userId || extractClientIP(req);
  const key = `${identifier}:${clientIdentifier}`;
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
    resetAt: entry.windowStart + windowMs,
    skipped: false
  };
}

/**
 * Detect if request is from a webhook (for allowlist/skip logic)
 */
function isWebhookRequest(req) {
  const userAgent = req.headers.get('user-agent') || '';
  const webhookIndicators = ['stripe', 'paypal', 'webhook', 'hookdeck'];
  return webhookIndicators.some(indicator => 
    userAgent.toLowerCase().includes(indicator)
  );
}

/**
 * Create rate limit response headers (X-RateLimit-*)
 */
export function createRateLimitHeaders(result) {
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.floor(result.resetAt / 1000).toString() // Unix timestamp
  };

  if (result.skipped) {
    headers['X-RateLimit-Policy'] = 'skipped-webhook';
  }

  return headers;
}

/**
 * Create 429 Too Many Requests response
 */
export function createRateLimitResponse(result) {
  const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({ 
      error: 'Too Many Requests',
      retryAfter,
      limit: result.limit,
      windowMs: Math.floor((result.resetAt - Date.now()) / 60000)
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        ...createRateLimitHeaders(result)
      }
    }
  );
}

/**
 * Easy wrapper for common endpoints
 */
export const FALLBACK_LIMITS = {
  admin: { maxRequests: 30, windowMs: 60000 },        // 30/min
  checkout: { maxRequests: 20, windowMs: 60000 },     // 20/min
  webhook: { maxRequests: 200, windowMs: 60000, skipIfWebhook: true }, // 200/min or skip
  default: { maxRequests: 100, windowMs: 60000 }      // 100/min
};

/**
 * Check if Cloudflare is active (primary rate limiting)
 */
export function isCloudflareActive(req) {
  // Check for Cloudflare ray ID header
  if (req.headers.get('cf-ray')) return true;
  
  // Check environment variable
  const cfActive = Deno.env.get('CLOUDFLARE_ACTIVE');
  if (cfActive === 'true' || cfActive === '1') return true;
  
  return false;
}

/**
 * Check if request should use fallback rate limiting
 */
export function shouldUseFallback(req) {
  return !isCloudflareActive(req);
}