# Fallback Rate Limiting

## Overview
Simple in-memory rate limiting that **only activates when Cloudflare is not detected**.

## Purpose
- **Local development** without Cloudflare
- **Emergency fallback** if Cloudflare fails
- **NOT intended** as primary rate limiting solution

## Usage Example

```javascript
import { checkFallbackRateLimit, shouldUseFallback, FALLBACK_LIMITS, createRateLimitHeaders } from './_lib/fallbackRateLimit.js';

Deno.serve(async (req) => {
  // Only use fallback if Cloudflare is not present
  if (shouldUseFallback(req)) {
    const result = checkFallbackRateLimit(req, 'myEndpoint', FALLBACK_LIMITS.default);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }), 
        { 
          status: 429, 
          headers: {
            'Content-Type': 'application/json',
            ...createRateLimitHeaders(result)
          }
        }
      );
    }
  }
  
  // Your function logic here...
});
```

## Predefined Limits

```javascript
FALLBACK_LIMITS.admin     // 30 requests/min
FALLBACK_LIMITS.webhook   // 60 requests/min
FALLBACK_LIMITS.checkout  // 20 requests/min
FALLBACK_LIMITS.default   // 100 requests/min
```

## Limitations

⚠️ **In-Memory Storage**
- Resets on function restart
- Not shared across instances
- No persistence

⚠️ **Not Production-Ready**
- Use Cloudflare for production
- This is emergency fallback only

⚠️ **Limited Detection**
- Based on Cloudflare headers
- May not detect all edge cases

## Detection Logic

Function checks for `cf-ray` header:
- ✅ Present → Cloudflare active → Skip fallback
- ❌ Missing → No Cloudflare → Use fallback

## Monitoring

No built-in monitoring. If fallback activates in production:
1. Check Cloudflare status
2. Verify DNS configuration
3. Review Cloudflare dashboard

## Status

🟡 **Fallback Only** - Use Cloudflare as primary solution