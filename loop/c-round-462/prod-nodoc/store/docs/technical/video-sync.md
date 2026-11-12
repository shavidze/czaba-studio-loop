# Video Sync Feature - Implementation Plan

## Overview
Add video upload and sync functionality to Studio page. Users can upload their video footage and see how stems fit with their video in real-time.

## Requirements Summary
- **Location**: Studio Page (collapsible section above TransportBar)
- **Storage**: Session-based (Blob URLs, no Firestore)
- **Export**: Audio Mix only (no video export)
- **File Size**: Support 1GB+ files with progress tracking

## Architecture

### Component Structure

**New Components:**
1. `app/components/studio/VideoUploadZone.tsx` - Drag-and-drop upload UI
2. `app/components/studio/VideoPlayer.tsx` - Video display with metadata

**Modified Components:**
3. `app/contexts/StudioContext.tsx` - Add video state & sync logic
4. `app/routes/studio.$productId.tsx` - Integrate video section
5. `app/types/studio.ts` - Add VideoState interface

### State Management

Extend `StudioState` in StudioContext:

```typescript
interface StudioState {
  // ... existing fields ...

  video: {
    blobUrl: string | null;
    file: File | null;
    duration: number;
    isLoaded: boolean;
    isUploading: boolean;
    uploadProgress: number;
    metadata: {
      size: number;
      format: string;
      resolution?: string;
    } | null;
  };

  videoPanelExpanded: boolean;
}
```

New context methods:
- `loadVideo(file: File): Promise<void>`
- `clearVideo(): void`
- `setVideoPanelExpanded(expanded: boolean): void`
- `videoRef: React.RefObject<HTMLVideoElement>`

## Sync Mechanism

### Core Concept
Video follows audio playback using the existing requestAnimationFrame loop.

**Audio is the master clock** (Web Audio API) → Video follows (HTML5 Video API)

### Implementation

**1. Extend Time Tracking Loop** (in `StudioContext.tsx`):

```typescript
const updateTime = () => {
  const elapsed = audioContext.currentTime - startTime;
  const newTime = offset + elapsed;

  // SYNC VIDEO
  if (videoRef.current && state.video.isLoaded) {
    const drift = Math.abs(videoRef.current.currentTime - newTime);

    // Only correct if drift > 100ms (avoid jitter)
    if (drift > 0.1) {
      videoRef.current.currentTime = newTime;
    }
  }

  // ... existing logic ...
  animationFrameRef.current = requestAnimationFrame(updateTime);
};
```

**2. Coordinate Play/Pause**:

```typescript
const togglePlayPause = () => {
  if (isPlaying) {
    // Pause audio
    stopAllSources();

    // Pause video
    if (videoRef.current) {
      videoRef.current.pause();
    }
  } else {
    // Play audio
    startAudioPlayback();

    // Play video
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
      videoRef.current.play();
    }

    startTimeTracking();
  }
};
```

**3. Sync Seek**:

```typescript
const seek = (time: number) => {
  stopPlayback();

  // Sync video
  if (videoRef.current) {
    videoRef.current.currentTime = time;
  }

  setState({ currentTime: time });

  // Resume if was playing
  if (wasPlaying) {
    setTimeout(togglePlayPause, 100);
  }
};
```

## UI Layout

### Studio Page Structure

```
┌─────────────────────────────────────────────┐
│ Top Toolbar                                  │
├─────────────────────────────────────────────┤
│ [▼ Video Sync] ← Collapsible Header         │
│ ┌───────────────────────────────────────┐  │
│ │ VideoUploadZone OR VideoPlayer         │  │
│ └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│ TransportBar (Timeline + Zoom)              │
├─────────────────────────────────────────────┤
│ StudioTrackList (Waveforms)                 │
└─────────────────────────────────────────────┘
```

**When No Video**: Show VideoUploadZone
**When Video Loaded**: Show VideoPlayer

### VideoUploadZone Component

```typescript
interface VideoUploadZoneProps {
  onVideoSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress: number;
}
```

**Features:**
- Drag-and-drop area with dashed border
- File picker button fallback
- File validation (mp4, mov, webm - max 2GB)
- Progress bar for large files
- Error messages for invalid files

**Design:**
- `bg-neutral-900 border-dashed border-neutral-700`
- `hover:border-teal-500` on drag over
- Upload icon (Lucide `Upload`)
- Text: "Drop video here or click to browse"
- Subtext: "Supported: MP4, MOV, WebM (max 2GB)"

