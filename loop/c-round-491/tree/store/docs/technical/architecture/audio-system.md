# Audio System Architecture - 3-დონიანი სისტემა

## მიმოხილვა

CZABA Store-ში გამოიყენება **3-დონიანი აუდიო არქიტექტურა**, რომელიც უზრუნველყოფს სხვადასხვა დონის აუდიო გამოცდილებას პროდუქტის გაცნობიდან სრულ რედაქტირებამდე.

```
┌────────────────────────────────────────────────────────────────────────┐
│                       CZABA Audio System                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Level 1: AudioContext          Level 2: StemsContext                  │
│  ┌─────────────────────┐        ┌─────────────────────────────────┐   │
│  │ Simple Preview      │        │ Multi-Stem Preview Modal        │   │
│  │ - Single audio file │        │ - Multiple HTMLAudioElement     │   │
│  │ - HTMLAudioElement  │        │ - Basic Solo/Mute               │   │
│  │ - Play/Pause/Seek   │        │ - Synchronized playback         │   │
│  │ - Volume control    │        │ - Quick demo experience         │   │
│  │ - Queue system      │        │                                 │   │
│  └─────────────────────┘        └─────────────────────────────────┘   │
│           ↑                                    ↑                       │
│           │ მარტივი                            │ საშუალო               │
│           │ preview                            │ preview               │
│           │                                    │                       │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              Level 3: StudioContext (Full DAW)                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │ Web Audio API Architecture:                               │  │   │
│  │  │                                                           │  │   │
│  │  │ AudioBuffer → BufferSourceNode → GainNode → destination  │  │   │
│  │  │      ↑              ↑                ↑           ↑       │  │   │
│  │  │   PCM Data      Play/Stop      Volume/Mute   Speakers    │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                 │   │
│  │  Features: Solo/Mute, Loop, Export, Video Sync, Undo/Redo      │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## დონე 1: AudioContext (Simple Player)

### დანიშნულება

მარტივი აუდიო preview საიტზე ნავიგაციის დროს. Sticky Player, რომელიც არ წყდება გვერდებს შორის გადასვლისას.

### მდებარეობა

`app/contexts/AudioContext.tsx`

### ტექნოლოგია

- **HTMLAudioElement** - ბრაუზერის ჩაშენებული აუდიო ელემენტი
- **Single file playback** - ერთი ფაილის დაკვრა
- **Event-based updates** - `timeupdate`, `loadedmetadata`, `ended`

### State Interface

```typescript
interface AudioState {
  currentTrack: Track | null;   // მიმდინარე ტრეკი
  isPlaying: boolean;           // დაკვრის სტატუსი
  volume: number;               // 0-1 (default: 0.7)
  currentTime: number;          // მიმდინარე დრო (წამებში)
  duration: number;             // ტრეკის ხანგრძლივობა
  queue: Track[];               // რიგი
  queueIndex: number;           // მიმდინარე პოზიცია რიგში
}
```

### API

| მეთოდი | აღწერა |
|--------|--------|
| `play(track)` | ტრეკის დაკვრა |
| `pause()` | პაუზა |
| `resume()` | გაგრძელება |
| `togglePlayPause()` | Play/Pause toggle |
| `seek(time)` | გადახტომა დროზე |
| `setVolume(volume)` | ხმის დაყენება |
| `addToQueue(track)` | რიგში დამატება |
| `skipNext()` | შემდეგი ტრეკი |
| `skipPrevious()` | წინა ტრეკი (3წმ+ = restart) |
| `closePlayer()` | Player-ის დახურვა |

### რეალური სცენარი

```
1. მომხმარებელი ხსნის პროდუქტის გვერდს
2. აჭერს Preview ღილაკს
3. AudioContext იწყებს დაკვრას
4. მომხმარებელი გადადის სხვა გვერდზე
5. მუსიკა აგრძელებს დაკვრას (Sticky Player)
6. მომხმარებელი აჭერს პაუზას Sticky Player-ზე
```

### გამოყენება კომპონენტებში

```typescript
import { useAudio } from '~/hooks/useAudio';

function ProductCard({ product }) {
  const { play, state } = useAudio();

  const isThisPlaying = state.currentTrack?.id === product.id && state.isPlaying;

  return (
    <button onClick={() => play({
      id: product.id,
      title: product.title,
      audioUrl: product.audioPreviewUrl,
      imageUrl: product.featuredImage?.url,
      productHandle: product.handle,
    })}>
      {isThisPlaying ? 'Pause' : 'Play'}
    </button>
  );
}
```

---

## დონე 2: StemsContext (Multi-Stem Preview)

### დანიშნულება

Stems-ების სწრაფი preview მოდალში. მომხმარებელს შეუძლია მოისმინოს ცალკეული stems და გაიგოს რას ყიდულობს.

### მდებარეობა

`app/contexts/StemsContext.tsx`

### ტექნოლოგია

- **Multiple HTMLAudioElement** - თითოეული stem-ისთვის ცალკე audio element
- **Synchronized playback** - ყველა stem ერთდროულად უკრავს
- **Basic Solo/Mute** - მარტივი solo/mute ფუნქციონალი

### State Interface

```typescript
interface StemsPlayerState {
  currentTrack: Track | null;     // ტრეკი stems-ებით
  stems: StemState[];             // stems-ების მასივი
  isPlaying: boolean;             // დაკვრის სტატუსი
  currentTime: number;            // მიმდინარე დრო
  duration: number;               // ხანგრძლივობა
  isLoading: boolean;             // იტვირთება
  allLoaded: boolean;             // ყველა ჩატვირთულია
}

