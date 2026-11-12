# 08 - ffmpeg Service (Merge + Transcode)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 1 (Core APIs) |
| **Depends On** | 01 (database), 02 (models/DTOs) |
| **Blocks** | 12 (video validation), A4 (admin content library) |
| **Project** | `backend` |
| **Est. Hours** | 8h |
| **Status** | `pending` |

## აღწერა

ffmpeg CLI wrapper: ვიდეო + აუდიო merge, multi-format transcode, R2 upload/download integration.

## API Endpoints

```
POST   /api/social/media/upload             -- ვიდეო ატვირთვა → R2
POST   /api/social/media/merge              -- ვიდეო + აუდიო merge (Hangfire job)
GET    /api/social/media/{id}/status        -- merge job სტატუსი
GET    /api/social/media/library            -- ატვირთული მედია სია (paginated)
```

## რა უნდა გაკეთდეს

### 1. FfmpegService

- `MergeVideoAudio(videoR2Key, audioR2Key, keepOriginalAudio)` → merged R2 key
- `TranscodeForAllPlatforms(sourceR2Key)` → { FacebookKey, InstagramKey, TikTokKey }
- Download from R2 → process → upload back to R2 → cleanup temp files

### 2. ffmpeg Commands

**Replace audio:**
```bash
ffmpeg -i video.mp4 -i audio.mp3 -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest output.mp4
```

**Mix audio (original + czaba):**
```bash
ffmpeg -i video.mp4 -i audio.mp3 -filter_complex "[0:a]volume=0.3[orig];[1:a]volume=1.0[music];[orig][music]amix=inputs=2:duration=shortest[aout]" -c:v copy -map 0:v:0 -map "[aout]" -c:a aac -b:a 192k output.mp4
```

**Transcode 9:16 (IG/TikTok):**
```bash
ffmpeg -i input.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4
```

### 3. Media Upload Endpoint

- Multipart upload → save to R2 `social/raw/{guid}.mp4`
- Auto-generate thumbnail with ffmpeg
- Return media ID + R2 key

### 4. R2 Integration

```
social/
├── raw/           # ორიგინალი ვიდეოები
├── merged/        # merge შედეგი
├── transcoded/    # platform-specific versions
└── thumbnails/    # auto-generated
```

### 5. Hangfire Job for Merge

Merge არის CPU-intensive → Hangfire job, არა synchronous.
`social-publish` queue-ში.

## ვერიფიკაცია

- [ ] Upload → R2-ში ინახება
- [ ] Merge: video + audio = output (ffmpeg exit code 0)
- [ ] Transcode: 1 input → 3 outputs (FB 16:9, IG 9:16, TT 9:16)
- [ ] Temp files cleaned up after processing
- [ ] Library endpoint returns paginated media list
- [ ] Large files (>100MB) handle correctly
