# Studio/Audio Feature Template

Studio (Personal Mixdown) ფუნქციონალის შექმნისას დაიცავი ეს pattern-ები (StudioContext, AudioContext მაგალითებიდან).

---

## Web Audio API Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      AudioContext                            │
│  (მართავს აუდიო ფაილის შექმნას, დამუშავებას, ეფექტებს)       │
└──────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  AudioBuffer    │  │  AudioBuffer    │  │  AudioBuffer    │
│  (Stem 1)       │  │  (Stem 2)       │  │  (Stem 3)       │
│  decoded audio  │  │  decoded audio  │  │  decoded audio  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ SourceNode      │  │ SourceNode      │  │ SourceNode      │
│ (ერთჯერადი!)    │  │ (ერთჯერადი!)    │  │ (ერთჯერადი!)    │
│ play/stop only  │  │ play/stop only  │  │ play/stop only  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│    GainNode     │  │    GainNode     │  │    GainNode     │
│  (volume 0-1)   │  │  (volume 0-1)   │  │  (volume 0-1)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  Destination    │
                    │   (speakers)    │
                    └─────────────────┘
```

---

## Refs Structure

```typescript
// Web Audio API refs
const audioContextRef = useRef<AudioContext | null>(null);

// Decoded audio data (reusable)
const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

// Active playback sources (ერთჯერადი - recreate each play)
const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

// Volume control nodes (reusable)
const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

// WaveSurfer.js instances for visualization
const waveformInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());

// Animation frame for time tracking
const animationFrameRef = useRef<number | null>(null);

// Playback timing
const playbackStartTimeRef = useRef<number>(0);
const playbackStartOffsetRef = useRef<number>(0);
```

---

## AudioContext Initialization

```typescript
// Helper function to ensure AudioContext exists
const ensureAudioContext = useCallback(() => {
  if (audioContextRef.current) {
    return audioContextRef.current;
  }

  // SSR check
  if (typeof window === 'undefined') {
    debug.error('Cannot create AudioContext: window is undefined (SSR)');
    return null;
  }

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;
    debug.log('AudioContext created, state:', ctx.state);
    return ctx;
  } catch (error) {
    debug.error('Failed to create AudioContext:', error);
    return null;
  }
}, []);

