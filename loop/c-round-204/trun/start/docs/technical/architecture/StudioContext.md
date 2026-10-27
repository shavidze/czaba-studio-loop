# StudioContext - დეტალური ტექნიკური აღწერა

## მდებარეობა

`app/contexts/StudioContext.tsx`

## კონცეფცია

StudioContext არის Studio გვერდის **ცენტრალური state management** სისტემა. ეს არის React Context, რომელიც მართავს:
- Web Audio API (აუდიოს დაკვრა)
- Playback state (play/pause/stop/seek)
- Solo/Mute ლოგიკა
- Loop system (global + per-stem)
- Selection system (multi-select)
- Undo/Redo history
- Export functionality
- Video sync
- Keyboard shortcuts

**ზომა:** ~1700 ხაზი კოდი

---

## ფაილის სტრუქტურა

```
StudioContext.tsx
├── Imports
├── Interfaces
│   ├── StudioContextValue (public API)
│   └── StudioState (internal state)
├── initialState
├── StudioProvider component
│   ├── Refs (Web Audio, animation, video)
│   ├── Helper functions
│   ├── Lifecycle (loadProduct, loadVideo)
│   ├── Playback (togglePlayPause, seek, stop)
│   ├── Stem controls (toggleMute, toggleSolo, setVolume)
│   ├── Loop system
│   ├── Selection system
│   ├── Undo/Redo
│   ├── Export
│   ├── Keyboard handlers (useEffect)
│   └── Context Provider value
└── useStudio hook
```

---

## Interfaces

### StudioContextValue (Public API)

```typescript
interface StudioContextValue {
  state: StudioState;

  // Lifecycle
  loadProduct: (product: ProductWithStems) => Promise<void>;

  // Playback controls
  togglePlayPause: () => void;
  seek: (time: number) => void;
  stop: () => void;

  // Stem controls
  toggleMute: (stemId: string) => void;
  toggleSolo: (stemId: string, isMultiSelect?: boolean) => void;
  setVolume: (stemId: string, volume: number) => void;
  setTrackHeight: (stemId: string, height: number) => void;

  // Global Loop (Ableton-style)
  loopRegion: LoopRegion;           // { start: number, end: number }
  loopEnabled: boolean;
  setLoopRegion: (region: LoopRegion) => void;
  setLoopEnabled: (enabled: boolean) => void;
  toggleLoopEnabled: () => void;

  // Selection (Ableton-style multi-select)
  selectedStemIds: Set<string>;
  selectStem: (stemId: string, mode: SelectionMode) => void;
  selectAllStems: () => void;
  deselectAllStems: () => void;

  // Time selection (waveform drag)
  timeSelection: TimeSelection;
  setTimeSelection: (start: number, end: number) => void;
  clearTimeSelection: () => void;
  setLoopFromSelection: () => void;  // Ctrl+L

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // ... და სხვა
}
```

### StudioState (Internal State)

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

  // Selection
  selectedStemIds: Set<string>;
  lastSelectedStemId: string | null;

  // Loop (Ableton-style)
  loopRegion: LoopRegion;
  loopEnabled: boolean;

  // Time selection
  timeSelection: TimeSelection;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // ...
}
```

---

## Web Audio API Refs

```typescript
// AudioContext - მთავარი აუდიო engine
const audioContextRef = useRef<AudioContext | null>(null);

// AudioBuffer cache - დეკოდირებული აუდიო მონაცემები
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

// BufferSourceNode - დაკვრის ობიექტები (ერთჯერადი!)
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

// GainNode - ხმის კონტროლი (volume, mute)
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

// WaveSurfer instances - ვიზუალიზაცია
const waveformInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());
```

### Audio Graph სტრუქტურა

```
AudioBuffer → BufferSourceNode → GainNode → AudioContext.destination
     ↑              ↑                ↑              ↑
  PCM Data      Play/Stop      Volume/Mute      Speakers