### VideoPlayer Component

```typescript
interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  blobUrl: string;
  metadata: VideoMetadata;
  onRemove: () => void;
}
```

**Features:**
- 16:9 aspect ratio container
- Video element with ref forwarding
- Metadata display (resolution, file size)
- Remove button (X icon)
- Warning badge if video > stems duration

**Design:**
- `bg-neutral-950 rounded-lg border-neutral-800`
- `aspect-video` container
- Bottom bar: metadata + remove button
- Minimal chrome (relies on main PlaybackControls)

## File Upload Flow

### Step 1: File Selection

```typescript
// Drag-and-drop handler
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFileSelect(file);
};

// File picker handler
const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) handleFileSelect(file);
};
```

### Step 2: Validation

```typescript
const handleFileSelect = (file: File) => {
  const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

  if (!validTypes.includes(file.type)) {
    showError('Invalid format. Use MP4, MOV, or WebM.');
    return;
  }

  if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
    showError('File too large. Maximum: 2GB');
    return;
  }

  loadVideo(file);
};
```

### Step 3: Load Video

```typescript
const loadVideo = async (file: File) => {
  setState({ video: { ...video, isUploading: true } });

  // Create Blob URL
  const blobUrl = URL.createObjectURL(file);

  // Extract metadata
  const tempVideo = document.createElement('video');
  tempVideo.src = blobUrl;

  await new Promise((resolve, reject) => {
    tempVideo.onloadedmetadata = () => {
      setState({
        video: {
          blobUrl,
          file,
          duration: tempVideo.duration,
          isLoaded: true,
          metadata: {
            size: file.size,
            format: file.type,
            resolution: `${tempVideo.videoWidth}x${tempVideo.videoHeight}`,
          }
        },
        videoPanelExpanded: true,
      });
      resolve(null);
    };

    tempVideo.onerror = reject;
    setTimeout(() => reject(new Error('Timeout')), 10000);
  });
};
```

### Step 4: Memory Cleanup

```typescript
const clearVideo = () => {
  if (state.video.blobUrl) {
    URL.revokeObjectURL(state.video.blobUrl);
  }

  setState({
    video: {
      blobUrl: null,
      file: null,
      duration: 0,
      isLoaded: false,
      metadata: null,
    }
  });
};
```

## Implementation Phases

### Phase 1: Basic Upload & Display

**Goal**: Upload video and display it

**Tasks:**
1. Create `VideoUploadZone.tsx` component
   - Drag-and-drop UI
   - File validation
   - Error handling

2. Create `VideoPlayer.tsx` component
   - Video element with ref
   - Metadata display
   - Remove button

3. Extend `StudioContext.tsx`
   - Add `video` to StudioState
   - Add `videoRef` ref
   - Implement `loadVideo()` method
   - Implement `clearVideo()` method

4. Update `studio.$productId.tsx`
   - Add collapsible video section
   - Wire up VideoUploadZone/VideoPlayer
   - Add collapse/expand toggle

5. Add types to `studio.ts`
   - VideoState interface
   - VideoMetadata interface

**Testing:**
- Upload MP4, MOV, WebM files
- Verify metadata extraction
- Test remove video
- Check Blob URL cleanup

### Phase 2: Sync with Playback

**Goal**: Video plays in sync with audio stems

**Tasks:**
1. Modify `StudioContext.tsx`
   - Extend `startTimeTracking()` loop with video sync
   - Add drift correction (100ms threshold)
   - Update `togglePlayPause()` to control video
   - Update `seek()` to sync video time
   - Update `stop()` to reset video

**Testing:**
- Play audio + video together
- Verify sync accuracy
- Test drift correction
- Seek to different positions
- Pause/resume multiple times
- Video shorter than stems (pause at end)
- Video longer than stems (handle gracefully)

### Phase 3: Polish & Edge Cases

**Goal**: Production-ready feature

**Tasks:**
1. Add file size warnings (> 500MB)
2. Handle duration mismatches
3. Improve loading states
4. Add error recovery
5. Update ExportDialog with video note

**Testing:**
- Large files (1GB+)
- Various video durations
- Edge case scenarios
- Performance with 4K video
- Memory usage over time

## Edge Cases

### Video/Audio Duration Mismatch

**Video Shorter:**
- Pause video at end
- Continue playing stems
- Show badge: "Video ended"