// Initialize on mount
useEffect(() => {
  ensureAudioContext();

  return () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };
}, [ensureAudioContext]);
```

---

## Audio Loading Pattern

```typescript
const loadAudio = useCallback(async (stems: Stem[]) => {
  const ctx = ensureAudioContext();
  if (!ctx) return;

  setState(prev => ({ ...prev, isLoading: true }));

  try {
    const loadPromises = stems.map(async (stem) => {
      // Fetch audio file
      const response = await fetch(stem.audioUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${stem.name}: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Decode audio data (CPU intensive!)
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

      // Store in ref (not state - doesn't need re-render)
      audioBuffersRef.current.set(stem.id, audioBuffer);

      // Update individual stem's loaded state
      setState(prev => ({
        ...prev,
        stems: prev.stems.map(s =>
          s.id === stem.id
            ? { ...s, duration: audioBuffer.duration, isLoaded: true }
            : s
        ),
      }));

      return audioBuffer;
    });

    await Promise.all(loadPromises);

    setState(prev => ({ ...prev, isLoading: false, allLoaded: true }));
  } catch (error) {
    debug.error('Failed to load audio:', error);
    setState(prev => ({ ...prev, isLoading: false }));
  }
}, [ensureAudioContext]);
```

---

## Playback Control

```typescript
const togglePlayPause = useCallback(() => {
  if (!audioContextRef.current) return;

  setState(prev => {
    if (!prev.allLoaded) return prev;

    if (prev.isPlaying) {
      // ===== PAUSE =====
      // Stop all sources (ერთჯერადია, ვეღარ გამოვიყენებთ)
      sourceNodesRef.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Already stopped
        }
      });
      sourceNodesRef.current.clear();
      gainNodesRef.current.clear();

      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      return { ...prev, isPlaying: false };
    } else {
      // ===== PLAY =====
      const ctx = audioContextRef.current!;
      const startTime = prev.currentTime;

      // Track timing for accurate playback position
      playbackStartTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = startTime;

      // Create new source nodes for each stem
      prev.stems.forEach(stem => {
        const buffer = audioBuffersRef.current.get(stem.id);
        if (!buffer) return;

        // Check if stem should be audible (mute/solo logic)
        if (!shouldStemBeAudible(stem, anySoloed)) return;

        // Create NEW source (ერთჯერადი!)
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Create gain node for volume
        const gainNode = ctx.createGain();
        gainNode.gain.value = stem.volume;

        // Connect: source -> gain -> destination
        source.connect(gainNode).connect(ctx.destination);

        // Start from current position
        source.start(0, startTime);

        // Store references
        sourceNodesRef.current.set(stem.id, source);
        gainNodesRef.current.set(stem.id, gainNode);
      });

      // Start time tracking
      startTimeTracking();

      return { ...prev, isPlaying: true };
    }
  });
}, [startTimeTracking, shouldStemBeAudible]);
```

---

## Time Tracking Loop

```typescript
const startTimeTracking = useCallback(() => {
  const updateTime = () => {
    if (!audioContextRef.current) return;

    const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
    const newTime = playbackStartOffsetRef.current + elapsed;

    setState(prev => {
      // Bail if not playing
      if (!prev.isPlaying) return prev;

      // Check if reached end
      if (newTime >= prev.masterDuration) {
        // Stop all sources
        sourceNodesRef.current.forEach(source => {
          try { source.stop(); } catch (e) {}
        });
        sourceNodesRef.current.clear();

        // Cancel animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        return { ...prev, isPlaying: false, currentTime: 0 };
      }

      // Continue playback
      animationFrameRef.current = requestAnimationFrame(updateTime);

      // Sync waveforms
      waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
        const stem = prev.stems.find(s => s.id === stemId);
        if (!stem || stem.duration === 0) return;
        const progress = newTime / stem.duration;
        wavesurfer.seekTo(Math.max(0, Math.min(1, progress)));
      });

      return { ...prev, currentTime: newTime };
    });
  };

  animationFrameRef.current = requestAnimationFrame(updateTime);
}, []);
```

---

## Volume Control (Real-time)

```typescript
const setVolume = useCallback((stemId: string, volume: number) => {
  setState(prev => {
    const newStems = prev.stems.map(stem =>
      stem.id === stemId ? { ...stem, volume } : stem
    );

    // Update gain node immediately (no re-render needed for audio)
    const gainNode = gainNodesRef.current.get(stemId);
    if (gainNode) {
      gainNode.gain.value = volume;
    }

    return { ...prev, stems: newStems, hasUnsavedChanges: true };
  });
}, []);
```

---

## WaveSurfer.js Integration

```typescript
// Register waveform instance
const registerWaveform = useCallback((stemId: string, wavesurfer: WaveSurfer) => {
  waveformInstancesRef.current.set(stemId, wavesurfer);
}, []);

// Unregister waveform instance
const unregisterWaveform = useCallback((stemId: string) => {
  waveformInstancesRef.current.delete(stemId);
}, []);

// In component:
useEffect(() => {
  const wavesurfer = WaveSurfer.create({
    container: containerRef.current,
    waveColor: '#13D9CC',
    progressColor: '#0A9A91',
    cursorColor: '#F9A80C',
    height: 80,
    normalize: true,
  });

  registerWaveform(stemId, wavesurfer);

  return () => {
    unregisterWaveform(stemId);
    wavesurfer.destroy();
  };
}, [stemId, registerWaveform, unregisterWaveform]);
```

---

## Mute/Solo Logic (Ableton-style)

```typescript
// Priority: Solo mode > Mute state
const shouldStemBeAudible = (stem: StemState, anySoloed: boolean): boolean => {
  // If muted, always silent
  if (stem.isMuted) return false;

  // If any stem is soloed, only soloed stems are audible
  if (anySoloed) return stem.isSoloed;

  // Default: audible
  return true;
};

