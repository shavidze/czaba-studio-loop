# 15 - Analytics Sync Service

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 4 (Analytics) |
| **Depends On** | 09 (FB publish), 10 (IG publish), 11 (TT publish) |
| **Blocks** | A5 (admin analytics dashboard) |
| **Project** | `backend` |
| **Est. Hours** | 6h |
| **Status** | `pending` |

## აღწერა

Facebook/Instagram/TikTok analytics API integration - views, likes, comments, shares, reach, engagement rate.

## API Endpoints

```
GET    /api/social/analytics/campaign/{id}  -- campaign-level analytics
GET    /api/social/analytics/post/{id}      -- post-level analytics history
GET    /api/social/analytics/overview       -- dashboard overview
POST   /api/social/analytics/sync           -- manual sync trigger
```

## რა უნდა გაკეთდეს

### 1. AnalyticsSyncService (Hangfire Hourly)

Sync published posts' metrics from all 3 platforms.

### 2. Facebook Video Insights

```
GET /{video-id}/video_insights
  ?metric=total_video_views,total_video_impressions,
          total_video_reactions_by_type_total,
          total_video_comments,total_video_shares
```

### 3. Instagram Reels Insights

```
GET /{media-id}/insights
  ?metric=plays,reach,likes,comments,shares,saved,total_interactions
```

### 4. TikTok Video Analytics

```
POST https://open.tiktokapis.com/v2/video/query/
  ?fields=id,like_count,comment_count,share_count,view_count
  Body: { "filters": { "video_ids": ["id1"] } }
```

### 5. SocialAnalytics Table Population

- New row on each sync (time-series data)
- Calculate EngagementRate = (likes + comments + shares) / views * 100

### 6. Aggregation Endpoints

**Campaign analytics:**
- Total views, avg engagement rate, best performing post
- Group by platform

**Overview:**
- Last 30 days totals
- Platform comparison
- Growth trends

## ვერიფიკაცია

- [ ] Hourly sync fetches metrics for published posts
- [ ] All 3 platform APIs return data correctly
- [ ] Analytics table has time-series rows
- [ ] Campaign aggregation calculates correctly
- [ ] Overview endpoint returns cross-platform summary
- [ ] Manual sync trigger works
