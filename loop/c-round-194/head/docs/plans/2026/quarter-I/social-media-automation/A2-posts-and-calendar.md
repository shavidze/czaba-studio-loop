# A2 - Admin: Posts List + Calendar + Batch Editor + Post Detail

## Meta

| Field | Value |
|-------|-------|
| **Layer** | Admin Frontend |
| **Depends On** | 06 (post API) |
| **Blocks** | - |
| **Project** | `admin` |
| **Est. Hours** | 12h |
| **Status** | `pending` |

## აღწერა

ეს არის ყველაზე დიდი frontend task: 4 გვერდი post management-ისთვის.

## გვერდები

### 1. Posts List (`/social/campaigns/:id/posts`)

- ცხრილი: Platform (icon), Title, Status (badge), Scheduled Date, Published Date
- ფილტრები: Platform, Status
- Actions: View, Edit(Pending), Cancel(Pending), Retry(Failed), View on Platform(Published)

### 2. Batch Prompt Editor (`/social/campaigns/:id/prompts`)

- **30-line textarea** - ყოველ ხაზზე 1 prompt
- თითოეულ prompt-ს expand-ით: Title, Description, Hashtags fields
- **"Duplicate to All Platforms"** checkbox - 1 prompt → 3 posts (FB, IG, TT)
- **CSV Import/Export** buttons
- **Preview Grid**: 3 columns (FB, IG, TT) showing how posts will look
- **"Save All"** → batch create API call

### 3. Post Calendar (`/social/campaigns/:id/calendar`)

- **Month view** calendar (FullCalendar.js library)
- **Drag & drop** to reschedule posts
- **Color coding**: Pending(blue), Queued(yellow), Published(green), Failed(red)
- **Click post** → sidebar with post detail
- **Date navigation**: month/week view toggle
- Package: `@fullcalendar/react` + `@fullcalendar/interaction` (drag)

### 4. Post Detail (`/social/posts/:id`)

- Video preview player (HTML5 video element)
- Post metadata: title, description, hashtags
- **Status timeline**: Created → Scheduled → Publishing → Published (stepper UI)
- Platform response: post URL (link), error message
- **Audit log table**: chronological actions with timestamps
- **Actions**: Retry(Failed), Cancel(Pending), "View on Platform"(Published, external link)

## ფაილები

```
admin/src/pages/social/
├── Posts.tsx
├── BatchPromptEditor.tsx
├── PostCalendar.tsx
├── PostDetail.tsx
└── components/
    ├── PostTable.tsx
    ├── PostStatusBadge.tsx
    ├── PostStatusTimeline.tsx
    ├── PromptRow.tsx
    ├── CalendarPost.tsx
    ├── PostDetailSidebar.tsx
    └── AuditLogTable.tsx

admin/src/hooks/social/
├── usePosts.ts
├── usePost.ts
├── usePostMutations.ts       -- batch create, retry, cancel
└── usePostCalendar.ts        -- calendar data query
```

## Dependencies (npm)

```
@fullcalendar/react
@fullcalendar/daygrid
@fullcalendar/interaction
```

## Primitives

წაიკითხე შექმნამდე:
- `admin/.claude/primitives/LIST_PAGE_WITH_FILTERS.md`
- `admin/.claude/primitives/FORM_PAGE_PATTERN.md`
- `admin/.claude/primitives/STATUS_BADGE_VARIANTS.md`
- `admin/.claude/primitives/REACT_QUERY_PATTERNS.md`

## ვერიფიკაცია

- [ ] Posts list loads for a campaign
- [ ] Batch editor: 30 prompts → "Duplicate to All" → 90 posts created
- [ ] Calendar renders posts on correct dates
- [ ] Drag & drop reschedules (calls PUT API)
- [ ] Post detail shows status timeline
- [ ] Audit log shows chronological history
- [ ] CSV import loads prompts correctly
- [ ] `npm run check` passes