// Usage in toggleMute/toggleSolo:
const toggleMute = useCallback((stemId: string) => {
  setState(prev => {
    const newStems = prev.stems.map(stem =>
      stem.id === stemId ? { ...stem, isMuted: !stem.isMuted } : stem
    );

    const anySoloed = newStems.some(s => s.isSoloed);

    // Update gain nodes immediately
    newStems.forEach(stem => {
      const gainNode = gainNodesRef.current.get(stem.id);
      if (gainNode) {
        gainNode.gain.value = shouldStemBeAudible(stem, anySoloed) ? stem.volume : 0;
      }
    });

    return { ...prev, stems: newStems };
  });
}, [shouldStemBeAudible]);
```

---

## Export with OfflineAudioContext

```typescript
const exportAudio = useCallback(async (config: ExportConfig): Promise<Blob> => {
  const exportDuration = Math.max(...state.stems.map(s => s.trimEnd));
  const sampleRate = 48000;

  // OfflineAudioContext renders faster than real-time
  const offlineCtx = new OfflineAudioContext({
    numberOfChannels: 2,
    length: sampleRate * exportDuration,
    sampleRate: sampleRate,
  });

  // Build audio graph
  state.stems.forEach(stem => {
    const buffer = audioBuffersRef.current.get(stem.id);
    if (!buffer || !config.includedStemIds.includes(stem.id)) return;

    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;

    const gainNode = offlineCtx.createGain();
    gainNode.gain.value = stem.volume;

    source.connect(gainNode).connect(offlineCtx.destination);
    source.start(0, stem.trimStart, stem.trimEnd - stem.trimStart);
  });

  // Render (very fast!)
  const renderedBuffer = await offlineCtx.startRendering();

  // Convert to WAV/MP3 using Web Worker (non-blocking)
  const blob = await encodeAudioBuffer(renderedBuffer, config.format);

  return blob;
}, [state.stems]);
```

---

## Performance Patterns

### Debounce for Frequent Updates

```typescript
import { useMemo } from 'react';
import { debounce } from '~/lib/utils';

const debouncedSetVolume = useMemo(
  () => debounce((stemId: string, volume: number) => {
    setVolume(stemId, volume);
  }, 16), // ~60fps
  [setVolume]
);
```

### Throttle for Continuous Input

```typescript
const throttledSeek = useMemo(
  () => throttle((time: number) => {
    seek(time);
  }, 50),
  [seek]
);
```

### requestIdleCallback for Non-Critical Updates

```typescript
const updateNonCriticalState = (updater: any) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setState(updater), { timeout: 100 });
  } else {
    setState(updater);
  }
};
```

---

## Cleanup Pattern

```typescript
useEffect(() => {
  return () => {
    // 1. Stop all audio sources
    sourceNodesRef.current.forEach(source => {
      try { source.stop(); } catch (e) {}
    });
    sourceNodesRef.current.clear();

    // 2. Clear gain nodes
    gainNodesRef.current.clear();

    // 3. Cancel animation frames
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // 4. Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }

    // 5. Destroy WaveSurfer instances
    waveformInstancesRef.current.forEach(ws => ws.destroy());
    waveformInstancesRef.current.clear();

    // 6. Revoke Blob URLs
    if (state.video.blobUrl) {
      URL.revokeObjectURL(state.video.blobUrl);
    }
  };
}, []);
```

---

## Types (from types/studio.ts)

```typescript
interface StudioStemState {
  id: string;
  name: string;
  audioUrl: string;

  // Playback
  isMuted: boolean;
  isSoloed: boolean;
  isLoaded: boolean;
  volume: number;

  // Trim
  trimStart: number;
  trimEnd: number;
  duration: number;

  // UI
  trackHeight: number;
  peaks: number[];
}

interface ExportConfig {
  format: 'mp3' | 'wav';
  quality: 'low' | 'medium' | 'high';
  includedStemIds: string[];
  normalize: boolean;
}
```

---

## Checklist

Studio ფუნქციონალის შექმნის წინ შეამოწმე:

- [ ] AudioContext SSR check (`typeof window`)
- [ ] AudioBufferSourceNode is one-time-use (recreate each play)
- [ ] Refs for audio objects (not state)
- [ ] State for UI (triggers re-render)
- [ ] Cleanup in useEffect return
- [ ] Animation frame cleanup
- [ ] GainNode for real-time volume changes
- [ ] Mute/Solo priority logic correct
- [ ] WaveSurfer cleanup (destroy)
- [ ] Blob URL revocation
- [ ] OfflineAudioContext for export
- [ ] Web Worker for encoding (non-blocking)
- [ ] Debounce/Throttle for performance
- [ ] Error handling for fetch/decode
