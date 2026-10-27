# 13 - Publish Orchestrator (Idempotency + Rate Limit + Circuit Breaker + Scheduler)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 3 (Orchestration) |
| **Depends On** | 09 (FB publish), 10 (IG publish), 11 (TT publish), 03 (Hangfire) |
| **Blocks** | - (ეს არის publishing-ის ცენტრალური კომპონენტი) |
| **Project** | `backend` |
| **Est. Hours** | 10h |
| **Status** | `pending` |

## აღწერა

Publishing-ის ორკესტრაცია: scheduled post processor, idempotency guard, rate limiting, circuit breaker pattern (Polly).

## რა უნდა გაკეთდეს

### 1. ScheduledPostProcessor (Hangfire Recurring - every 5 min)

```csharp
// ყოველ 5 წუთში: find Pending posts where ScheduledAt <= now
// Group by platform
// For each platform: check rate limit → check circuit → publish with idempotency
```

### 2. IdempotentPublisher

- IdempotencyKey: `publish:{PostId}:{Platform}:{RetryCount}`
- Serializable transaction: check existing → set Publishing → commit
- Unique constraint violation = duplicate → skip
- On success: Published + PlatformPostId + PublishedAt
- On failure: Failed + ErrorMessage + increment RetryCount
- Auto-retry: schedule new job with exponential backoff (5min * RetryCount)
- Max 3 retries

### 3. RateLimitTracker

- Daily sliding window per platform per account
- Conservative limits: FB=50, IG=25, TikTok=20
- `CanPublish(platform, accountId)` → bool
- `RecordUsage(platform, accountId)` → void
- Uses SocialRateLimit table

### 4. Circuit Breaker (Polly v8)

NuGet: `Microsoft.Extensions.Http.Resilience`

```csharp
builder.Services.AddHttpClient("MetaApi")
    .AddStandardResilienceHandler(options => {
        options.CircuitBreaker = new HttpCircuitBreakerStrategyOptions {
            FailureRatio = 0.5,
            SamplingDuration = TimeSpan.FromSeconds(30),
            MinimumThroughput = 5,
            BreakDuration = TimeSpan.FromSeconds(60)
        };
        options.Retry = new HttpRetryStrategyOptions {
            MaxRetryAttempts = 3,
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true
        };
    });
```

- Separate HTTP clients per platform: MetaApi, TikTokApi
- BrokenCircuitException → skip remaining posts for that platform
- Platform isolation: FB down ≠ IG down

### 5. Publishing Flow

```
ScheduledPostProcessor (every 5min)
  → Get pending posts (ScheduledAt <= now)
  → Group by Platform
  → For each platform group:
      → Check circuit breaker state
      → For each post:
          → RateLimitTracker.CanPublish() ?
          → IdempotentPublisher.PublishWithIdempotency()
          → RateLimitTracker.RecordUsage()
          → Catch BrokenCircuitException → break platform group
```

## ვერიფიკაცია

- [ ] Scheduled posts publish at correct time (within 5min window)
- [ ] Duplicate publish blocked by idempotency
- [ ] Rate limit stops publishing when limit reached
- [ ] Circuit breaker opens after 5 failures in 30sec
- [ ] Platform isolation: FB circuit open, IG still publishes
- [ ] Auto-retry with exponential backoff works
- [ ] Campaign status updates: Publishing → Active → Completed
