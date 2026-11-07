# 02 - Models, DTOs, Service Interfaces, Token Encryption

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 0 (Foundation) |
| **Depends On** | - (არაფერი) |
| **Blocks** | 05, 06, 07, 08, 09, 10, 11 |
| **Project** | `backend` |
| **Est. Hours** | 6h |
| **Status** | `pending` |

## აღწერა

EF Core entities, DTOs, service interfaces და TokenEncryptionService.

## რა უნდა გაკეთდეს

### 1. EF Core Entities

ფოლდერი: `backend/Czaba.Api/Entities/Social/`

- `SocialCampaign.cs`
- `SocialPost.cs`
- `SocialPlatformAccount.cs`
- `SocialAnalytics.cs`
- `SocialAuditLog.cs`
- `SocialRateLimit.cs`

### 2. DTOs

ფოლდერი: `backend/Czaba.Api/DTOs/Social/`

**Campaign:**
- `CreateCampaignRequest` (Name, Description, DefaultHashtags, StartDate, EndDate)
- `UpdateCampaignRequest`
- `CampaignResponse`
- `CampaignListResponse` (paginated)

**Post:**
- `CreatePostRequest` (CampaignId, Platform, Title, Description, Hashtags, VideoUrl, ScheduledAt)
- `BatchCreatePostsRequest` (CampaignId, Posts: List<CreatePostRequest>)
- `UpdatePostRequest`
- `PostResponse`
- `PostCalendarResponse` (for calendar view)

**Platform Account:**
- `ConnectMetaRequest` (code from OAuth callback)
- `ConnectTikTokRequest`
- `PlatformAccountResponse`
- `TokenStatusResponse` (isActive, expiresAt, daysRemaining)

**Analytics:**
- `PostAnalyticsResponse`
- `CampaignAnalyticsResponse`
- `OverviewAnalyticsResponse`

### 3. Service Interfaces

ფოლდერი: `backend/Czaba.Api/Services/Social/`

```csharp
public interface ISocialCampaignService { ... }
public interface ISocialPostService { ... }
public interface IPublishingService { ... }
public interface IFacebookPublisher { ... }
public interface IInstagramPublisher { ... }
public interface ITikTokPublisher { ... }
public interface IFfmpegService { ... }
public interface IVideoValidationService { ... }
public interface IRateLimitTracker { ... }
public interface ITokenEncryptionService { ... }
public interface IOAuthTokenManager { ... }
public interface IAnalyticsSyncService { ... }
```

### 4. TokenEncryptionService

AES-256-GCM encryption for OAuth tokens.

```csharp
public class TokenEncryptionService : ITokenEncryptionService
{
    public byte[] Encrypt(string plainText) { /* AES-GCM */ }
    public string Decrypt(byte[] encrypted) { /* AES-GCM */ }
}
```

Key-ს appsettings.json-იდან იღებს, production-ში Azure Key Vault.

### 5. Enums

```csharp
public enum CampaignStatus { Draft, Scheduled, Publishing, Active, Paused, Completed, Failed, Cancelled }
public enum PostStatus { Pending, Queued, Publishing, Published, Failed, Cancelled }
public enum SocialPlatform { Facebook, Instagram, TikTok }
```

### 6. DbContext Configuration

`CzabaDbContext`-ში Social entities-ის დამატება, fluent API configuration.

## ვერიფიკაცია

- [ ] `dotnet build` წარმატებულია
- [ ] ყველა entity-ს აქვს სწორი navigation properties
- [ ] DTOs-ს აქვს validation attributes
- [ ] Encryption service-ის unit test (encrypt → decrypt = original)
