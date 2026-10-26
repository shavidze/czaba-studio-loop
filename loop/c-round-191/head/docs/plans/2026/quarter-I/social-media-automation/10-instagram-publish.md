# 10 - Instagram Reels Publish + Polling

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 2 (Publishing) |
| **Depends On** | 06 (post API), 07 (Meta OAuth), 03 (Hangfire) |
| **Blocks** | 13 (orchestrator), 14 (webhooks), 15 (analytics) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Instagram Reels 2-step publish: Create Container → Poll Status → Publish. Hangfire background job polling-ისთვის.

## კრიტიკული: IG Reels publish არის 2-step async process!

```
Step 1: POST /{ig-user-id}/media
  { media_type: "REELS", video_url, caption, share_to_feed: true }
  → { id: container_id }

Step 2: Poll status (Hangfire background job)
  GET /{container_id}?fields=status_code
  → status_code: "IN_PROGRESS" | "FINISHED" | "ERROR"
  (poll every 30 seconds, max 15 minutes)

Step 3: POST /{ig-user-id}/media_publish
  { creation_id: container_id }
  → { id: media_id }
```

## რა უნდა გაკეთდეს

### 1. InstagramPublisher Service

- `Publish(post, account)` → creates container, schedules polling job
- Uses Page Access Token (not User Token!)
- IG Business Account ID from SocialPlatformAccount

### 2. InstagramPollingJob (Hangfire)

- 30 poll attempts x 30 sec intervals = 15 min max
- CancellationTokenSource with 15-min timeout
- On FINISHED → publish container → update post as Published
- On ERROR → mark post as Failed with error message
- On timeout → mark as Failed with timeout message

### 3. Video URL Requirements

- Video must be publicly accessible URL (R2 signed URL with 1hr expiry)
- Aspect ratio 9:16 recommended
- Max 90 seconds
- H.264 codec, AAC audio

### 4. Caption Building

```csharp
var caption = $"{post.Title}\n\n{post.Description}\n\n{post.Hashtags}";
if (post.IsAiGenerated)
    caption += "\n\n🤖 Created with AI-generated visuals";
```

## ვერიფიკაცია

- [ ] Container creation returns valid ID
- [ ] Polling job correctly waits for FINISHED
- [ ] Published post gets IG media ID saved
- [ ] ERROR status → post marked Failed with message
- [ ] Timeout after 15 min → post marked Failed
- [ ] R2 signed URL accessible by Instagram servers
