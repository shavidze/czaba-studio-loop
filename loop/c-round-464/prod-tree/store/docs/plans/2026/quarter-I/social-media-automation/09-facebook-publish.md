# 09 - Facebook Publish Service

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 2 (Publishing) |
| **Depends On** | 06 (post API), 07 (Meta OAuth) |
| **Blocks** | 13 (orchestrator), 14 (webhooks), 15 (analytics) |
| **Project** | `backend` |
| **Est. Hours** | 6h |
| **Status** | `pending` |

## აღწერა

Facebook Page Video publish - Resumable Upload API (3-step: start → transfer chunks → finish).

## რა უნდა გაკეთდეს

### 1. FacebookPublisher Service

**Implements** `IFacebookPublisher`

#### Resumable Upload Flow

```
POST /{page-id}/videos?upload_phase=start&file_size={bytes}
  → { upload_session_id, start_offset, end_offset }

POST /{page-id}/videos?upload_phase=transfer&upload_session_id={id}&start_offset={n}
  + multipart video_file_chunk
  → { start_offset, end_offset }
  (repeat until done)

POST /{page-id}/videos?upload_phase=finish&upload_session_id={id}&title=...&description=...
  → { id, success }
```

### 2. Implementation Details

- 4MB chunk size
- Download video from R2 → temp file → chunked upload → cleanup
- Page Access Token from SocialPlatformAccount (decrypted)
- Caption includes AI disclosure text
- Graph API version: v21.0

### 3. AI Content Disclosure

```csharp
// Caption-ში auto-append:
if (post.IsAiGenerated)
    caption += "\n\n🤖 Created with AI-generated visuals";
```

### 4. Error Handling

- 400/403 → Mark post as Failed with error message
- 429 (rate limit) → Reschedule via Hangfire with delay
- 5xx → Retry (handled by circuit breaker in task 13)

## ვერიფიკაცია

- [ ] Publish to Facebook Page works (sandbox)
- [ ] Chunked upload handles large files (>50MB)
- [ ] AI disclosure text appears in post
- [ ] Failed publish sets correct error message
- [ ] Returns Facebook post ID on success
