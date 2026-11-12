# 07 - Meta OAuth Flow + Token Management

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 1 (Core APIs) |
| **Depends On** | 01 (database), 02 (models/DTOs — TokenEncryptionService) |
| **Blocks** | 09 (FB publish), 10 (IG publish), 14 (webhooks), A3 (admin accounts page) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Meta (Facebook + Instagram) OAuth 2.0 flow, token exchange chain, Page Access Token, token refresh job.

## API Endpoints

```
POST   /api/social/accounts/meta/connect    -- initiate OAuth (returns redirect URL)
GET    /api/social/accounts/meta/callback   -- OAuth callback (exchange code for tokens)
GET    /api/social/accounts                 -- connected accounts list
DELETE /api/social/accounts/{id}            -- disconnect
POST   /api/social/accounts/{id}/refresh    -- manual token refresh
GET    /api/social/accounts/{id}/status     -- token health check
```

## კრიტიკული Token Flow

```
Short-Lived User Token (1hr)
  → Exchange → Long-Lived User Token (60 days)
    → Get Pages → Page Access Token (never expires)
      → Get IG Business Account ID
```

## რა უნდა გაკეთდეს

### 1. MetaOAuthService

- Generate authorization URL with scopes:
  `pages_manage_posts, pages_read_engagement, instagram_basic, instagram_content_publish`
- Handle callback: exchange code for short-lived token
- Exchange short-lived → long-lived user token
- Get Page Access Token from long-lived user token
- Get Instagram Business Account ID from page
- Store all tokens encrypted in SocialPlatformAccount

### 2. TokenRefreshJob (Hangfire Recurring)

- Runs daily at 03:00 UTC
- Finds accounts where `TokenExpiresAt < now + 15 days` (day 45 refresh!)
- Exchange current long-lived token for new one
- Re-fetch Page Access Token
- Update DB

### 3. Token Status Endpoint

```csharp
public record TokenStatusResponse(
    bool IsActive,
    DateTime? ExpiresAt,
    int? DaysRemaining,
    DateTime? LastRefreshed,
    string Status // "Active", "ExpiringSoon", "Expired"
);
```

### 4. Configuration

```json
// appsettings.json
"Meta": {
    "AppId": "",
    "AppSecret": "",
    "RedirectUri": "https://api.czaba.ge/api/social/accounts/meta/callback",
    "WebhookVerifyToken": ""
}
```

## ვერიფიკაცია

- [ ] OAuth flow: redirect → callback → tokens saved encrypted
- [ ] Page Access Token correctly obtained from Long-Lived User Token
- [ ] IG Business Account ID saved
- [ ] Token refresh job works (test with near-expiry token)
- [ ] Status endpoint shows correct days remaining
- [ ] Disconnect deletes tokens from DB
