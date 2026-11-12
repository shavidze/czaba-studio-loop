# 12 - Video Validation Service (ffprobe)

## Meta

| Field | Value |
|-------|-------|
| **Layer** | 2 (Publishing) |
| **Depends On** | 08 (ffmpeg service) |
| **Blocks** | - (გამოიყენება upload-ის დროს) |
| **Project** | `backend` |
| **Est. Hours** | 3h |
| **Status** | `pending` |

## აღწერა

ffprobe-based ვიდეო ვალიდაცია: ყოველ ატვირთვაზე და publish-ის წინ ვამოწმებთ platform constraints.

## API Endpoints

```
POST   /api/social/media/validate    -- manual validation check
```

ასევე auto-validate on upload (task 08-ში upload endpoint-ის ნაწილი).

## Platform Constraints

| Parameter | Facebook | Instagram Reels | TikTok |
|-----------|----------|-----------------|--------|
| Max duration | 240 min | 90 sec | 180 sec |
| Min duration | 1 sec | 3 sec | 3 sec |
| Max file size | 10 GB | 4 GB | 4 GB |
| Formats | mp4, mov | mp4, mov | mp4, webm, mov |
| Aspect ratio | any | 9:16 recommended | 9:16 recommended |
| Min resolution | 720p | 720p | 720p |
| Video codec | H.264 | H.264 | H.264, H.265 |
| Audio codec | AAC | AAC | AAC |

## რა უნდა გაკეთდეს

### 1. VideoValidationService

- `ValidateForPlatform(filePath, platform)` → ValidationResult { IsValid, Errors[] }
- `ValidateForAllPlatforms(filePath)` → Dictionary<platform, ValidationResult>

### 2. ffprobe Wrapper

```csharp
// ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
// Parse: duration, file_size, width, height, codec_name, codec_type
```

### 3. Validation Rules

- Duration range check
- File size check
- Resolution (min 720p height)
- Video codec compatibility
- Audio codec compatibility
- Aspect ratio warning (not hard error for IG/TikTok)

## ვერიფიკაცია

- [ ] Valid 1080x1920 mp4 → passes all platforms
- [ ] Too-long video → fails IG validation with clear message
- [ ] Wrong codec → fails with message
- [ ] Missing audio → warning
- [ ] API endpoint returns per-platform validation results
