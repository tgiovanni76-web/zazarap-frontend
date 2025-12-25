# Fallback Rate Limiting

## Overview
Simple in-memory rate limiting that **only activates when Cloudflare is not detected**.

## Purpose
- **Local development** without Cloudflare
- **Emergency fallback** if Cloudflare fails
- **NOT intended** as primary rate limiting solution

## Usage Example

### Basic Usage (IP-based)

```javascript
import { 
  checkFallbackRateLimit, 
  shouldUseFallback, 
  FALLBACK_LIMITS, 
  createRateLimitResponse 
} from './_lib/fallbackRateLimit.js';

Deno.serve(async (req) => {
  // Only use fallback if Cloudflare is not present
  if (shouldUseFallback(req)) {
    const result = checkFallbackRateLimit(req, 'myEndpoint', FALLBACK_LIMITS.default);
    
    if (!result.allowed) {
      return createRateLimitResponse(result);
    }
  }
  
  // Your function logic here...
});
```

### Advanced Usage (User-ID based, preferred)

```javascript
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { 
  checkFallbackRateLimit, 
  shouldUseFallback, 
  FALLBACK_LIMITS, 
  createRateLimitResponse,
  createRateLimitHeaders 
} from './_lib/fallbackRateLimit.js';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  // Only use fallback if Cloudflare is not present
  if (shouldUseFallback(req)) {
    const user = await base44.auth.me().catch(() => null);
    
    const result = checkFallbackRateLimit(req, 'checkoutEndpoint', {
      ...FALLBACK_LIMITS.checkout,
      userId: user?.id || user?.email // Prefer User-ID over IP
    });
    
    if (!result.allowed) {
      return createRateLimitResponse(result);
    }
  }
  
  // Your function logic here...
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      ...createRateLimitHeaders(result) // Add observability headers
    }
  });
});
```

### Webhook Endpoints (Higher Limits / Skip)

```javascript
Deno.serve(async (req) => {
  if (shouldUseFallback(req)) {
    const result = checkFallbackRateLimit(req, 'stripeWebhook', {
      ...FALLBACK_LIMITS.webhook,
      skipIfWebhook: true // Skip rate limiting for known webhooks
    });
    
    if (!result.allowed && !result.skipped) {
      return createRateLimitResponse(result);
    }
  }
  
  // Process webhook...
});
```

## Predefined Limits

```javascript
FALLBACK_LIMITS.admin     // 30 requests/min (sensitive)
FALLBACK_LIMITS.checkout  // 20 requests/min (payment)
FALLBACK_LIMITS.webhook   // 200 requests/min + auto-skip for webhooks
FALLBACK_LIMITS.default   // 100 requests/min
```

## Features

### ✅ User-ID Preference
- Prioritizes `userId` over IP for authenticated requests
- More accurate than IP-based limiting

### ✅ Trust Proxy Headers
- Correctly extracts client IP behind proxies/CDN
- Priority: `cf-connecting-ip` > `x-forwarded-for` > `x-real-ip`

### ✅ Observability Headers
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp of window reset
- `X-RateLimit-Policy`: Policy applied (e.g., `skipped-webhook`)

### ✅ Webhook Allowlist
- Auto-detects webhooks via User-Agent
- Skips rate limiting for Stripe, PayPal, etc.

### ✅ 429 Response Helper
- `createRateLimitResponse(result)` generates proper 429 with headers

## Configuration

### Environment Variables

```bash
# Optional: Force Cloudflare detection
CLOUDFLARE_ACTIVE=true  # Skip fallback rate limiting
```

### Custom Limits

```javascript
const result = checkFallbackRateLimit(req, 'myEndpoint', {
  maxRequests: 50,
  windowMs: 120000, // 2 minutes
  userId: user?.id,
  skipIfWebhook: false
});
```

## Limitations

⚠️ **In-Memory Storage**
- Resets on function restart
- Not shared across instances
- No persistence

⚠️ **Not Production-Ready**
- Use Cloudflare for production
- This is emergency fallback only

⚠️ **Limited Webhook Detection**
- Based on User-Agent matching
- May not detect all webhook providers

## Detection Logic

### Cloudflare Active?
1. Check `cf-ray` header (most reliable)
2. Check `CLOUDFLARE_ACTIVE` env var
3. If either true → Skip fallback

### Client Identification Priority
1. `userId` parameter (preferred)
2. `cf-connecting-ip` header
3. `x-forwarded-for` header (first IP)
4. `x-real-ip` header
5. `'unknown'` fallback

## Monitoring

If fallback activates in production:
1. Check Cloudflare status dashboard
2. Verify DNS/proxy configuration
3. Review `cf-ray` header presence
4. Monitor `X-RateLimit-*` response headers

## Status

🟡 **Fallback Only** - Use Cloudflare as primary solution

## API Reference

### `checkFallbackRateLimit(req, identifier, options)`
- **req**: Request object
- **identifier**: Endpoint name (e.g., 'checkout')
- **options**: `{ userId?, maxRequests?, windowMs?, skipIfWebhook? }`
- **Returns**: `{ allowed, remaining, limit, resetAt, skipped? }`

### `shouldUseFallback(req)`
- **Returns**: `boolean` - true if Cloudflare is NOT detected

### `createRateLimitResponse(result)`
- **Returns**: `Response` - 429 with headers

### `createRateLimitHeaders(result)`
- **Returns**: `object` - Header object with X-RateLimit-* fields