interface StemState {
  id: string;
  name: string;
  audioUrl: string;
  isMuted: boolean;
  isSoloed: boolean;
  isLoaded: boolean;
}
```

### API

| მეთოდი | აღწერა |
|--------|--------|
| `openStemsPlayer(track)` | მოდალის გახსნა და stems-ების ჩატვირთვა |
| `closeStemsPlayer()` | მოდალის დახურვა |
| `togglePlayPause()` | Play/Pause |
| `toggleMute(stemId)` | Stem-ის mute toggle |
| `toggleSolo(stemId)` | Stem-ის solo toggle |
| `seek(time)` | Seek ყველა stem-ზე |

### სინქრონიზაციის მექანიზმი

```typescript
// Master stem (პირველი) მართავს დროს
const handleTimeUpdate = () => {
  const firstAudio = audioElementsRef.current.values().next().value;
  const currentTime = firstAudio.currentTime;

  // შევამოწმოთ drift და resynce-ვთ
  audioElementsRef.current.forEach((audio, id) => {
    if (audio !== firstAudio) {
      const drift = Math.abs(audio.currentTime - currentTime);
      if (drift > 0.1) {  // 100ms tolerance
        audio.currentTime = currentTime;  // Resync!
      }
    }
  });
};
```

### Solo/Mute ლოგიკა (Ableton-style)

```typescript
const shouldStemBeAudible = (stem, anySoloed) => {
  // წესი 1: Muted stem არასოდეს არ ისმის
  if (stem.isMuted) return false;

  // წესი 2: თუ რომელიმე Solo-შია, მხოლოდ Solo-ები ისმის
  if (anySoloed) return stem.isSoloed;

  // Default: ისმის
  return true;
};
```

### რეალური სცენარი

```
1. მომხმარებელი პროდუქტის გვერდზეა
2. აჭერს "Preview Stems" ღილაკს
3. StemsContext ხსნის მოდალს
4. იტვირთება ყველა stem (~5-10 ფაილი)
5. მომხმარებელი უკრავს და Solo-ში ტოვებს Drums-ს
6. მხოლოდ Drums ისმის
7. მომხმარებელი კმაყოფილია და ყიდულობს
```

---

## დონე 3: StudioContext (Full DAW)

### დანიშნულება

სრული "Personal Mixdown Studio" - Ableton Live-ის მსგავსი ინტერფეისი შეძენილი პროდუქტების რედაქტირებისთვის.

### მდებარეობა

`app/contexts/StudioContext.tsx`

### ტექნოლოგია

- **Web Audio API** - დაბალ დონეზე აუდიო კონტროლი
- **AudioBuffer** - PCM მონაცემების შენახვა მეხსიერებაში
- **AudioBufferSourceNode** - დაკვრის node (ერთჯერადი!)
- **GainNode** - ხმის/mute კონტროლი
- **OfflineAudioContext** - Export-ისთვის faster-than-realtime რენდერი
- **WaveSurfer.js** - Waveform ვიზუალიზაცია
- **IndexedDB** - აუდიო ფაილების cache

### Audio Graph

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ AudioBuffer  │────▶│ SourceNode   │────▶│  GainNode    │────▶ destination
│ (PCM data)   │     │ (playback)   │     │  (volume)    │      (speakers)
└──────────────┘     └──────────────┘     └──────────────┘
                           ▲                     ▲
                           │                     │
                    source.start()         gain.value = 0
                    source.stop()          (mute effect)
```

### State Interface

```typescript
interface StudioState {
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

  // UI
  zoomLevel: number;        // 0.5 - 4 (50% - 400%)
  splitMode: boolean;

  // Selection (Ableton-style)
  selectedStemIds: Set<string>;
  lastSelectedStemId: string | null;

  // Loop
  loopRegion: { start: number; end: number };
  loopEnabled: boolean;

  // Time selection
  timeSelection: TimeSelection;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;
}
```

### Refs (Web Audio API)

```typescript
// AudioContext - მთავარი engine
const audioContextRef = useRef<AudioContext | null>(null);

// AudioBuffer cache - დეკოდირებული აუდიო
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

// Source nodes - დაკვრის ობიექტები (ერთჯერადი!)
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

// Gain nodes - ხმის კონტროლი
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

// WaveSurfer instances - ვიზუალიზაცია
const waveformInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());
```

**რატომ `Map` და არა `Array`?**

- `Map.get(stemId)` = O(1) - მყისიერი lookup
- `Array.find(s => s.id === stemId)` = O(n) - ნელი

