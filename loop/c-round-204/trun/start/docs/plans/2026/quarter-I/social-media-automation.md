# სოციალური ქსელების ავტომატიზაციის სისტემა

## სტატუსი

| Field | Value |
|-------|-------|
| **სტატუსი** | `draft` |
| **პრიორიტეტი** | `P1` (high) |
| **შექმნის თარიღი** | 2026-02-22 |
| **ავტორი** | Claude + Manual Review |

---

## კონტექსტი

Czaba-ს პროდუქტების (cinematic tracks, SFX) მარკეტინგისთვის საჭიროა სოციალურ ქსელებში რეგულარული ვიდეო-კონტენტის პოსტინგი. ხელით პოსტვა 3 პლატფორმაზე დღეში 30 წუთს+ მოითხოვს. სისტემა საშუალებას მისცემს ადმინს:

1. 1-2 დღეში 30 ვიდეო prompt დაწეროს batch-ად
2. AI-ით ვიდეოები დააგენერიროს (Seedance, Runway, Kling)
3. Czaba-ს აუდიო ტრეკები/SFX დაადოს (ffmpeg merge)
4. 30 დღის განმავლობაში ავტომატურად დაიპოსტოს Facebook, Instagram Reels, TikTok-ზე
5. ანალიტიკა და engagement აკონტროლოს

---

## 1. არქიტექტურა

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel (React)                    │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────────┐  │
│  │Campaigns │ │  Batch   │ │Calendar│ │  Analytics   │  │
│  │  CRUD    │ │ Prompts  │ │  View  │ │  Dashboard   │  │
│  └────┬─────┘ └────┬─────┘ └───┬────┘ └──────┬───────┘  │
│       └─────────────┴───────────┴─────────────┘          │
└──────────────────────────┬───────────────────────────────┘
                           │ REST API
                           ▼
┌──────────────────────────────────────────────────────────┐
│                  .NET 10 Backend API                      │
│  ┌──────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │ Social       │ │  Hangfire      │ │  OAuth Token   │  │
│  │ Controller   │ │  Scheduler     │ │  Manager       │  │
│  └──────┬───────┘ └───────┬────────┘ └───────┬────────┘  │
│         │                 │                   │           │
│  ┌──────┴───────┐ ┌──────┴────────┐ ┌───────┴────────┐  │
│  │ Publishing   │ │  ffmpeg       │ │  Rate Limit    │  │
│  │ Service      │ │  Service      │ │  Tracker       │  │
│  └──────┬───────┘ └──────┬────────┘ └───────┬────────┘  │
└─────────┼────────────────┼──────────────────┼────────────┘
          │                │                  │
    ┌─────┴──────┐   ┌────┴─────┐    ┌──────┴──────┐
    │  Social    │   │Cloudflare│    │   MSSQL     │
    │  APIs      │   │   R2     │    │  Database   │
    │ FB/IG/TT   │   │ (videos) │    │             │
    └────────────┘   └──────────┘    └─────────────┘