```

**რატომ `Map` და არა `Array`?**

- `Map.get(stemId)` = O(1) - მყისიერი lookup
- `Array.find(s => s.id === stemId)` = O(n) - ნელი

**რატომ `useRef`?**

1. **Performance** - ref ცვლილება არ იწვევს re-render
2. **Mutable** - Web Audio nodes მუტაბელურია
3. **Synchronous** - Audio callbacks-ში სინქრონული წვდომა

---

## Time Tracking System

### requestAnimationFrame Loop

```typescript
const startTimeTracking = useCallback(() => {
  const updateTime = () => {
    if (!audioContextRef.current) return;

    // 1. გამოვთვალოთ elapsed time
    const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    let newTime = playbackStartOffsetRef.current + elapsed;

    setState(prev => {
      // 2. Global Loop check
      if (prev.loopEnabled && prev.loopRegion.end > prev.loopRegion.start) {
        if (newTime >= prev.loopRegion.end) {
          newTime = prev.loopRegion.start;
          // Restart audio from loop start
          if (restartAudioAtPositionRef.current) {
            restartAudioAtPositionRef.current(newTime);
          }
          // Reset timing references
          playbackStartTimeRef.current = audioContextRef.current!.currentTime;
          playbackStartOffsetRef.current = newTime;
        }
      }

      // 3. End check
      if (newTime >= prev.masterDuration) {
        // Stop and cleanup
        return { ...prev, isPlaying: false, currentTime: 0 };
      }

      // 4. Continue loop
      animationFrameRef.current = requestAnimationFrame(updateTime);

      // 5. Sync waveforms
      waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
        // ...
      });

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

Web Audio API-ს აქვს თავისი high-precision timer. `Date.now()`-ზე უფრო ზუსტია აუდიო სინქრონიზაციისთვის.

---

## Playback System

### togglePlayPause

```typescript
const togglePlayPause = useCallback(() => {
  if (!audioContextRef.current) return;

  setState(prev => {
    if (!prev.allLoaded) return prev;

    if (prev.isPlaying) {
      // ===== PAUSE =====
      // 1. Stop all source nodes
      sourceNodesRef.current.forEach(source => {
        try { source.stop(); } catch (e) { /* Already stopped */ }
      });
      sourceNodesRef.current.clear();
      gainNodesRef.current.clear();

      // 2. Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      return { ...prev, isPlaying: false };
    } else {
      // ===== PLAY =====
      const ctx = audioContextRef.current!;
      const startTime = prev.currentTime;
      const anySoloed = prev.stems.some(s => s.isSoloed);

      // 1. Set timing references
      playbackStartTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = startTime;

      // 2. Create and start audio nodes for each stem
      prev.stems.forEach(stem => {
        const buffer = audioBuffersRef.current.get(stem.id);
        if (!buffer) return;

        if (shouldStemBeAudible(stem, anySoloed)) {
          // Create nodes
          const source = ctx.createBufferSource();
          source.buffer = buffer;

          const gainNode = ctx.createGain();
          gainNode.gain.value = stem.volume;

          // Connect: source → gain → destination
          source.connect(gainNode).connect(ctx.destination);

          // Start playback from current position
          source.start(0, startTime);

          // Store refs
          sourceNodesRef.current.set(stem.id, source);
          gainNodesRef.current.set(stem.id, gainNode);
        }
      });

      // 3. Start time tracking
      startTimeTracking();

      return { ...prev, isPlaying: true };
    }
  });
}, [startTimeTracking]);
```

**რატომ `source.start(0, offset)`?**

- პირველი პარამეტრი: `when` - როდის დაიწყოს (0 = ახლავე)
- მეორე პარამეტრი: `offset` - აუდიოს რომელი წამიდან

---

## Solo/Mute System

### shouldStemBeAudible

```typescript
const shouldStemBeAudible = (stem: StudioStemState, anySoloed: boolean): boolean => {
  // წესი 1: Muted stem არასოდეს არ ისმის
  if (stem.isMuted) return false;

  // წესი 2: თუ რომელიმე Solo-შია, მხოლოდ Solo-ები ისმის
  if (anySoloed) return stem.isSoloed;

  // Default: ისმის
  return true;
};
```

**ლოგიკის ცხრილი:**

| isMuted | isSoloed | anySoloed | ისმის? |
|---------|----------|-----------|--------|
| true    | *        | *         | ❌     |
| false   | false    | false     | ✅     |
| false   | false    | true      | ❌     |
| false   | true     | true      | ✅     |

### toggleSolo (Group Logic)

```typescript
const toggleSolo = useCallback((stemId: string, isMultiSelect: boolean = false) => {
  setState(prev => {
    let newStems: StudioStemState[];

    // Check: clicked stem is part of multi-selection?
    const isPartOfSelection = prev.selectedStemIds.has(stemId) &&
                              prev.selectedStemIds.size > 1;

    if (isPartOfSelection) {
      // ===== GROUP SOLO MODE =====
      const selectedIds = Array.from(prev.selectedStemIds);
      const allSelectedAreSoloed = selectedIds.every(id =>
        prev.stems.find(s => s.id === id)?.isSoloed
      );

      if (allSelectedAreSoloed) {
        // ყველა Solo-შია → ყველას გავთიშოთ
        newStems = prev.stems.map(stem =>
          prev.selectedStemIds.has(stem.id)
            ? { ...stem, isSoloed: false }
            : stem
        );
      } else {
        // ზოგი არ არის Solo → ყველა ჩავრთოთ
        newStems = prev.stems.map(stem =>
          prev.selectedStemIds.has(stem.id)
            ? { ...stem, isSoloed: true }
            : stem
        );
      }
    } else if (isMultiSelect) {
      // ===== MULTI-SOLO MODE (Ctrl+Click) =====
      // მხოლოდ ეს stem toggle
      newStems = prev.stems.map(stem =>
        stem.id === stemId
          ? { ...stem, isSoloed: !stem.isSoloed }
          : stem
      );
    } else {
      // ===== EXCLUSIVE SOLO MODE =====
      if (clickedStem?.isSoloed) {
        // უკვე Solo-შია → EXIT SOLO MODE (ყველას გათიშვა)
        newStems = prev.stems.map(stem => ({ ...stem, isSoloed: false }));
      } else {
        // არ არის Solo-ში → EXCLUSIVE SOLO (მხოლოდ ეს)
        newStems = prev.stems.map(stem =>
          stem.id === stemId
            ? { ...stem, isSoloed: true }
            : { ...stem, isSoloed: false }
        );
      }
    }

    // Update gain nodes in real-time
    const isAnySoloed = newStems.some(s => s.isSoloed);
    newStems.forEach(stem => {
      const gainNode = gainNodesRef.current.get(stem.id);
      if (gainNode) {
        gainNode.gain.value = shouldStemBeAudible(stem, isAnySoloed)
          ? stem.volume
          : 0;
      }
    });

    return { ...prev, stems: newStems };
  });
}, [shouldStemBeAudible]);
```

---

## Selection System

### selectStem

```typescript
const selectStem = useCallback((stemId: string, mode: SelectionMode) => {
  setState(prev => {
    const newSelected = new Set(prev.selectedStemIds);

    switch (mode) {
      case 'replace':
        // Regular click - მხოლოდ ეს stem
        newSelected.clear();
        newSelected.add(stemId);
        break;

      case 'add':
        // დამატება
        newSelected.add(stemId);
        break;

      case 'toggle':
        // Ctrl+Click - toggle
        if (newSelected.has(stemId)) {
          newSelected.delete(stemId);
        } else {
          newSelected.add(stemId);
        }
        break;

      case 'range':
        // Shift+Click - range selection
        if (prev.lastSelectedStemId) {
          const stemIds = prev.stems.map(s => s.id);
          const lastIndex = stemIds.indexOf(prev.lastSelectedStemId);
          const currentIndex = stemIds.indexOf(stemId);

          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);
          for (let i = start; i <= end; i++) {
            newSelected.add(stemIds[i]);
          }
        } else {
          newSelected.add(stemId);
        }
        break;
    }

    return {
      ...prev,
      selectedStemIds: newSelected,
      lastSelectedStemId: stemId,
    };
  });
}, []);
```

**Selection Modes:**

| Mode | გამომწვევი | შედეგი |
|------|------------|--------|
| `replace` | Regular Click | გაწმინდე, მონიშნე ეს |
| `toggle` | Ctrl/Cmd+Click | დაამატე/წაშალე |
| `range` | Shift+Click | ბოლოდან ამ stem-მდე ყველა |
| `add` | Programmatic | უბრალოდ დამატება |

---

## Loop System

### Global Loop State

```typescript
// State
loopRegion: { start: number, end: number }
loopEnabled: boolean

// Actions
setLoopRegion: (region) => void
setLoopEnabled: (enabled) => void
toggleLoopEnabled: () => void
setLoopFromSelection: () => void  // Ctrl+L
```

### setLoopFromSelection

```typescript
const setLoopFromSelection = useCallback(() => {
  setState(prev => {
    if (!prev.timeSelection.isActive) return prev;

    const start = Math.min(prev.timeSelection.start, prev.timeSelection.end);
    const end = Math.max(prev.timeSelection.start, prev.timeSelection.end);

    // Loop region-ის დაყენება + loop-ის ჩართვა + cursor-ის გადატანა
    return {
      ...prev,
      loopRegion: { start, end },
      loopEnabled: true,
      currentTime: start,  // Seek to loop start
      timeSelection: { ...prev.timeSelection, isActive: false },
    };
  });
}, []);
```

---

## Keyboard Shortcuts

```typescript
useEffect(() => {
  if (typeof window === 'undefined') return;

  const handleKeyDown = (e: KeyboardEvent) => {
    // Input/textarea-ში არ ვრეაგირებთ
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    const modKey = e.ctrlKey || e.metaKey;

    switch (e.key.toLowerCase()) {
      case ' ':  // Space - Play/Pause
        e.preventDefault();
        togglePlayPause();
        break;

      case 'm':  // M - Mute selected
        if (!modKey && state.selectedStemIds.size > 0) {
          e.preventDefault();
          state.selectedStemIds.forEach(stemId => toggleMute(stemId));
        }
        break;

      case 's':  // S - Solo selected
        if (!modKey && state.selectedStemIds.size > 0) {
          e.preventDefault();
          toggleSoloForSelection();
        }
        break;

      case 'l':  // L / Ctrl+L - Loop
        e.preventDefault();
        if (modKey && state.timeSelection.isActive) {
          setLoopFromSelection();
        } else {
          toggleLoopEnabled();
        }
        break;

      case 'a':  // Ctrl+A - Select all
        if (modKey) {
          e.preventDefault();
          selectAllStems();
        }
        break;

      case 'z':  // Ctrl+Z - Undo, Ctrl+Shift+Z - Redo
        if (modKey) {
          e.preventDefault();
          if (e.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        break;

      // Arrow keys for seek
      case 'arrowleft':
        e.preventDefault();
        seek(Math.max(0, state.currentTime - (modKey ? 5 : 1)));
        break;

      case 'arrowright':
        e.preventDefault();
        seek(Math.min(state.masterDuration, state.currentTime + (modKey ? 5 : 1)));
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [/* dependencies */]);
```

**Keyboard Shortcuts ცხრილი:**

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| M | Mute selected stems |
| S | Solo selected stems |
| L | Toggle loop |
| Ctrl+L | Set loop from selection |
| Ctrl+A | Select all stems |
| Ctrl+Z | Undo |
| Ctrl+Shift+Z | Redo |
| ← | Seek -1s (Ctrl: -5s) |
| → | Seek +1s (Ctrl: +5s) |
| Escape | Deselect all / Exit split mode |

---

## Export System

```typescript
const exportAudio = useCallback(async (config: ExportConfig): Promise<Blob> => {
  const ctx = audioContextRef.current;
  if (!ctx) throw new Error('AudioContext not available');

  setState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }));

  try {
    // 1. Create offline context for rendering
    const offlineCtx = new OfflineAudioContext(
      2, // stereo
      sampleRate * duration,
      sampleRate
    );

    // 2. Mix selected stems
    for (const stemId of config.includedStemIds) {
      const buffer = audioBuffersRef.current.get(stemId);
      // ... create and connect nodes
    }

    // 3. Render
    const renderedBuffer = await offlineCtx.startRendering();

    // 4. Encode to WAV
    const wavBlob = encodeAudioBufferToWav(renderedBuffer);

    // 5. Convert to MP3 if needed
    if (config.format === 'mp3') {
      return await convertWavToMp3(wavBlob);
    }

    return wavBlob;
  } finally {
    setState(prev => ({ ...prev, isExporting: false }));
  }
}, []);
```

---

## Context Provider

```typescript
export function StudioProvider({ children }: { children: ReactNode }) {
  // ... all the state and functions

  const value: StudioContextValue = {
    state,
    loadProduct,
    togglePlayPause,
    seek,
    stop,
    toggleMute,
    toggleSolo,
    setVolume,
    // ... all other functions
    loopRegion: state.loopRegion,
    loopEnabled: state.loopEnabled,
    selectedStemIds: state.selectedStemIds,
    // ...
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}
```

---

## useStudio Hook

```typescript
export function useStudio(): StudioContextValue {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
```

**გამოყენება კომპონენტებში:**

```typescript
function MyComponent() {
  const { state, togglePlayPause, seek } = useStudio();
  // ...
}
```

---

## Performance Considerations

### 1. useCallback Dependencies

```typescript
const toggleSolo = useCallback((stemId, isMultiSelect) => {
  setState(prev => { /* use prev, not state */ });
}, [shouldStemBeAudible]);  // მინიმალური dependencies
```

**რატომ `prev` და არა `state`?**

`setState(prev => ...)` pattern უზრუნველყოფს fresh state-ს. თუ `state`-ს გამოვიყენებთ closure-ში, შეიძლება stale მნიშვნელობა მივიღოთ.

### 2. Map for O(1) Lookups

```typescript
const gainNode = gainNodesRef.current.get(stem.id);  // O(1)
// vs
const gainNode = gainNodes.find(g => g.stemId === stem.id);  // O(n)
```

### 3. requestAnimationFrame Cleanup

```typescript
if (animationFrameRef.current) {
  cancelAnimationFrame(animationFrameRef.current);
  animationFrameRef.current = null;
}
```

**რატომ cleanup?**

Memory leaks-ის თავიდან აცილება. თუ animation frame გაშვებულია და კომპონენტი unmount-ია, callback მაინც გაეშვება.

---

## ბოლო განახლება

2024-12-27 - დეტალური დოკუმენტაცია მთავარი სექციებით
