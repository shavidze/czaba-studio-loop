# A1 - Admin: Campaigns List + Create/Edit Pages

## Meta

| Field | Value |
|-------|-------|
| **Layer** | Admin Frontend |
| **Depends On** | 05 (campaign API) |
| **Blocks** | - |
| **Project** | `admin` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Campaign management UI: list page with filters + wizard-style create/edit form.

## გვერდები

### 1. Campaigns List (`/social/campaigns`)

- **ცხრილი** (LIST_PAGE_WITH_FILTERS pattern):
  - Columns: Name, Status (badge), Posts (published/total), Date Range, Created
  - Status badges: Draft(gray), Scheduled(blue), Active(green), Paused(yellow), Failed(red), Completed(purple)
- **ფილტრები**: Status dropdown, Date range picker
- **Actions**: View, Edit(Draft only), Pause, Resume, Cancel, Delete(Draft only)
- **"New Campaign"** button → navigate to create page
- TanStack Query: `useQuery` for list, `useMutation` for status changes

### 2. Campaign Create/Edit (`/social/campaigns/new`, `/social/campaigns/:id/edit`)

- **Wizard-style 3 steps:**
  1. **Basic Info**: Name (required), Description, Default Hashtags (tag input)
  2. **Platform Selection**: Checkboxes (Facebook, Instagram, TikTok) + Account selector per platform
  3. **Schedule**: Start date, End date, Posting frequency (1x/day, 2x/day, custom), Preferred times per platform
- **Draft auto-save** ყოველ step-ზე
- **Final step**: Summary preview → "Save as Draft" or "Schedule Now"

## ფაილები

```
admin/src/pages/social/
├── Campaigns.tsx                -- list page
├── CampaignCreate.tsx           -- create wizard
├── CampaignEdit.tsx             -- edit wizard
└── components/
    ├── CampaignTable.tsx
    ├── CampaignStatusBadge.tsx
    ├── CampaignWizard.tsx       -- shared wizard component
    └── CampaignWizardSteps/
        ├── BasicInfoStep.tsx
        ├── PlatformStep.tsx
        └── ScheduleStep.tsx

admin/src/hooks/social/
├── useCampaigns.ts              -- useQuery list
├── useCampaign.ts               -- useQuery single
└── useCampaignMutations.ts      -- create, update, status change
```

## Primitives

წაიკითხე შექმნამდე:
- `admin/.claude/primitives/LIST_PAGE_WITH_FILTERS.md`
- `admin/.claude/primitives/FORM_PAGE_PATTERN.md`
- `admin/.claude/primitives/STATUS_BADGE_VARIANTS.md`
- `admin/.claude/primitives/REACT_QUERY_PATTERNS.md`

## ვერიფიკაცია

- [ ] Campaign list loads with pagination
- [ ] Status filter works
- [ ] Create wizard: all 3 steps → saves Draft
- [ ] Status badges show correct colors
- [ ] Pause/Resume/Cancel buttons work
- [ ] Edit only available for Draft campaigns
- [ ] `npm run check` passes