**რატომ `useRef`?**

1. **Performance** - ref ცვლილება არ იწვევს re-render
2. **Mutable** - Web Audio nodes მუტაბელურია
3. **Synchronous** - Audio callbacks-ში სინქრონული წვდომა

### Time Tracking (requestAnimationFrame)

```typescript
const startTimeTracking = useCallback(() => {
  const updateTime = () => {
    // 1. გამოვთვალოთ elapsed time
    const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    let newTime = playbackStartOffsetRef.current + elapsed;

    setState(prev => {
      // 2. Loop check
      if (prev.loopEnabled && newTime >= prev.loopRegion.end) {
        newTime = prev.loopRegion.start;
        restartAudioAtPosition(newTime);
      }

      // 3. End check
      if (newTime >= prev.masterDuration) {
        return { ...prev, isPlaying: false, currentTime: 0 };
      }

      // 4. Continue loop
      animationFrameRef.current = requestAnimationFrame(updateTime);

      return { ...prev, currentTime: newTime };
    });
  };

  animationFrameRef.current = requestAnimationFrame(updateTime);
}, []);
```

**რატომ `requestAnimationFrame`?**

- ~60fps update rate
- Browser-ის render cycle-თან სინქრონიზაცია
- ეფექტური - pause ხდება როცა tab არ ჩანს

**რატომ `audioContext.currentTime`?**

Web Audio API-ს აქვს high-precision hardware timer. `Date.now()`-ზე უფრო ზუსტია აუდიო სინქრონიზაციისთვის.

### სრული დოკუმენტაცია

დეტალური აღწერისთვის იხილეთ: [StudioContext.md](./StudioContext.md)

---

## შედარება

| თვისება | AudioContext | StemsContext | StudioContext |
|---------|--------------|--------------|---------------|
| **დანიშნულება** | Quick preview | Stems preview | Full editing |
| **API** | HTMLAudioElement | HTMLAudioElement[] | Web Audio API |
| **Stems support** | არა | დიახ | დიახ |
| **Solo/Mute** | არა | Basic | Advanced + Group |
| **Loop** | არა | არა | Global + Per-stem |
| **Export** | არა | არა | WAV/MP3/ALS |
| **Video sync** | არა | არა | დიახ |
| **Waveform** | არა | არა | WaveSurfer.js |
| **Undo/Redo** | არა | არა | დიახ |
| **Caching** | Browser | Browser | IndexedDB |
| **კომპონენტი** | StickyPlayer | StemsPlayerModal | Studio page |
| **წვდომა** | ყველა | ყველა | მხოლოდ მფლობელები |

---

## როდის რომელი გამოვიყენოთ?

```
მომხმარებელი ათვალიერებს საიტს
         │
         ▼
    ┌─────────────────┐
    │ უკრავს Preview? │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │ AudioContext    │ ← მარტივი preview
    │ (Sticky Player) │
    └────────┬────────┘
             │
    ┌────────┴────────────┐
    │ Stems Preview კამერა? │
    └────────┬────────────┘
             │
    ┌────────┴────────┐
    │ StemsContext    │ ← stems-ების demo
    │ (Modal)         │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │ იყიდა Premium?  │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │ StudioContext   │ ← სრული რედაქტირება
    │ (Studio Page)   │
    └─────────────────┘
```

---

## Performance Considerations

### 1. Memory Management

```typescript
// AudioBuffer-ები დიდია (~29MB თითო stem)
// Cache-ში ინახება, მაგრამ cleanup საჭიროა

useEffect(() => {
  return () => {
    // Cleanup on unmount
    sourceNodesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourceNodesRef.current.clear();
    gainNodesRef.current.clear();
    // NOTE: audioBuffersRef რჩება cache-ისთვის
  };
}, []);
```

### 2. IndexedDB Caching

```typescript
// First load: Network → Decode → Cache → Play
// Second load: Cache → Decode → Play (95% faster!)

const cached = await getCachedStem(productId, stemId);
if (cached) {
  arrayBuffer = cached.slice(0); // Always clone!
} else {
  arrayBuffer = await fetch(url).then(r => r.arrayBuffer());
  cacheStem(productId, stemId, arrayBuffer.slice(0));
}
```

### 3. ArrayBuffer Cloning

`decodeAudioData()` **"detaches"** ArrayBuffer-ს. ამიტომ ყოველთვის `.slice(0)`:

```typescript
// სწორი
const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

// არასწორი - buffer განადგურდება!
const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
```

---

## დაკავშირებული დოკუმენტაცია

- [StudioContext.md](./StudioContext.md) - დეტალური StudioContext აღწერა
- [audio-cache.md](./audio-cache.md) - IndexedDB caching სისტემა
- [solo-mute.md](../features/solo-mute.md) - Solo/Mute ლოგიკა
- [loop.md](../features/loop.md) - Loop ფუნქციონალი

---

## ბოლო განახლება

2026-01-18 - 3-დონიანი არქიტექტურის დოკუმენტაცია
