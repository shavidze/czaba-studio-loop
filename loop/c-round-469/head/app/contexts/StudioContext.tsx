import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type WaveSurfer from 'wavesurfer.js';
import { cacheStem, clearExpiredCache, getCachedStem } from '~/lib/audio-cache';
import { debug } from '~/lib/debug';
import type {
  ExportConfig,
  HistoryEntry,
  LoopRegion,
  ProductWithStems,
  SelectionMode,
  SnapSettings,
  StudioStemState,
  TimeSelection,
  VideoState,
} from '~/types/studio';
import { encodeAudioBufferToWav } from '~/utils/audio-encoder';
import { convertWavToMp3 } from '~/utils/ffmpeg';

// Context Value Interface
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

  // Global Loop (Ableton-style loop brace)
  loopRegion: LoopRegion;
  loopEnabled: boolean;
  setLoopRegion: (region: LoopRegion) => void;
  setLoopEnabled: (enabled: boolean) => void;
  toggleLoopEnabled: () => void;

  // Trim controls (Phase 4)
  setTrimStart: (stemId: string, time: number) => void;
  setTrimEnd: (stemId: string, time: number) => void;

  // Waveform registration (Phase 2)
  registerWaveform: (stemId: string, wavesurfer: WaveSurfer) => void;
  unregisterWaveform: (stemId: string) => void;

  // Zoom controls
  zoomLevel: number;
  setZoomLevel: (level: number) => void;

  // Export (Phase 6)
  exportAudio: (config: ExportConfig) => Promise<Blob>;

  // Save/Load (Phase 5)
  saveToFirebase: () => Promise<void>;
  loadFromFirebase: (productId: string, userId: string) => Promise<void>;
  hasUnsavedChanges: boolean;

  // Video controls
  loadVideo: (file: File) => Promise<void>;
  clearVideo: () => void;
  setVideoPanelExpanded: (expanded: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  setVideoStartOffset: (offset: number) => void;

  // Selection (Ableton-style multi-select)
  selectedStemIds: Set<string>;
  selectStem: (stemId: string, mode: SelectionMode) => void;
  selectAllStems: () => void;
  deselectAllStems: () => void;

  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Snap to grid
  snap: SnapSettings;
  setSnapEnabled: (enabled: boolean) => void;
  setSnapGridSize: (size: number) => void;

  // Time selection on waveform (for setting loop via Ctrl+L)
  timeSelection: TimeSelection;
  setTimeSelection: (start: number, end: number) => void;
  clearTimeSelection: () => void;
  setLoopFromSelection: () => void;
}

interface StudioState {
  productId: string | null;
  productTitle: string | null;
  userId: string | null;
  stems: StudioStemState[];

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  masterDuration: number; // Longest stem duration

  // Loading states
  isLoading: boolean;
  allLoaded: boolean;

  // Export state
  isExporting: boolean;
  exportProgress: number;

  // Save state
  isSaving: boolean;
  lastSaved: string | null;
  hasUnsavedChanges: boolean;

  // UI state
  zoomLevel: number; // 0.5 = 50%, 1 = 100%, 4 = 400%

  // Video state
  video: VideoState;
  videoPanelExpanded: boolean;

  // Selection state (Ableton-style)
  selectedStemIds: Set<string>;
  lastSelectedStemId: string | null;

  // Undo/Redo history
  history: HistoryEntry[];
  historyIndex: number; // Current position in history (-1 = at latest state)

  // Snap to grid
  snap: SnapSettings;

  // Global loop (Ableton-style loop brace)
  loopRegion: LoopRegion;
  loopEnabled: boolean;

  // Time selection on waveform
  timeSelection: TimeSelection;
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

const initialState: StudioState = {
  productId: null,
  productTitle: null,
  userId: null,
  stems: [],
  isPlaying: false,
  currentTime: 0,
  masterDuration: 0,
  isLoading: false,
  allLoaded: false,
  isExporting: false,
  exportProgress: 0,
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  zoomLevel: 1,
  video: {
    blobUrl: null,
    file: null,
    duration: 0,
    isLoaded: false,
    isUploading: false,
    uploadProgress: 0,
    metadata: null,
    startOffset: 0,
  },
  videoPanelExpanded: false,

  // Selection state
  selectedStemIds: new Set<string>(),
  lastSelectedStemId: null,

  // Undo/Redo history
  history: [],
  historyIndex: -1,

  // Snap to grid
  snap: {
    enabled: false,
    gridSize: 1, // 1 second default
  },

  // Global loop (Ableton-style loop brace)
  loopRegion: {
    start: 0,
    end: 0, // Will be set to masterDuration when loaded
  },
  loopEnabled: false,

  // Time selection on waveform
  timeSelection: {
    stemId: null,
    start: 0,
    end: 0,
    isActive: false,
  },
};

export function StudioProvider({ children }: { children: ReactNode }) {
  debug.log('🎨 StudioProvider rendering...');

  const [state, setState] = useState<StudioState>(initialState);

  // Web Audio API refs
  const audioContextRef = useRef<AudioContext | null>(null); // ეს მართავს აუდიო ფაილის შექმნას, დამუშავებას, ეფექტებს, ფილტრებს და ა.შ.

  // ეს მაქვს ფაილისთვის, რომ რამში ჩავტვირთო ერთხელ დეკოდირებული ვერსია. waveform მონაცემები გვაქქვს
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());

  // ეს არის რეალური დაკვრის ობიექტი. ერთჯერადია, ერთხელ დაუკრა დასრულდა, მერე ახლიდან უნდა შექმნა. თითოეულ
  // აუდიოს უნდა ჰქონდეს თავის Source node, რომელსა შეუძლია play/stop + pause
  // აუდიობაფერი არის ჩაწერილი ფაილი, ეს არის რომ გახსენი დაუკარი რამდენჯერაც გინდა, როგორც ვინდოუსზე შეგიძლა 30-ჯერ გახსნა ერთი
  // აუდიო ფაილი
  const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

