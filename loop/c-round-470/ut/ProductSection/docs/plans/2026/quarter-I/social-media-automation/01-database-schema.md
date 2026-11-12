# 01 - Database Schema

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 0 (Foundation) |
| **Depends On** | - (არაფერი) |
| **Blocks** | 05, 06, 07, 08 (ყველა Layer 1 task) |
| **Project** | `backend` |
| **Est. Hours** | 4h |
| **Status** | `pending` |

## აღწერა

შექმენი Social Media ავტომატიზაციის 6 SQL ცხრილი MSSQL-ში.

## რა უნდა გაკეთდეს

### 1. Migration Script შექმნა

ფაილი: `backend/docs/database/scripts/tables/Social_*.sql`

### 2. ცხრილები

#### SocialCampaign
```sql
CREATE TABLE SocialCampaign (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Name            NVARCHAR(200) NOT NULL,
    Description     NVARCHAR(1000),
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Draft',
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

#### SocialPlatformAccount
```sql
CREATE TABLE SocialPlatformAccount (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    Platform        NVARCHAR(20) NOT NULL,
    AccountName     NVARCHAR(200) NOT NULL,
    AccountId       NVARCHAR(200) NOT NULL,
    AccessToken     VARBINARY(MAX) NOT NULL,
    RefreshToken    VARBINARY(MAX),
    TokenExpiresAt  DATETIME2,
    PageId          NVARCHAR(100),
    PageAccessToken VARBINARY(MAX),
    InstagramBusinessAccountId NVARCHAR(100),
    IsActive        BIT NOT NULL DEFAULT 1,
    LastUsedAt      DATETIME2,
    TokenRefreshedAt DATETIME2,
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
```

#### SocialPost (SocialSchedule merged)
```sql
CREATE TABLE SocialPost (
    Id                  INT IDENTITY(1,1) PRIMARY KEY,
    CampaignId          INT NOT NULL REFERENCES SocialCampaign(Id),
    Platform            NVARCHAR(20) NOT NULL,
    PlatformAccountId   INT NOT NULL REFERENCES SocialPlatformAccount(Id),
    Title               NVARCHAR(300),
    Description         NVARCHAR(2000),
    Hashtags            NVARCHAR(500),
    VideoUrl            NVARCHAR(500),
    OriginalVideoUrl    NVARCHAR(500),
    AudioTrackId        INT,
    FacebookVideoUrl    NVARCHAR(500),
    InstagramVideoUrl   NVARCHAR(500),
    TikTokVideoUrl      NVARCHAR(500),
    ScheduledAt         DATETIME2 NOT NULL,
    PublishedAt         DATETIME2,
    Status              NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    HangfireJobId       NVARCHAR(100),
    PlatformPostId      NVARCHAR(200),
    PlatformUrl         NVARCHAR(500),
    ErrorMessage        NVARCHAR(2000),
    RetryCount          INT NOT NULL DEFAULT 0,
    MaxRetries          INT NOT NULL DEFAULT 3,
    IdempotencyKey      NVARCHAR(200) NOT NULL,
    IsAiGenerated       BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt           DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_SocialPost_Campaign (CampaignId),
    INDEX IX_SocialPost_ScheduledAt (ScheduledAt) WHERE Status = 'Pending',
    INDEX IX_SocialPost_Platform (Platform, Status),
    CONSTRAINT UQ_IdempotencyKey UNIQUE (IdempotencyKey)
);
```

#### SocialAnalytics
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

#### SocialAuditLog
```sql
CREATE TABLE SocialAuditLog (
    Id              INT IDENTITY(1,1) PRIMARY KEY,
    PostId          INT REFERENCES SocialPost(Id),
    CampaignId      INT REFERENCES SocialCampaign(Id),
    Action          NVARCHAR(50) NOT NULL,
    Details         NVARCHAR(MAX),
    CorrelationId   UNIQUEIDENTIFIER NOT NULL,
    CreatedAt       DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CreatedBy       INT REFERENCES [User](Id),
    INDEX IX_AuditLog_Post (PostId),
    INDEX IX_AuditLog_Correlation (CorrelationId)
);
```

#### SocialRateLimit
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

## ვერიფიკაცია

- [ ] ყველა ცხრილი იქმნება წარმატებით MSSQL-ში
- [ ] Foreign keys სწორად არის
- [ ] Indexes სწორ columns-ზეა
- [ ] Filtered index (WHERE Status = 'Pending') მუშაობს
