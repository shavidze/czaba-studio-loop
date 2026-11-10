# A5 - Admin: Analytics Dashboard + Settings Page

## Meta

| Field | Value |
|-------|-------|
| **Layer** | Admin Frontend |
| **Depends On** | 15 (analytics service API) |
| **Blocks** | - |
| **Project** | `admin` |
| **Est. Hours** | 6h |
| **Status** | `pending` |

## აღწერა

Analytics dashboard (charts, metrics) + Social settings page.

## გვერდები

### 1. Analytics Dashboard (`/social/analytics`)

- **Overview Cards** (top row):
  - Total Posts (published)
  - Total Views
  - Total Engagement (likes + comments + shares)
  - Avg Engagement Rate (%)

- **Charts** (recharts library):
  - **Views over time**: Line chart, last 30 days
  - **Engagement by platform**: Bar chart (FB vs IG vs TT)
  - **Best posting times**: Heatmap (day x hour)

- **Top Performing Posts Table**:
  - Columns: Platform, Title, Views, Engagement Rate, Published Date
  - Sortable by any column
  - Click → navigate to post detail

- **Campaign Comparison**:
  - Select 2 campaigns → side-by-side metrics

- **Date Range Filter**: Last 7d, 30d, 90d, Custom

### 2. Settings Page (`/social/settings`)

- **Default Hashtags**: per platform textarea
- **Default Posting Times**: time picker per platform (FB, IG, TT)
- **Auto-Retry Config**:
  - Max retries (1-5, default 3)
  - Retry delay multiplier
- **AI Disclosure Text**: customizable text per platform
- **TikTok Feature Toggle**: enabled/disabled (read-only status + info)
- **Notification Preferences**:
  - Email on failed post
  - Email on campaign complete
  - Daily summary email

## Dependencies (npm)

```
recharts
```

## ფაილები

```
admin/src/pages/social/
├── Analytics.tsx
├── Settings.tsx
└── components/
    ├── OverviewCards.tsx
    ├── ViewsChart.tsx
    ├── EngagementChart.tsx
    ├── TopPostsTable.tsx
    ├── CampaignComparison.tsx
    ├── HashtagSettings.tsx
    ├── PostingTimeSettings.tsx
    └── RetrySettings.tsx

admin/src/hooks/social/
├── useAnalyticsOverview.ts
├── useAnalyticsCharts.ts
├── useSocialSettings.ts
└── useSocialSettingsMutations.ts
```

## Primitives

წაიკითხე შექმნამდე:
- `admin/.claude/primitives/REACT_QUERY_PATTERNS.md`
- `admin/.claude/primitives/FORM_PAGE_PATTERN.md`
- `admin/.claude/primitives/TAILWIND_FIRST.md`

## ვერიფიკაცია

- [ ] Overview cards show correct totals
- [ ] Charts render with real data
- [ ] Date range filter updates all charts
- [ ] Top posts table sortable
- [ ] Settings save correctly (API call)
- [ ] TikTok toggle reflects backend feature flag
- [ ] `npm run check` passes