```

### კომპონენტები

| კომპონენტი | ტექნოლოგია | პასუხისმგებლობა |
|-----------|-----------|----------------|
| Admin UI | React + Vite + TanStack Query | Campaign მენეჯმენტი, კალენდარი, ანალიტიკა |
| Social Controller | .NET 10 Minimal API | REST endpoints, ვალიდაცია |
| Publishing Service | .NET 10 Service | პლატფორმა-სპეციფიკური publish ლოგიკა |
| Hangfire Scheduler | Hangfire + MSSQL Storage | დაგეგმილი პოსტების execution, IG polling |
| OAuth Token Manager | .NET 10 Service | Token storage, refresh, Page Token flow |
| ffmpeg Service | ffmpeg CLI wrapper | ვიდეო + აუდიო merge, ვალიდაცია |
| Rate Limit Tracker | .NET 10 Service | Sliding window rate limiting |

---

## 2. მონაცემთა ბაზის სქემა

### SocialCampaign

```sql
CREATE TABLE SocialCampaign (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(1000),
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Draft',
        -- Draft, Scheduled, Publishing, Active, Paused, Completed, Failed
    TotalPosts      INT NOT NULL DEFAULT 0,
    PublishedPosts  INT NOT NULL DEFAULT 0,
    FailedPosts     INT NOT NULL DEFAULT 0,
    StartDate       DATETIME2,
    EndDate         DATETIME2,
    DefaultHashtags NVARCHAR(500),
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT REFERENCES [User](Id)
);
```

### SocialPost (SocialSchedule merged - 1:1 ცალკე ცხრილი ზედმეტია)

```sql
CREATE TABLE SocialPost (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId          INT NOT NULL REFERENCES SocialCampaign(Id),
    Platform            NVARCHAR(20) NOT NULL, -- Facebook, Instagram, TikTok
    PlatformAccountId   INT NOT NULL REFERENCES SocialPlatformAccount(Id),

    -- კონტენტი
    Title               NVARCHAR(300),
    Description         NVARCHAR(2000),
    Hashtags            NVARCHAR(500),
    VideoUrl            NVARCHAR(500),       -- R2 signed URL (merged ვიდეო)
    OriginalVideoUrl    NVARCHAR(500),       -- R2 URL (AI raw ვიდეო)
    AudioTrackId        INT,                 -- Czaba product ID (optional)

    -- დაგეგმვა (ex-SocialSchedule fields)
    ScheduledAt         DATETIME2 NOT NULL,
    PublishedAt         DATETIME2,
    Status              NVARCHAR(20) NOT NULL DEFAULT 'Pending',
        -- Pending, Queued, Publishing, Published, Failed, Cancelled
    HangfireJobId       NVARCHAR(100),

    -- პლატფორმის პასუხი
    PlatformPostId      NVARCHAR(200),       -- FB/IG/TT post ID
    PlatformUrl         NVARCHAR(500),       -- direct link to post
    ErrorMessage        NVARCHAR(2000),
    RetryCount          INT NOT NULL DEFAULT 0,
    MaxRetries          INT NOT NULL DEFAULT 3,

    -- Idempotency
    IdempotencyKey      NVARCHAR(200) NOT NULL,
        -- format: publish:{Id}:{Platform}:{RetryCount}

    -- AI Disclosure
    IsAiGenerated       BIT NOT NULL DEFAULT 1,

    CreatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    INDEX IX_SocialPost_Campaign (CampaignId),
    INDEX IX_SocialPost_ScheduledAt (ScheduledAt) WHERE Status = 'Pending',
    INDEX IX_SocialPost_Platform (Platform, Status),
    CONSTRAINT UQ_IdempotencyKey UNIQUE (IdempotencyKey)
);
```

### SocialPlatformAccount

```sql
CREATE TABLE SocialPlatformAccount (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Platform        NVARCHAR(20) NOT NULL,    -- Facebook, Instagram, TikTok
    AccountName     NVARCHAR(200) NOT NULL,
    AccountId       NVARCHAR(200) NOT NULL,   -- platform-specific account/page ID

    -- OAuth Tokens (encrypted)
    AccessToken     VARBINARY(MAX) NOT NULL,
    RefreshToken    VARBINARY(MAX),
    TokenExpiresAt  DATETIME2,

    -- Meta-specific
    PageId          NVARCHAR(100),            -- Facebook Page ID
    PageAccessToken VARBINARY(MAX),           -- never-expiring page token
    InstagramBusinessAccountId NVARCHAR(100), -- IG business account ID

    -- Status
    IsActive        BIT NOT NULL DEFAULT 1,
    LastUsedAt      DATETIME2,
    TokenRefreshedAt DATETIME2,

    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

### SocialAnalytics

```sql
CREATE TABLE SocialAnalytics (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    PostId          INT NOT NULL REFERENCES SocialPost(Id),

    Views           INT NOT NULL DEFAULT 0,
    Likes           INT NOT NULL DEFAULT 0,
    Comments        INT NOT NULL DEFAULT 0,
    Shares          INT NOT NULL DEFAULT 0,
    Saves           INT NOT NULL DEFAULT 0,
    Reach           INT NOT NULL DEFAULT 0,
    EngagementRate  DECIMAL(5,2) DEFAULT 0,

    FetchedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    INDEX IX_SocialAnalytics_Post (PostId)
);
```

### SocialAuditLog

```sql
CREATE TABLE SocialAuditLog (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    PostId          INT REFERENCES SocialPost(Id),
    CampaignId      INT REFERENCES SocialCampaign(Id),
    Action          NVARCHAR(50) NOT NULL,
        -- Created, Scheduled, Publishing, Published, Failed, Retried, Cancelled, Paused
    Details         NVARCHAR(MAX),            -- JSON payload
    CorrelationId   UNIQUEIDENTIFIER NOT NULL, -- Serilog correlation
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT REFERENCES [User](Id),

    INDEX IX_AuditLog_Post (PostId),
    INDEX IX_AuditLog_Correlation (CorrelationId)
);
```

### SocialRateLimit

```sql
CREATE TABLE SocialRateLimit (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Platform        NVARCHAR(20) NOT NULL,
    AccountId       INT NOT NULL REFERENCES SocialPlatformAccount(Id),
    WindowStart     DATETIME2 NOT NULL,
    WindowEnd       DATETIME2 NOT NULL,
    RequestCount    INT NOT NULL DEFAULT 0,
    MaxRequests     INT NOT NULL,

    INDEX IX_RateLimit_Lookup (Platform, AccountId, WindowEnd)
);
```

---

## 3. API Endpoints

### Campaign Management

```
POST   /api/social/campaigns                    -- შექმნა
GET    /api/social/campaigns                    -- სია (paginated, filtered)
GET    /api/social/campaigns/{id}               -- დეტალები
PUT    /api/social/campaigns/{id}               -- განახლება
DELETE /api/social/campaigns/{id}               -- წაშლა (მხოლოდ Draft)
POST   /api/social/campaigns/{id}/schedule      -- Draft → Scheduled
POST   /api/social/campaigns/{id}/pause         -- Active → Paused
POST   /api/social/campaigns/{id}/resume        -- Paused → Active
POST   /api/social/campaigns/{id}/cancel        -- → Cancelled (unpublished posts)
```

### Post Management

```
POST   /api/social/posts                        -- ერთი პოსტის შექმნა
POST   /api/social/posts/batch                  -- batch შექმნა (30 პოსტი ერთად)
GET    /api/social/posts                        -- სია (by campaign, platform, status)
GET    /api/social/posts/{id}                   -- დეტალები + logs
PUT    /api/social/posts/{id}                   -- განახლება (მხოლოდ Pending)
DELETE /api/social/posts/{id}                   -- წაშლა (მხოლოდ Pending)
POST   /api/social/posts/{id}/publish           -- manual publish now
POST   /api/social/posts/{id}/retry             -- failed → retry
POST   /api/social/posts/{id}/cancel            -- cancel scheduled
GET    /api/social/posts/calendar               -- calendar view (date range)
```

### Platform Accounts

```
GET    /api/social/accounts                     -- connected accounts სია
POST   /api/social/accounts/meta/connect        -- Meta OAuth initiate
GET    /api/social/accounts/meta/callback       -- Meta OAuth callback
POST   /api/social/accounts/tiktok/connect      -- TikTok OAuth initiate
GET    /api/social/accounts/tiktok/callback      -- TikTok OAuth callback
DELETE /api/social/accounts/{id}                -- disconnect
POST   /api/social/accounts/{id}/refresh        -- manual token refresh
GET    /api/social/accounts/{id}/status         -- token health check
```

### Video & Media

```
POST   /api/social/media/upload                 -- ვიდეოს ატვირთვა → R2
POST   /api/social/media/merge                  -- ვიდეო + აუდიო ffmpeg merge
GET    /api/social/media/{id}/status            -- merge job სტატუსი
POST   /api/social/media/validate               -- ვიდეო ვალიდაცია (ffprobe)
GET    /api/social/media/library                -- ატვირთული მედია სია
```

### Analytics

```
GET    /api/social/analytics/campaign/{id}      -- campaign analytics
GET    /api/social/analytics/post/{id}          -- post analytics
GET    /api/social/analytics/overview            -- dashboard overview
POST   /api/social/analytics/sync               -- manual analytics refresh
```

---

## 4. OAuth ინტეგრაციები

### 4.1 Meta (Facebook + Instagram)

#### Token Flow (კრიტიკულად მნიშვნელოვანი)

```
Step 1: User Authorization
────────────────────────
Admin clicks "Connect Facebook" →
  Redirect to: https://www.facebook.com/v21.0/dialog/oauth
  Permissions: pages_manage_posts, pages_read_engagement,
               instagram_basic, instagram_content_publish
  → Returns short-lived User Access Token (1 hour)

Step 2: Exchange for Long-Lived User Token
──────────────────────────────────────────
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id={app-id}
  &client_secret={app-secret}
  &fb_exchange_token={short-lived-token}
  → Returns Long-Lived User Access Token (60 days)

Step 3: Get Page Access Token (never expires!)
──────────────────────────────────────────────
GET https://graph.facebook.com/v21.0/me/accounts
  ?access_token={long-lived-user-token}
  → Returns Page Access Tokens (permanent while user token valid)

IMPORTANT: Page Access Token obtained from a Long-Lived User Token
is itself long-lived and does NOT expire as long as:
  - The user hasn't revoked the app
  - The page permissions haven't changed
```

#### პროაქტიული Token Refresh

```csharp
// Hangfire recurring job - ყოველდღე
[AutomaticRetry(Attempts = 3)]
public async Task RefreshExpiringTokens(CancellationToken ct)
{
    var threshold = DateTime.UtcNow.AddDays(15); // day 45-ზე refresh, არა 59-ზე!

    var expiringAccounts = await _db.SocialPlatformAccounts
        .Where(a => a.Platform == "Facebook"
                  && a.TokenExpiresAt < threshold
                  && a.IsActive)
        .ToListAsync(ct);

    foreach (var account in expiringAccounts)
    {
        var newToken = await _metaApi.ExchangeForLongLivedToken(
            _encryption.Decrypt(account.AccessToken), ct);

        account.AccessToken = _encryption.Encrypt(newToken.Token);
        account.TokenExpiresAt = DateTime.UtcNow.AddDays(60);
        account.TokenRefreshedAt = DateTime.UtcNow;

        // Page Token-ც ხელახლა ვიღებთ
        var pageToken = await _metaApi.GetPageAccessToken(
            account.PageId, newToken.Token, ct);
        account.PageAccessToken = _encryption.Encrypt(pageToken);

        _logger.LogInformation(
            "Refreshed Meta tokens for account {AccountId}, expires {Expiry}",
            account.Id, account.TokenExpiresAt);
    }

    await _db.SaveChangesAsync(ct);
}
```

#### Instagram Reels 2-Step Publish + Polling

```csharp
public async Task<string> PublishInstagramReel(
    SocialPost post, SocialPlatformAccount account, CancellationToken ct)
{
    var igAccountId = account.InstagramBusinessAccountId;
    var pageToken = _encryption.Decrypt(account.PageAccessToken);

    // Step 1: Create Container
    var container = await _httpClient.PostAsJsonAsync(
        $"https://graph.facebook.com/v21.0/{igAccountId}/media",
        new {
            media_type = "REELS",
            video_url = post.VideoUrl,
            caption = BuildCaption(post), // includes AI disclosure
            share_to_feed = true
        }, ct);

    var containerId = (await container.Content
        .ReadFromJsonAsync<MetaResponse>(ct))!.Id;

    // Step 2: Hangfire background job-ით ვაკვირდებით status-ს
    // IG-ს შეიძლება 30 წამიდან 5 წუთამდე დასჭირდეს processing
    var jobId = BackgroundJob.Schedule<InstagramPollingJob>(
        job => job.PollAndPublish(post.Id, containerId, igAccountId, pageToken),
        TimeSpan.FromSeconds(30)); // 30 წამის შემდეგ ვიწყებთ polling-ს

    return jobId;
}

// ცალკე Hangfire Job - polling logic
public class InstagramPollingJob
{
    private const int MaxPollAttempts = 30;      // 30 attempts
    private const int PollIntervalSeconds = 30;   // x30sec = 15 min max

    [AutomaticRetry(Attempts = 0)] // არ გავიმეოროთ - თვითონ მართავს
    public async Task PollAndPublish(
        int postId, string containerId, string igAccountId,
        string pageToken)
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(15));

        for (int attempt = 0; attempt < MaxPollAttempts; attempt++)
        {
            cts.Token.ThrowIfCancellationRequested();

            var status = await CheckContainerStatus(containerId, pageToken, cts.Token);

            switch (status.StatusCode)
            {
                case "FINISHED":
                    await PublishContainer(postId, containerId, igAccountId,
                                          pageToken, cts.Token);
                    return;

                case "ERROR":
                    await MarkPostFailed(postId,
                        $"IG container error: {status.ErrorMessage}", cts.Token);
                    return;

                case "IN_PROGRESS":
                    await Task.Delay(
                        TimeSpan.FromSeconds(PollIntervalSeconds), cts.Token);
                    break;
            }
        }

        await MarkPostFailed(postId, "IG polling timeout after 15 minutes",
                            CancellationToken.None);
    }

    private async Task PublishContainer(
        int postId, string containerId, string igAccountId,
        string pageToken, CancellationToken ct)
    {
        var result = await _httpClient.PostAsJsonAsync(
            $"https://graph.facebook.com/v21.0/{igAccountId}/media_publish",
            new { creation_id = containerId },
            ct);

        var published = await result.Content
            .ReadFromJsonAsync<MetaResponse>(ct);

        await UpdatePostAsPublished(postId, published!.Id, ct);
    }
}
```

### 4.2 TikTok Content Posting API

#### OAuth Flow

```
Step 1: Authorization
────────────────────
Redirect to: https://www.tiktok.com/v2/auth/authorize/
  ?client_key={client_key}
  &scope=user.info.basic,video.publish,video.upload
  &response_type=code
  → Returns authorization code

Step 2: Exchange for Access Token
────────────────────────────────
POST https://open.tiktokapis.com/v2/oauth/token/
  { client_key, client_secret, code, grant_type: "authorization_code" }
  → access_token (24 hours), refresh_token (365 days)

Step 3: Token Refresh (Hangfire daily job)
────────────────────────────────────────
POST https://open.tiktokapis.com/v2/oauth/token/
  { client_key, client_secret, refresh_token, grant_type: "refresh_token" }
```

#### TikTok Publish Flow

```csharp
public async Task<string> PublishToTikTok(
    SocialPost post, SocialPlatformAccount account, CancellationToken ct)
{
    var accessToken = _encryption.Decrypt(account.AccessToken);

    // Step 1: Initialize upload
    var initResponse = await _httpClient.PostAsJsonAsync(
        "https://open.tiktokapis.com/v2/post/publish/video/init/",
        new {
            post_info = new {
                title = post.Title,
                description = post.Description,
                disable_duet = false,
                disable_stitch = false,
                privacy_level = "PUBLIC_TO_EVERYONE",
                is_aigc = post.IsAiGenerated  // AI disclosure - სავალდებულო!
            },
            source_info = new {
                source = "PULL_FROM_URL",
                video_url = post.VideoUrl
            }
        }, ct);

    var publishId = (await initResponse.Content
        .ReadFromJsonAsync<TikTokResponse>(ct))!.Data.PublishId;

    // Status check similar to IG polling
    BackgroundJob.Schedule<TikTokPollingJob>(
        job => job.PollStatus(post.Id, publishId, accessToken),
        TimeSpan.FromSeconds(30));

    return publishId;
}
```

#### TikTok App Review Timeline

```
Day 1:    Submit app for review (Content Posting API scope)
Day 1-3:  Sandbox testing with test accounts
Day 3-14: TikTok review process (average 5-7 business days)
Day 14+:  Production access (if approved)

Contingency (feature flag):
- If review delayed → manual TikTok posting instructions in UI
- If rejected → resubmit with corrections, FB/IG still works
- Admin UI-ში TikTok toggle: enabled/disabled based on approval status
```

### 4.3 Token Storage

```csharp
// AES-256-GCM encryption for token storage
public class TokenEncryptionService
{
    private readonly byte[] _key; // from appsettings (Azure Key Vault in prod)

    public byte[] Encrypt(string plainText)
    {
        using var aes = new AesGcm(_key, AesGcm.TagByteSizes.MaxSize);
        var nonce = new byte[AesGcm.NonceByteSizes.MaxSize];
        RandomNumberGenerator.Fill(nonce);
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipher = new byte[plainBytes.Length];
        var tag = new byte[AesGcm.TagByteSizes.MaxSize];
        aes.Encrypt(nonce, plainBytes, cipher, tag);
        // nonce + tag + cipher
        return [..nonce, ..tag, ..cipher];
    }

    public string Decrypt(byte[] encrypted)
    {
        var nonceSize = AesGcm.NonceByteSizes.MaxSize;
        var tagSize = AesGcm.TagByteSizes.MaxSize;
        using var aes = new AesGcm(_key, tagSize);
        var nonce = encrypted[..nonceSize];
        var tag = encrypted[nonceSize..(nonceSize + tagSize)];
        var cipher = encrypted[(nonceSize + tagSize)..];
        var plain = new byte[cipher.Length];
        aes.Decrypt(nonce, cipher, tag, plain);
        return Encoding.UTF8.GetString(plain);
    }
}
```

---

## 5. Hangfire vs n8n - გადაწყვეტილების მატრიცა

### რეკომენდაცია: **Hangfire (Plan A)**

| კრიტერიუმი | Hangfire | n8n |
|-----------|----------|-----|
| **Development hours** | ~56 საათი | ~80 საათი |
| **Language** | C# (.NET native) | JavaScript/n8n DSL |
| **Debugging** | Visual Studio debugger | n8n UI + logs |
| **Deployment** | Same app (IIS/Docker) | ცალკე Docker container |
| **IG Reels polling** | Background job + CancellationToken | HTTP polling node (ძნელი) |
| **Monitoring** | Built-in dashboard (/hangfire) | n8n UI |
| **DB** | MSSQL (existing) | PostgreSQL (new!) |
| **Cost** | Free (open source) | Free (self-hosted) |
| **Error handling** | try/catch + automatic retry | retry node + error workflow |
| **Team expertise** | .NET team ✓ | JavaScript learning curve |
| **Token management** | Direct DB access | API call back to .NET |
| **Scale** | Horizontal (multiple workers) | Horizontal (queue mode) |

### რატომ Hangfire?

1. **IG Reels polling** - Hangfire-ში 15-წუთიანი background job with CancellationToken ბუნებრივია. n8n-ში HTTP polling node-ით ეს მტკივნეულია.
2. **Token management** - Hangfire-ს აქვს პირდაპირი წვდომა EF Core-ზე, n8n-ს HTTP-ით უნდა დაბრუნდეს .NET API-სთან.
3. **Single deployment** - ცალკე Docker container არ გჭირდება.
4. **Team skill** - .NET-ცენტრული გუნდისთვის C# > JavaScript.

### n8n (Plan B) - როდის?

- თუ non-social automation tasks გაჩნდება (email campaigns, webhook integrations)
- თუ non-technical team member-ს უნდა workflow-ების მართვა
- მომავალში Hangfire-ის გვერდით შეიძლება n8n-ის დამატება

### Hangfire Setup

```csharp
// Program.cs
builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(connectionString, new SqlServerStorageOptions
    {
        CommandBatchMaxTimeout = TimeSpan.FromMinutes(5),
        QueuePollInterval = TimeSpan.FromSeconds(15),
        SchemaName = "social"  // separate schema
    }));

builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 4;  // 4 parallel workers
    options.Queues = new[] { "social-publish", "social-analytics", "default" };
});

// Recurring Jobs Registration
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new AdminAuthFilter() }
});

RecurringJob.AddOrUpdate<TokenRefreshJob>(
    "refresh-social-tokens",
    job => job.RefreshExpiringTokens(CancellationToken.None),
    Cron.Daily(3, 0)); // 03:00 UTC

RecurringJob.AddOrUpdate<AnalyticsSyncJob>(
    "sync-social-analytics",
    job => job.SyncAll(CancellationToken.None),
    Cron.Hourly);

RecurringJob.AddOrUpdate<ScheduledPostProcessor>(
    "process-scheduled-posts",
    job => job.ProcessPendingPosts(CancellationToken.None),
    "*/5 * * * *"); // ყოველ 5 წუთში
```

---

## 6. ვიდეო ვალიდაციის ფენა

### პლატფორმის კონსტრეინტები

| პარამეტრი | Facebook | Instagram Reels | TikTok |
|----------|----------|-----------------|--------|
| Max duration | 240 min | 90 sec | 180 sec (10min with permission) |
| Min duration | 1 sec | 3 sec | 3 sec |
| Max file size | 10 GB | 4 GB | 4 GB |
| Formats | mp4, mov | mp4, mov | mp4, webm, mov |
| Aspect ratio | any | 9:16 (recommended) | 9:16 (recommended) |
| Min resolution | 720p | 720p | 720p |
| Audio codec | AAC | AAC | AAC |
| Video codec | H.264 | H.264 | H.264, H.265 |

### ffprobe-based ვალიდაცია

```csharp
public class VideoValidationService
{
    public async Task<ValidationResult> ValidateForPlatform(
        string filePath, string platform, CancellationToken ct)
    {
        var probe = await RunFfprobe(filePath, ct);
        var constraints = GetConstraints(platform);
        var errors = new List<string>();

        // Duration
        if (probe.Duration < constraints.MinDuration)
            errors.Add($"ვიდეო ძალიან მოკლეა: {probe.Duration:F1}s (min: {constraints.MinDuration}s)");
        if (probe.Duration > constraints.MaxDuration)
            errors.Add($"ვიდეო ძალიან გრძელია: {probe.Duration:F1}s (max: {constraints.MaxDuration}s)");

        // File size
        if (probe.FileSize > constraints.MaxFileSize)
            errors.Add($"ფაილი ძალიან დიდია: {probe.FileSize / 1_000_000}MB (max: {constraints.MaxFileSize / 1_000_000}MB)");

        // Resolution
        if (probe.Height < constraints.MinHeight)
            errors.Add($"რეზოლუცია ძალიან დაბალია: {probe.Width}x{probe.Height} (min height: {constraints.MinHeight})");

        // Codec
        if (!constraints.VideoCodecs.Contains(probe.VideoCodec))
            errors.Add($"Video codec '{probe.VideoCodec}' not supported. Use: {string.Join(", ", constraints.VideoCodecs)}");

        // Aspect ratio warning (not error) for Reels/TikTok
        if (platform is "Instagram" or "TikTok" && probe.AspectRatio != "9:16")
            errors.Add($"WARNING: {platform} recommends 9:16 aspect ratio, current: {probe.AspectRatio}");

        return new ValidationResult(errors.Count == 0, errors);
    }

    private async Task<ProbeResult> RunFfprobe(string filePath, CancellationToken ct)
    {
        var process = Process.Start(new ProcessStartInfo
        {
            FileName = "ffprobe",
            Arguments = $"-v quiet -print_format json -show_format -show_streams \"{filePath}\"",
            RedirectStandardOutput = true,
            UseShellExecute = false
        });

        var output = await process!.StandardOutput.ReadToEndAsync(ct);
        await process.WaitForExitAsync(ct);
        return JsonSerializer.Deserialize<ProbeResult>(output)!;
    }
}
```

---

## 7. Campaign State Machine

### 7 States + Transition Rules

```
                    ┌──────────┐
                    │  Draft   │
                    └────┬─────┘
                         │ schedule()
                         ▼
                    ┌──────────┐
              ┌─────│Scheduled │
              │     └────┬─────┘
              │          │ first post starts publishing
              │          ▼
              │     ┌──────────┐
              │     │Publishing│─────────┐
              │     └────┬─────┘         │ all failed
              │          │ first success │
              │          ▼               ▼
     cancel() │     ┌──────────┐   ┌──────────┐
     (any)    │     │  Active  │   │  Failed  │
              │     └──┬───┬───┘   └──────────┘
              │  pause()│   │ all posts done
              │        ▼   ▼
              │  ┌────────┐ ┌───────────┐
              └─▶│ Paused │ │ Completed │
                 └───┬────┘ └───────────┘
                     │ resume()
                     ▼
                 ┌──────────┐
                 │  Active  │ (back)
                 └──────────┘
```

### Transition Rules

```csharp
public class CampaignStateMachine
{
    private static readonly Dictionary<string, string[]> AllowedTransitions = new()
    {
        ["Draft"]      = ["Scheduled"],
        ["Scheduled"]  = ["Publishing", "Cancelled"],
        ["Publishing"] = ["Active", "Failed", "Cancelled"],
        ["Active"]     = ["Paused", "Completed", "Cancelled"],
        ["Paused"]     = ["Active", "Cancelled"],
        ["Failed"]     = ["Draft"],          // retry: back to draft for re-edit
        ["Completed"]  = [],                 // terminal state
        ["Cancelled"]  = [],                 // terminal state
    };

    public bool CanTransition(string currentStatus, string targetStatus)
        => AllowedTransitions.TryGetValue(currentStatus, out var allowed)
           && allowed.Contains(targetStatus);

    public async Task Pause(int campaignId, CancellationToken ct)
    {
        var campaign = await _db.SocialCampaigns.FindAsync(campaignId, ct);
        if (!CanTransition(campaign!.Status, "Paused"))
            throw new InvalidOperationException(
                $"Cannot pause campaign in '{campaign.Status}' status");

        campaign.Status = "Paused";

        // Pending პოსტები → Cancelled, არა Published-ები
        var pendingPosts = await _db.SocialPosts
            .Where(p => p.CampaignId == campaignId
                     && p.Status == "Pending")
            .ToListAsync(ct);

        foreach (var post in pendingPosts)
        {
            if (post.HangfireJobId != null)
                BackgroundJob.Delete(post.HangfireJobId);
            post.Status = "Cancelled";
        }

        await _db.SaveChangesAsync(ct);
    }
}
```

---

## 8. Idempotency on Publish

### პრობლემა
ქსელის შეფერხების ან retry-ის დროს ერთი და იგივე პოსტი შეიძლება 2-ჯერ გამოქვეყნდეს.

### გადაწყვეტა: DB-based distributed lock

```csharp
public class IdempotentPublisher
{
    public async Task<PublishResult> PublishWithIdempotency(
        SocialPost post, CancellationToken ct)
    {
        var idempotencyKey = $"publish:{post.Id}:{post.Platform}:{post.RetryCount}";

        // DB lock - atomic check-and-set
        await using var transaction = await _db.Database
            .BeginTransactionAsync(IsolationLevel.Serializable, ct);

        try
        {
            var existing = await _db.SocialPosts
                .Where(p => p.IdempotencyKey == idempotencyKey
                         && p.Status == "Published")
                .FirstOrDefaultAsync(ct);

            if (existing != null)
            {
                _logger.LogWarning(
                    "Duplicate publish attempt blocked: {Key}", idempotencyKey);
                return PublishResult.AlreadyPublished(existing.PlatformPostId!);
            }

            post.Status = "Publishing";
            post.IdempotencyKey = idempotencyKey;
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
        }
        catch (DbUpdateException) // unique constraint violation = duplicate
        {
            return PublishResult.AlreadyPublished("");
        }

        // actual publish (outside transaction)
        try
        {
            var platformPostId = post.Platform switch
            {
                "Facebook"  => await _facebookPublisher.Publish(post, ct),
                "Instagram" => await _instagramPublisher.Publish(post, ct),
                "TikTok"    => await _tiktokPublisher.Publish(post, ct),
                _ => throw new ArgumentException($"Unknown platform: {post.Platform}")
            };

            post.Status = "Published";
            post.PlatformPostId = platformPostId;
            post.PublishedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);

            return PublishResult.Success(platformPostId);
        }
        catch (Exception ex)
        {
            post.Status = "Failed";
            post.ErrorMessage = ex.Message;
            post.RetryCount++;
            await _db.SaveChangesAsync(CancellationToken.None);

            if (post.RetryCount < post.MaxRetries)
            {
                BackgroundJob.Schedule<PostPublisher>(
                    p => p.Publish(post.Id, CancellationToken.None),
                    TimeSpan.FromMinutes(5 * post.RetryCount)); // exponential-ish
            }

            return PublishResult.Failed(ex.Message);
        }
    }
}
```

---

## 9. Rate Limit Tracking

### Sliding Window Counter

```csharp
public class RateLimitTracker
{
    // პლატფორმის ლიმიტები (conservative - official limits-ზე ნაკლები)
    private static readonly Dictionary<string, int> DailyLimits = new()
    {
        ["Facebook"]  = 50,  // official: ~200, safe: 50
        ["Instagram"] = 25,  // official: 25 API calls/user/hour
        ["TikTok"]    = 20   // official: varies, safe: 20
    };

    public async Task<bool> CanPublish(
        string platform, int accountId, CancellationToken ct)
    {
        var windowStart = DateTime.UtcNow.Date; // daily window
        var windowEnd = windowStart.AddDays(1);

        var current = await _db.SocialRateLimits
            .Where(r => r.Platform == platform
                     && r.AccountId == accountId
                     && r.WindowStart == windowStart)
            .FirstOrDefaultAsync(ct);

        if (current == null) return true; // no records = no usage

        return current.RequestCount < DailyLimits[platform];
    }

    public async Task RecordUsage(
        string platform, int accountId, CancellationToken ct)
    {
        var windowStart = DateTime.UtcNow.Date;

        var rateLimit = await _db.SocialRateLimits
            .Where(r => r.Platform == platform
                     && r.AccountId == accountId
                     && r.WindowStart == windowStart)
            .FirstOrDefaultAsync(ct);

        if (rateLimit == null)
        {
            _db.SocialRateLimits.Add(new SocialRateLimit
            {
                Platform = platform,
                AccountId = accountId,
                WindowStart = windowStart,
                WindowEnd = windowStart.AddDays(1),
                RequestCount = 1,
                MaxRequests = DailyLimits[platform]
            });
        }
        else
        {
            rateLimit.RequestCount++;
        }

        await _db.SaveChangesAsync(ct);
    }
}
```

---

## 10. AI Content Disclosure

### სავალდებულო AI disclosure

```csharp
public class ContentDisclosureService
{
    public string BuildCaption(SocialPost post)
    {
        var caption = new StringBuilder();

        if (!string.IsNullOrEmpty(post.Title))
            caption.AppendLine(post.Title);
        if (!string.IsNullOrEmpty(post.Description))
            caption.AppendLine(post.Description);
        if (!string.IsNullOrEmpty(post.Hashtags))
            caption.AppendLine(post.Hashtags);

        // AI disclosure - Meta platforms
        if (post.IsAiGenerated && post.Platform is "Facebook" or "Instagram")
            caption.AppendLine("\n🤖 Created with AI-generated visuals");

        return caption.ToString().Trim();
    }

    public object BuildTikTokPostInfo(SocialPost post)
    {
        return new
        {
            title = post.Title,
            description = BuildCaption(post),
            privacy_level = "PUBLIC_TO_EVERYONE",
            is_aigc = post.IsAiGenerated  // TikTok-ის სავალდებულო flag
        };
    }
}
```

**Legal notes:**
- EU AI Act (2025+): AI-generated content-ის labeling სავალდებულოა
- TikTok: `is_aigc` flag false-ზე დატოვება → account suspension risk
- Meta: caption-ში disclosure + "Made with AI" label option
- Best practice: ყოველთვის გამჟღავნება, არასდროს დამალვა

---

## 11. Structured Logging

### Serilog Setup

```csharp
// Program.cs
builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Czaba.Social")
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] [{CorrelationId}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.MSSqlServer(connectionString, new MSSqlServerSinkOptions
    {
        TableName = "SocialLogs",
        SchemaName = "social",
        AutoCreateSqlTable = true
    }));
```

### Per-Publish Scope

```csharp
public class PostPublisher
{
    public async Task Publish(int postId, CancellationToken ct)
    {
        var correlationId = Guid.NewGuid();

        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["PostId"] = postId,
            ["Operation"] = "SocialPublish"
        });

        var post = await _db.SocialPosts
            .Include(p => p.PlatformAccount)
            .FirstAsync(p => p.Id == postId, ct);

        using var platformScope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["Platform"] = post.Platform,
            ["CampaignId"] = post.CampaignId,
            ["AccountId"] = post.PlatformAccountId
        });

        _logger.LogInformation("Starting publish for post {PostId} to {Platform}",
            postId, post.Platform);

        // ... publish logic ...

        // Audit log
        _db.SocialAuditLogs.Add(new SocialAuditLog
        {
            PostId = postId,
            CampaignId = post.CampaignId,
            Action = "Publishing",
            CorrelationId = correlationId,
            Details = JsonSerializer.Serialize(new { post.Platform, post.ScheduledAt })
        });
    }
}
```

---

## 12. ffmpeg Resources

### VPS Sizing

| პარამეტრი | მინიმუმი | რეკომენდებული |
|----------|---------|--------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| Monthly cost | $24 | $48 |
| Provider | Hetzner CX22 / DO Droplet | Hetzner CX32 |

**$5 VPS არ არის საკმარისი!** ffmpeg ვიდეო encoding CPU-intensive-ია. 1080p 60sec ვიდეოს merge-ს 2vCPU-ზე ~30-45 წამი სჭირდება.

### ffmpeg Commands

```bash
# ვიდეო + აუდიო merge (ვიდეოს აუდიო ჩანაცვლდება Czaba ტრეკით)
ffmpeg -i input_video.mp4 -i czaba_audio.mp3 \
  -c:v copy -c:a aac -b:a 192k \
  -map 0:v:0 -map 1:a:0 \
  -shortest \
  output_merged.mp4

# ვიდეო + აუდიო merge (ორიგინალი აუდიოც შერჩეს, czaba ზემოდან)
ffmpeg -i input_video.mp4 -i czaba_audio.mp3 \
  -filter_complex "[0:a]volume=0.3[orig];[1:a]volume=1.0[music];[orig][music]amix=inputs=2:duration=shortest[aout]" \
  -c:v copy -map 0:v:0 -map "[aout]" \
  -c:a aac -b:a 192k \
  output_mixed.mp4

# Instagram Reels ფორმატში კონვერტაცია (9:16, 1080x1920)
ffmpeg -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  output_reel.mp4
```

### C# ffmpeg Service

```csharp
public class FfmpegService
{
    private readonly string _ffmpegPath;
    private readonly string _tempDir;

    public async Task<string> MergeVideoAudio(
        string videoR2Key, string audioR2Key,
        bool keepOriginalAudio, CancellationToken ct)
    {
        // Download from R2
        var videoPath = await _r2Service.DownloadToTemp(videoR2Key, ct);
        var audioPath = await _r2Service.DownloadToTemp(audioR2Key, ct);
        var outputPath = Path.Combine(_tempDir, $"{Guid.NewGuid()}.mp4");

        try
        {
            var args = keepOriginalAudio
                ? $"-i \"{videoPath}\" -i \"{audioPath}\" " +
                  "-filter_complex \"[0:a]volume=0.3[orig];[1:a]volume=1.0[music];" +
                  "[orig][music]amix=inputs=2:duration=shortest[aout]\" " +
                  $"-c:v copy -map 0:v:0 -map \"[aout]\" -c:a aac -b:a 192k \"{outputPath}\""
                : $"-i \"{videoPath}\" -i \"{audioPath}\" " +
                  $"-c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest \"{outputPath}\"";

            var process = Process.Start(new ProcessStartInfo
            {
                FileName = _ffmpegPath,
                Arguments = args,
                RedirectStandardError = true,
                UseShellExecute = false
            });

            await process!.WaitForExitAsync(ct);

            if (process.ExitCode != 0)
            {
                var error = await process.StandardError.ReadToEndAsync(ct);
                throw new FfmpegException($"ffmpeg failed: {error}");
            }

            // Upload merged file to R2
            var mergedKey = $"social/merged/{Guid.NewGuid()}.mp4";
            await _r2Service.Upload(outputPath, mergedKey, ct);

            return mergedKey;
        }
        finally
        {
            // Cleanup temp files
            File.Delete(videoPath);
            File.Delete(audioPath);
            File.Delete(outputPath);
        }
    }
}
```

### R2 Integration

```
R2 Bucket Structure:
social/
├── raw/           # AI-დან ატვირთული ვიდეოები
│   └── {guid}.mp4
├── merged/        # ffmpeg merge-ის შედეგი
│   └── {guid}.mp4
└── thumbnails/    # auto-generated thumbnails
    └── {guid}.jpg
```

---

## 13. Admin Panel UI

### 9 გვერდი

#### 13.1 Campaigns List (`/social/campaigns`)
- ცხრილი: Name, Status (badge), Posts count, Published/Failed, Date range
- ფილტრები: Status, Date range
- Actions: View, Edit, Pause, Cancel, Delete
- "New Campaign" ღილაკი

#### 13.2 Campaign Create/Edit (`/social/campaigns/new`, `/social/campaigns/:id/edit`)
- Wizard-style 3 steps:
  1. **Basic Info**: Name, Description, Default Hashtags
  2. **Platform Selection**: Checkboxes (FB, IG, TikTok) + Account selection
  3. **Schedule**: Start date, Posting frequency (1x/day, 2x/day, custom)
- Draft save ყოველ step-ზე

#### 13.3 Batch Video Prompts (`/social/campaigns/:id/prompts`)
- Textarea list: 30 ხაზი = 30 prompt
- თითოეულ prompt-ს: Title, Description, Hashtags fields
- "Generate All" - ტემპლეიტიდან auto-fill
- "Duplicate to All Platforms" checkbox
- CSV import/export
- Preview grid (3 columns: FB, IG, TikTok)

#### 13.4 Post Calendar (`/social/campaigns/:id/calendar`)
- Month view calendar
- Drag & drop posts to reschedule
- Color coding: 🔵 Pending, 🟡 Queued, 🟢 Published, 🔴 Failed
- Click post → detail sidebar
- FullCalendar.js library

#### 13.5 Platform Accounts (`/social/accounts`)
- Cards: Facebook Page, Instagram Business, TikTok Account
- "Connect" ღილაკი (OAuth flow)
- Token status: ✅ Active, ⚠️ Expiring Soon, ❌ Expired
- Last used date
- "Refresh Token" manual ღილაკი
- "Disconnect" with confirmation

#### 13.6 Post Detail (`/social/posts/:id`)
- Video preview player
- Post metadata (title, description, hashtags)
- Status timeline (Created → Scheduled → Publishing → Published)
- Platform response (post URL, error message)
- Audit log table
- Actions: Retry (if failed), Cancel (if pending), View on Platform

#### 13.7 Analytics Dashboard (`/social/analytics`)
- Overview cards: Total Posts, Total Views, Avg Engagement Rate
- Charts: Views over time (line), Engagement by platform (bar)
- Top performing posts table
- Campaign comparison
- Date range filter
- recharts library

#### 13.8 Content Library (`/social/media`)
- Grid view: video thumbnails
- Upload ვიდეო (drag & drop → R2)
- Audio track selection (from Czaba products)
- "Merge" ღილაკი (ვიდეო + აუდიო)
- Merge status indicator
- Filter: raw, merged, by campaign

#### 13.9 Settings (`/social/settings`)
- Default hashtags per platform
- Default posting times
- Auto-retry configuration (max retries, delay)
- AI disclosure text customization
- TikTok feature toggle (pending app review)
- Notification preferences

---

## 14. Batch Video Production Pipeline

### Step-by-Step Workflow

```
Day 1-2: Content Creation
═════════════════════════

Step 1: Write Prompts (Admin Panel)
───────────────────────────────────
• Open /social/campaigns/new
• Name: "February Cinematic Promos"
• Write 30 video prompts in batch prompt editor
• Example prompts:
  - "Cinematic drone shot over foggy mountains, slow motion, golden hour"
  - "Close-up of piano keys being played, moody blue lighting, shallow DOF"
  - "Time-lapse of city skyline at sunset transitioning to night"

Step 2: Generate Videos with AI Tools (Manual, outside system)
──────────────────────────────────────────────────────────────
• Copy prompts from admin panel
• Generate in: Seedance / Runway Gen-4 / Kling AI / Google Veo 2
• Target: 1080x1920 (9:16) for Reels/TikTok, also 1920x1080 for FB
• Save locally

Step 3: Upload Videos to System
───────────────────────────────
• Open /social/media (Content Library)
• Drag & drop 30 videos
• System uploads to R2 (social/raw/)
• Auto-validation runs (ffprobe checks)

Step 4: Select Audio & Merge
────────────────────────────
• For each video: select Czaba audio track or SFX
• Click "Merge" → Hangfire job → ffmpeg processing
• Wait for all merges to complete (~15-20 minutes for 30 videos)
• Preview merged results

Step 5: Write Titles, Descriptions, Tags
─────────────────────────────────────────
• Batch prompt editor: fill Title, Description, Hashtags per post
• "Duplicate to platforms" → copies to FB, IG, TikTok variants
• Customize per platform if needed
• AI disclosure auto-appended

Step 6: Schedule Posts (Calendar View)
──────────────────────────────────────
• Open calendar view
• System auto-distributes: 1 post/day/platform over 30 days
• Drag & drop to adjust dates
• Set posting times: FB 10:00, IG 14:00, TikTok 19:00 (peak hours)

Step 7: Launch Campaign
───────────────────────
• Review summary
• Click "Schedule Campaign" → Draft → Scheduled
• Hangfire creates jobs for each post at scheduled times


Day 3-32: Automated Publishing
══════════════════════════════

• Hangfire fires jobs at scheduled times
• Rate limiter checks → publish → update status
• Failed posts → auto-retry (up to 3 times, exponential backoff)
• Analytics sync every hour
• Token refresh runs daily at 03:00 UTC
• Admin monitors dashboard for any issues
```

---

## 15. Build vs Buy ROI Analysis

### Development Cost

| Phase | Sprints | Dev Hours | Description |
|-------|---------|-----------|-------------|
| Phase 1 (MVP) | 2 sprints | 80h | DB + API + FB publish + basic UI |
| Phase 2 | 2 sprints | 80h | IG Reels + TikTok + ffmpeg + OAuth |
| Phase 3 | 1 sprint | 40h | Analytics + Calendar + Batch editor |
| Phase 4 | 1 sprint | 40h | Polish, testing, monitoring |
| **Total** | **6 sprints** | **240h** | |

### Monthly Operational Cost

| Item | Cost |
|------|------|
| VPS (ffmpeg processing) | $30/month |
| R2 Storage (50GB video) | $0.75/month |
| R2 Egress (Class B operations) | ~$2/month |
| Hangfire (open source) | $0 |
| Meta API | $0 |
| TikTok API | $0 |
| **Total** | **~$33/month** |

### Manual Posting Time (without system)

| Task | Time/day | Monthly |
|------|----------|---------|
| ვიდეოს მომზადება 3 პლატფორმისთვის | 15 min | 7.5h |
| Title/description/tags writing | 10 min | 5h |
| Manual posting 3 platforms | 15 min | 7.5h |
| Analytics checking | 10 min | 5h |
| **Total** | **50 min/day** | **25h/month** |

### ROI Calculation

```
Manual cost: 25h/month × $50/h (your time value) = $1,250/month
System cost: $33/month operational
System build: 240h × $50/h = $12,000 one-time

Monthly savings: $1,250 - $33 = $1,217/month
Break-even: $12,000 / $1,217 = ~10 months

But: system ასევე scales — 60 videos/month = same cost
Manual 60 videos = 50h/month = $2,500/month
```

---

## 16. MVP Phases

### Phase 1: Manual Upload + Scheduling + Facebook (2 sprints)

```
Backend:
- [ ] SocialCampaign, SocialPost, SocialPlatformAccount tables
- [ ] Campaign CRUD endpoints
- [ ] Post CRUD + Batch Create endpoints
- [ ] Meta OAuth flow (FB only)
- [ ] Facebook publish service
- [ ] Hangfire setup + scheduled post processor
- [ ] Basic idempotency

Admin:
- [ ] Campaigns list page
- [ ] Campaign create form
- [ ] Posts list with status
- [ ] Platform accounts page (FB connect)
- [ ] Manual publish button
```

### Phase 2: Instagram + TikTok + ffmpeg (2 sprints)

```
Backend:
- [ ] Instagram Reels 2-step publish + polling job
- [ ] TikTok Content Posting API integration
- [ ] TikTok OAuth flow
- [ ] ffmpeg service (video + audio merge)
- [ ] Video validation service (ffprobe)
- [ ] Rate limit tracker
- [ ] Token refresh recurring job
- [ ] AI content disclosure service

Admin:
- [ ] Content library page (upload, merge)
- [ ] Batch prompt editor
- [ ] Post detail page with audit log
```

### Phase 3: Analytics + Calendar + Optimization (1 sprint)

```
Backend:
- [ ] Analytics sync service (FB Insights, IG Insights, TikTok Analytics)
- [ ] SocialAnalytics table + endpoints
- [ ] Campaign state machine (pause/resume/cancel)

Admin:
- [ ] Calendar view (FullCalendar.js)
- [ ] Analytics dashboard (recharts)
- [ ] Campaign analytics page
- [ ] Drag & drop rescheduling
```

### Phase 4: Polish + Templates (1 sprint)

```
Backend:
- [ ] Structured logging (Serilog → SocialLogs table)
- [ ] Comprehensive error handling
- [ ] Hangfire dashboard auth

Admin:
- [ ] Settings page
- [ ] CSV import/export
- [ ] Post templates
- [ ] Notification system (failed posts alert)
- [ ] Mobile-responsive UI fixes
```

---

## 17. Facebook Video Publish API (Resumable Upload)

Facebook Page-ზე ვიდეოს პოსტვა IG Reels-ისგან განსხვავებული flow-ა:

### Resumable Upload Flow (recommended for files > 1MB)

```
Step 1: Initialize Upload Session
POST https://graph.facebook.com/v21.0/{page-id}/videos
  ?upload_phase=start
  &file_size={size_in_bytes}
  &access_token={page_access_token}
  → { upload_session_id, start_offset, end_offset }

Step 2: Upload Chunks
POST https://graph.facebook.com/v21.0/{page-id}/videos
  ?upload_phase=transfer
  &upload_session_id={session_id}
  &start_offset={offset}
  &video_file_chunk={binary}
  → { start_offset, end_offset }
  (repeat until all chunks uploaded)

Step 3: Finish Upload
POST https://graph.facebook.com/v21.0/{page-id}/videos
  ?upload_phase=finish
  &upload_session_id={session_id}
  &title={title}
  &description={description}
  → { id, success: true }
```

### C# Implementation

```csharp
public class FacebookPublisher
{
    private const int ChunkSize = 4 * 1024 * 1024; // 4MB chunks

    public async Task<string> Publish(
        SocialPost post, SocialPlatformAccount account, CancellationToken ct)
    {
        var pageToken = _encryption.Decrypt(account.PageAccessToken);
        var videoPath = await _r2Service.DownloadToTemp(post.VideoUrl!, ct);

        try
        {
            var fileSize = new FileInfo(videoPath).Length;

            // Step 1: Start
            var startResponse = await _httpClient.PostAsync(
                $"https://graph.facebook.com/v21.0/{account.PageId}/videos" +
                $"?upload_phase=start&file_size={fileSize}&access_token={pageToken}",
                null, ct);

            var session = await startResponse.Content
                .ReadFromJsonAsync<FbUploadSession>(ct);

            // Step 2: Transfer chunks
            await using var fileStream = File.OpenRead(videoPath);
            var offset = session!.StartOffset;

            while (offset < fileSize)
            {
                var chunkLength = (int)Math.Min(ChunkSize, fileSize - offset);
                var chunk = new byte[chunkLength];
                await fileStream.ReadExactlyAsync(chunk, ct);

                using var content = new MultipartFormDataContent();
                content.Add(new ByteArrayContent(chunk), "video_file_chunk", "chunk.mp4");

                var transferResponse = await _httpClient.PostAsync(
                    $"https://graph.facebook.com/v21.0/{account.PageId}/videos" +
                    $"?upload_phase=transfer&upload_session_id={session.UploadSessionId}" +
                    $"&start_offset={offset}&access_token={pageToken}",
                    content, ct);

                var result = await transferResponse.Content
                    .ReadFromJsonAsync<FbTransferResult>(ct);
                offset = result!.StartOffset;
            }

            // Step 3: Finish
            var caption = _disclosureService.BuildCaption(post);
            var finishResponse = await _httpClient.PostAsync(
                $"https://graph.facebook.com/v21.0/{account.PageId}/videos" +
                $"?upload_phase=finish&upload_session_id={session.UploadSessionId}" +
                $"&title={Uri.EscapeDataString(post.Title ?? "")}" +
                $"&description={Uri.EscapeDataString(caption)}" +
                $"&access_token={pageToken}",
                null, ct);

            var published = await finishResponse.Content
                .ReadFromJsonAsync<FbPublishResult>(ct);

            return published!.Id;
        }
        finally
        {
            File.Delete(videoPath);
        }
    }
}
```

---

## 18. Webhook-based Status Updates

Polling-ის ნაცვლად webhook-ები უფრო ეფექტურია publish status-ის ტრეკინგისთვის.

### TikTok Webhook

```csharp
// TikTok publish API supports callback URL
// POST init request-ში ვამატებთ:
var initRequest = new
{
    post_info = new { /* ... */ },
    source_info = new { source = "PULL_FROM_URL", video_url = url },
    // Webhook callback
    post_mode = "MEDIA_UPLOAD",
    callback_url = "https://api.czaba.ge/api/social/webhooks/tiktok"
};

// Webhook endpoint
[HttpPost("webhooks/tiktok")]
public async Task<IResult> TikTokWebhook(
    [FromBody] TikTokWebhookPayload payload, CancellationToken ct)
{
    // Verify webhook signature
    if (!VerifyTikTokSignature(Request))
        return Results.Unauthorized();

    var post = await _db.SocialPosts
        .FirstOrDefaultAsync(p => p.PlatformPostId == payload.PublishId, ct);

    if (post == null) return Results.NotFound();

    if (payload.Status == "PUBLISH_COMPLETE")
    {
        post.Status = "Published";
        post.PublishedAt = DateTime.UtcNow;
        post.PlatformUrl = payload.ShareUrl;
    }
    else if (payload.Status == "FAILED")
    {
        post.Status = "Failed";
        post.ErrorMessage = payload.ErrorCode;
    }

    await _db.SaveChangesAsync(ct);
    return Results.Ok();
}
```

### Meta Webhooks for Pages

```csharp
// Meta webhook subscription for video status
// Subscribe to: feed, videos topics

[HttpGet("webhooks/meta")]
public IResult VerifyWebhook(
    [FromQuery(Name = "hub.mode")] string mode,
    [FromQuery(Name = "hub.verify_token")] string verifyToken,
    [FromQuery(Name = "hub.challenge")] string challenge)
{
    if (mode == "subscribe" && verifyToken == _config.MetaWebhookVerifyToken)
        return Results.Ok(challenge);
    return Results.Forbidden();
}

[HttpPost("webhooks/meta")]
public async Task<IResult> MetaWebhook(
    [FromBody] MetaWebhookPayload payload, CancellationToken ct)
{
    // Verify X-Hub-Signature-256 header
    if (!VerifyMetaSignature(Request))
        return Results.Unauthorized();

    foreach (var entry in payload.Entry)
    {
        foreach (var change in entry.Changes)
        {
            if (change.Field == "videos" && change.Value.Status == "ready")
            {
                // Video processing complete
                await UpdatePostStatus(change.Value.VideoId, "Published", ct);
            }
        }
    }

    return Results.Ok();
}
```

### Hybrid Approach: Webhook + Polling Fallback

```csharp
// Webhook = primary, Polling = fallback (if webhook fails)
// Hangfire recurring job ამოწმებს "stuck" posts
RecurringJob.AddOrUpdate<StuckPostChecker>(
    "check-stuck-posts",
    job => job.CheckAndResolve(CancellationToken.None),
    "*/10 * * * *"); // ყოველ 10 წუთში

public class StuckPostChecker
{
    public async Task CheckAndResolve(CancellationToken ct)
    {
        // Posts that have been "Publishing" for > 20 minutes
        var stuckThreshold = DateTime.UtcNow.AddMinutes(-20);

        var stuckPosts = await _db.SocialPosts
            .Where(p => p.Status == "Publishing"
                     && p.UpdatedAt < stuckThreshold)
            .ToListAsync(ct);

        foreach (var post in stuckPosts)
        {
            // Poll platform API directly as fallback
            var status = post.Platform switch
            {
                "Instagram" => await _igService.CheckStatus(post, ct),
                "TikTok" => await _ttService.CheckStatus(post, ct),
                _ => null
            };

            if (status != null)
                await UpdateFromPollResult(post, status, ct);
        }
    }
}
```

---

## 19. Circuit Breaker Pattern

### პრობლემა
თუ Meta API down-ია და 90 scheduled post-ის retry ერთდროულად fire-დება = სისტემას თვითონ ვაზიანებთ.

### Polly Circuit Breaker

```csharp
// NuGet: Microsoft.Extensions.Http.Resilience (Polly v8)

// Program.cs
builder.Services.AddHttpClient("MetaApi")
    .AddStandardResilienceHandler(options =>
    {
        // Circuit breaker: 5 failures in 30sec → open for 60sec
        options.CircuitBreaker = new HttpCircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,
            SamplingDuration = TimeSpan.FromSeconds(30),
            MinimumThroughput = 5,
            BreakDuration = TimeSpan.FromSeconds(60),
            ShouldHandle = new PredicateBuilder<HttpResponseMessage>()
                .HandleResult(r => r.StatusCode == HttpStatusCode.TooManyRequests
                                || r.StatusCode >= HttpStatusCode.InternalServerError)
        };

        // Retry: 3 attempts with exponential backoff
        options.Retry = new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = 3,
            Delay = TimeSpan.FromSeconds(2),
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true
        };
    });

builder.Services.AddHttpClient("TikTokApi")
    .AddStandardResilienceHandler(/* similar config */);
```

### Publish Service Integration

```csharp
public class PublishingService
{
    public async Task ProcessScheduledPosts(CancellationToken ct)
    {
        var pendingPosts = await GetPendingPosts(ct);

        // Group by platform - if one platform is down, others still work
        foreach (var platformGroup in pendingPosts.GroupBy(p => p.Platform))
        {
            foreach (var post in platformGroup)
            {
                try
                {
                    if (!await _rateLimiter.CanPublish(post.Platform, post.PlatformAccountId, ct))
                    {
                        _logger.LogWarning("Rate limit reached for {Platform}", post.Platform);
                        break; // stop this platform, continue others
                    }

                    await _idempotentPublisher.PublishWithIdempotency(post, ct);
                    await _rateLimiter.RecordUsage(post.Platform, post.PlatformAccountId, ct);
                }
                catch (BrokenCircuitException)
                {
                    _logger.LogWarning(
                        "Circuit open for {Platform} - skipping remaining posts",
                        post.Platform);
                    break; // circuit open - stop trying this platform
                }
            }
        }
    }
}
```

---

## 20. Multi-Format Auto-Transcode Pipeline

### პრობლემა
ერთი ვიდეო 3 პლატფორმას 3 სხვადასხვა ფორმატში სჭირდება.

### Auto-Transcode on Upload

```csharp
public class VideoTranscodeService
{
    // ერთი source ვიდეოდან 3 ვარიანტი
    public async Task<TranscodeResult> TranscodeForAllPlatforms(
        string sourceR2Key, CancellationToken ct)
    {
        var sourcePath = await _r2Service.DownloadToTemp(sourceR2Key, ct);
        var result = new TranscodeResult();

        try
        {
            // Facebook: 1920x1080 (16:9), H.264, up to 240min
            result.FacebookKey = await Transcode(sourcePath, new TranscodeOptions
            {
                Width = 1920, Height = 1080,
                AspectRatio = "16:9",
                Codec = "libx264",
                Preset = "medium",
                Suffix = "fb"
            }, ct);

            // Instagram Reels: 1080x1920 (9:16), H.264, max 90sec
            result.InstagramKey = await Transcode(sourcePath, new TranscodeOptions
            {
                Width = 1080, Height = 1920,
                AspectRatio = "9:16",
                Codec = "libx264",
                Preset = "medium",
                MaxDuration = 90,
                Suffix = "ig"
            }, ct);

            // TikTok: 1080x1920 (9:16), H.264, max 180sec
            result.TikTokKey = await Transcode(sourcePath, new TranscodeOptions
            {
                Width = 1080, Height = 1920,
                AspectRatio = "9:16",
                Codec = "libx264",
                Preset = "medium",
                MaxDuration = 180,
                Suffix = "tt"
            }, ct);
        }
        finally
        {
            File.Delete(sourcePath);
        }

        return result;
    }

    private async Task<string> Transcode(
        string inputPath, TranscodeOptions options, CancellationToken ct)
    {
        var outputPath = Path.Combine(_tempDir,
            $"{Guid.NewGuid()}_{options.Suffix}.mp4");

        var durationArg = options.MaxDuration.HasValue
            ? $"-t {options.MaxDuration}" : "";

        var args = $"-i \"{inputPath}\" " +
            $"-vf \"scale={options.Width}:{options.Height}:" +
            $"force_original_aspect_ratio=decrease," +
            $"pad={options.Width}:{options.Height}:(ow-iw)/2:(oh-ih)/2\" " +
            $"-c:v {options.Codec} -preset {options.Preset} -crf 23 " +
            $"-c:a aac -b:a 128k -movflags +faststart " +
            $"{durationArg} \"{outputPath}\"";

        await RunFfmpeg(args, ct);

        var r2Key = $"social/transcoded/{Guid.NewGuid()}_{options.Suffix}.mp4";
        await _r2Service.Upload(outputPath, r2Key, ct);
        File.Delete(outputPath);

        return r2Key;
    }
}
```

### SocialPost ცხრილში ცვლილება

```sql
-- SocialPost-ში VideoUrl-ის ნაცვლად platform-specific URL-ები
ALTER TABLE SocialPost ADD
    FacebookVideoUrl    NVARCHAR(500),  -- 16:9 version
    InstagramVideoUrl   NVARCHAR(500),  -- 9:16 version
    TikTokVideoUrl      NVARCHAR(500);  -- 9:16 version

-- Publish-ის დროს platform-ის მიხედვით correct URL აირჩევა
```

---

## 21. Analytics API Specifics

### Facebook Page Insights

```
GET https://graph.facebook.com/v21.0/{video-id}/video_insights
  ?metric=total_video_views,total_video_impressions,
          total_video_reactions_by_type_total,
          total_video_comments,total_video_shares
  &access_token={page_token}

GET https://graph.facebook.com/v21.0/{page-id}/insights
  ?metric=page_video_views,page_engaged_users
  &period=day
  &since={start_date}
  &until={end_date}
```

### Instagram Reels Insights

```
GET https://graph.facebook.com/v21.0/{media-id}/insights
  ?metric=plays,reach,likes,comments,shares,saved,
          total_interactions
  &access_token={page_token}
```

### TikTok Video Analytics

```
POST https://open.tiktokapis.com/v2/video/query/
  ?fields=id,like_count,comment_count,share_count,view_count
  Headers: Authorization: Bearer {access_token}
  Body: { "filters": { "video_ids": ["id1", "id2"] } }
```

### Analytics Sync Service

```csharp
public class AnalyticsSyncService
{
    [AutomaticRetry(Attempts = 2)]
    public async Task SyncAll(CancellationToken ct)
    {
        var publishedPosts = await _db.SocialPosts
            .Where(p => p.Status == "Published"
                     && p.PublishedAt > DateTime.UtcNow.AddDays(-60))
            .Include(p => p.PlatformAccount)
            .ToListAsync(ct);

        foreach (var post in publishedPosts)
        {
            try
            {
                var metrics = post.Platform switch
                {
                    "Facebook" => await FetchFacebookMetrics(post, ct),
                    "Instagram" => await FetchInstagramMetrics(post, ct),
                    "TikTok" => await FetchTikTokMetrics(post, ct),
                    _ => null
                };

                if (metrics != null)
                {
                    _db.SocialAnalytics.Add(new SocialAnalytics
                    {
                        PostId = post.Id,
                        Views = metrics.Views,
                        Likes = metrics.Likes,
                        Comments = metrics.Comments,
                        Shares = metrics.Shares,
                        Saves = metrics.Saves,
                        Reach = metrics.Reach,
                        EngagementRate = metrics.CalculateEngagementRate()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to sync analytics for post {PostId}", post.Id);
            }
        }

        await _db.SaveChangesAsync(ct);
    }
}
```

---

## 22. AI-Assisted Prompt Generation (Bonus)

30 prompt-ის ხელით წერა შრომატევადია. Claude/ChatGPT API integration:

### Prompt Generator in Admin UI

```typescript
// Admin panel - batch prompt generator
async function generatePrompts(params: {
  theme: string;       // "cinematic nature", "urban nightlife", etc.
  count: number;       // 30
  style: string;       // "dramatic", "peaceful", "energetic"
  product: string;     // "epic orchestral track", "ambient SFX pack"
}) {
  const response = await apiClient.post("/api/social/prompts/generate", params);
  return response.data.prompts; // string[]
}
```

### Backend endpoint (Claude API)

```csharp
[HttpPost("prompts/generate")]
public async Task<IResult> GeneratePrompts(
    GeneratePromptsRequest request, CancellationToken ct)
{
    var systemPrompt = $"""
        You are a video prompt writer for AI video generation tools
        (Seedance, Runway, Kling). Generate {request.Count} unique
        video prompts for {request.Theme} theme.

        Style: {request.Style}
        Product being promoted: {request.Product}

        Each prompt should be 1-2 sentences describing a cinematic scene.
        Focus on: camera movement, lighting, mood, composition.
        Output as JSON array of strings.
        """;

    var result = await _claudeClient.CreateMessageAsync(new()
    {
        Model = "claude-sonnet-4-20250514",
        MaxTokens = 2000,
        System = systemPrompt,
        Messages = [new() { Role = "user", Content = "Generate the prompts." }]
    }, ct);

    var prompts = JsonSerializer.Deserialize<string[]>(
        result.Content[0].Text);

    return Results.Ok(new { prompts });
}
```

---

## ვერიფიკაცია

- [ ] Unit tests: Publishing services, State machine, Rate limiter
- [ ] Integration tests: Meta API mock, TikTok API mock
- [ ] E2E: Campaign create → schedule → publish flow
- [ ] Security: Token encryption, OAuth CSRF protection
- [ ] Load test: 30 posts batch scheduling
- [ ] Manual: OAuth flows on real accounts (sandbox first)
