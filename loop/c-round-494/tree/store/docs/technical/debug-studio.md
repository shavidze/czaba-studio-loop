# Studio (Personal Mixdown) Debugging

Web Audio API + WaveSurfer.js სისტემის debugging გზამკვლევი.

## არქიტექტურა

```
AudioBuffer (decoded)
    ↓
AudioBufferSourceNode (playback)
    ↓
GainNode (volume)
    ↓
AudioContext.destination (speakers)
```

---

## ფაილების მდებარეობა

```
app/
├── routes/studio.$productId.tsx      # Studio page
├── contexts/StudioContext.tsx        # Core audio logic
├── components/studio/
│   ├── PlaybackControls.tsx         # Play/Pause/Stop
│   ├── TransportBar.tsx             # Timeline
│   ├── StudioTrack.tsx              # Waveform
│   └── ExportDialog.tsx             # Export modal
└── lib/audio-cache.ts               # IndexedDB cache
```

---

## Debug Checklist

### 1. აუდიო არ უკრავს

```typescript
// შეამოწმე AudioContext state
const ctx = audioContextRef.current;
console.log('AudioContext state:', ctx?.state);
// "suspended" → ctx.resume() საჭიროა
// "running" → კარგია
```

**გადაწყვეტა:**
```typescript
// User gesture შემდეგ resume
await audioContext.resume();
```

### 2. Waveform არ ჩანს

```typescript
// WaveSurfer initialization check
const wavesurfer = WaveSurfer.create({
  container: waveformRef.current, // ref უნდა იყოს მინიჭებული
  // ...
});

// Check container exists
console.log('Container:', waveformRef.current);
```

### 3. Timeline არ მოძრაობს

**პრობლემა:** Stale closure in requestAnimationFrame

**გადაწყვეტა:** setState(prev => ...) pattern
```typescript
// ❌ არასწორი
if (state.isPlaying) { ... }

// ✅ სწორი
setState(prev => {
  if (prev.isPlaying) { ... }
});
```

### 4. Loop არ მუშაობს

```typescript
// Web Audio native loop
source.loop = true;
source.loopStart = trimStart;
source.loopEnd = trimEnd;
source.start(0, offset);
```

### 5. Export fails

```typescript
// OfflineAudioContext check
const offlineCtx = new OfflineAudioContext({
  numberOfChannels: 2,
  length: duration * sampleRate, // length in samples!
  sampleRate: 48000
});

// MP3: app/utils/ffmpeg.ts (legacy სახელი) → საერთო LAME encoder
convertWavToMp3(wavBlob: Blob, bitrate: string = '320k'): Promise<Blob>
```

- დასაშვები `bitrate`: `'128k'`, `'192k'`, `'320k'`; სხვა მნიშვნელობაზე ფუნქცია შეცდომას აგდებს.
- MP3 encoder (`app/lib/arrangement/mp3-encoder.client.ts`, `mediabunny` + `@mediabunny/mp3-encoder`) პირველ MP3 ექსპორტზე იტვირთება, იმავე origin-იდან, ცალკე lazy chunk-ით. Network tab-ში მოძებნე `mp3-encoder.client` (production build-ში `mp3-encoder.client-*.js`); მესამე მხარის CDN-ზე (მაგ. `unpkg.com`) request არ უნდა იყოს.
- `Unsupported MP3 bitrate` შეცდომა ნიშნავს, რომ `convertWavToMp3`-ს დაუშვებელი `bitrate` გადაეცა.

---

## Audio Cache (IndexedDB)

```typescript
import { getCachedStem, cacheStem } from '~/lib/audio-cache';

// Check cache
const cached = await getCachedStem(productId, stemId);

// CRITICAL: ArrayBuffer cloning!
// decodeAudioData "detaches" buffer
const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
```

---

## Solo/Mute Logic (Ableton-style)

```typescript
// Exclusive Solo (default click): მხოლოდ ერთი soloed
// Multi-Solo (Ctrl+Click): რამდენიმე soloed

const shouldStemBeAudible = (stem, anySoloed) => {
  if (anySoloed) return stem.isSoloed;  // Only soloed tracks play
  if (stem.isMuted) return false;
  return true;
};
```

---

## State Structure

```typescript
interface StudioState {
  productId: string;
  stems: StudioStemState[];
  isPlaying: boolean;
  currentTime: number;
  masterDuration: number;
  zoomLevel: number;
}

interface StudioStemState {
  id: string;
  name: string;
  audioUrl: string;
  duration: number;
  trimStart: number;
  trimEnd: number;
  isMuted: boolean;
  isSoloed: boolean;
  isLooped: boolean;
  volume: number;
}
```

---

## Refs (Non-reactive)

```typescript
const audioContextRef = useRef<AudioContext>();
const audioBuffersRef = useRef<Map<string, AudioBuffer>>();
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>();
const gainNodesRef = useRef<Map<string, GainNode>>();
const waveformInstancesRef = useRef<Map<string, WaveSurfer>>();
```

---

## Testing Checklist

- [ ] Play/Pause works
- [ ] Stop resets to 0:00
- [ ] Timeline scrubbing
- [ ] Trim region drag/resize
- [ ] Loop on/off
- [ ] Solo exclusive
- [ ] Solo multi (Ctrl+Click)
- [ ] Mute > Solo priority
- [ ] Volume slider
- [ ] WAV export
- [ ] MP3 export (LAME via mediabunny): Low/Medium/High → 128/192/320 kbps
- [ ] Zoom controls

---

## Console Debugging

```typescript
// StudioContext state
const { state } = useStudio();
console.log('Studio state:', state);

// AudioContext
console.log('AudioContext:', audioContextRef.current?.state);

// Buffers loaded
console.log('Buffers:', audioBuffersRef.current?.size);
```

თუ $ARGUMENTS მითითებულია, debug კონკრეტული Studio პრობლემა.
