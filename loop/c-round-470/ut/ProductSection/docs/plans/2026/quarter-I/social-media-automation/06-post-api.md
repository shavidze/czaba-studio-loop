# 06 - Post CRUD + Batch Create API

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 1 (Core APIs) |
| **Depends On** | 01 (database), 02 (models/DTOs) |
| **Blocks** | 09, 10, 11 (publishers), 13 (orchestrator), A2 (admin posts pages) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Post CRUD endpoints + Batch Create (30 პოსტი ერთი request-ით) + Calendar view endpoint.

## API Endpoints

```
POST   /api/social/posts                    -- ერთი პოსტის შექმნა
POST   /api/social/posts/batch              -- batch (30 posts ერთად)
GET    /api/social/posts                    -- სია (by campaign, platform, status, paginated)
GET    /api/social/posts/{id}               -- დეტალები + audit logs
PUT    /api/social/posts/{id}               -- განახლება (მხოლოდ Pending)
DELETE /api/social/posts/{id}               -- წაშლა (მხოლოდ Pending)
POST   /api/social/posts/{id}/publish       -- manual publish now
POST   /api/social/posts/{id}/retry         -- Failed → retry (increment RetryCount)
POST   /api/social/posts/{id}/cancel        -- Pending → Cancelled
GET    /api/social/posts/calendar            -- calendar view (date range query)
```

## რა უნდა გაკეთდეს

### 1. SocialPostController

Minimal API endpoints.

### 2. SocialPostService

- Single create + batch create
- Batch: validate all 30 posts first, then insert in transaction
- Calendar endpoint: return posts grouped by date for a given date range
- IdempotencyKey auto-generation: `publish:{Id}:{Platform}:{RetryCount}`
- Manual publish: immediately enqueue Hangfire job
- Retry: increment RetryCount, new IdempotencyKey, re-enqueue

### 3. Batch Create Logic

```csharp
public async Task<List<PostResponse>> BatchCreate(
    BatchCreatePostsRequest request, CancellationToken ct)
{
    // Validate all
    // Generate IdempotencyKeys
    // Insert all in single transaction
    // If campaign is Scheduled → create Hangfire jobs for each
    // Return created posts
}
```

### 4. Calendar Query

```csharp
// GET /api/social/posts/calendar?startDate=2026-03-01&endDate=2026-03-31&campaignId=5
// Returns: { date: "2026-03-01", posts: [...] }[]
```

## ვერიფიკაცია

- [ ] Single create მუშაობს
- [ ] Batch create 30 posts ერთი request-ით
- [ ] Batch validation: ერთი invalid post = მთელი batch fails
- [ ] Calendar endpoint აბრუნებს date-grouped data
- [ ] Edit/Delete მხოლოდ Pending status-ზე მუშაობს
- [ ] Manual publish enqueues Hangfire job