**Video Longer:**
- Pause video when stems end (at masterDuration)
- Or: Continue video silently (user preference)

### Large Files

- Warn if > 500MB: "Large file may impact performance"
- Show file size prominently
- Recommend compressed videos

### Drift Correction

- Check every frame: `Math.abs(video.currentTime - audioTime)`
- Only correct if drift > 100ms
- Audio is master clock (AudioContext more accurate)

### Session Persistence

- Video lost on refresh (session-based)
- Show warning on upload
- Future: IndexedDB for persistence

## Type Definitions

```typescript
// app/types/studio.ts

export interface VideoMetadata {
  size: number;
  format: string;
  resolution?: string;
  width?: number;
  height?: number;
}

export interface VideoState {
  blobUrl: string | null;
  file: File | null;
  duration: number;
  isLoaded: boolean;
  isUploading: boolean;
  uploadProgress: number;
  metadata: VideoMetadata | null;
}

// Extend StudioState
export interface StudioState {
  // ... existing ...
  video: VideoState;
  videoPanelExpanded: boolean;
}

// Extend StudioContextValue
export interface StudioContextValue {
  // ... existing ...
  loadVideo: (file: File) => Promise<void>;
  clearVideo: () => void;
  setVideoPanelExpanded: (expanded: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}
```

## File Paths

### Files to Create
1. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\components\studio\VideoUploadZone.tsx`
2. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\components\studio\VideoPlayer.tsx`

### Files to Modify
3. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\contexts\StudioContext.tsx`
4. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\routes\studio.$productId.tsx`
5. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\types\studio.ts`
6. `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\components\studio\index.ts` (add exports)

### Reference Files
- `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\components\home\VideoShowcase.tsx` (HTML5 video patterns)
- `C:\Users\saba.shavidze\Desktop\czaba\music-store\app\components\studio\DownloadDialog.tsx` (modal patterns)

## Performance Considerations

**Optimizations:**
1. Lazy render VideoPlayer only when video loaded
2. Skip video sync if `!video.isLoaded`
3. Drift correction threshold (100ms) prevents GPU thrashing
4. Blob URL cleanup prevents memory leaks
5. Recommend compressed videos (not raw 4K)

**Metrics to Monitor:**
- Frame rate (should stay 60fps)
- Memory usage (watch for leaks with large files)
- Sync accuracy (drift should auto-correct < 1s)

## User Flow Example

1. User opens Studio with stems loaded
2. Clicks collapsible "Video Sync" section
3. Drags MP4 file (500MB) into upload zone
4. Video loads, displays: "1920x1080 • 500MB"
5. User clicks Play → stems + video play in sync
6. User adjusts stem volumes while watching
7. User solos "Vocals" → video continues, only vocals audible
8. User seeks to 30s → both video and audio jump to 30s
9. User exports → audio mix only (video not included)
10. User removes video → memory freed, upload zone returns

## Testing Checklist

**Upload:**
- [ ] MP4 upload success
- [ ] MOV upload success
- [ ] WebM upload success
- [ ] Invalid format rejection
- [ ] Oversized file rejection (> 2GB)
- [ ] Metadata extraction
- [ ] Remove video memory cleanup

**Sync:**
- [ ] Play video + audio together
- [ ] Pause mid-playback
- [ ] Seek to start
- [ ] Seek to middle
- [ ] Seek to end
- [ ] Drift stays < 100ms
- [ ] Video shorter than stems
- [ ] Video longer than stems

**Controls:**
- [ ] Mute stem (video continues)
- [ ] Solo stem (video continues)
- [ ] Volume adjust (video continues)
- [ ] Loop stem (video syncs)

**Edge Cases:**
- [ ] Refresh page (video lost)
- [ ] Large file (> 1GB)
- [ ] Rapid seeks
- [ ] Rapid play/pause
- [ ] Export with video (audio-only)

## Success Criteria

✅ Users can upload video files (MP4, MOV, WebM)
✅ Video plays in perfect sync with audio stems
✅ Drift correction maintains A/V sync
✅ All stem controls work with video (mute, solo, volume)
✅ Seek/play/pause control both video and audio
✅ Export produces audio-only mix
✅ Memory managed efficiently (Blob URL cleanup)
✅ Works with 1GB+ files
✅ Matches existing UI/UX design patterns

---

**Next Steps**: Move to implementation following Phase 1 → 2 → 3 sequence.
