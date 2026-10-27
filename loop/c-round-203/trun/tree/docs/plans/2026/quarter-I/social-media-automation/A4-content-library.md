# A4 - Admin: Content Library (Upload, Merge, Preview)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | Admin Frontend |
| **Depends On** | 08 (ffmpeg service API) |
| **Blocks** | - |
| **Project** | `admin` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

Media management: video upload (drag & drop), audio selection, ffmpeg merge, preview.

## გვერდი

### Content Library (`/social/media`)

- **Grid View**: video thumbnails (3-4 columns)
  - Each card: thumbnail, filename, duration, status (raw/merged/transcoded)
  - Click → expand with video player

- **Upload Zone**:
  - Drag & drop area
  - Multi-file upload support
  - Progress bars per file
  - Upload → R2 → auto-validation (ffprobe) → show results
  - Validation errors shown inline (red badge on card)

- **Merge Workflow**:
  1. Select video from library
  2. Select audio track (from Czaba products list or upload custom)
  3. Choose merge mode: "Replace audio" / "Mix (original + Czaba)"
  4. Click "Merge" → shows processing spinner
  5. Hangfire job status: Pending → Processing → Complete/Failed
  6. Preview merged result

- **Filters**:
  - Type: All, Raw, Merged, Transcoded
  - Campaign assignment
  - Date range

- **Bulk Actions**:
  - Select multiple → "Merge All with..." (same audio)
  - Select multiple → "Delete"

## ფაილები

```
admin/src/pages/social/
├── ContentLibrary.tsx
└── components/
    ├── MediaGrid.tsx
    ├── MediaCard.tsx
    ├── UploadZone.tsx
    ├── MergeDialog.tsx
    ├── AudioSelector.tsx
    ├── VideoPlayer.tsx
    └── MergeStatusBadge.tsx

admin/src/hooks/social/
├── useMediaLibrary.ts
├── useMediaUpload.ts
└── useMediaMerge.ts
```

## Primitives

წაიკითხე შექმნამდე:
- `admin/.claude/primitives/REACT_QUERY_PATTERNS.md`
- `admin/.claude/primitives/FORWARDREF_COMPONENT.md`
- `admin/.claude/primitives/TAILWIND_FIRST.md`

## ვერიფიკაცია

- [ ] Drag & drop upload works (multiple files)
- [ ] Upload progress bars show correctly
- [ ] Validation results display on cards
- [ ] Audio selector shows Czaba products
- [ ] Merge dialog: select mode → submit → job starts
- [ ] Merge status updates (poll or refresh)
- [ ] Video player preview works for merged files
- [ ] Bulk merge with same audio works
- [ ] `npm run check` passes
