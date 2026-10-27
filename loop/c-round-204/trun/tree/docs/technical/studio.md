# Technical Documentation - Music Store Studio

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Web Audio API Implementation](#web-audio-api-implementation)
3. [WaveSurfer.js Integration](#wavesurferjs-integration)
4. [Trim Regions & Loop Functionality](#trim-regions--loop-functionality)
5. [Solo/Mute Logic (Ableton-style)](#solomute-logic-ableton-style)
6. [Export System](#export-system)
7. [Audio Caching (IndexedDB)](#audio-caching-indexeddb)
8. [State Management](#state-management)
9. [Key Technical Decisions](#key-technical-decisions)
10. [File Structure](#file-structure)

---

## Architecture Overview

### Tech Stack

- **Frontend**: React 18 + Remix (Shopify Hydrogen)
- **Audio Engine**: Web Audio API (native browser)
- **Waveform Visualization**: WaveSurfer.js v7
- **Audio Processing**: OfflineAudioContext (for export)
- **Format Conversion**: FFmpeg.wasm (WAV → MP3)
- **State Management**: React Context API
- **Styling**: Tailwind CSS

### Core Components

```
app/
├── routes/
│   └── studio.$productId.tsx          # Studio page route
├── contexts/
│   └── StudioContext.tsx              # Core state & audio logic
├── components/studio/
│   ├── PlaybackControls.tsx           # Play/Pause/Stop buttons
│   ├── TransportBar.tsx               # Timeline ruler & playhead
│   ├── StudioTrackList.tsx            # Track container
│   ├── StudioTrack.tsx                # Individual track with waveform
│   └── ExportDialog.tsx               # Export modal
└── utils/
    └── ffmpeg.ts                      # FFmpeg.wasm wrapper
```

---

## Web Audio API Implementation

### Audio Context Setup

```tsx
// StudioContext.tsx - Line 124-145
const ensureAudioContext = useCallback(() => {
  if (audioContextRef.current) return audioContextRef.current;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioContextClass();
  audioContextRef.current = ctx;
  return ctx;
}, []);
```

### Audio Graph Architecture

```
AudioBuffer (decoded audio)
    ↓
AudioBufferSourceNode (playback)
    ↓
GainNode (volume control)
    ↓
AudioContext.destination (speakers)
```

### Playback Implementation

```tsx
// StudioContext.tsx - Line 354-404
// For each stem:
const source = ctx.createBufferSource();
source.buffer = audioBuffer;

const gainNode = ctx.createGain();
gainNode.gain.value = stem.volume;

source.connect(gainNode).connect(ctx.destination);

// Apply trim points
const trimStart = stem.trimStart || 0;
const trimEnd = stem.trimEnd || stem.duration;

// Loop configuration
if (stem.isLooped) {
  source.loop = true;
  source.loopStart = trimStart;
  source.loopEnd = trimEnd;
  source.start(0, offset);
} else {
  source.start(0, offset, duration);
}
```

### Time Tracking

- Uses `requestAnimationFrame` for smooth 60fps updates
- Calculates elapsed time: `audioContext.currentTime - playbackStartTime`
- **Critical**: Uses `setState(prev => ...)` pattern to avoid stale closure issues

```tsx
// StudioContext.tsx - Line 275-327
const startTimeTracking = useCallback(() => {
  const updateTime = () => {
    const elapsed =
      audioContextRef.current.currentTime - playbackStartTimeRef.current;
    const newTime = playbackStartOffsetRef.current + elapsed;

    setState((prev) => {
      // All state checks inside setState callback to avoid stale closures
      if (newTime >= prev.masterDuration) {
        // Stop playback
        sourceNodesRef.current.forEach((source) => source.stop());
        return { ...prev, isPlaying: false, currentTime: 0 };
      }

      // Sync waveforms
      // Continue playback
      animationFrameRef.current = requestAnimationFrame(updateTime);
      return { ...prev, currentTime: newTime };
    });
  };

  animationFrameRef.current = requestAnimationFrame(updateTime);
}, []);
```

---

## WaveSurfer.js Integration

### Initialization

```tsx
// StudioTrack.tsx - Line 92-104
const wavesurfer = WaveSurfer.create({
  container: waveformRef.current,
  waveColor: "#3f3f46", // Gray (unplayed)
  progressColor: "#14b8a6", // Teal (played)
  cursorColor: "#ffffff",
  barWidth: 2,
  barGap: 1,
  height: stem.trackHeight,
  normalize: true,
  interact: false, // Disable default interactions
  backend: "WebAudio",
  plugins: [regions], // Regions plugin for trim
});
```

### Regions Plugin (Trim Regions)

```tsx
// StudioTrack.tsx - Line 116-123
regions.addRegion({
  id: `trim-${stem.id}`,
  start: trimStart,
  end: trimEnd,
  color: "rgba(251, 191, 36, 0.15)", // Amber (Ableton-style)
  drag: true,
  resize: true,
});

// Listen to region updates
regions.on("region-updated", (region) => {
  if (region.id === `trim-${stem.id}`) {
    setTrimStart(stem.id, region.start);
    setTrimEnd(stem.id, region.end);
  }
});
```

### Waveform Sync with Playback

```tsx
// StudioContext.tsx - Line 313-342
waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
  const stem = prev.stems.find((s) => s.id === stemId);

  let progress;
  if (stem.isLooped) {
    // Loop region: calculate cycling progress
    const loopDuration = trimEnd - trimStart;
    const timeIntoLoop = newTime - trimStart;
    const loopedTime = timeIntoLoop % loopDuration;
    progress = (trimStart + loopedTime) / stem.duration;
  } else {
    // Normal playback
    progress = newTime / stem.duration;
  }

  wavesurfer.seekTo(progress);
});
```

---

## Trim Regions & Loop Functionality

### Trim Region Behavior

- **Visual**: Amber-colored region overlay on waveform
- **Drag**: Move entire region
- **Resize**: Drag left/right handles to adjust start/end
- **Purpose**: Define which portion of the stem plays/exports

### Loop Implementation

- **Native Web Audio API loop**: `source.loop`, `source.loopStart`, `source.loopEnd`
- **Visual Indicators**:
  - Region color: 15% → 25% opacity (brighter when looped)
  - Waveform border: Amber ring (`ring-2 ring-amber-400/50`)
  - Badge: "LOOP 🔁" indicator

```tsx
// StudioContext.tsx - Line 379-387
if (stem.isLooped) {
  source.loop = true;
  source.loopStart = trimStart;
  source.loopEnd = trimEnd;

  // Start from current position or trim start
  const offset = Math.max(trimStart, Math.min(trimStart + startTime, trimEnd));
  source.start(0, offset);
}
```

### Waveform Progress Cycling

When looped, waveform progress visually cycles within the loop region:

```tsx
const timeIntoLoop = newTime - trimStart;
const loopedTime = timeIntoLoop % loopDuration; // Modulo for cycling
const absolutePosition = trimStart + loopedTime;
progress = absolutePosition / stem.duration;
```

---

## Solo/Mute Logic (Ableton-style)

### Behavior Specification

1. **Exclusive Solo** (default click):

   - Only the clicked track becomes solo
   - All other tracks are implicitly muted

2. **Multi-Solo** (Ctrl/Cmd + click):

   - Multiple tracks can be solo simultaneously
   - Non-soloed tracks are implicitly muted

3. **Mute Priority**:

   - Mute > Solo
   - If a track is explicitly muted, solo won't unmute it

4. **Visual Feedback**:
   - Implicitly muted tracks: `opacity-50` + "Implicitly Muted" badge

### Implementation

```tsx
// StudioContext.tsx - Line 162-171
const shouldStemBeAudible = (
  stem: StudioStemState,
  anySoloed: boolean
): boolean => {
  // If any stem is soloed, ONLY soloed stems are audible
  if (anySoloed) return stem.isSoloed;

  // If no stems are soloed, check mute state
  if (stem.isMuted) return false;

  return true;
};

// StudioTrack.tsx - Line 48-49
const anySoloed = state.stems.some((s) => s.isSoloed);
const isImplicitlyMuted = anySoloed && !stem.isSoloed;
```

### Toggle Solo Implementation

```tsx
// StudioContext.tsx - Line 519-541
const toggleSolo = useCallback((stemId: string, isMultiSelect = false) => {
  setState((prev) => {
    const updatedStems = prev.stems.map((stem) => {
      if (stem.id === stemId) {
        return { ...stem, isSoloed: !stem.isSoloed };
      } else if (!isMultiSelect) {
        // Exclusive solo: turn off other solos
        return { ...stem, isSoloed: false };
      }
      return stem;
    });

    return { ...prev, stems: updatedStems };
  });
}, []);
```

---

## Export System

### Architecture

1. **OfflineAudioContext**: Renders audio faster than real-time
2. **Mix down**: Combines selected stems with trim/volume applied
3. **WAV encoding**: Convert AudioBuffer to WAV Blob
4. **MP3 conversion**: FFmpeg.wasm (client-side)

### OfflineAudioContext Rendering

```tsx
// StudioContext.tsx - Line 662-770
export async function exportAudio(config: ExportConfig): Promise<Blob> {
  const sampleRate = 48000;
  const duration = calculateMaxDuration();

  // Create offline context
  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: 2,
    length: duration * sampleRate,
    sampleRate,
  });

  // Mix stems
  includedStems.forEach((stem) => {
    const buffer = audioBuffersRef.current.get(stem.id);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = stem.volume;

    // Apply trim points
    const trimStart = stem.trimStart || 0;
    const trimEnd = stem.trimEnd || stem.duration;
    const trimmedDuration = trimEnd - trimStart;

    source.connect(gainNode).connect(offlineCtx.destination);
    source.start(0, trimStart, trimmedDuration);
  });

  // Render
  const renderedBuffer = await offlineCtx.startRendering();

  // Convert to WAV
  const wavBlob = audioBufferToWav(renderedBuffer);

  // Convert to MP3 if needed
  if (config.format === "mp3") {
    return await convertWavToMp3(wavBlob, bitrate);
  }

  return wavBlob;
}
```

### WAV Encoding

```tsx
// StudioContext.tsx - Line 772-840
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // Write WAV header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, "WAVE");
  // ... (full WAV header specification)

  // Write audio data (interleaved)
  const channels = [];
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  // Interleave and convert to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: "audio/wav" });
}
```

### FFmpeg.wasm Integration

```tsx
// utils/ffmpeg.ts
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

let ffmpeg: FFmpeg | null = null;

export async function loadFFmpeg(): Promise<FFmpeg> {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  await ffmpeg.load();
  return ffmpeg;
}

export async function convertWavToMp3(
  wavBlob: Blob,
  bitrate: string = "320k"
): Promise<Blob> {
  const ffmpeg = await loadFFmpeg();

  await ffmpeg.writeFile("input.wav", await fetchFile(wavBlob));
  await ffmpeg.exec([
    "-i",
    "input.wav",
    "-codec:a",
    "libmp3lame",
    "-b:a",
    bitrate,
    "-q:a",
    "0",
    "output.mp3",
  ]);

  const data = await ffmpeg.readFile("output.mp3");
  return new Blob([data], { type: "audio/mpeg" });
}
```

---

## Audio Caching (IndexedDB)

> **სრული დოკუმენტაცია:** [`docs/technical/architecture/audio-cache.md`](./architecture/audio-cache.md)

### Overview

Studio იყენებს IndexedDB-ზე დაფუძნებულ cache-ს, რომ დიდი აუდიო ფაილები (~29MB თითო stem) არ გადმოიწეროს ყოველ ჯერზე.

### Key Features

| Feature | Description |
|---------|-------------|
| **Storage** | IndexedDB (`czaba-audio-cache` database) |
| **Expiry** | 30 დღე |
| **Key Format** | `${productId}:${stemId}` |
| **Data** | Raw ArrayBuffer |

### Flow

```
First Load:  Network → Decode → Cache → Play
Second Load: Cache → Decode → Play (95% faster!)
```

### API

```typescript
import { getCachedStem, cacheStem, clearExpiredCache } from '~/lib/audio-cache';

// Check cache first
const cached = await getCachedStem(productId, stemId);
if (cached) {
  arrayBuffer = cached.slice(0); // Always clone!
} else {
  arrayBuffer = await fetch(url).then(r => r.arrayBuffer());
  cacheStem(productId, stemId, arrayBuffer.slice(0)); // Save for next time
}
```

### Critical: ArrayBuffer Cloning

`decodeAudioData()` **"detaches"** ArrayBuffer-ს (გახდება ცარიელი). ამიტომ ყოველთვის `.slice(0)` გამოიყენე:

```typescript
// ✅ სწორი
const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

// ❌ არასწორი - buffer განადგურდება
const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
```

---

## State Management

### StudioContext Architecture

```tsx
interface StudioState {
  // Product
  productId: string | null;
  productTitle: string | null;
  stems: StudioStemState[];

  // Playback
  isPlaying: boolean;
  currentTime: number;
  masterDuration: number;

  // Loading
  isLoading: boolean;
  allLoaded: boolean;

  // Export
  isExporting: boolean;
  exportProgress: number;

  // UI
  zoomLevel: number;
  splitMode: boolean;
}

interface StudioStemState {
  id: string;
  name: string;
  audioUrl: string;
  duration: number;

  // Trim
  trimStart: number;
  trimEnd: number;

  // Controls
  isMuted: boolean;
  isSoloed: boolean;
  isLooped: boolean;
  volume: number;

  // UI
  trackHeight: number;
  splitMarkers: number[];

  // Loading
  isLoaded: boolean;
}
```

### Refs (Mutable, Non-Reactive)

```tsx
const audioContextRef = useRef<AudioContext | null>(null);
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());
const waveformInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());
const animationFrameRef = useRef<number | null>(null);
const playbackStartTimeRef = useRef<number>(0);
const playbackStartOffsetRef = useRef<number>(0);
```

---

## Key Technical Decisions

### 1. Why `setState(prev => ...)` Pattern?

**Problem**: Stale closures in callbacks with state dependencies

**Solution**: Move all state reads inside `setState` callback

```tsx
// ❌ BAD - Stale closure
const togglePlayPause = useCallback(() => {
  if (state.isPlaying) {
    /* stale! */
  }
}, [state]);

// ✅ GOOD - Fresh state
const togglePlayPause = useCallback(() => {
  setState((prev) => {
    if (prev.isPlaying) {
      /* fresh! */
    }
  });
}, []);
```

### 2. Why OfflineAudioContext for Export?

- **Faster than real-time**: 10-second track renders in ~1 second
- **No playback required**: Silent rendering
- **Same API**: Uses Web Audio API (familiar)
- **Client-side**: No server needed

### 3. Why FFmpeg.wasm?

- **Client-side conversion**: No backend required
- **High quality**: Supports LAME encoder (industry standard)
- **Format flexibility**: Can add FLAC, AAC, etc. in future

### 4. Why WaveSurfer.js?

- **Performance**: Handles large audio files (100+ MB)
- **Visual quality**: Professional-looking waveforms
- **Regions plugin**: Built-in trim region support
- **Active development**: v7 is modern and maintained

### 5. Why React Context instead of Redux?

- **Simpler**: No boilerplate, less complexity
- **Performance**: State is localized to Studio pages
- **Remix integration**: Works seamlessly with Remix loaders

---

## File Structure

```
music-store/
├── app/
│   ├── routes/
│   │   └── studio.$productId.tsx          # Studio page (loader + UI)
│   ├── contexts/
│   │   └── StudioContext.tsx              # Core audio logic & state
│   ├── components/studio/
│   │   ├── PlaybackControls.tsx           # Play/Pause/Stop/Split
│   │   ├── TransportBar.tsx               # Timeline ruler + zoom
│   │   ├── StudioTrackList.tsx            # Scrollable track container
│   │   ├── StudioTrack.tsx                # Waveform + controls
│   │   └── ExportDialog.tsx               # Export modal
│   ├── types/
│   │   └── studio.ts                      # TypeScript interfaces
│   └── utils/
│       └── ffmpeg.ts                      # FFmpeg.wasm wrapper
└── public/
    └── stems/
        └── middle-east/                   # Audio files (.wav)
```

---

## Performance Optimizations

### 1. Audio Buffer Caching

- Decoded buffers stored in `Map<string, AudioBuffer>`
- Avoids re-decoding on every playback

### 2. Waveform Instance Reuse

- WaveSurfer instances stored in ref
- Seeked during playback (not recreated)

### 3. RequestAnimationFrame Throttling

- Time tracking at 60fps (not faster)
- Paused when not playing

### 4. Trim Region Calculation

- Calculated once per stem
- Stored in state, not recalculated

### 5. Export Progress Reporting

- Uses `OfflineAudioContext.oncomplete` event
- No polling required

---

## Known Limitations & Future Improvements

### Current Limitations

1. **No undo/redo**: Trim changes can't be undone
2. **No waveform zoom**: Horizontal waveform zoom not implemented
3. **No effects**: No EQ, reverb, compression, etc.
4. **No automation**: Volume/pan can't be automated over time
5. **No MIDI support**: Audio-only

### Planned Improvements

1. **History stack**: Undo/redo with Ctrl+Z
2. **Waveform zoom**: Horizontal zoom independent of timeline zoom
3. **Effects chain**: Basic EQ, reverb, delay
4. **Normalization**: Auto-normalize export volume
5. **Markers**: Add markers for quick navigation
6. **Keyboard shortcuts**: Space = play/pause, etc.

---

## Debugging Tips

### Enable Console Logs

Search for `console.log` statements:

- `StudioContext.tsx`: Playback, loading, export logs
- `StudioTrack.tsx`: Waveform loading logs

### Common Issues

**Issue**: "Failed to fetch" audio files

- **Solution**: Ensure dev server is running (`npm run dev`)
- **Check**: Files exist in `public/stems/middle-east/`

**Issue**: Timeline doesn't move

- **Solution**: Check `setState(prev => ...)` pattern in time tracking

**Issue**: Pause button doesn't work

- **Solution**: Check `setState(prev => ...)` pattern in `togglePlayPause`

**Issue**: Waveform doesn't loop visually

- **Solution**: Check loop progress calculation in waveform sync

---

## Testing Checklist

### Playback

- [ ] Play/Pause works
- [ ] Stop resets to 0:00
- [ ] Timeline moves during playback
- [ ] Seeking works (click on timeline)

### Trim & Loop

- [ ] Trim region can be dragged
- [ ] Trim region can be resized (left/right handles)
- [ ] Loop button enables/disables loop
- [ ] Looped stem shows visual indicators (border, badge, brighter region)
- [ ] Waveform progress cycles within loop region

### Solo/Mute

- [ ] Solo (exclusive): Only one track plays
- [ ] Solo (multi): Ctrl+Click allows multiple solos
- [ ] Mute overrides Solo
- [ ] Implicitly muted tracks are visually dimmed

### Export

- [ ] WAV export works
- [ ] MP3 export works (FFmpeg.wasm)
- [ ] Selected stems only export
- [ ] Trim regions are respected in export
- [ ] Volume levels are applied

### UI

- [ ] Zoom controls work (50% - 400%)
- [ ] Track height resize works
- [ ] Individual stem download works
- [ ] Export dialog opens/closes

---

## Dependencies

```json
{
  "dependencies": {
    "wavesurfer.js": "^7.x",
    "@ffmpeg/ffmpeg": "^0.12.x",
    "@ffmpeg/util": "^0.12.x"
  }
}
```

---

**Last Updated**: 2025-01-07
**Version**: 1.1.0
**Author**: Claude Code Assistant
