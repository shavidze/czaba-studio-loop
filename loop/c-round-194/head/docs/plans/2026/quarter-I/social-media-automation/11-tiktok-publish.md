# 11 - TikTok OAuth + Content Posting API

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 2 (Publishing) |
| **Depends On** | 06 (post API), 02 (models, encryption) |
| **Blocks** | 13 (orchestrator), 14 (webhooks), 15 (analytics) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

TikTok OAuth 2.0 flow + Content Posting API integration + App Review timeline management.

## API Endpoints

```
POST   /api/social/accounts/tiktok/connect    -- initiate OAuth
GET    /api/social/accounts/tiktok/callback   -- OAuth callback
```

## რა უნდა გაკეთდეს

### 1. TikTok OAuth Flow

```
Authorization URL: https://www.tiktok.com/v2/auth/authorize/
  ?client_key={key}&scope=user.info.basic,video.publish,video.upload
  &response_type=code

Token Exchange: POST https://open.tiktokapis.com/v2/oauth/token/
  { client_key, client_secret, code, grant_type: "authorization_code" }
  → access_token (24h), refresh_token (365 days)

Token Refresh: POST https://open.tiktokapis.com/v2/oauth/token/
  { client_key, client_secret, refresh_token, grant_type: "refresh_token" }
```

### 2. TikTokPublisher Service

```csharp
// Publish flow:
POST https://open.tiktokapis.com/v2/post/publish/video/init/
{
    post_info: {
        title, description,
        privacy_level: "PUBLIC_TO_EVERYONE",
        is_aigc: true  // MANDATORY for AI content!
    },
    source_info: {
        source: "PULL_FROM_URL",
        video_url: r2SignedUrl
    }
}
→ { data: { publish_id } }
```

### 3. TikTok Token Refresh Job

- Daily Hangfire job
- access_token expires in 24h → refresh daily
- refresh_token expires in 365 days → log warning at day 330

### 4. App Review Management

```
TikTok App Review Timeline:
- Day 1: Submit app for Content Posting API scope
- Day 1-3: Sandbox testing
- Day 3-14: Review (avg 5-7 business days)

Contingency:
- Feature flag in Admin Settings: TikTok enabled/disabled
- If review pending → UI shows "TikTok: Pending Review"
- FB/IG still work independently
```

### 5. is_aigc Flag (Critical!)

- `is_aigc: true` **MUST** be set for AI-generated videos
- TikTok policy: false declaration → account suspension risk
- Auto-set from `SocialPost.IsAiGenerated` field

### 6. Configuration

```json
"TikTok": {
    "ClientKey": "",
    "ClientSecret": "",
    "RedirectUri": "https://api.czaba.ge/api/social/accounts/tiktok/callback",
    "Enabled": false  // feature flag
}
```

## ვერიფიკაცია

- [ ] OAuth flow: redirect → callback → tokens saved
- [ ] Token refresh works
- [ ] Publish with `is_aigc: true` succeeds (sandbox)
- [ ] Feature flag correctly disables TikTok in UI
- [ ] R2 signed URL accessible by TikTok servers
