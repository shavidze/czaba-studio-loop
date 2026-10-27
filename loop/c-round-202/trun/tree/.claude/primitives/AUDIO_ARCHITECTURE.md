# AUDIO_ARCHITECTURE

## Studio/DAW 3-Layer Audio System

### არქიტექტურა

```
┌────────────────────────────────────────────────────────────┐
│                    StudioContext                            │
│  Full DAW: Timeline, Loop Regions, Trim, Solo/Mute, Export │
│  Route: /studio/:handle                                     │
└────────────────────────────────────────────────────────────┘
                           │
                           │ extends
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    StemsContext                             │
│  Modal Preview: Multi-stem playback, volume control         │
│  Component: StemsPreviewModal                               │
└────────────────────────────────────────────────────────────┘
                           │
                           │ extends
                           ▼
┌────────────────────────────────────────────────────────────┐
│                    AudioContext                             │
│  Simple Playback: Single track preview, play/pause          │
│  Component: AudioPlayer                                     │
└────────────────────────────────────────────────────────────┘
```

### Layer 1: AudioContext (Simple)

```tsx
interface AudioState {
  isPlaying: boolean
  currentTrack: Track | null
  progress: number
  duration: number
}

interface AudioContextValue extends AudioState {
  play: (track: Track) => void
  pause: () => void
  seek: (time: number) => void
}

// გამოყენება
function TrackCard({ track }) {
  const { play, pause, isPlaying, currentTrack } = useAudio()
  const isThisTrack = currentTrack?.id === track.id

  return (
    <button onClick={() => isThisTrack && isPlaying ? pause() : play(track)}>
      {isThisTrack && isPlaying ? <Pause /> : <Play />}
    </button>
  )
}
```

### Layer 2: StemsContext (Multi-track)

```tsx
interface Stem {
  id: string
  name: string       // "Drums", "Bass", "Melody", "Vocals"
  url: string
  volume: number     // 0-1
  isMuted: boolean
  isSolo: boolean
  waveform: number[] // Pre-computed peaks
}

interface StemsState {
  stems: Stem[]
  isPlaying: boolean
  currentTime: number
  duration: number
}

interface StemsContextValue extends StemsState {
  loadStems: (productHandle: string) => Promise<void>
  play: () => void
  pause: () => void
  setVolume: (stemId: string, volume: number) => void
  toggleMute: (stemId: string) => void
  toggleSolo: (stemId: string) => void
}
```

### Layer 3: StudioContext (Full DAW)

```tsx
interface LoopRegion {
  start: number  // seconds
  end: number    // seconds
  isActive: boolean
}

interface TrimRegion {
  start: number
  end: number
}

interface StudioState extends StemsState {
  loop: LoopRegion | null
  trim: TrimRegion | null
  isExporting: boolean
  exportProgress: number
}

interface StudioContextValue extends StudioState {
  // Loop
  setLoop: (start: number, end: number) => void
  clearLoop: () => void
  toggleLoop: () => void

  // Trim
  setTrim: (start: number, end: number) => void
  clearTrim: () => void

  // Export
  exportMix: (format: 'wav' | 'mp3') => Promise<Blob>
}
```

### Solo/Mute Logic (Ableton-style)

```tsx
function getAudibleStems(stems: Stem[]): Stem[] {
  const soloedStems = stems.filter(s => s.isSolo)

  // თუ რამე Solo-ზეა, მხოლოდ ისინი ისმის
  if (soloedStems.length > 0) {
    return soloedStems.filter(s => !s.isMuted)
  }

  // თუ არაფერი არ არის Solo-ზე, ყველა ისმის გარდა Muted-ისა
  return stems.filter(s => !s.isMuted)
}
```

### WaveSurfer Integration

```tsx
import WaveSurfer from 'wavesurfer.js'

function StemWaveform({ stem }: { stem: Stem }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'var(--color-muted)',
      progressColor: 'var(--color-brand)',
      height: 64,
      normalize: true
    })

    wavesurfer.current.load(stem.url)

    return () => wavesurfer.current?.destroy()
  }, [stem.url])

  return <div ref={containerRef} />
}
```

### Export with FFmpeg.wasm

```tsx
import { FFmpeg } from '@ffmpeg/ffmpeg'

async function exportMix(stems: Stem[], trim: TrimRegion): Promise<Blob> {
  const ffmpeg = new FFmpeg()
  await ffmpeg.load()

  // Write stem files
  for (const stem of stems) {
    const buffer = await fetch(stem.url).then(r => r.arrayBuffer())
    ffmpeg.writeFile(`stem_${stem.id}.wav`, new Uint8Array(buffer))
  }

  // Mix command
  const inputs = stems.map((s, i) => `-i stem_${s.id}.wav`).join(' ')
  const volumes = stems.map((s, i) => `[${i}:a]volume=${s.volume}[a${i}]`).join(';')
  const mix = stems.map((_, i) => `[a${i}]`).join('')

  await ffmpeg.exec([
    ...inputs.split(' '),
    '-filter_complex', `${volumes};${mix}amix=inputs=${stems.length}:duration=longest[out]`,
    '-map', '[out]',
    '-ss', String(trim.start),
    '-to', String(trim.end),
    'output.mp3'
  ])

  const data = await ffmpeg.readFile('output.mp3')
  return new Blob([data], { type: 'audio/mp3' })
}
```

### IndexedDB Caching

```tsx
const CACHE_DB = 'czaba-audio-cache'

async function cacheAudioBuffer(url: string, buffer: ArrayBuffer) {
  const db = await openDB(CACHE_DB, 1, {
    upgrade(db) {
      db.createObjectStore('buffers')
    }
  })
  await db.put('buffers', buffer, url)
}

async function getCachedBuffer(url: string): Promise<ArrayBuffer | null> {
  const db = await openDB(CACHE_DB, 1)
  return db.get('buffers', url)
}
```
