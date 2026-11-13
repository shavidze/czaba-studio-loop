# 05 - Campaign CRUD API + State Machine

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 1 (Core APIs) |
| **Depends On** | 01 (database), 02 (models/DTOs) |
| **Blocks** | 13 (orchestrator), A1 (admin campaigns pages) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Campaign CRUD endpoints + 7-state Campaign State Machine.

## API Endpoints

```
POST   /api/social/campaigns                -- შექმნა
GET    /api/social/campaigns                -- სია (paginated, filtered by status/date)
GET    /api/social/campaigns/{id}           -- დეტალები (includes post counts)
PUT    /api/social/campaigns/{id}           -- განახლება (მხოლოდ Draft/Paused)
DELETE /api/social/campaigns/{id}           -- წაშლა (მხოლოდ Draft)
POST   /api/social/campaigns/{id}/schedule  -- Draft → Scheduled
POST   /api/social/campaigns/{id}/pause     -- Active → Paused
POST   /api/social/campaigns/{id}/resume    -- Paused → Active
POST   /api/social/campaigns/{id}/cancel    -- any non-terminal → Cancelled
```

## State Machine

```
Draft → Scheduled → Publishing → Active → Completed
                                  ↓  ↑
                                Paused
any non-terminal → Cancelled
Failed → Draft (re-edit)
```

### Transition Rules

```csharp
["Draft"]      = ["Scheduled"],
["Scheduled"]  = ["Publishing", "Cancelled"],
["Publishing"] = ["Active", "Failed", "Cancelled"],
["Active"]     = ["Paused", "Completed", "Cancelled"],
["Paused"]     = ["Active", "Cancelled"],
["Failed"]     = ["Draft"],
["Completed"]  = [],
["Cancelled"]  = [],
```

## რა უნდა გაკეთდეს

### 1. SocialCampaignController

Minimal API endpoints (MapGroup pattern).

### 2. SocialCampaignService

- CRUD operations
- Pagination + filtering (PagedResult pattern)
- State transition validation
- Pause: cancel pending Hangfire jobs, set pending posts to Cancelled
- Resume: reschedule cancelled posts
- Cancel: cancel all unpublished posts

### 3. CampaignStateMachine

Separate class with `CanTransition()` + action methods.

## ვერიფიკაცია

- [ ] Campaign CRUD მუშაობს (Postman/Swagger)
- [ ] State transitions validate correctly (invalid → 400)
- [ ] Pause cancels pending posts' Hangfire jobs
- [ ] Delete არ მუშაობს non-Draft campaigns-ზე
- [ ] Pagination + status filter მუშაობს
