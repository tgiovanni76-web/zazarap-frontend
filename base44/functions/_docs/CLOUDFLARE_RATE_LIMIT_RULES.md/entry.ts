# Cloudflare Rate Limiting Rules - Implementation Plan

## Status: 📋 **PLANNED** (Not yet activated)

---

## Rule Configuration

### 1. Admin Endpoints Protection

```yaml
Rule Name: Admin API Rate Limit
Path Pattern: /api/admin/*
Method: ALL
Rate Limit: 30 requests per minute per IP
Action: Block
Response:
  Status: 429
  Content-Type: application/json
  Body: '{"error": "Too Many Requests", "retry_after": 60}'
```

**Rationale:**
- Admin endpoints are sensitive and should have strict limits
- 30 req/min allows legitimate admin operations while preventing abuse
- Protects against brute force attacks and unauthorized scanning

---

### 2. Webhook Endpoints

```yaml
Rule Name: Webhook Rate Limit
Path Pattern: /api/webhooks/*
Method: POST
Rate Limit: 60 requests per minute per IP
Action: Block
Response:
  Status: 429
  Content-Type: application/json
  Body: '{"error": "Webhook rate limit exceeded"}'
```

**Rationale:**
- Webhooks need higher limits for legitimate traffic spikes
- 60 req/min accommodates burst events from payment processors
- Still protects against malicious webhook flooding

**Note:** Consider whitelisting known provider IPs (PayPal, Stripe) if possible

---

### 3. Checkout/Payment Endpoints

```yaml
Rule Name: Checkout Rate Limit
Path Pattern: /api/checkout/*
Method: POST, PUT
Rate Limit: 20 requests per minute per IP
Action: Block
Response:
  Status: 429
  Content-Type: application/json
  Body: '{"error": "Too many payment attempts. Please wait before retrying."}'
```

**Rationale:**
- Payment endpoints need strict limits to prevent fraud
- 20 req/min allows retries for legitimate failures
- Prevents automated payment testing attacks

---

### 4. Global API Protection (Burst + Challenge)

```yaml
Rule Name: Global API Burst Protection
Path Pattern: /api/*
Method: ALL
Burst Threshold: 100 requests in 10 seconds per IP
Action: Managed Challenge
Challenge Duration: 300 seconds (5 minutes)
```

**Configuration:**
- **Normal Traffic:** Allow without challenge
- **Burst Detected:** Show Managed Challenge (invisible CAPTCHA)
- **Repeated Bursts:** Escalate to JavaScript Challenge or Block

**Advanced Options:**
```yaml
Sensitivity: Medium
Countries to Exclude: None (apply globally)
ASN Exclusions: Add trusted CDN/proxy ASNs if needed
User-Agent Filtering: Block known bot patterns
```

---

## Implementation Steps

### Phase 1: Setup (Pre-activation)
1. ✅ Document rules (this file)
2. ⬜ Review with team
3. ⬜ Prepare monitoring dashboard
4. ⬜ Set up Cloudflare alerts

### Phase 2: Staging Test
1. ⬜ Enable rules in staging environment
2. ⬜ Run load tests to validate limits
3. ⬜ Check for false positives
4. ⬜ Adjust thresholds if needed

### Phase 3: Production Rollout
1. ⬜ Enable rules in production (start with permissive limits)
2. ⬜ Monitor for 48 hours
3. ⬜ Analyze blocked requests
4. ⬜ Optimize based on real traffic patterns

---

## Cloudflare Dashboard Configuration

### Access Path
```
Cloudflare Dashboard
└── Security
    └── WAF
        └── Rate Limiting Rules
            └── Create Rule
```

### Rule Priority Order
1. Admin API Rate Limit (Priority: 1 - Highest)
2. Checkout Rate Limit (Priority: 2)
3. Webhook Rate Limit (Priority: 3)
4. Global API Burst Protection (Priority: 4 - Lowest)

---

## Monitoring & Alerts

### Key Metrics to Track
- Blocked requests per rule
- False positive rate
- Legitimate user impact
- Attack patterns and sources

### Recommended Alerts
```yaml
Alert 1:
  Trigger: >50 blocked requests in 5 minutes on Admin endpoints
  Action: Email + Slack notification
  
Alert 2:
  Trigger: Challenge rate >10% of total traffic
  Action: Email notification
  
Alert 3:
  Trigger: >100 unique IPs blocked in 1 hour
  Action: Critical alert + review
```

---

## Exception Handling

### Trusted IPs (Whitelist)
Consider adding these to bypass rate limits:
- Monitoring services (UptimeRobot, Pingdom)
- Known payment provider IPs
- Internal testing IPs
- CI/CD pipeline IPs

### Cloudflare Configuration:
```yaml
IP Access Rules:
  - Action: Allow
  - IP List: [Add trusted IPs]
  - Note: "Bypass rate limits for trusted sources"
```

---

## Testing Checklist

Before activation, verify:
- [ ] Rules don't block legitimate admin operations
- [ ] Payment flows work under normal load
- [ ] Webhook delivery from Stripe/PayPal succeeds
- [ ] Challenge page displays correctly for humans
- [ ] API documentation reflects rate limits
- [ ] Error responses are user-friendly

---

## Rollback Plan

If issues occur after activation:
1. **Immediate:** Disable problematic rule via Cloudflare dashboard
2. **Short-term:** Increase limits temporarily (2x multiplier)
3. **Long-term:** Analyze blocked requests, adjust rules
4. **Communication:** Notify affected users if needed

---

## Additional Considerations

### DDoS Protection
- Cloudflare DDoS protection is separate and automatic
- Rate limiting complements but doesn't replace DDoS protection
- Consider enabling "I'm Under Attack Mode" for severe attacks

### Bot Management
- Cloudflare Bot Management can provide more sophisticated filtering
- Consider upgrading if bot traffic becomes significant
- Can distinguish between good bots (search engines) and bad bots

### Caching Strategy
- Rate limits apply to uncached requests
- Increase cache hit ratio to reduce rate limit impact
- Configure appropriate TTLs for API endpoints

---

## Cost Implications

**Cloudflare Rate Limiting:**
- Free Plan: Limited rate limiting rules
- Pro Plan ($20/mo): More rules + analytics
- Business Plan ($200/mo): Advanced rules + bot management
- Enterprise: Custom solutions

**Current Plan:** [Specify your plan]
**Recommended:** Business or Enterprise for production

---

## Contact Information

**Implementation Owner:** Admin Team  
**Technical Review:** DevOps Team  
**Approval Required:** Yes (before production activation)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-25 | Initial rule planning | System |

---

## Next Steps

1. ✅ Review this document with stakeholders
2. ⬜ Get approval for implementation
3. ⬜ Schedule staging test window
4. ⬜ Prepare rollback procedures
5. ⬜ Set up monitoring dashboards
6. ⬜ Schedule production rollout

---

## Status: 🔴 **NOT ACTIVATED** - Awaiting Approval & Testing