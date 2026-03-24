# Rate Limiting Architecture

## Strategic Decision: Edge-Level Rate Limiting

### Overview
Rate limiting is **intentionally NOT implemented at the backend level**. Instead, all rate limiting is handled at the **edge layer (Cloudflare)** for optimal performance and simplified architecture.

---

## Why Edge-Level Rate Limiting?

### ✅ Advantages

1. **Centralized Control**
   - Single point of configuration for all rate limiting rules
   - No need to duplicate logic across multiple backend functions
   - Easier to manage and update policies

2. **Performance**
   - Requests blocked at edge never reach backend
   - Reduces unnecessary compute costs
   - Lower latency for legitimate requests

3. **Reduced Backend Complexity**
   - No need for shared state management (Redis/DB)
   - Simpler function code without rate limiting logic
   - Fewer dependencies and potential failure points

4. **Better Protection**
   - DDoS mitigation at the edge
   - Geographic-based filtering
   - More sophisticated attack detection

5. **Scalability**
   - Cloudflare handles billions of requests
   - No impact on backend infrastructure
   - Automatic scaling without code changes

---

## Cloudflare Configuration

### Recommended Setup

```
Rate Limiting Rules (Cloudflare Dashboard):
├── Global API Rate Limit: 100 req/min per IP
├── Authentication Endpoints: 5 req/min per IP
├── Payment Endpoints: 10 req/min per IP
├── File Upload: 5 req/min per IP
└── Public Pages: 300 req/min per IP
```

### Implementation Steps

1. **Cloudflare Dashboard** → Security → Rate Limiting Rules
2. Create rules based on:
   - Path patterns (e.g., `/functions/*`)
   - HTTP methods
   - IP address
   - User-Agent
3. Configure actions:
   - Block
   - Challenge (CAPTCHA)
   - JavaScript Challenge
   - Managed Challenge

### Example Rule Configuration

```javascript
// Cloudflare Workers - Rate Limiting Rule Example
{
  "path": "/functions/createPayPalOrder",
  "method": ["POST"],
  "period": 60,
  "requests_per_period": 10,
  "action": "block",
  "response": {
    "status": 429,
    "body": "Too Many Requests. Please try again later."
  }
}
```

---

## Backend Function Considerations

### What Backend Functions Should Do

✅ **Focus on business logic**
- Input validation
- Data processing
- Database operations
- External API calls

❌ **What they should NOT do**
- Rate limiting logic
- IP tracking
- Request counting
- Throttling mechanisms

### Exception: Application-Level Rate Limiting

In rare cases where **application-specific rate limiting** is needed (e.g., per-user quotas, feature limits), implement it in the backend:

```javascript
// Example: User-specific quota check (NOT request rate limiting)
const user = await base44.auth.me();
const userQuota = await base44.entities.UserQuota.findOne({ userId: user.id });

if (userQuota.dailyUploads >= userQuota.maxDailyUploads) {
  return Response.json({ error: 'Daily upload limit reached' }, { status: 429 });
}
```

---

## Migration Notes

### Existing Rate Limiting Code

If you find rate limiting logic in backend functions (e.g., `functions/_lib/rateLimit.js`), it is **legacy code** and should be:

1. **Documented** as deprecated
2. **Migrated** to Cloudflare rules
3. **Removed** once edge-level rules are confirmed working

### Transition Plan

1. ✅ Configure Cloudflare rate limiting rules
2. ✅ Test edge-level limits in staging
3. ✅ Monitor for false positives
4. ✅ Remove backend rate limiting code
5. ✅ Update documentation

---

## Monitoring & Alerts

### Cloudflare Analytics

- Monitor rate limiting actions in Cloudflare Dashboard
- Set up alerts for unusual patterns
- Review blocked IPs regularly

### Backend Monitoring

- Track 429 responses from Cloudflare
- Monitor legitimate user impact
- Adjust rules based on usage patterns

---

## Contact & Support

For rate limiting adjustments:
1. Check Cloudflare Dashboard → Analytics
2. Review Security Events
3. Adjust rules as needed
4. Document changes in this file

---

## Last Updated
2025-12-25

## Status
🟢 **Active Strategy** - All rate limiting handled at Cloudflare edge level