# 14 - Webhooks (Meta + TikTok) + Stuck Post Checker

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 3 (Orchestration) |
| **Depends On** | 09 (FB publish), 11 (TT publish) |
| **Blocks** | - |
| **Project** | `backend` |
| **Est. Hours** | 5h |
| **Status** | `pending` |

## აღწერა

Webhook endpoints publish status-ის real-time updates + fallback polling for stuck posts.

## API Endpoints

```
GET    /api/social/webhooks/meta            -- Meta verification (hub.challenge)
POST   /api/social/webhooks/meta            -- Meta status updates
POST   /api/social/webhooks/tiktok          -- TikTok publish callback
```

## რა უნდა გაკეთდეს

### 1. Meta Webhook

**Verification (GET):**
- `hub.mode=subscribe` + `hub.verify_token` match → return `hub.challenge`

**Updates (POST):**
- Verify `X-Hub-Signature-256` header (HMAC-SHA256 with app secret)
- Parse `entry[].changes[]` for video status updates
- `field: "videos"` + `status: "ready"` → update post as Published

### 2. TikTok Webhook

**Callback POST:**
- Verify TikTok signature header
- `PUBLISH_COMPLETE` → Published + save share_url
- `FAILED` → Failed + save error_code

### 3. StuckPostChecker (Hangfire Recurring - every 10 min)

Fallback თუ webhook ვერ მოვიდა:
- Find posts with Status="Publishing" AND UpdatedAt < 20min ago
- For each: poll platform API directly
- IG: check container status
- TikTok: check publish status
- Update post accordingly

### 4. Webhook Security

- Meta: HMAC-SHA256 signature verification
- TikTok: Signature header verification
- Replay protection: check timestamp freshness

## ვერიფიკაცია

- [ ] Meta webhook verification responds correctly
- [ ] Meta video status webhook updates post
- [ ] TikTok callback updates post on PUBLISH_COMPLETE
- [ ] Signature verification rejects invalid requests
- [ ] Stuck checker finds and resolves 20+ min old Publishing posts