  // ეს არის ხმის კონტროლისთვის, გაძლიერება, შესუსტება
  const gainNodesRef = useRef<Map<string, GainNode>>(new Map());

  // აუდიოს ვიზუალური კონტროლერი. ეს მინდა, რომ დავხატო audio ტალღები და ვაკონტროლო play/pause/seek
  const waveformInstancesRef = useRef<Map<string, WaveSurfer>>(new Map());

  // Time tracking
  const animationFrameRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);

  // Ref to store restart function for loop callbacks
  const restartAudioAtPositionRef = useRef<((position: number) => void) | null>(null);

  // Video ref for sync
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Helper function to ensure AudioContext exists
  const ensureAudioContext = useCallback(() => {
    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    if (typeof window === 'undefined') {
      debug.error('❌ Cannot create AudioContext: window is undefined (SSR)');
      return null;
    }

    try {
      debug.log('🎛️ Creating AudioContext...');
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      debug.log('✅ AudioContext created successfully, state:', ctx.state);
      return ctx;
    } catch (error) {
      debug.error('❌ Failed to create AudioContext:', error);
      return null;
    }
  }, []);

  // Initialize Audio Context on mount
  useEffect(() => {
    debug.log('🎛️ AudioContext initialization useEffect running...');
    ensureAudioContext();

    return () => {
      if (audioContextRef.current) {
        debug.log('🛑 Closing AudioContext...');
        audioContextRef.current.close();
      }
    };
  }, [ensureAudioContext]);

  // Helper: Check if stem should be audible
  // Priority: Solo mode > Mute state
  const shouldStemBeAudible = (stem: StudioStemState, anySoloed: boolean): boolean => {
    // if is muted, M > S
    if (stem.isMuted) return false;

    // If any stem is soloed, ONLY soloed stems are audible (ignore mute)
    if (anySoloed) return stem.isSoloed;

    // Default: audible
    return true;
  };

  // ჩავტვირთოთ აუდიო ფაილები
  const loadProduct = useCallback(
    async (product: ProductWithStems) => {
      debug.log('🎵 loadProduct called with:', product.title);

      // დავწრმუნდეთ რომ გვაქვს შექმნილი AudioContext
      const ctx = ensureAudioContext();

      if (!ctx) {
        debug.error('❌ Failed to create/get AudioContext');
        setState((prev) => ({ ...prev, isLoading: false, allLoaded: false }));
        return;
      }

      debug.log('✅ AudioContext ready, starting to load stems...');
      debug.log('AudioContext state:', ctx.state);
      setState((prev) => ({
        ...prev,
        isLoading: true,
        productId: product.id,
        productTitle: product.title,
      }));

      try {
        // Initialize stems
        const initialStems: StudioStemState[] = product.stems.map((stem) => ({
          ...stem,
          isMuted: false,
          isSoloed: false,
          isLoaded: false,
          trimStart: 0,
          trimEnd: 0, // Will be set after loading
          duration: 0,
          peaks: [],
          volume: 1.0,
          trackHeight: 100, // Default track height in pixels
          loopRegion: null, // No per-stem loop initially
        }));

        setState((prev) => ({ ...prev, stems: initialStems }));

        // Clear expired cache entries on load
        clearExpiredCache();

        // Load audio buffers - check cache first, then fetch if needed
        const loadPromises = product.stems.map(async (stem) => {
          try {
            let arrayBuffer: ArrayBuffer;

            // Try to get from cache first
            const cached = await getCachedStem(product.id, stem.id);

            if (cached) {
              // Use cached data - skip network! Clone to avoid detachment issues
              arrayBuffer = cached.slice(0);
              debug.log(`📦 Cache hit: ${stem.name}`);
            } else {
              // Not in cache - fetch from network
              debug.log(`Loading stem: ${stem.name} from ${stem.audioUrl}`);
              const response = await fetch(stem.audioUrl, {
                mode: 'cors',
                credentials: 'omit',
              });

              if (!response.ok) {
                throw new Error(
                  `Failed to fetch ${stem.name}: ${response.status} ${response.statusText}`,
                );
              }

              arrayBuffer = await response.arrayBuffer();
              debug.log(`Fetched ${stem.name}, size: ${arrayBuffer.byteLength} bytes`);

              // Cache for next time (don't await - fire and forget)
              cacheStem(product.id, stem.id, arrayBuffer.slice(0));
            }

            const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
            debug.log(`Decoded ${stem.name}, duration: ${audioBuffer.duration}s`);

            audioBuffersRef.current.set(stem.id, audioBuffer);

            // Update this stem's state immediately after it loads
            setState((prev) => ({
              ...prev,
              stems: prev.stems.map((s) =>
                s.id === stem.id
                  ? {
                      ...s,
                      duration: audioBuffer.duration,
                      trimEnd: audioBuffer.duration,
                      isLoaded: true,
                    }
                  : s,
              ),
            }));

            return {
              id: stem.id,
              duration: audioBuffer.duration,
            };
          } catch (error) {
            debug.error(`Failed to load stem ${stem.name}:`, error);
            throw error;
          }
        });

        const _results = await Promise.all(loadPromises);

        // Final update: set allLoaded, masterDuration, and loop region
        setState((prev) => {
          const maxTrimEnd = Math.max(...prev.stems.map((s) => s.trimEnd));

          return {
            ...prev,
            masterDuration: maxTrimEnd,
            allLoaded: true,
            isLoading: false,
            loopRegion: {
              start: 0,
              end: maxTrimEnd,
            },
          };
        });
      } catch (error) {
        debug.error('Failed to load stems:', error);
        setState((prev) => ({ ...prev, isLoading: false, allLoaded: false }));
      }
    },
    [ensureAudioContext],
  );

  // Load video file
  const loadVideo = useCallback(async (file: File) => {
    // Check if it's a YouTube embed
    const isYouTube = (file as any).isYouTube;

    if (!isYouTube) {
      // Validate file type for regular files
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid video format. Supported: MP4, MOV, WebM, AVI');
      }

      // Validate file size (2GB max)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        throw new Error('File too large. Maximum: 2GB');
      }
    }

    // Use requestIdleCallback for non-critical state update if available
    const updateState = (updater: any) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => setState(updater), { timeout: 100 });
      } else {
        setState(updater);
      }
    };

    updateState((prev: any) => ({
      ...prev,
      video: {
        ...prev.video,
        isUploading: true,
        uploadProgress: 0,
      },
    }));

    try {
      if (isYouTube) {
        // Handle YouTube embed - no heavy processing needed
        const embedUrl = (file as any).embedUrl;
        const youtubeId = (file as any).youtubeId;

        setState((prev) => ({
          ...prev,
          video: {
            blobUrl: embedUrl,
            file,
            duration: 0,
            isLoaded: true,
            isUploading: false,
            uploadProgress: 100,
            metadata: {
              size: 0,
              format: 'video/youtube',
              resolution: 'YouTube Embed',
            },
            startOffset: 0,
            isYouTube: true,
            youtubeId,
          },
          videoPanelExpanded: true,
        }));
      } else {
        // Handle regular video file
        // Defer Blob URL creation to next frame to avoid blocking
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const blobUrl = URL.createObjectURL(file);

        // Create temporary video element to extract metadata
        // This is async and handled by browser's video decoder
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata'; // Only load metadata, not entire video
        tempVideo.src = blobUrl;

        await new Promise((resolve, reject) => {
          tempVideo.onloadedmetadata = () => {
            // Defer state update to avoid blocking
            requestAnimationFrame(() => {
              setState((prev) => ({
                ...prev,
                video: {
                  blobUrl,
                  file,
                  duration: tempVideo.duration,
                  isLoaded: true,
                  isUploading: false,
                  uploadProgress: 100,
                  metadata: {
                    size: file.size,
                    format: file.type,
                    resolution: `${tempVideo.videoWidth}x${tempVideo.videoHeight}`,
                    width: tempVideo.videoWidth,
                    height: tempVideo.videoHeight,
                  },
                  startOffset: 0,
                },
                videoPanelExpanded: true,
              }));

              resolve(null);
            });
          };

          tempVideo.onerror = () => {
            reject(new Error('Failed to load video metadata'));
          };

          // Timeout after 15s (increased for large files)
          setTimeout(() => reject(new Error('Video loading timeout')), 15000);
        });
      }
    } catch (error) {
      debug.error('❌ Failed to load video:', error);
      setState((prev) => ({
        ...prev,
        video: {
          ...prev.video,
          isUploading: false,
          uploadProgress: 0,
        },
      }));
      throw error;
    }
  }, []);

  // Clear video
  const clearVideo = useCallback(() => {
    debug.log('🗑️ Clearing video...');

    setState((prev) => {
      // Revoke Blob URL to free memory
      if (prev.video.blobUrl) {
        URL.revokeObjectURL(prev.video.blobUrl);
      }

      return {
        ...prev,
        video: {
          blobUrl: null,
          file: null,
          duration: 0,
          isLoaded: false,
          isUploading: false,
          uploadProgress: 0,
          metadata: null,
          startOffset: 0,
        },
      };
    });

    debug.log('✅ Video cleared');
  }, []);

  // Set video panel expanded
  const setVideoPanelExpanded = useCallback((expanded: boolean) => {
    setState((prev) => ({ ...prev, videoPanelExpanded: expanded }));
  }, []);

  // Set video start offset
  const setVideoStartOffset = useCallback((offset: number) => {
    setState((prev) => ({
      ...prev,
      video: {
        ...prev.video,
        startOffset: Math.max(0, offset),
      },
    }));
  }, []);

  // Time tracking loop
  const startTimeTracking = useCallback(() => {
    const updateTime = () => {
      if (!audioContextRef.current) return;

      const elapsed = audioContextRef.current.currentTime - playbackStartTimeRef.current;
      let newTime = playbackStartOffsetRef.current + elapsed;
      setState((prev) => {
        // Bail out if not playing (stop was called)
        if (!prev.isPlaying) {
          return prev;
        }

        // Global loop check (Ableton-style)
        if (prev.loopEnabled && prev.loopRegion.end > prev.loopRegion.start) {
          // If we've reached the loop end, jump back to loop start
          if (newTime >= prev.loopRegion.end) {
            newTime = prev.loopRegion.start;

            // Restart audio from loop start position
            if (restartAudioAtPositionRef.current) {
              restartAudioAtPositionRef.current(newTime);
            }

            // Reset timing references for accurate tracking
            playbackStartTimeRef.current = audioContextRef.current!.currentTime;
            playbackStartOffsetRef.current = newTime;
          }
        }

        // Check if reached end (when not looping or past master duration)
        if (newTime >= prev.masterDuration) {
          // Stop playback
          sourceNodesRef.current.forEach((source) => {
            try {
              source.stop();
            } catch (_e) {
              // Already stopped
            }
          });
          sourceNodesRef.current.clear();
          gainNodesRef.current.clear();

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }

          // Reset waveforms
          waveformInstancesRef.current.forEach((wavesurfer) => {
            wavesurfer.seekTo(0);
          });

          return { ...prev, isPlaying: false, currentTime: 0 };
        }

        // Continue playback
        animationFrameRef.current = requestAnimationFrame(updateTime);

        // Sync waveforms - simple linear progress
        waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
          const stem = prev.stems.find((s) => s.id === stemId);
          if (!stem || stem.duration === 0) return;
          const progress = newTime / stem.duration;
          wavesurfer.seekTo(Math.max(0, Math.min(1, progress)));
        });

        // No video sync - video controls are independent
        return { ...prev, currentTime: newTime };
      });
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);
  }, []);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioContextRef.current) return;

    setState((prev) => {
      if (!prev.allLoaded) return prev;

      if (prev.isPlaying) {
        // Pause
        sourceNodesRef.current.forEach((source) => {
          try {
            source.stop();
          } catch (_e) {
            // Already stopped
          }
        });
        sourceNodesRef.current.clear();
        gainNodesRef.current.clear();

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }

        return { ...prev, isPlaying: false };
      } else {
        // Play
        const ctx = audioContextRef.current!;
        const startTime = prev.currentTime;
        const anySoloed = prev.stems.some((s) => s.isSoloed);

        playbackStartTimeRef.current = ctx.currentTime;
        playbackStartOffsetRef.current = startTime;

        prev.stems.forEach((stem) => {
          const buffer = audioBuffersRef.current.get(stem.id);
          if (!buffer) return;

          if (shouldStemBeAudible(stem, anySoloed)) {
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = ctx.createGain();
            gainNode.gain.value = stem.volume;

            source.connect(gainNode).connect(ctx.destination);

            // Apply trim points (Ableton-style trimming)
            const trimStart = stem.trimStart || 0;
            const trimEnd = stem.trimEnd || stem.duration;

            // Normal playback with trim (global loop is handled in startTimeTracking)
            const offset = Math.max(0, trimStart + startTime);
            const duration = Math.max(0, Math.min(trimEnd - offset, stem.duration - offset));

            if (duration > 0 && offset < trimEnd) {
              source.start(0, offset, duration);
            }

            sourceNodesRef.current.set(stem.id, source);
            gainNodesRef.current.set(stem.id, gainNode);
          }
        });

        startTimeTracking();
        return { ...prev, isPlaying: true };
      }
    });
  }, [startTimeTracking, shouldStemBeAudible]);

  // Restart audio at a specific position (used for loop restart)
  // This function is stored in a ref so it can be called from the time tracking loop
  const restartAudioAtPosition = useCallback(
    (position: number) => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;

      // Stop all current sources
      sourceNodesRef.current.forEach((source) => {
        try {
          source.stop();
        } catch (_e) {
          // Already stopped
        }
      });
      sourceNodesRef.current.clear();
      gainNodesRef.current.clear();

      // Get current state for stems
      setState((prev) => {
        const anySoloed = prev.stems.some((s) => s.isSoloed);

        prev.stems.forEach((stem) => {
          const buffer = audioBuffersRef.current.get(stem.id);
          if (!buffer) return;

          if (shouldStemBeAudible(stem, anySoloed)) {
            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = ctx.createGain();
            gainNode.gain.value = stem.volume;

            source.connect(gainNode).connect(ctx.destination);

            // Apply trim points
            const trimStart = stem.trimStart || 0;
            const trimEnd = stem.trimEnd || stem.duration;

            const offset = Math.max(0, trimStart + position);
            const duration = Math.max(0, Math.min(trimEnd - offset, stem.duration - offset));

            if (duration > 0 && offset < trimEnd) {
              source.start(0, offset, duration);
            }

            sourceNodesRef.current.set(stem.id, source);
            gainNodesRef.current.set(stem.id, gainNode);
          }
        });

        return prev; // No state change needed
      });
    },
    [shouldStemBeAudible],
  );

  // Store the restart function in ref for use in time tracking loop
  useEffect(() => {
    restartAudioAtPositionRef.current = restartAudioAtPosition;
  }, [restartAudioAtPosition]);

  // Seek
  const seek = useCallback(
    (time: number) => {
      let wasPlaying = false;

      setState((prev) => {
        wasPlaying = prev.isPlaying;

        if (prev.isPlaying) {
          // Stop playback
          sourceNodesRef.current.forEach((source) => {
            try {
              source.stop();
            } catch (_e) {
              // Already stopped
            }
          });
          sourceNodesRef.current.clear();
          gainNodesRef.current.clear();

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
        }

        // Sync waveforms - simple linear progress (global loop is handled in startTimeTracking)
        waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
          const stem = prev.stems.find((s) => s.id === stemId);
          if (!stem || stem.duration === 0) return;
          const progress = time / stem.duration;
          wavesurfer.seekTo(Math.max(0, Math.min(1, progress)));
        });

        return { ...prev, currentTime: time, isPlaying: false };
      });

      // Resume if was playing
      if (wasPlaying) {
        setTimeout(() => togglePlayPause(), 100);
      }
    },
    [togglePlayPause],
  );

  // Stop
  const stop = useCallback(() => {
    // Stop all audio sources safely
    sourceNodesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (_e) {
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

    // Reset state and waveforms
    setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));

    waveformInstancesRef.current.forEach((wavesurfer) => {
      wavesurfer.seekTo(0);
    });
  }, []);

  // Toggle mute
  const toggleMute = useCallback(
    (stemId: string) => {
      setState((prev) => {
        // Simply toggle mute state (solo takes priority in shouldStemBeAudible)
        const newStems = prev.stems.map((stem) =>
          stem.id === stemId ? { ...stem, isMuted: !stem.isMuted } : stem,
        );

        const anySoloed = newStems.some((s) => s.isSoloed);

        // Update gain nodes if playing
        // Note: If solo is active, mute state is ignored by shouldStemBeAudible
        newStems.forEach((stem) => {
          const gainNode = gainNodesRef.current.get(stem.id);
          if (gainNode) {
            gainNode.gain.value = shouldStemBeAudible(stem, anySoloed) ? stem.volume : 0;
          }
        });

        return { ...prev, stems: newStems, hasUnsavedChanges: true };
      });
    },
    [shouldStemBeAudible],
  );

  // Toggle solo (Ableton-style logic)
  const toggleSolo = useCallback(
    (stemId: string, isMultiSelect: boolean = false) => {
      setState((prev) => {
        let newStems: StudioStemState[];

        // Check if the clicked stem is part of a multi-selection
        const isPartOfSelection = prev.selectedStemIds.has(stemId) && prev.selectedStemIds.size > 1;

        if (isPartOfSelection) {
          // GROUP SOLO MODE - clicked stem is part of multi-selection
          // Check if ALL selected stems are currently soloed
          const selectedIds = Array.from(prev.selectedStemIds);
          const allSelectedAreSoloed = selectedIds.every(
            (id) => prev.stems.find((s) => s.id === id)?.isSoloed,
          );

          if (allSelectedAreSoloed) {
            // All selected are soloed -> unsolo ALL selected
            newStems = prev.stems.map((stem) =>
              prev.selectedStemIds.has(stem.id) ? { ...stem, isSoloed: false } : stem,
            );
          } else {
            // Not all selected are soloed -> solo ALL selected
            newStems = prev.stems.map((stem) =>
              prev.selectedStemIds.has(stem.id) ? { ...stem, isSoloed: true } : stem,
            );
          }
        } else if (isMultiSelect) {
          // MULTI-SOLO MODE (Ctrl/Cmd + Click on non-selected stem)
          // Toggle this track's solo state, keep others as they are
          newStems = prev.stems.map((stem) =>
            stem.id === stemId ? { ...stem, isSoloed: !stem.isSoloed } : stem,
          );
        } else {
          // EXCLUSIVE SOLO MODE (Regular Click)
          const clickedStem = prev.stems.find((s) => s.id === stemId);

          if (clickedStem?.isSoloed) {
            // Clicking on an already-soloed stem → EXIT SOLO MODE (unsolo ALL)
            // This handles both: single solo and multi-solo cases
            newStems = prev.stems.map((stem) => ({ ...stem, isSoloed: false }));
          } else {
            // Clicking on non-soloed stem → EXCLUSIVE SOLO (only this one)
            newStems = prev.stems.map((stem) =>
              stem.id === stemId ? { ...stem, isSoloed: true } : { ...stem, isSoloed: false },
            );
          }
        }

        const isAnySoloed = newStems.some((s) => s.isSoloed);

        // Update gain nodes if playing (Ableton logic)
        newStems.forEach((stem) => {
          const gainNode = gainNodesRef.current.get(stem.id);
          if (gainNode) {
            gainNode.gain.value = shouldStemBeAudible(stem, isAnySoloed) ? stem.volume : 0;
          }
        });

        return { ...prev, stems: newStems, hasUnsavedChanges: true };
      });
    },
    [shouldStemBeAudible],
  );

  // Toggle solo for all selected stems (used by keyboard shortcut S)
  const toggleSoloForSelection = useCallback(() => {
    setState((prev) => {
      if (prev.selectedStemIds.size === 0) return prev;

      const selectedIds = Array.from(prev.selectedStemIds);

      // Check if ALL selected stems are currently soloed
      const allSelectedAreSoloed = selectedIds.every(
        (id) => prev.stems.find((s) => s.id === id)?.isSoloed,
      );

      let newStems: StudioStemState[];

      if (allSelectedAreSoloed) {
        // All selected are soloed -> unsolo ALL selected
        newStems = prev.stems.map((stem) =>
          prev.selectedStemIds.has(stem.id) ? { ...stem, isSoloed: false } : stem,
        );
      } else {
        // Not all selected are soloed -> solo ALL selected
        newStems = prev.stems.map((stem) =>
          prev.selectedStemIds.has(stem.id) ? { ...stem, isSoloed: true } : stem,
        );
      }

      const isAnySoloed = newStems.some((s) => s.isSoloed);

      // Update gain nodes if playing
      newStems.forEach((stem) => {
        const gainNode = gainNodesRef.current.get(stem.id);
        if (gainNode) {
          gainNode.gain.value = shouldStemBeAudible(stem, isAnySoloed) ? stem.volume : 0;
        }
      });

      return { ...prev, stems: newStems, hasUnsavedChanges: true };
    });
  }, [shouldStemBeAudible]);

  // ==========================================
  // GLOBAL LOOP (Ableton-style loop brace)
  // ==========================================

  const setLoopRegion = useCallback((region: LoopRegion) => {
    setState((prev) => ({
      ...prev,
      loopRegion: region,
    }));
  }, []);

  const setLoopEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      loopEnabled: enabled,
    }));
  }, []);

  const toggleLoopEnabled = useCallback(() => {
    setState((prev) => ({
      ...prev,
      loopEnabled: !prev.loopEnabled,
    }));
  }, []);

  // Set volume
  const setVolume = useCallback((stemId: string, volume: number) => {
    setState((prev) => {
      const newStems = prev.stems.map((stem) => (stem.id === stemId ? { ...stem, volume } : stem));

      // Update gain node if playing
      const gainNode = gainNodesRef.current.get(stemId);
      if (gainNode) {
        gainNode.gain.value = volume;
      }

      return { ...prev, stems: newStems, hasUnsavedChanges: true };
    });
  }, []);

  // Set track height
  const setTrackHeight = useCallback((stemId: string, height: number) => {
    setState((prev) => ({
      ...prev,
      stems: prev.stems.map((stem) =>
        stem.id === stemId ? { ...stem, trackHeight: height } : stem,
      ),
      hasUnsavedChanges: true,
    }));
  }, []);

  // Set trim start (Phase 4)
  const setTrimStart = useCallback((stemId: string, time: number) => {
    setState((prev) => ({
      ...prev,
      stems: prev.stems.map((stem) => (stem.id === stemId ? { ...stem, trimStart: time } : stem)),
      hasUnsavedChanges: true,
    }));
  }, []);

  // Set trim end (Phase 4)
  const setTrimEnd = useCallback((stemId: string, time: number) => {
    setState((prev) => {
      const updatedStems = prev.stems.map((stem) =>
        stem.id === stemId ? { ...stem, trimEnd: time } : stem,
      );

      // Recalculate master duration (longest trimEnd value)
      const maxTrimEnd = Math.max(...updatedStems.map((s) => s.trimEnd));

      return {
        ...prev,
        stems: updatedStems,
        masterDuration: maxTrimEnd,
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Register waveform (Phase 2)
  const registerWaveform = useCallback((stemId: string, wavesurfer: WaveSurfer) => {
    waveformInstancesRef.current.set(stemId, wavesurfer);
  }, []);

  // Unregister waveform (Phase 2)
  const unregisterWaveform = useCallback((stemId: string) => {
    waveformInstancesRef.current.delete(stemId);
  }, []);

  // Note: Audio encoding (WAV conversion, normalization) moved to Web Worker
  // See: app/workers/audio-encoder.worker.ts
  // Used via: app/utils/audio-encoder.ts

  // Export audio using OfflineAudioContext (Ableton-style offline rendering)
  const exportAudio = useCallback(
    async (config: ExportConfig): Promise<Blob> => {
      debug.log('🎬 Starting offline render...', config);

      setState((prev) => ({ ...prev, isExporting: true, exportProgress: 0 }));

      try {
        // Calculate the longest trimEnd to determine export duration
        const exportDuration = Math.max(...state.stems.map((s) => s.trimEnd));
        const sampleRate = 48000; // High quality sample rate

        // Create OfflineAudioContext (renders faster than real-time)
        const offlineCtx = new OfflineAudioContext({
          numberOfChannels: 2,
          length: sampleRate * exportDuration,
          sampleRate: sampleRate,
        });

        debug.log(`📊 Offline context created: ${exportDuration}s @ ${sampleRate}Hz`);

        // Build the audio graph
        state.stems.forEach((stem) => {
          const buffer = audioBuffersRef.current.get(stem.id);
          if (!buffer) return;

          // Check if stem should be included in export
          if (!config.includedStemIds.includes(stem.id)) return;

          // Check mute/solo state
          const anySoloed = state.stems.some(
            (s) => s.isSoloed && config.includedStemIds.includes(s.id),
          );
          if (!shouldStemBeAudible(stem, anySoloed)) return;

          // Create source node
          const source = offlineCtx.createBufferSource();
          source.buffer = buffer;

          // Create gain node for volume
          const gainNode = offlineCtx.createGain();
          gainNode.gain.value = stem.volume;

          // Connect: source -> gain -> destination
          source.connect(gainNode).connect(offlineCtx.destination);

          // Apply trim points
          const trimStart = stem.trimStart || 0;
          const trimEnd = stem.trimEnd || stem.duration;
          const duration = trimEnd - trimStart;

          if (duration > 0) {
            source.start(0, trimStart, duration);
            debug.log(`✅ Added stem "${stem.name}": ${trimStart}s - ${trimEnd}s`);
          }
        });

        // Render the audio (this happens very fast, faster than real-time)
        debug.log('⚙️ Starting offline rendering...');
        setState((prev) => ({ ...prev, exportProgress: 30 }));

        const renderedBuffer = await offlineCtx.startRendering();

        debug.log('✅ Offline rendering complete!');
        setState((prev) => ({ ...prev, exportProgress: 40 }));

        // Convert to WAV blob using Web Worker (non-blocking)
        debug.log('💾 Converting to WAV (Web Worker)...');
        const wavBlob = await encodeAudioBufferToWav(
          renderedBuffer,
          config.normalize,
          (progress) => {
            // Map worker progress (0-100) to our range (40-80)
            const mappedProgress = 40 + Math.floor(progress * 0.4);
            setState((prev) => ({ ...prev, exportProgress: mappedProgress }));
          },
        );
        setState((prev) => ({ ...prev, exportProgress: 80 }));

        // If MP3 format requested, convert WAV to MP3
        if (config.format === 'mp3') {
          debug.log('🎵 Converting to MP3...');
          setState((prev) => ({ ...prev, exportProgress: 85 }));

          const bitrate =
            config.quality === 'high' ? '320k' : config.quality === 'medium' ? '192k' : '128k';
          const mp3Blob = await convertWavToMp3(wavBlob, bitrate);

          setState((prev) => ({ ...prev, exportProgress: 100, isExporting: false }));
          debug.log('🎉 MP3 export complete!', mp3Blob.size, 'bytes');
          return mp3Blob;
        }

        setState((prev) => ({ ...prev, exportProgress: 100, isExporting: false }));
        debug.log('🎉 WAV export complete!', wavBlob.size, 'bytes');
        return wavBlob;
      } catch (error) {
        debug.error('❌ Export failed:', error);
        setState((prev) => ({ ...prev, isExporting: false, exportProgress: 0 }));
        throw error;
      }
    },
    [state.stems, shouldStemBeAudible],
  );

  // Save to Firebase (Phase 5 - placeholder)
  const saveToFirebase = useCallback(async () => {
    // TODO: Implement in Phase 5
    debug.log('Save to Firebase');
  }, []);

  // Load from Firebase (Phase 5 - placeholder)
  const loadFromFirebase = useCallback(async (productId: string, userId: string) => {
    // TODO: Implement in Phase 5
    debug.log('Load from Firebase', productId, userId);
  }, []);

  // Set zoom level and update waveforms
  const setZoomLevel = useCallback((level: number) => {
    setState((prev) => ({ ...prev, zoomLevel: level }));

    // Update all WaveSurfer zoom levels
    waveformInstancesRef.current.forEach((wavesurfer) => {
      wavesurfer.zoom(level * 50); // WaveSurfer zoom is pixels per second
    });
  }, []);

  // ==========================================
  // SELECTION SYSTEM (Ableton-style multi-select)
  // ==========================================

  const selectStem = useCallback((stemId: string, mode: SelectionMode) => {
    setState((prev) => {
      const newSelected = new Set(prev.selectedStemIds);

      switch (mode) {
        case 'replace':
          newSelected.clear();
          newSelected.add(stemId);
          break;

        case 'add':
          newSelected.add(stemId);
          break;

        case 'toggle':
          if (newSelected.has(stemId)) {
            newSelected.delete(stemId);
          } else {
            newSelected.add(stemId);
          }
          break;

        case 'range':
          if (prev.lastSelectedStemId) {
            const stemIds = prev.stems.map((s) => s.id);
            const lastIndex = stemIds.indexOf(prev.lastSelectedStemId);
            const currentIndex = stemIds.indexOf(stemId);

            if (lastIndex !== -1 && currentIndex !== -1) {
              const start = Math.min(lastIndex, currentIndex);
              const end = Math.max(lastIndex, currentIndex);
              for (let i = start; i <= end; i++) {
                newSelected.add(stemIds[i]);
              }
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

  const selectAllStems = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedStemIds: new Set(prev.stems.map((s) => s.id)),
    }));
  }, []);

  const deselectAllStems = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedStemIds: new Set(),
      lastSelectedStemId: null,
    }));
  }, []);

  // ==========================================
  // UNDO/REDO SYSTEM
  // ==========================================

  const _pushHistory = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    setState((prev) => {
      // Remove any redo history if we're not at the end
      const newHistory =
        prev.historyIndex === -1
          ? prev.history
          : prev.history.slice(0, prev.history.length + prev.historyIndex + 1);

      // Add new entry
      const newEntry: HistoryEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      // Keep max 50 entries
      const trimmedHistory = [...newHistory, newEntry].slice(-50);

      return {
        ...prev,
        history: trimmedHistory,
        historyIndex: -1,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.history.length === 0) return prev;

      const currentIndex =
        prev.historyIndex === -1 ? prev.history.length - 1 : prev.historyIndex - 1;

      if (currentIndex < 0) return prev;

      const entry = prev.history[currentIndex];

      // Apply previous state
      const newStems = prev.stems.map((stem) => {
        const stateIndex = entry.stemIds.indexOf(stem.id);
        if (stateIndex === -1) return stem;
        return { ...stem, ...entry.prevState[stateIndex] };
      });

      return {
        ...prev,
        stems: newStems,
        historyIndex: currentIndex - prev.history.length,
        hasUnsavedChanges: true,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex === -1) return prev;

      const currentIndex = prev.historyIndex + prev.history.length + 1;
      if (currentIndex >= prev.history.length) {
        return { ...prev, historyIndex: -1 };
      }

      const entry = prev.history[currentIndex];

      // Apply new state
      const newStems = prev.stems.map((stem) => {
        const stateIndex = entry.stemIds.indexOf(stem.id);
        if (stateIndex === -1) return stem;
        return { ...stem, ...entry.newState[stateIndex] };
      });

      return {
        ...prev,
        stems: newStems,
        historyIndex: currentIndex - prev.history.length,
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // ==========================================
  // SNAP TO GRID
  // ==========================================

  const setSnapEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      snap: { ...prev.snap, enabled },
    }));
  }, []);

  const setSnapGridSize = useCallback((gridSize: number) => {
    setState((prev) => ({
      ...prev,
      snap: { ...prev.snap, gridSize },
    }));
  }, []);

  const _snapToGrid = useCallback(
    (time: number): number => {
      if (!state.snap.enabled) return time;
      return Math.round(time / state.snap.gridSize) * state.snap.gridSize;
    },
    [state.snap.enabled, state.snap.gridSize],
  );

  // ==========================================
  // TIME SELECTION (for setting loop via Ctrl+L)
  // ==========================================

  const setTimeSelection = useCallback((start: number, end: number) => {
    // Ensure start < end
    const selStart = Math.min(start, end);
    const selEnd = Math.max(start, end);

    setState((prev) => ({
      ...prev,
      timeSelection: {
        stemId: null,
        start: selStart,
        end: selEnd,
        isActive: true,
      },
    }));
  }, []);

  const clearTimeSelection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      timeSelection: {
        stemId: null,
        start: 0,
        end: 0,
        isActive: false,
      },
    }));
  }, []);

  const setLoopFromSelection = useCallback(() => {
    setState((prev) => {
      if (!prev.timeSelection.isActive) return prev;

      const loopStart = prev.timeSelection.start;

      // Set loop region from selection, enable loop, and seek to start
      return {
        ...prev,
        loopRegion: {
          start: loopStart,
          end: prev.timeSelection.end,
        },
        loopEnabled: true,
        currentTime: loopStart, // Seek to loop start
        // Clear the selection after setting loop
        timeSelection: {
          stemId: null,
          start: 0,
          end: 0,
          isActive: false,
        },
      };
    });

    // Also sync waveforms to the new position
    setState((prev) => {
      waveformInstancesRef.current.forEach((wavesurfer, stemId) => {
        const stem = prev.stems.find((s) => s.id === stemId);
        if (!stem || stem.duration === 0) return;
        const progress = prev.currentTime / stem.duration;
        wavesurfer.seekTo(Math.max(0, Math.min(1, progress)));
      });
      return prev;
    });
  }, []);

  // ==========================================
  // KEYBOARD SHORTCUTS (Ableton-style)
  // ==========================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Don't handle if audio not loaded
      if (!state.allLoaded) return;

      const { key, shiftKey, ctrlKey, metaKey } = e;
      const modKey = ctrlKey || metaKey; // Ctrl on Windows, Cmd on Mac

      switch (key) {
        // Play/Pause - SPACE
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;

        // Stop - ENTER
        case 'Enter':
          if (!modKey) {
            e.preventDefault();
            stop();
          }
          break;

        // Seek backward - LEFT ARROW
        case 'ArrowLeft': {
          e.preventDefault();
          const seekBackAmount = shiftKey ? 5 : 1;
          seek(Math.max(0, state.currentTime - seekBackAmount));
          break;
        }

        // Seek forward - RIGHT ARROW
        case 'ArrowRight': {
          e.preventDefault();
          const seekForwardAmount = shiftKey ? 5 : 1;
          seek(Math.min(state.masterDuration, state.currentTime + seekForwardAmount));
          break;
        }

        // Go to start - HOME
        case 'Home':
          e.preventDefault();
          seek(0);
          break;

        // Go to end - END
        case 'End':
          e.preventDefault();
          seek(state.masterDuration);
          break;

        // Zoom in - + or =
        case '+':
        case '=':
          e.preventDefault();
          setZoomLevel(Math.min(4, state.zoomLevel + 0.5));
          break;

        // Zoom out - -
        case '-':
          e.preventDefault();
          setZoomLevel(Math.max(0.5, state.zoomLevel - 0.5));
          break;

        // Reset zoom - 0
        case '0':
          if (!modKey) {
            e.preventDefault();
            setZoomLevel(1);
          }
          break;

        // Undo - Ctrl+Z, Zoom to selection - Z (without Ctrl)
        case 'z':
        case 'Z':
          if (modKey && !shiftKey) {
            e.preventDefault();
            undo();
          } else if (modKey && shiftKey) {
            // Redo - Ctrl+Shift+Z
            e.preventDefault();
            redo();
          } else if (!modKey && state.timeSelection.isActive) {
            // Zoom to selection - Z (without Ctrl)
            e.preventDefault();
            const { start, end } = state.timeSelection;
            if (end > start) {
              // Calculate zoom level to fit selection in view
              // Assume visible width is about 80% of master duration at zoom 1
              const selectionDuration = end - start;
              const targetZoom = Math.min(
                4,
                Math.max(0.5, (state.masterDuration / selectionDuration) * 0.8),
              );
              setZoomLevel(targetZoom);
            }
          }
          break;

        // Fit width - W (zoom to see entire timeline)
        case 'w':
        case 'W':
          if (!modKey) {
            e.preventDefault();
            setZoomLevel(1); // 100% shows full timeline
          }
          break;

        // Redo - Ctrl+Y (alternative)
        case 'y':
        case 'Y':
          if (modKey) {
            e.preventDefault();
            redo();
          }
          break;

        // Select All - Ctrl+A
        case 'a':
        case 'A':
          if (modKey) {
            e.preventDefault();
            selectAllStems();
          }
          break;

        // Deselect All - Escape
        case 'Escape':
          e.preventDefault();
          deselectAllStems();
          break;

        // Toggle Mute on selected - M
        case 'm':
        case 'M':
          if (!modKey && state.selectedStemIds.size > 0) {
            e.preventDefault();
            state.selectedStemIds.forEach((stemId) => toggleMute(stemId));
          }
          break;

        // Toggle Solo on selected - S
        case 's':
        case 'S':
          if (!modKey && state.selectedStemIds.size > 0) {
            e.preventDefault();
            toggleSoloForSelection();
          }
          break;

        // Loop controls - L / Ctrl+L
        case 'l':
        case 'L':
          e.preventDefault();
          if (modKey) {
            // Ctrl+L / Cmd+L - Set loop from waveform selection
            setLoopFromSelection();
          } else {
            // L - Toggle global loop
            toggleLoopEnabled();
          }
          break;

        // Toggle Snap - G
        case 'g':
        case 'G':
          if (!modKey) {
            e.preventDefault();
            setSnapEnabled(!state.snap.enabled);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.allLoaded,
    state.currentTime,
    state.masterDuration,
    state.zoomLevel,
    state.selectedStemIds,
    state.snap.enabled,
    state.timeSelection.isActive,
    togglePlayPause,
    stop,
    seek,
    setZoomLevel,
    undo,
    redo,
    selectAllStems,
    deselectAllStems,
    toggleMute,
    toggleSoloForSelection,
    toggleLoopEnabled,
    setSnapEnabled,
    setLoopFromSelection,
    state.timeSelection,
  ]);

  const value: StudioContextValue = {
    state,
    loadProduct,
    togglePlayPause,
    seek,
    stop,
    toggleMute,
    toggleSolo,
    setVolume,
    setTrackHeight,
    setTrimStart,
    setTrimEnd,
    registerWaveform,
    unregisterWaveform,
    exportAudio,
    setVideoStartOffset,
    saveToFirebase,
    loadFromFirebase,
    hasUnsavedChanges: state.hasUnsavedChanges,
    zoomLevel: state.zoomLevel,
    setZoomLevel,
    loadVideo,
    clearVideo,
    setVideoPanelExpanded,
    videoRef,

    // Global Loop (Ableton-style loop brace)
    loopRegion: state.loopRegion,
    loopEnabled: state.loopEnabled,
    setLoopRegion,
    setLoopEnabled,
    toggleLoopEnabled,

    // Selection (Ableton-style)
    selectedStemIds: state.selectedStemIds,
    selectStem,
    selectAllStems,
    deselectAllStems,

    // Undo/Redo
    canUndo:
      state.history.length > 0 &&
      (state.historyIndex === -1 || state.historyIndex > -state.history.length),
    canRedo: state.historyIndex !== -1 && state.historyIndex < -1,
    undo,
    redo,

    // Snap to grid
    snap: state.snap,
    setSnapEnabled,
    setSnapGridSize,

    // Time selection on waveform
    timeSelection: state.timeSelection,
    setTimeSelection,
    clearTimeSelection,
    setLoopFromSelection,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
}
