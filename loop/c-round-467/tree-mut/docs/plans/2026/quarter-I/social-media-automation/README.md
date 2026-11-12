# Social Media Automation - ქვე-დავალებები

## Dependency Graph

```
LAYER 0 — Foundation (ყველა პარალელურად)
═══════════════════════════════════════
  [01-database-schema]     [02-models-and-dtos]     [03-hangfire-setup]     [04-serilog-logging]
         │                        │                        │
         └────────┬───────────────┘                        │
                  │                                        │
LAYER 1 — Core APIs (პარალელურად, Foundation-ის შემდეგ)
═══════════════════════════════════════════════════════
  [05-campaign-api]        [06-post-api]        [07-meta-oauth]        [08-ffmpeg-service]
         │                      │                     │                       │
         │                      │                     │                       │
LAYER 2 — Publishing Services (პარალელურად, Core APIs-ის შემდეგ)
════════════════════════════════════════════════════════════════
  [09-facebook-publish]    [10-instagram-publish]    [11-tiktok-publish]    [12-video-validation]
         │                        │                        │
         └────────────────┬───────┴────────────────────────┘
                          │
LAYER 3 — Orchestration (Publishing-ის შემდეგ)
═══════════════════════════════════════════════
  [13-publish-orchestrator]               [14-webhooks]
         │                                      │
         └──────────────┬───────────────────────┘
                        │
LAYER 4 — Analytics (Orchestration-ის შემდეგ)
═════════════════════════════════════════════
  [15-analytics-service]

ADMIN FRONTEND (Backend API-ებს ელოდება)
═════════════════════════════════════════
  [A1-campaigns-pages]    ← depends on: 05
  [A2-posts-and-calendar] ← depends on: 06
  [A3-platform-accounts]  ← depends on: 07
  [A4-content-library]    ← depends on: 08
  [A5-analytics-settings] ← depends on: 15
```

## რომელი რა არის

| # | ფაილი | Layer | Depends On | ~საათი | აღწერა |
|---|-------|-------|------------|--------|--------|
| 01 | `01-database-schema.md` | 0 | - | 4h | 6 SQL ცხრილი + indexes |
| 02 | `02-models-and-dtos.md` | 0 | - | 6h | EF entities, DTOs, service interfaces, encryption |
| 03 | `03-hangfire-setup.md` | 0 | - | 3h | Hangfire config, dashboard, queues |
| 04 | `04-serilog-logging.md` | 0 | - | 2h | Structured logging, SocialLogs table |
| 05 | `05-campaign-api.md` | 1 | 01, 02 | 8h | Campaign CRUD + State Machine |
| 06 | `06-post-api.md` | 1 | 01, 02 | 8h | Post CRUD + Batch Create |
| 07 | `07-meta-oauth.md` | 1 | 01, 02 | 8h | Meta OAuth, Token refresh, Page Token |
| 08 | `08-ffmpeg-service.md` | 1 | 01, 02 | 8h | Merge, Transcode, ffprobe validate |
| 09 | `09-facebook-publish.md` | 2 | 06, 07 | 6h | Resumable Upload, AI disclosure |
| 10 | `10-instagram-publish.md` | 2 | 06, 07, 03 | 8h | IG Reels 2-step + Hangfire polling |
| 11 | `11-tiktok-publish.md` | 2 | 06, 02 | 8h | TikTok OAuth + Content Posting API |
| 12 | `12-video-validation.md` | 2 | 08 | 3h | ffprobe per-platform validation |
| 13 | `13-publish-orchestrator.md` | 3 | 09, 10, 11, 03 | 10h | Idempotency + Rate Limit + Circuit Breaker + Scheduler |
| 14 | `14-webhooks.md` | 3 | 09, 11 | 5h | Meta/TikTok webhooks + stuck checker |
| 15 | `15-analytics-service.md` | 4 | 09, 10, 11 | 6h | FB/IG/TikTok analytics sync |
| A1 | `A1-campaigns-pages.md` | Admin | 05 | 8h | Campaigns list + create/edit wizard |
| A2 | `A2-posts-and-calendar.md` | Admin | 06 | 12h | Posts list + Calendar + Batch editor + Post detail |
| A3 | `A3-platform-accounts.md` | Admin | 07 | 5h | OAuth connect/disconnect UI |
| A4 | `A4-content-library.md` | Admin | 08 | 8h | Upload, merge, preview |
| A5 | `A5-analytics-settings.md` | Admin | 15 | 6h | Analytics dashboard + Settings page |

## პარალელიზაცია - რეალური Execution Plan

```
Sprint 1 (Week 1-2):
─────────────────────
  პარალელურად 4 აგენტი:
    Agent 1: [01-database-schema]
    Agent 2: [02-models-and-dtos]
    Agent 3: [03-hangfire-setup]
    Agent 4: [04-serilog-logging]

  01+02 დასრულების შემდეგ → პარალელურად 4 აგენტი:
    Agent 1: [05-campaign-api]
    Agent 2: [06-post-api]
    Agent 3: [07-meta-oauth]
    Agent 4: [08-ffmpeg-service]

Sprint 2 (Week 3-4):
─────────────────────
  06+07 დასრულების შემდეგ → პარალელურად:
    Agent 1: [09-facebook-publish]
    Agent 2: [10-instagram-publish]
    Agent 3: [11-tiktok-publish]
    Agent 4: [12-video-validation]

  პარალელურად (backend API-ები მზადაა):
    Agent 5: [A1-campaigns-pages]
    Agent 6: [A2-posts-and-calendar]
    Agent 7: [A3-platform-accounts]
    Agent 8: [A4-content-library]

Sprint 3 (Week 5-6):
─────────────────────
  Publishing services-ის შემდეგ → პარალელურად:
    Agent 1: [13-publish-orchestrator]
    Agent 2: [14-webhooks]
    Agent 3: [15-analytics-service]
    Agent 4: [A5-analytics-settings]
```

## სტატუსი

| Task | Status |
|------|--------|
| 01-database-schema | `pending` |
| 02-models-and-dtos | `pending` |
| 03-hangfire-setup | `pending` |
| 04-serilog-logging | `pending` |
| 05-campaign-api | `pending` |
| 06-post-api | `pending` |
| 07-meta-oauth | `pending` |
| 08-ffmpeg-service | `pending` |
| 09-facebook-publish | `pending` |
| 10-instagram-publish | `pending` |
| 11-tiktok-publish | `pending` |
| 12-video-validation | `pending` |
| 13-publish-orchestrator | `pending` |
| 14-webhooks | `pending` |
| 15-analytics-service | `pending` |
| A1-campaigns-pages | `pending` |
| A2-posts-and-calendar | `pending` |
| A3-platform-accounts | `pending` |
| A4-content-library | `pending` |
| A5-analytics-settings | `pending` |

**Total: 20 tasks, ~134 dev hours**
