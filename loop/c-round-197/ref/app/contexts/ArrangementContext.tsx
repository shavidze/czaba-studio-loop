import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import {
  applyClipGainTargets,
  clipGainMemberKey,
  clipGainMemberSpan,
  clipGainShiftTargets,
  formatClipGainMembersStatus,
  setClipGainsDb,
} from '~/lib/arrangement/clip-gain-multi';
import {
  type ArrangementClipboard,
  copyClipsToClipboard,
  copyRangeToClipboard,
  cutClipsFromArrangement,
  cutRangeFromArrangement,
  cutTimeToClipboard,
  deleteRangeKeepingGap,
  planClipboardPaste,
} from '~/lib/arrangement/clipboard';
import { workspaceCollectionCopy } from '~/lib/arrangement/collection';
import { clipEnvelopeShapes } from '~/lib/arrangement/envelope';
import {
  ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE,
  ARRANGEMENT_EXPORT_CANCELLED_MESSAGE,
  raceArrangementExportAbort,
} from '~/lib/arrangement/export-cancel';
import {
  type ArrangementExportProgressStore,
  createArrangementExportProgressStore,
} from '~/lib/arrangement/export-progress';
import { clipFadeShapes } from '~/lib/arrangement/fades';
import {
  type ArrangementRenderOptions,
  type ArrangementRenderWindow,
  applySchedule,
  formatExportOverloadWarning,
  renderArrangementWav,
  type ScheduleHandle,
} from '~/lib/arrangement/graph.client';
import {
  arrangementGroups,
  setTrackGroupMix,
  toggleTrackGroupSolo,
  trackGroupVolume,
} from '~/lib/arrangement/groups';
import { canPlaceLibraryClip } from '~/lib/arrangement/library';
import {
  type LoopEdge,
  type LoopScheduleParams,
  loopTimelinePosition,
  moveLoop,
  planLoopIteration,
  refillLoopIterations,
  resizeLoop,
  resolveActiveLoop,
  setLoopFromRange,
  toggleLoop,
} from '~/lib/arrangement/loop';
import {
  createMasterMeterState,
  createMasterMeterStore,
  createTrackMeterStore,
  floorMasterMeter,
  floorTrackMeterFrames,
  MASTER_METER_FFT_SIZE,
  type MasterMeterState,
  type MasterMeterStore,
  type MeterBlock,
  measureBlock,
  resetMasterMeterPeak,
  resetTrackMeterPeaks,
  stepMeter,
  type TrackMeterStore,
} from '~/lib/arrangement/meter';
import {
  generateMetronomeClickSamples,
  METRONOME_SCHEDULE_HORIZON_SECONDS,
  type MetronomeHorizonState,
  nextMetronomeChunk,
  planMetronomeClicks,
} from '~/lib/arrangement/metronome';
import {
  ARRANGEMENT_EPS,
  type ArrangementHistory,
  addClip,
  appendVideoClip,
  clipLinearGain,
  clipLinearGains,
  commitHistory,
  createArrangement,
  createHistory,
  deleteClip,
  duplicateClips,
  masterLinearGain,
  moveClip,
  normalizeTrackPan,
  projectEnd,
  redoHistory,
  remapTime,
  setArrangementTrackPan,
  setClipGainDb,
  setMasterMix,
  setTrackMix,
  splitClipAt,
  splitClipsAtTime,
  splitClipsByRange,
  toggleSolo,
  trackPanValue,
  undoHistory,
} from '~/lib/arrangement/model';
import { computePeaks, PEAK_BUCKETS_PER_SECOND } from '~/lib/arrangement/peaks';
import {
  type ArrangementPositionStore,
  createArrangementPositionStore,
} from '~/lib/arrangement/position-store';
import {
  createLibraryPreviewPlayer,
  type LibraryPreviewPlayer,
} from '~/lib/arrangement/preview.client';
import { isValidArrangementRenderWindow } from '~/lib/arrangement/render-window';
import { planSchedule, trackEffectiveGains } from '~/lib/arrangement/schedule';
import {
  deleteClips,
  GROUP_MOVE_BLOCKED_MESSAGE,
  moveClips,
  type SelectionToggleMode,
  toggleInSelection,
} from '~/lib/arrangement/selection';
import {
  type ArrangementStatusEntry,
  type ArrangementStatusUpdate,
  createArrangementStatusEntry,
  reduceArrangementStatus,
} from '~/lib/arrangement/status-announcement';
import {
  studioClipStrings,
  studioEditStrings,
  studioExportStrings,
  studioLibraryStrings,
  studioLoopStrings,
  studioMoveStrings,
  studioPlaybackStrings,
  studioSourceLoadStrings,
  studioVideoStrings,
} from '~/lib/arrangement/strings';
import {
  createPlaybackAnchor,
  isPlaybackAnchorHolding,
  type PlaybackAnchor,
  positionAt,
  reschedulePlaybackAnchor,
  shouldRescheduleScrub,
} from '~/lib/arrangement/transport';
import {
  audioFileRejectionMessage,
  classifyVideoFile,
  unsupportedFileMessage,
  VIDEO_AUDIO_DECODE_LIMIT_SECONDS,
} from '~/lib/arrangement/video';
import { decodeVideoAudio, probeVideoFile, videoAudioNote } from '~/lib/arrangement/video.client';
import { clampTimelineZoom, TIMELINE_ZOOM_DEFAULT } from '~/lib/arrangement/view';
import type {
  Arrangement,
  ArrangementLoop,
  ArrangementMaster,
  TimeRange,
  WorkspaceCollection,
  WorkspaceVideoSource,
} from '~/types/arrangement';

const PLAYBACK_LOOKAHEAD = 0.05;
const LOOP_SCHEDULE_HORIZON = 2;
const LOOP_LATE_MARGIN = 0.02;
const AUDIO_PUMP_INTERVAL_MS = 200;
export const GESTURE_UNDO_BLOCKED_MESSAGE = studioMoveStrings.undoBlockedDuringDrag;
export const GESTURE_EDIT_BLOCKED_MESSAGE = studioMoveStrings.editBlockedDuringDrag;
export const NUDGE_AT_TIME_START_MESSAGE = studioMoveStrings.nudgeAtTimeStart;
const AUDIO_ON_VIDEO_LANE_MESSAGE = studioLibraryStrings.audioOnVideoTrack;
const LIBRARY_DROP_BLOCKED_MESSAGE = studioLibraryStrings.dropBlocked;
const librarySourceFailedMessage = studioLibraryStrings.sourceFailed;
export const WEB_AUDIO_UNAVAILABLE_MESSAGE = studioPlaybackStrings.webAudioUnavailable;
const STOP_OVERSHOOT_TOLERANCE = 0.05;
const NO_SELECTION: readonly string[] = [];
const LOOP_STEP_BLOCKED_MESSAGE = studioLoopStrings.stepBlocked;
const DECODE_SAMPLE_RATE = 48000;
const RETIRED_GRAPH_GRACE = 0.25;
const GESTURE_WAIT_MS = 50;
const GESTURE_WAIT_LIMIT_MS = 30000;
const MASTER_VOLUME_LABEL = 'Master Volume';
const MASTER_MUTE_LABEL = 'Master Mute';
const CLIP_GAIN_LABEL = 'Clip Gain';
const MASTER_MUTED_EXPORT_SUFFIX = studioExportStrings.masterMutedSuffix;
export const ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS = 120_000;

export type SourceLoadStatus = 'loading' | 'ready' | 'error';

export interface SourceLoadState {
  status: SourceLoadStatus;
  duration: number;
  error: string | null;
}

export type ArrangementExportPhase = 'idle' | 'rendering' | 'done' | 'error' | 'cancelled';

export interface ArrangementExportState {
  phase: ArrangementExportPhase;
  message: string | null;
  warning?: string;
}

export interface LibraryDragSource {
  sourceId: string;
  title: string;
  duration: number;
}

export interface ClipLaneGhost {
  clipId: string;
  trackId: string;
  start: number;
  duration: number;
  blocked: boolean;
  message: string | null;
}

export interface ClipLaneDragState {
  ghosts: readonly ClipLaneGhost[];
  timeLocked: boolean;
}

export interface ArrangementPlaybackClock {
  ctxTime: number;
  holdUntil: number;
  loop: ArrangementLoop | null;
  scrubbing: boolean;
}

interface ArrangementContextValue {
  collection: WorkspaceCollection;
  arrangement: Arrangement;
  projectEnd: number;
  undoLabel: string | null;
  redoLabel: string | null;
  selectedClipId: string | null;
  selectedClipIds: readonly string[];
  selectedSourceId: string | null;
  range: TimeRange | null;
  activeTrackId: string | null;
  isPlaying: boolean;
  pxPerSecond: number;
  status: string;
  statusSequence: number;
  sourceStates: Record<string, SourceLoadState>;
  sourcePeaks: ReadonlyMap<string, Float32Array>;
  sourceDurations: ReadonlyMap<string, number>;
  videoSources: ReadonlyMap<string, WorkspaceVideoSource>;
  exportState: ArrangementExportState;
  exportProgress: ArrangementExportProgressStore;
  clipLaneDrag: ClipLaneDragState | null;
  setClipLaneDrag: (next: ClipLaneDragState | null) => void;
  togglePlayback: () => void;
  pausePlaybackWithStatus: (message: string) => void;
  seekTo: (time: number) => void;
  scrubPlayhead: (time: number) => void;
  endPlayheadScrub: (time: number) => void;
  importVideoFiles: (files: readonly File[]) => void;
  selectSource: (sourceId: string) => void;
  addSourceToActiveTrack: (sourceId?: string) => void;
  selectClip: (clipId: string | null) => void;
  toggleClipSelection: (clipId: string, mode: SelectionToggleMode) => void;
  selectClips: (clipIds: readonly string[]) => void;
  selectAllClips: () => void;
  getSelectedClipIds: () => readonly string[];
  getLivePosition: () => number;
  getPlaybackClock: () => ArrangementPlaybackClock | null;
  beginPointerGesture: () => () => void;
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
  isArrangementPreviewActive: () => boolean;
  isPointerGestureActive: () => boolean;
  libraryPreviewSourceId: string | null;
  startLibraryPreview: (sourceId: string, offset?: number) => void;
  stopLibraryPreview: () => void;
  getLibraryPreviewOffset: () => number | null;
  beginLibraryDrag: (sourceId: string) => void;
  endLibraryDrag: () => void;
  getLibraryDragSource: () => LibraryDragSource | null;
  dropLibrarySource: (trackId: string, start: number) => boolean;
  toggleLoopSelection: () => void;
  extendRangeToAllTracks: () => void;
  previewLoopArrangement: (next: Arrangement) => void;
  commitLoopRange: (before: Arrangement) => void;
  stepLoopRange: (
    kind: 'move' | LoopEdge,
    delta: number,
    gridStep?: number | null,
    options?: { readonly keyRepeat?: boolean },
  ) => void;
  setTimeRange: (range: TimeRange | null) => void;
  setActiveTrack: (trackId: string) => void;
  getArrangement: () => Arrangement;
  previewArrangement: (next: Arrangement) => void;
  commitArrangement: (next: Arrangement, label: string, before: Arrangement) => boolean;
  nudgeSelectedClip: (delta: number, options?: { readonly keyRepeat?: boolean }) => void;
  splitSelection: () => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  copySelection: () => void;
  cutSelection: () => void;
  cutTimeSelection: () => void;
  pasteClipboard: () => void;
  undo: () => void;
  redo: () => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackSolo: (trackId: string, additive: boolean) => void;
  previewTrackVolume: (trackId: string, volume: number) => void;
  commitTrackVolume: (trackId?: string) => void;
  beginTrackVolumeGesture: (trackId: string, pointerId: number) => boolean;
  blurTrackVolume: (trackId: string) => void;
  toggleGroupMute: (groupId: string) => void;
  toggleGroupSolo: (groupId: string, additive: boolean) => void;
  previewGroupVolume: (groupId: string, volume: number) => void;
  commitGroupVolume: (groupId: string) => void;
  beginGroupVolumeGesture: (groupId: string, pointerId: number) => boolean;
  blurGroupVolume: (groupId: string) => void;
  setTrackPan: (trackId: string, pan: number) => boolean;
  beginTrackPanGesture: (trackId: string, pointerId: number) => boolean;
  previewTrackPan: (trackId: string, pan: number) => void;
  commitTrackPan: (trackId: string) => void;
  cancelTrackPan: (trackId: string) => void;
  master: ArrangementMaster;
  toggleMasterMute: () => void;
  setClipGain: (clipId: string, gainDb: number) => boolean;
  previewClipGainFader: (clipId: string, gainDb: number) => void;
  commitClipGainFader: (clipId?: string) => void;
  beginClipGainFaderGesture: (clipId: string, pointerId: number) => boolean;
  blurClipGainFader: (clipId: string) => void;
  setClipGainMembers: (clipIds: readonly string[], gainDb: number) => boolean;
  previewClipGainMembers: (clipIds: readonly string[], anchorDb: number) => void;
  commitClipGainMembers: (clipIds?: readonly string[]) => void;
  beginClipGainMembersGesture: (clipIds: readonly string[], pointerId: number) => boolean;
  blurClipGainMembers: (clipIds: readonly string[]) => void;
  previewMasterGain: (gainDb: number) => void;
  commitMasterGain: () => void;
  beginMasterGainGesture: (pointerId: number) => boolean;
  blurMasterGain: () => void;
  resetMasterPeak: () => void;
  setPxPerSecond: (value: number) => void;
  setStatus: (message: string) => void;
  setMetronomeBpm: (next: number | null) => void;
  exportWav: (renderWindow?: ArrangementRenderWindow) => Promise<void>;
  exportMp3: (
    renderWindow?: ArrangementRenderWindow,
    options?: { includeWav?: boolean },
  ) => Promise<void>;
  resetExportState: () => void;
  cancelExport: () => void;
}

interface ArrangementProviderProps {
  collection: WorkspaceCollection;
  initialArrangement?: Arrangement;
  children?: ReactNode;
}

interface ActivePointerGesture {
  pointerId: number;
  abort: () => void;
  release: () => void;
}

interface MixVolumeGesture {
  targetKey: string;
  release: () => void;
}

type MixVolumeTarget = { kind: 'track' | 'group'; id: string };

function mixVolumeTargetKey(target: MixVolumeTarget): string {
  return `${target.kind}:${target.id}`;
}

function mixVolumeTargetValue(
  arrangement: Arrangement,
  target: MixVolumeTarget,
): number | undefined {
  if (target.kind === 'track') {
    return arrangement.tracks.find((entry) => entry.id === target.id)?.volume;
  }
  const group = arrangementGroups(arrangement).find((entry) => entry.id === target.id);
  return group ? trackGroupVolume(group) : undefined;
}

interface MasterGainGesture {
  release: () => void;
}

interface ClipGainFaderGesture {
  memberKey: string;
  release: () => void;
}

interface TrackPanGesture {
  trackId: string;
  release: () => void;
}

interface TrackPanOverride {
  trackId: string;
  value: number;
}

interface RetiredGraph {
  handle: ScheduleHandle;
  stopAt: number;
}

const ArrangementContext = createContext<ArrangementContextValue | undefined>(undefined);

const ArrangementPositionContext = createContext<ArrangementPositionStore | null>(null);

const ArrangementMeterContext = createContext<MasterMeterStore | null>(null);

interface MasterMeterTap {
  input: ChannelSplitterNode;
  analysers: readonly AnalyserNode[];
}

function createMasterMeterTap(ctx: AudioContext): MasterMeterTap | null {
  if (typeof ctx.createAnalyser !== 'function' || typeof ctx.createChannelSplitter !== 'function') {
    return null;
  }
  try {
    const input = ctx.createChannelSplitter(2);
    const analysers = [0, 1].map((channel) => {
      const analyser = ctx.createAnalyser();
      analyser.fftSize = MASTER_METER_FFT_SIZE;
      input.connect(analyser, channel);
      return analyser;
    });
    return { input, analysers };
  } catch {
    return null;
  }
}

const ArrangementTrackMeterContext = createContext<TrackMeterStore | null>(null);

interface TrackMeterTap extends MasterMeterTap {
  blocks: readonly Float32Array<ArrayBuffer>[];
}

function createTrackMeterTap(ctx: AudioContext): TrackMeterTap | null {
  const tap = createMasterMeterTap(ctx);
  if (!tap) {
    return null;
  }
  return { ...tap, blocks: tap.analysers.map((analyser) => new Float32Array(analyser.fftSize)) };
}

function measureTrackMeterTap(tap: TrackMeterTap, fresh: number): MeterBlock {
  let peak = 0;
  let over = false;
  tap.analysers.forEach((analyser, channel) => {
    const block = tap.blocks[channel];
    analyser.getFloatTimeDomainData(block);
    const measured = measureBlock(
      fresh >= block.length ? block : block.subarray(block.length - Math.max(0, fresh)),
    );
    peak = Math.max(peak, measured.peak);
    over = over || measured.over;
  });
  return { peak, over };
}

function ensureTrackMeterInputs(
  ctx: AudioContext,
  taps: Map<string, TrackMeterTap>,
  tracks: Arrangement['tracks'],
): Map<string, ChannelSplitterNode> | undefined {
  const inputs = new Map<string, ChannelSplitterNode>();
  for (const track of tracks) {
    let tap = taps.get(track.id);
    if (!tap) {
      const created = createTrackMeterTap(ctx);
      if (!created) {
        continue;
      }
      tap = created;
      taps.set(track.id, tap);
    }
    inputs.set(track.id, tap.input);
  }
  return inputs.size > 0 ? inputs : undefined;
}

const usePositionWriterEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function formatArrangementTime(seconds: number): string {
  const safe = Math.max(0, seconds);
  const totalMs = Math.round(safe * 1000);
  const minutes = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
}

export function playPastEndMessage(position: number, end: number): string {
  return studioPlaybackStrings.playPastEnd({
    position: formatArrangementTime(position),
    end: formatArrangementTime(end),
  });
}

interface LoopScheduleState {
  params: LoopScheduleParams;
  arrangement: Arrangement;
  nextIteration: number;
}

function scheduleKey(arrangement: Arrangement): string {
  return JSON.stringify([arrangement.clips, arrangement.loop], (key, value) =>
    key === 'gainDb' ? undefined : value,
  );
}

function formatLoopSpan(loop: ArrangementLoop | { start: number; end: number }): string {
  return `${formatArrangementTime(loop.start)} — ${formatArrangementTime(loop.end)}`;
}

function roundToMs(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function fallbackArrangement(): Arrangement {
  return createArrangement([
    { id: 'video', kind: 'video', name: 'Video' },
    { id: 'audio', kind: 'audio', name: 'Audio' },
  ]);
}

export function ArrangementProvider({
  collection,
  initialArrangement,
  children,
}: ArrangementProviderProps) {
  const [history, setHistory] = useState<ArrangementHistory>(() =>
    createHistory(initialArrangement ?? fallbackArrangement()),
  );
  const [selectedClipIds, setSelectedClipIdsState] = useState<readonly string[]>(NO_SELECTION);
  const [selectedSourceId, setSelectedSourceIdState] = useState<string | null>(
    collection.sources[0]?.id ?? null,
  );
  const [range, setRangeState] = useState<TimeRange | null>(null);
  const [activeTrackId, setActiveTrackIdState] = useState<string | null>(
    () => history.present.tracks.find((track) => track.kind === 'audio')?.id ?? null,
  );
  const [positionStore] = useState(() => createArrangementPositionStore(0));
  const [meterStore] = useState(() => createMasterMeterStore());
  const [trackMeterStore] = useState(() => createTrackMeterStore());
  const [isPlaying, setIsPlaying] = useState(false);
  const [pxPerSecond, setPxPerSecondState] = useState(TIMELINE_ZOOM_DEFAULT);
  const gestureCountRef = useRef(0);
  const [statusEntry, setStatus] = useReducer(
    (previous: ArrangementStatusEntry, next: ArrangementStatusUpdate) =>
      reduceArrangementStatus(previous, next, gestureCountRef.current > 0),
    collection.origin,
    (origin) => createArrangementStatusEntry(workspaceCollectionCopy(origin).loading),
  );
  const status = statusEntry.text;
  const statusSequence = statusEntry.sequence;
  const lastNonRefusalStatusRef = useRef(status);
  useIsomorphicLayoutEffect(() => {
    if (status !== GESTURE_EDIT_BLOCKED_MESSAGE && status !== GESTURE_UNDO_BLOCKED_MESSAGE) {
      lastNonRefusalStatusRef.current = status;
    }
  }, [status]);
  const [sourceStates, setSourceStatesState] = useState<Record<string, SourceLoadState>>({});
  const [sourcePeaks, setSourcePeaks] = useState<ReadonlyMap<string, Float32Array>>(new Map());
  const [videoSources, setVideoSourcesState] = useState<ReadonlyMap<string, WorkspaceVideoSource>>(
    new Map(),
  );
  const [exportState, setExportState] = useState<ArrangementExportState>({
    phase: 'idle',
    message: null,
  });
  const [exportProgress] = useState(() => createArrangementExportProgressStore());
  const exportAbortRef = useRef<AbortController | null>(null);
  const [clipLaneDrag, setClipLaneDrag] = useState<ClipLaneDragState | null>(null);
  const clipboardRef = useRef<ArrangementClipboard | null>(null);

  const historyRef = useRef(history);
  const positionRef = useRef(0);
  const isPlayingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const meterTapRef = useRef<MasterMeterTap | null>(null);
  const meterBlocksRef = useRef<Float32Array<ArrayBuffer>[]>([]);
  const meterStateRef = useRef(createMasterMeterState());
  const meterFreshFromRef = useRef(0);
  const trackMeterTapsRef = useRef(new Map<string, TrackMeterTap>());
  const trackMeterStatesRef = useRef(new Map<string, MasterMeterState>());
  const buffersRef = useRef(new Map<string, AudioBuffer>());
  const handleRef = useRef<ScheduleHandle | null>(null);
  const metronomeBpmRef = useRef<number | null>(null);
  const metronomeBuffersRef = useRef<{ accent: AudioBuffer; beat: AudioBuffer } | null>(null);
  const metronomeHorizonRef = useRef<MetronomeHorizonState | null>(null);
  const retiredRef = useRef<RetiredGraph[]>([]);
  const anchorRef = useRef<PlaybackAnchor>(createPlaybackAnchor(0, 0));
  const scrubbingRef = useRef(false);
  const lastScrubRescheduleRef = useRef<number | null>(null);
  const decodeContextRef = useRef<OfflineAudioContext | null>(null);
  const videoSourcesRef = useRef(new Map<string, WorkspaceVideoSource>());
  const videoUrlsRef = useRef(new Set<string>());
  const importControllerRef = useRef<AbortController | null>(null);
  const importChainRef = useRef<Promise<void>>(Promise.resolve());
  const decodeChainRef = useRef<Promise<void>>(Promise.resolve());
  const previewActiveRef = useRef(false);
  const scheduledKeyRef = useRef('');
  const frameRef = useRef<number | null>(null);
  const volumeBeforeRef = useRef<Arrangement | null>(null);
  const volumeGestureRef = useRef<MixVolumeGesture | null>(null);
  const volumeTargetKeyRef = useRef<string | null>(null);
  const masterBeforeRef = useRef<Arrangement | null>(null);
  const masterGestureRef = useRef<MasterGainGesture | null>(null);
  const clipGainBeforeRef = useRef<Arrangement | null>(null);
  const clipGainMemberKeyRef = useRef<string | null>(null);
  const clipGainMemberIdsRef = useRef<readonly string[] | null>(null);
  const clipGainGestureRef = useRef<ClipGainFaderGesture | null>(null);
  const panGestureRef = useRef<TrackPanGesture | null>(null);
  const panOverrideRef = useRef<TrackPanOverride | null>(null);
  const latestRef = useRef({
    selectedClipIds,
    selectedSourceId,
    range,
    activeTrackId,
    sourceStates,
  });
  const scheduledEndRef = useRef(0);
  const loopScheduleRef = useRef<LoopScheduleState | null>(null);
  const lastLoopPreviewSyncRef = useRef<number | null>(null);
  const resyncLoopRef = useRef<() => void>(() => undefined);
  const audioPumpTimerRef = useRef<number | null>(null);
  const activeGestureRef = useRef<ActivePointerGesture | null>(null);
  const playbackEndedAtRef = useRef<number | null>(null);
  const webAudioUnavailableRef = useRef(false);
  const previewPlayerRef = useRef<LibraryPreviewPlayer | null>(null);
  const libraryPreviewSourceRef = useRef<string | null>(null);
  const libraryDragSourceRef = useRef<string | null>(null);
  const [libraryPreviewSourceId, setLibraryPreviewSourceId] = useState<string | null>(null);

  const setSelection = useCallback((next: readonly string[]) => {
    latestRef.current.selectedClipIds = next;
    setSelectedClipIdsState(next);
  }, []);

  const setSelectedClipId = useCallback(
    (next: string | null) => {
      setSelection(next ? [next] : NO_SELECTION);
    },
    [setSelection],
  );

  const getSelectedClipIds = useCallback(() => latestRef.current.selectedClipIds, []);

  const primarySelectedClipId = useCallback(
    (): string | null => latestRef.current.selectedClipIds.at(-1) ?? null,
    [],
  );

  const setSelectedSourceId = useCallback((next: string | null) => {
    latestRef.current.selectedSourceId = next;
    setSelectedSourceIdState(next);
  }, []);

  const setRange = useCallback((next: TimeRange | null) => {
    latestRef.current.range = next;
    setRangeState(next);
  }, []);

  const setActiveTrackId = useCallback((next: string | null) => {
    latestRef.current.activeTrackId = next;
    setActiveTrackIdState(next);
  }, []);

  const patchSourceState = useCallback((sourceId: string, next: SourceLoadState) => {
    const states = { ...latestRef.current.sourceStates, [sourceId]: next };
    latestRef.current.sourceStates = states;
    setSourceStatesState(states);
  }, []);

  const updateHistory = useCallback((next: ArrangementHistory) => {
    historyRef.current = next;
    setHistory(next);
  }, []);

  const updatePosition = useCallback(
    (next: number) => {
      positionRef.current = next;
      positionStore.setPosition(next);
    },
    [positionStore],
  );

  const refuseEditDuringGesture = useCallback((): boolean => {
    if (gestureCountRef.current > 0) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return true;
    }
    return false;
  }, []);

  const patchVideoSource = useCallback((source: WorkspaceVideoSource) => {
    const next = new Map(videoSourcesRef.current).set(source.id, source);
    videoSourcesRef.current = next;
    setVideoSourcesState(next);
  }, []);

  const getDecodeContext = useCallback((): OfflineAudioContext => {
    if (!decodeContextRef.current) {
      decodeContextRef.current = new OfflineAudioContext({
        numberOfChannels: 2,
        length: 1,
        sampleRate: DECODE_SAMPLE_RATE,
      });
    }
    return decodeContextRef.current;
  }, []);

  const livePosition = useCallback((): number => {
    const ctx = audioContextRef.current;
    if (!isPlayingRef.current || !ctx || scrubbingRef.current) {
      return positionRef.current;
    }
    const anchor = anchorRef.current;
    return loopTimelinePosition(
      positionAt(anchor, ctx.currentTime),
      loopScheduleRef.current?.params.loop ?? null,
      anchor.position,
    );
  }, []);

  const getPlaybackClock = useCallback((): ArrangementPlaybackClock | null => {
    const ctx = audioContextRef.current;
    if (!isPlayingRef.current || !ctx) {
      return null;
    }
    return {
      ctxTime: ctx.currentTime,
      holdUntil: anchorRef.current.holdUntil,
      loop: loopScheduleRef.current?.params.loop ?? null,
      scrubbing: scrubbingRef.current,
    };
  }, []);

  const fillLoopIterations = useCallback((): boolean => {
    const ctx = audioContextRef.current;
    const schedule = loopScheduleRef.current;
    const handle = handleRef.current;
    if (!ctx || !schedule || !handle) {
      return false;
    }
    const result = refillLoopIterations(
      schedule,
      ctx.currentTime,
      LOOP_SCHEDULE_HORIZON,
      LOOP_LATE_MARGIN,
      (iteration, timing) => {
        handle.appendPlan(
          planLoopIteration(schedule.arrangement, schedule.params, iteration),
          timing.from,
          timing.startAt,
        );
        const metronomeBpm = metronomeBpmRef.current;
        if (metronomeBpm !== null) {
          handle.appendClicks(
            planMetronomeClicks(metronomeBpm, timing.from, timing.until),
            timing.from,
            timing.startAt,
          );
        }
      },
    );
    return result === 'late';
  }, []);

  const fillMetronomeHorizon = useCallback(() => {
    const ctx = audioContextRef.current;
    const handle = handleRef.current;
    const state = metronomeHorizonRef.current;
    if (!ctx || !handle || !state) {
      return;
    }
    for (;;) {
      const chunk = nextMetronomeChunk(
        state,
        ctx.currentTime,
        METRONOME_SCHEDULE_HORIZON_SECONDS,
        LOOP_LATE_MARGIN,
      );
      if (!chunk) {
        return;
      }
      handle.appendClicks(
        planMetronomeClicks(state.bpm, chunk.from, chunk.until, state.end),
        state.from,
        state.startAt,
      );
      state.nextFrom = chunk.until;
    }
  }, []);

  const releaseRetiredGraphs = useCallback((all: boolean) => {
    const now = audioContextRef.current?.currentTime ?? 0;
    retiredRef.current = retiredRef.current.filter((entry) => {
      if (all || entry.stopAt + RETIRED_GRAPH_GRACE < now) {
        entry.handle.disconnect();
        return false;
      }
      return true;
    });
  }, []);

  const stopGraph = useCallback(() => {
    if (handleRef.current) {
      handleRef.current.stop();
      handleRef.current.disconnect();
      handleRef.current = null;
    }
    metronomeHorizonRef.current = null;
    loopScheduleRef.current = null;
    for (const entry of retiredRef.current) {
      entry.handle.stop();
    }
    releaseRetiredGraphs(true);
  }, [releaseRetiredGraphs]);

  const startGraph = useCallback(
    (arrangement: Arrangement, anchor: PlaybackAnchor) => {
      const ctx = audioContextRef.current;
      if (!ctx) {
        return;
      }
      const { startAt } = anchor;
      const from = positionAt(anchor, startAt);
      const loop = resolveActiveLoop(arrangement.loop, from);
      const params: LoopScheduleParams | null = loop ? { loop, from, startAt } : null;
      const plan = params
        ? planLoopIteration(arrangement, params, 0)
        : planSchedule(arrangement, from);
      const panOverride = panOverrideRef.current;
      const metronomeBpm = metronomeBpmRef.current;
      const end = projectEnd(arrangement);
      const horizonUntil = Math.min(end, from + METRONOME_SCHEDULE_HORIZON_SECONDS);
      let clickBuffers = metronomeBuffersRef.current;
      if (metronomeBpm !== null && !clickBuffers) {
        const createClickBuffer = (accent: boolean): AudioBuffer => {
          const samples = generateMetronomeClickSamples(ctx.sampleRate, accent);
          const buffer = new AudioBuffer({
            length: samples.length,
            numberOfChannels: 1,
            sampleRate: ctx.sampleRate,
          });
          buffer.copyToChannel(samples, 0);
          return buffer;
        };
        clickBuffers = { accent: createClickBuffer(true), beat: createClickBuffer(false) };
        metronomeBuffersRef.current = clickBuffers;
      }
      const handle = applySchedule(ctx, plan, {
        buffers: buffersRef.current,
        tracks: panOverride
          ? arrangement.tracks.map((track) =>
              track.id === panOverride.trackId ? { ...track, pan: panOverride.value } : track,
            )
          : arrangement.tracks,
        from,
        startAt,
        masterGain: masterLinearGain(arrangement.master),
        clipGains: clipLinearGains(arrangement),
        clipFades: clipFadeShapes(arrangement),
        clipEnvelopes: clipEnvelopeShapes(arrangement),
        trackGains: trackEffectiveGains(arrangement),
        tap: meterTapRef.current?.input,
        trackTaps: meterTapRef.current
          ? ensureTrackMeterInputs(ctx, trackMeterTapsRef.current, arrangement.tracks)
          : undefined,
        metronome:
          metronomeBpm !== null && clickBuffers
            ? {
                ...clickBuffers,
                clicks: loop
                  ? planMetronomeClicks(metronomeBpm, from, loop.end)
                  : planMetronomeClicks(metronomeBpm, from, horizonUntil, end),
              }
            : undefined,
      });
      const previous = handleRef.current;
      if (previous) {
        const stopAt = isPlaybackAnchorHolding(anchorRef.current, ctx.currentTime)
          ? ctx.currentTime
          : startAt;
        previous.stop(stopAt);
        retiredRef.current.push({ handle: previous, stopAt });
      }
      handleRef.current = handle;
      metronomeHorizonRef.current =
        metronomeBpm !== null && clickBuffers && !loop
          ? { bpm: metronomeBpm, from, startAt, end, nextFrom: horizonUntil }
          : null;
      anchorRef.current = anchor;
      loopScheduleRef.current = params ? { params, arrangement, nextIteration: 1 } : null;
      scheduledKeyRef.current = scheduleKey(arrangement);
      scheduledEndRef.current = projectEnd(arrangement);
      fillLoopIterations();
      fillMetronomeHorizon();
      releaseRetiredGraphs(false);
    },
    [fillLoopIterations, fillMetronomeHorizon, releaseRetiredGraphs],
  );

  const stopPlayback = useCallback(
    (at?: number) => {
      const stoppedAt = at ?? livePosition();
      stopGraph();
      scrubbingRef.current = false;
      lastScrubRescheduleRef.current = null;
      isPlayingRef.current = false;
      setIsPlaying(false);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (audioPumpTimerRef.current !== null) {
        window.clearInterval(audioPumpTimerRef.current);
        audioPumpTimerRef.current = null;
      }
      updatePosition(stoppedAt);
      meterStateRef.current = floorMasterMeter(meterStateRef.current);
      meterStore.publishMeterFrame(meterStateRef.current);
      trackMeterStatesRef.current = floorTrackMeterFrames(trackMeterStatesRef.current);
      trackMeterStore.publishTrackMeterFrames(trackMeterStatesRef.current);
    },
    [livePosition, meterStore, stopGraph, trackMeterStore, updatePosition],
  );

  const sampleMasterMeter = useCallback(() => {
    const tap = meterTapRef.current;
    const ctx = audioContextRef.current;
    if (!tap || !ctx) {
      return;
    }
    const fresh = Math.round((ctx.currentTime - meterFreshFromRef.current) * ctx.sampleRate);
    let peak = 0;
    let over = false;
    tap.analysers.forEach((analyser, channel) => {
      let block = meterBlocksRef.current[channel];
      if (!block || block.length !== analyser.fftSize) {
        block = new Float32Array(analyser.fftSize);
        meterBlocksRef.current[channel] = block;
      }
      analyser.getFloatTimeDomainData(block);
      const measured = measureBlock(
        fresh >= block.length ? block : block.subarray(block.length - Math.max(0, fresh)),
      );
      peak = Math.max(peak, measured.peak);
      over = over || measured.over;
    });
    meterStateRef.current = stepMeter(meterStateRef.current, { peak, over }, performance.now());
    meterStore.publishMeterFrame(meterStateRef.current);
  }, [meterStore]);

  const sampleTrackMeters = useCallback(() => {
    const ctx = audioContextRef.current;
    const taps = trackMeterTapsRef.current;
    if (!ctx || taps.size === 0) {
      return;
    }
    const fresh = Math.round((ctx.currentTime - meterFreshFromRef.current) * ctx.sampleRate);
    const nowMs = performance.now();
    const states = trackMeterStatesRef.current;
    for (const [trackId, tap] of taps) {
      states.set(
        trackId,
        stepMeter(
          states.get(trackId) ?? createMasterMeterState(),
          measureTrackMeterTap(tap, fresh),
          nowMs,
        ),
      );
    }
    trackMeterStore.publishTrackMeterFrames(states);
  }, [trackMeterStore]);

  const resetMasterPeak = useCallback(() => {
    meterFreshFromRef.current = audioContextRef.current?.currentTime ?? 0;
    meterStateRef.current = resetMasterMeterPeak(meterStateRef.current);
    meterStore.publishMeterFrame(meterStateRef.current);
    trackMeterStatesRef.current = resetTrackMeterPeaks(trackMeterStatesRef.current);
    trackMeterStore.publishTrackMeterFrames(trackMeterStatesRef.current);
  }, [meterStore, trackMeterStore]);

  const pumpPlaybackAudio = useCallback(() => {
    if (!isPlayingRef.current) {
      return;
    }
    if (fillLoopIterations()) {
      resyncLoopRef.current();
    }
    fillMetronomeHorizon();
    releaseRetiredGraphs(false);
  }, [fillLoopIterations, fillMetronomeHorizon, releaseRetiredGraphs]);

  const tick = useCallback(() => {
    if (!isPlayingRef.current) {
      frameRef.current = null;
      return;
    }
    pumpPlaybackAudio();
    sampleMasterMeter();
    sampleTrackMeters();
    if (scrubbingRef.current) {
      frameRef.current = requestAnimationFrame(tick);
      return;
    }
    const end = scheduledEndRef.current;
    const current = livePosition();
    if (!loopScheduleRef.current && current >= end) {
      const stopAt = current > end + STOP_OVERSHOOT_TOLERANCE ? current : end;
      playbackEndedAtRef.current = stopAt;
      stopPlayback(stopAt);
      return;
    }
    updatePosition(current);
    frameRef.current = requestAnimationFrame(tick);
  }, [
    livePosition,
    pumpPlaybackAudio,
    sampleMasterMeter,
    sampleTrackMeters,
    stopPlayback,
    updatePosition,
  ]);

  const syncPlayback = useCallback(
    (arrangement: Arrangement, removed?: { a: number; b: number }, force = false) => {
      const ctx = audioContextRef.current;
      if (!isPlayingRef.current || !ctx) {
        return;
      }
      if (force || removed || scheduleKey(arrangement) !== scheduledKeyRef.current) {
        const startAt = ctx.currentTime + PLAYBACK_LOOKAHEAD;
        const previousAnchor = anchorRef.current;
        const previousLoop = loopScheduleRef.current?.params.loop ?? null;
        const anchor = scrubbingRef.current
          ? createPlaybackAnchor(positionRef.current, startAt)
          : reschedulePlaybackAnchor(
              previousAnchor,
              startAt,
              (position) => {
                const mapped = loopTimelinePosition(
                  position,
                  previousLoop,
                  previousAnchor.position,
                );
                return removed ? remapTime(mapped, removed.a, removed.b) : mapped;
              },
              ctx.currentTime,
            );
        startGraph(arrangement, anchor);
        return;
      }
      const handle = handleRef.current;
      if (!handle) {
        return;
      }
      const trackGains = trackEffectiveGains(arrangement);
      for (const track of arrangement.tracks) {
        handle.setTrackGain(track.id, trackGains.get(track.id) ?? 0);
      }
      const panOverride = panOverrideRef.current;
      for (const track of arrangement.tracks) {
        handle.setTrackPan(
          track.id,
          panOverride?.trackId === track.id ? panOverride.value : trackPanValue(track),
        );
      }
      handle.setMasterGain(masterLinearGain(arrangement.master));
      for (const clip of arrangement.clips) {
        handle.setClipGain(clip.id, clipLinearGain(clip));
      }
    },
    [startGraph],
  );

  resyncLoopRef.current = () => syncPlayback(historyRef.current.present, undefined, true);

  const setMetronomeBpm = useCallback(
    (next: number | null) => {
      const bpm = next !== null && Number.isFinite(next) && next > 0 ? next : null;
      if (bpm === metronomeBpmRef.current) {
        return;
      }
      metronomeBpmRef.current = bpm;
      if (isPlayingRef.current) {
        syncPlayback(historyRef.current.present, undefined, true);
      }
    },
    [syncPlayback],
  );

  const flushPendingVolume = useCallback(() => {
    const pending = volumeBeforeRef.current;
    volumeBeforeRef.current = null;
    volumeTargetKeyRef.current = null;
    if (!pending) {
      return;
    }
    const current = historyRef.current;
    const committed = commitHistory(current, current.present, 'Volume', pending);
    if (committed !== current) {
      updateHistory(committed);
    }
  }, [updateHistory]);

  const flushPendingMaster = useCallback(() => {
    const pending = masterBeforeRef.current;
    masterBeforeRef.current = null;
    if (!pending) {
      return;
    }
    const current = historyRef.current;
    const committed = commitHistory(current, current.present, MASTER_VOLUME_LABEL, pending);
    if (committed !== current) {
      updateHistory(committed);
    }
  }, [updateHistory]);

  const flushPendingClipGain = useCallback(() => {
    const pending = clipGainBeforeRef.current;
    clipGainBeforeRef.current = null;
    clipGainMemberKeyRef.current = null;
    clipGainMemberIdsRef.current = null;
    if (!pending) {
      return;
    }
    const current = historyRef.current;
    const committed = commitHistory(current, current.present, CLIP_GAIN_LABEL, pending);
    if (committed !== current) {
      updateHistory(committed);
    }
  }, [updateHistory]);

  const applyEdit = useCallback(
    (
      next: Arrangement,
      label: string,
      before?: Arrangement,
      removed?: { a: number; b: number },
    ): boolean => {
      flushPendingVolume();
      flushPendingMaster();
      flushPendingClipGain();
      const current = historyRef.current;
      const committed = commitHistory(current, next, label, before);
      if (committed === current) {
        return false;
      }
      updateHistory(committed);
      syncPlayback(committed.present, removed);
      return committed.past.length !== current.past.length;
    },
    [flushPendingClipGain, flushPendingMaster, flushPendingVolume, syncPlayback, updateHistory],
  );

  const ensureAudioContext = useCallback((): AudioContext | null => {
    let ctx = audioContextRef.current;
    if (!ctx) {
      try {
        ctx = new AudioContext({ latencyHint: 'interactive' });
      } catch {
        webAudioUnavailableRef.current = true;
        setStatus(WEB_AUDIO_UNAVAILABLE_MESSAGE);
        return null;
      }
      webAudioUnavailableRef.current = false;
      audioContextRef.current = ctx;
      meterTapRef.current = createMasterMeterTap(ctx);
    }
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }
    return ctx;
  }, []);

  const stopLibraryPreview = useCallback(() => {
    previewPlayerRef.current?.stopLibraryPreview();
    if (libraryPreviewSourceRef.current !== null) {
      libraryPreviewSourceRef.current = null;
      setLibraryPreviewSourceId(null);
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlayingRef.current) {
      stopPlayback();
      return;
    }
    stopLibraryPreview();
    const arrangement = historyRef.current.present;
    const end = projectEnd(arrangement);
    if (end <= 0) {
      setStatus(studioPlaybackStrings.nothingToPlay);
      return;
    }
    const current = positionRef.current;
    const loopActive = resolveActiveLoop(arrangement.loop, current) !== null;
    const endedHere =
      playbackEndedAtRef.current !== null &&
      Math.abs(playbackEndedAtRef.current - current) < ARRANGEMENT_EPS;
    if (!loopActive && !endedHere && current > end + ARRANGEMENT_EPS) {
      setStatus(playPastEndMessage(current, end));
      return;
    }
    const ctx = ensureAudioContext();
    if (!ctx) {
      return;
    }
    playbackEndedAtRef.current = null;
    const from = current >= end - ARRANGEMENT_EPS && !loopActive ? 0 : current;
    isPlayingRef.current = true;
    setIsPlaying(true);
    updatePosition(from);
    const startAt = ctx.currentTime + PLAYBACK_LOOKAHEAD;
    meterFreshFromRef.current = startAt;
    startGraph(arrangement, createPlaybackAnchor(from, startAt));
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(tick);
    }
    if (audioPumpTimerRef.current === null) {
      audioPumpTimerRef.current = window.setInterval(pumpPlaybackAudio, AUDIO_PUMP_INTERVAL_MS);
    }
  }, [
    ensureAudioContext,
    pumpPlaybackAudio,
    startGraph,
    stopLibraryPreview,
    stopPlayback,
    tick,
    updatePosition,
  ]);

  const startLibraryPreview = useCallback(
    (sourceId: string, offset = 0) => {
      const source = collection.sources.find((entry) => entry.id === sourceId);
      const buffer = buffersRef.current.get(sourceId);
      if (!source || !buffer || latestRef.current.sourceStates[sourceId]?.status !== 'ready') {
        stopLibraryPreview();
        if (!source) {
          setStatus(studioLibraryStrings.selectSoundFirst);
        } else if (latestRef.current.sourceStates[sourceId]?.status === 'error') {
          setStatus(librarySourceFailedMessage(source.title));
        } else {
          setStatus(studioLibraryStrings.sourceNotLoaded(source.title));
        }
        return;
      }
      const ctx = ensureAudioContext();
      if (!ctx) {
        return;
      }
      if (isPlayingRef.current) {
        stopPlayback();
      }
      if (!previewPlayerRef.current) {
        previewPlayerRef.current = createLibraryPreviewPlayer(ctx, () => {
          libraryPreviewSourceRef.current = null;
          setLibraryPreviewSourceId(null);
        });
      }
      previewPlayerRef.current.playLibraryPreview(buffer, offset);
      libraryPreviewSourceRef.current = sourceId;
      setLibraryPreviewSourceId(sourceId);
    },
    [collection.sources, ensureAudioContext, stopLibraryPreview, stopPlayback],
  );

  const getLibraryPreviewOffset = useCallback(
    () => previewPlayerRef.current?.getLibraryPreviewOffset() ?? null,
    [],
  );

  const pausePlaybackWithStatus = useCallback(
    (message: string) => {
      if (isPlayingRef.current) {
        stopPlayback();
      }
      setStatus(message);
    },
    [stopPlayback],
  );

  const seekTo = useCallback(
    (time: number) => {
      const target = Math.max(0, time);
      const ctx = audioContextRef.current;
      scrubbingRef.current = false;
      lastScrubRescheduleRef.current = null;
      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
      updatePosition(target);
    },
    [startGraph, updatePosition],
  );

  const scrubPlayhead = useCallback(
    (time: number) => {
      const target = Math.max(0, time);
      updatePosition(target);
      const ctx = audioContextRef.current;
      if (!isPlayingRef.current || !ctx) {
        return;
      }
      scrubbingRef.current = true;
      if (shouldRescheduleScrub(lastScrubRescheduleRef.current, ctx.currentTime)) {
        lastScrubRescheduleRef.current = ctx.currentTime;
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
    },
    [startGraph, updatePosition],
  );

  const endPlayheadScrub = useCallback(
    (time: number) => {
      scrubbingRef.current = false;
      lastScrubRescheduleRef.current = null;
      const target = Math.max(0, time);
      updatePosition(target);
      const ctx = audioContextRef.current;
      if (isPlayingRef.current && ctx) {
        startGraph(
          historyRef.current.present,
          createPlaybackAnchor(target, ctx.currentTime + PLAYBACK_LOOKAHEAD),
        );
      }
    },
    [startGraph, updatePosition],
  );

  const selectSource = useCallback(
    (sourceId: string) => {
      setSelectedSourceId(sourceId);
    },
    [setSelectedSourceId],
  );

  const addSourceToActiveTrack = useCallback(
    (sourceId?: string) => {
      if (refuseEditDuringGesture()) {
        return;
      }
      const latest = latestRef.current;
      const id = sourceId ?? latest.selectedSourceId;
      const source = collection.sources.find((entry) => entry.id === id);
      if (!source) {
        setStatus(studioLibraryStrings.selectSoundFirst);
        return;
      }
      const state = latest.sourceStates[source.id];
      if (!state || state.status !== 'ready') {
        setStatus(
          state?.status === 'error'
            ? librarySourceFailedMessage(source.title)
            : studioLibraryStrings.sourceNotLoaded(source.title),
        );
        return;
      }
      const arrangement = historyRef.current.present;
      const track = arrangement.tracks.find((entry) => entry.id === latest.activeTrackId);
      if (!track || track.kind !== 'audio') {
        setStatus(AUDIO_ON_VIDEO_LANE_MESSAGE);
        return;
      }
      const desired = livePosition();
      const result = addClip(arrangement, {
        trackId: track.id,
        sourceId: source.id,
        desiredStart: desired,
        sourceDuration: state.duration,
      });
      if (!result) {
        setStatus(studioLibraryStrings.addFailed);
        return;
      }
      applyEdit(result.arrangement, studioLibraryStrings.historyAdd(source.title));
      setSelectedClipId(result.clip.id);
      setRange(null);
      const moved = Math.abs(result.clip.start - desired) > ARRANGEMENT_EPS;
      setStatus(
        studioLibraryStrings.clipAdded({
          title: source.title,
          track: track.name,
          time: formatArrangementTime(result.clip.start),
          suffix: moved ? studioLibraryStrings.nearestFreeSpot : '',
        }),
      );
    },
    [
      applyEdit,
      collection.sources,
      livePosition,
      refuseEditDuringGesture,
      setRange,
      setSelectedClipId,
    ],
  );

  const beginLibraryDrag = useCallback((sourceId: string) => {
    libraryDragSourceRef.current = sourceId;
  }, []);

  const endLibraryDrag = useCallback(() => {
    libraryDragSourceRef.current = null;
  }, []);

  const getLibraryDragSource = useCallback((): LibraryDragSource | null => {
    const sourceId = libraryDragSourceRef.current;
    const source = collection.sources.find((entry) => entry.id === sourceId);
    const state = sourceId ? latestRef.current.sourceStates[sourceId] : undefined;
    if (!source || !state || state.status !== 'ready') {
      return null;
    }
    return { sourceId: source.id, title: source.title, duration: state.duration };
  }, [collection.sources]);

  const dropLibrarySource = useCallback(
    (trackId: string, start: number): boolean => {
      if (refuseEditDuringGesture()) {
        libraryDragSourceRef.current = null;
        return false;
      }
      const dragged = getLibraryDragSource();
      libraryDragSourceRef.current = null;
      if (!dragged) {
        setStatus(studioLibraryStrings.dropNotLoaded);
        return false;
      }
      const arrangement = historyRef.current.present;
      const track = arrangement.tracks.find((entry) => entry.id === trackId);
      if (!track || track.kind !== 'audio') {
        setStatus(AUDIO_ON_VIDEO_LANE_MESSAGE);
        return false;
      }
      const placement = { trackId, start, duration: dragged.duration };
      if (!canPlaceLibraryClip(arrangement, placement)) {
        setStatus(LIBRARY_DROP_BLOCKED_MESSAGE);
        return false;
      }
      const result = addClip(arrangement, {
        trackId,
        sourceId: dragged.sourceId,
        desiredStart: start,
        sourceDuration: dragged.duration,
      });
      if (!result || Math.abs(result.clip.start - start) > ARRANGEMENT_EPS) {
        setStatus(LIBRARY_DROP_BLOCKED_MESSAGE);
        return false;
      }
      applyEdit(result.arrangement, studioLibraryStrings.historyAdd(dragged.title));
      setActiveTrackId(trackId);
      setSelectedClipId(result.clip.id);
      setRange(null);
      setStatus(
        studioLibraryStrings.clipAdded({
          title: dragged.title,
          track: track.name,
          time: formatArrangementTime(result.clip.start),
          suffix: '',
        }),
      );
      return true;
    },
    [
      applyEdit,
      getLibraryDragSource,
      refuseEditDuringGesture,
      setActiveTrackId,
      setRange,
      setSelectedClipId,
    ],
  );

  const selectClip = useCallback(
    (clipId: string | null) => {
      setSelectedClipId(clipId);
    },
    [setSelectedClipId],
  );

  const setTimeRange = useCallback(
    (next: TimeRange | null) => {
      setRange(next);
    },
    [setRange],
  );

  const setActiveTrack = useCallback(
    (trackId: string) => {
      setActiveTrackId(trackId);
    },
    [setActiveTrackId],
  );

  const getArrangement = useCallback(() => historyRef.current.present, []);

  const previewArrangement = useCallback(
    (next: Arrangement) => {
      previewActiveRef.current = true;
      updateHistory({ ...historyRef.current, present: next });
    },
    [updateHistory],
  );

  const commitArrangement = useCallback(
    (next: Arrangement, label: string, before: Arrangement) => {
      previewActiveRef.current = false;
      return applyEdit(next, label, before);
    },
    [applyEdit],
  );

  const beginPointerGesture = useCallback(() => {
    gestureCountRef.current += 1;
    let released = false;
    return () => {
      if (released) {
        return;
      }
      released = true;
      gestureCountRef.current = Math.max(0, gestureCountRef.current - 1);
      if (gestureCountRef.current === 0) {
        previewActiveRef.current = false;
        setStatus((current) =>
          current === GESTURE_EDIT_BLOCKED_MESSAGE || current === GESTURE_UNDO_BLOCKED_MESSAGE
            ? lastNonRefusalStatusRef.current
            : current,
        );
      }
    };
  }, []);

  const claimPointerGesture = useCallback(
    (pointerId: number, abort: () => void): (() => void) | null => {
      const active = activeGestureRef.current;
      if (active) {
        if (active.pointerId !== pointerId) {
          return null;
        }
        activeGestureRef.current = null;
        try {
          active.abort();
        } finally {
          active.release();
        }
      }
      const releaseCount = beginPointerGesture();
      const abortIfStillActive = () => {
        if (activeGestureRef.current === entry) {
          activeGestureRef.current = null;
          try {
            abort();
          } finally {
            release();
          }
        }
      };
      const handleWindowPointerEnd = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          window.setTimeout(abortIfStillActive, 0);
        }
      };
      const release = () => {
        window.removeEventListener('pointerup', handleWindowPointerEnd, true);
        window.removeEventListener('pointercancel', handleWindowPointerEnd, true);
        window.removeEventListener('blur', abortIfStillActive);
        if (activeGestureRef.current === entry) {
          activeGestureRef.current = null;
        }
        releaseCount();
      };
      const entry: ActivePointerGesture = { pointerId, abort, release };
      activeGestureRef.current = entry;
      window.addEventListener('pointerup', handleWindowPointerEnd, true);
      window.addEventListener('pointercancel', handleWindowPointerEnd, true);
      window.addEventListener('blur', abortIfStillActive);
      return release;
    },
    [beginPointerGesture],
  );

  const isArrangementPreviewActive = useCallback(() => previewActiveRef.current, []);

  const isPointerGestureActive = useCallback(() => gestureCountRef.current > 0, []);

  const toggleClipSelection = useCallback(
    (clipId: string, mode: SelectionToggleMode) => {
      setSelection(toggleInSelection(latestRef.current.selectedClipIds, clipId, mode));
      setRange(null);
    },
    [setRange, setSelection],
  );

  const selectClips = useCallback(
    (clipIds: readonly string[]) => {
      const current = latestRef.current.selectedClipIds;
      const same =
        current.length === clipIds.length && current.every((id, index) => id === clipIds[index]);
      if (!same) {
        setSelection([...clipIds]);
      }
    },
    [setSelection],
  );

  const selectAllClips = useCallback(() => {
    setSelection(historyRef.current.present.clips.map((clip) => clip.id));
    setRange(null);
  }, [setRange, setSelection]);

  const toggleLoopSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const arrangement = historyRef.current.present;
    const selected = latestRef.current.range;
    const loop = arrangement.loop;
    const sameAsBrace =
      selected !== null &&
      loop !== null &&
      Math.abs(selected.start - loop.start) < 1e-6 &&
      Math.abs(selected.end - loop.end) < 1e-6;
    if (selected && !sameAsBrace) {
      const next = setLoopFromRange(arrangement, selected);
      if (!next) {
        setStatus(studioLoopStrings.tooShort);
        return;
      }
      const replaced = loop !== null;
      applyEdit(
        next,
        replaced ? studioLoopStrings.historyReplaced : studioLoopStrings.historyCreated,
      );
      setStatus(
        replaced
          ? studioLoopStrings.replaced(formatLoopSpan(selected))
          : studioLoopStrings.created(formatLoopSpan(selected)),
      );
      return;
    }
    if (!loop) {
      setStatus(studioLoopStrings.needsSelection);
      return;
    }
    const enabling = !loop.enabled;
    applyEdit(
      toggleLoop(arrangement),
      enabling ? studioLoopStrings.historyOn : studioLoopStrings.historyOff,
    );
    setStatus(enabling ? studioLoopStrings.on : studioLoopStrings.off);
  }, [applyEdit, refuseEditDuringGesture]);

  const previewLoopArrangement = useCallback(
    (next: Arrangement) => {
      previewArrangement(next);
      const ctx = audioContextRef.current;
      if (!ctx || !isPlayingRef.current) {
        return;
      }
      if (shouldRescheduleScrub(lastLoopPreviewSyncRef.current, ctx.currentTime)) {
        lastLoopPreviewSyncRef.current = ctx.currentTime;
        syncPlayback(next);
      }
    },
    [previewArrangement, syncPlayback],
  );

  const commitLoopRange = useCallback(
    (before: Arrangement) => {
      lastLoopPreviewSyncRef.current = null;
      const committed = commitArrangement(
        historyRef.current.present,
        studioLoopStrings.historyRange,
        before,
      );
      const loop = historyRef.current.present.loop;
      syncPlayback(historyRef.current.present);
      if (committed && loop) {
        setStatus(`Loop: ${formatLoopSpan(loop)}${loop.enabled ? '' : ' · off'}.`);
      }
    },
    [commitArrangement, syncPlayback],
  );

  const stepLoopRange = useCallback(
    (
      kind: 'move' | LoopEdge,
      delta: number,
      gridStep: number | null = null,
      options?: { readonly keyRepeat?: boolean },
    ) => {
      const arrangement = historyRef.current.present;
      const loop = arrangement.loop;
      if (!loop) {
        return;
      }
      const next =
        kind === 'move'
          ? moveLoop(arrangement, roundToMs(loop.start + delta), gridStep)
          : resizeLoop(arrangement, kind, roundToMs(loop[kind] + delta));
      if (next === arrangement) {
        setStatus(
          options?.keyRepeat === true ? () => LOOP_STEP_BLOCKED_MESSAGE : LOOP_STEP_BLOCKED_MESSAGE,
        );
        return;
      }
      applyEdit(next, studioLoopStrings.historyRange);
      if (next.loop) {
        setStatus(`Loop: ${formatLoopSpan(next.loop)}${next.loop.enabled ? '' : ' · off'}.`);
      }
    },
    [applyEdit],
  );

  const nudgeSelectedClip = useCallback(
    (delta: number, options?: { readonly keyRepeat?: boolean }) => {
      const keyRepeat = options?.keyRepeat === true;
      const ids = latestRef.current.selectedClipIds;
      const arrangement = historyRef.current.present;
      if (ids.length >= 2) {
        const moved = moveClips(arrangement, ids, roundToMs(delta));
        if (!moved || moved === arrangement) {
          setStatus(keyRepeat ? () => GROUP_MOVE_BLOCKED_MESSAGE : GROUP_MOVE_BLOCKED_MESSAGE);
          return;
        }
        applyEdit(moved, studioClipStrings.historyMoveClips(ids.length));
        setRange(null);
        return;
      }
      const clipId = primarySelectedClipId();
      const clip = arrangement.clips.find((entry) => entry.id === clipId);
      if (!clip) {
        return;
      }
      const target = Math.max(0, Math.round((clip.start + delta) * 1000) / 1000);
      if (target === clip.start) {
        setStatus(keyRepeat ? () => NUDGE_AT_TIME_START_MESSAGE : NUDGE_AT_TIME_START_MESSAGE);
        return;
      }
      const next = moveClip(arrangement, clip.id, target);
      if (!next) {
        const message = studioMoveStrings.nudgeBlocked;
        setStatus(keyRepeat ? () => message : message);
        return;
      }
      applyEdit(next, studioMoveStrings.historyNudgeClip);
      setRange(null);
    },
    [applyEdit, primarySelectedClipId, setRange],
  );

  const splitSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range?.allTracks) {
      setStatus(studioEditStrings.splitAllTracksRefused);
      return;
    }
    if (!latest.range && latest.selectedClipIds.length >= 2) {
      const time = livePosition();
      const result = splitClipsAtTime(arrangement, latest.selectedClipIds, time);
      if (!result) {
        setStatus(studioEditStrings.splitMissesSelection);
        return;
      }
      const count = result.rightIds.length;
      applyEdit(result.arrangement, studioEditStrings.historySplitClips(count));
      setSelection(result.rightIds);
      setStatus(studioEditStrings.splitClipsDone({ count, time: formatArrangementTime(time) }));
      return;
    }
    if (latest.range) {
      const result = splitClipsByRange(arrangement, latest.range);
      if (!result) {
        setStatus(studioEditStrings.splitRangeFailed);
        return;
      }
      applyEdit(result.arrangement, studioEditStrings.historySplitRange);
      setSelectedClipId(result.middleId);
      setRange(null);
      setStatus(studioEditStrings.splitRangeDone);
      return;
    }
    const time = livePosition();
    const clip = arrangement.clips.find((entry) => entry.id === primarySelectedClipId());
    if (!clip) {
      setStatus(studioEditStrings.splitNeedsTarget);
      return;
    }
    const result = splitClipAt(arrangement, clip.id, time);
    if (!result) {
      setStatus(studioEditStrings.splitPlayheadOutside);
      return;
    }
    applyEdit(result.arrangement, studioEditStrings.historySplit);
    setSelectedClipId(result.rightId);
    setStatus(studioEditStrings.splitDone(formatArrangementTime(time)));
  }, [
    applyEdit,
    livePosition,
    primarySelectedClipId,
    refuseEditDuringGesture,
    setRange,
    setSelectedClipId,
    setSelection,
  ]);

  const deleteSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range) {
      const range = latest.range;
      const next = deleteRangeKeepingGap(arrangement, range);
      if (next === arrangement) {
        setStatus(studioEditStrings.deleteRangeEmpty);
        return;
      }
      applyEdit(
        next,
        range.allTracks
          ? studioEditStrings.historyDeleteRangeAllTracks
          : studioEditStrings.historyDeleteRange,
      );
      setRange(null);
      setSelectedClipId(null);
      const lanes = range.allTracks
        ? studioEditStrings.onAllTracks
        : studioEditStrings.onTrack(
            arrangement.tracks.find((track) => track.id === range.trackId)?.name ?? '—',
          );
      setStatus(
        studioEditStrings.deleteRangeDone({
          start: formatArrangementTime(Math.min(range.start, range.end)),
          end: formatArrangementTime(Math.max(range.start, range.end)),
          lanes,
        }),
      );
      return;
    }
    const ids = latest.selectedClipIds;
    if (ids.length >= 2) {
      const next = deleteClips(arrangement, ids);
      const removed = arrangement.clips.length - next.clips.length;
      applyEdit(next, studioEditStrings.historyDeleteClips(removed));
      setSelection(NO_SELECTION);
      setStatus(studioEditStrings.deleteClipsDone(removed));
      return;
    }
    const clip = arrangement.clips.find((entry) => entry.id === primarySelectedClipId());
    if (!clip) {
      setStatus(studioEditStrings.deleteNeedsTarget);
      return;
    }
    applyEdit(deleteClip(arrangement, clip.id), studioEditStrings.historyDeleteClip);
    setSelectedClipId(null);
    setStatus(studioEditStrings.deleteClipDone);
  }, [
    applyEdit,
    primarySelectedClipId,
    refuseEditDuringGesture,
    setRange,
    setSelectedClipId,
    setSelection,
  ]);

  const extendRangeToAllTracks = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const range = latestRef.current.range;
    if (!range) {
      setStatus(studioEditStrings.extendNeedsRange);
      return;
    }
    if (!range.allTracks) {
      setRange({ ...range, allTracks: true });
    }
    setStatus(
      studioEditStrings.extendDone({
        start: formatArrangementTime(Math.min(range.start, range.end)),
        end: formatArrangementTime(Math.max(range.start, range.end)),
      }),
    );
  }, [refuseEditDuringGesture, setRange]);

  const trackLabel = useCallback(
    (trackId: string | null): string =>
      historyRef.current.present.tracks.find((track) => track.id === trackId)?.name ?? '—',
    [],
  );

  const duplicateSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const latest = latestRef.current;
    if (latest.range) {
      setStatus(studioEditStrings.duplicateRangeRefused);
      return;
    }
    const result = duplicateClips(historyRef.current.present, latest.selectedClipIds);
    if (!result) {
      setStatus(studioEditStrings.duplicateNeedsClip);
      return;
    }
    if (!result.arrangement) {
      const { conflict } = result;
      setStatus(
        studioEditStrings.duplicateConflict({
          track: trackLabel(conflict.trackId),
          start: formatArrangementTime(conflict.start),
          end: formatArrangementTime(conflict.end),
        }),
      );
      return;
    }
    const count = result.copyIds.length;
    applyEdit(result.arrangement, studioEditStrings.historyDuplicate(count));
    setSelection(result.copyIds);
    const firstCopy = Math.min(
      ...result.arrangement.clips
        .filter((clip) => result.copyIds.includes(clip.id))
        .map((clip) => clip.start),
    );
    setStatus(studioEditStrings.duplicateDone({ count, from: formatArrangementTime(firstCopy) }));
  }, [applyEdit, refuseEditDuringGesture, setSelection, trackLabel]);

  const copySelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    if (latest.range) {
      const clipboard = copyRangeToClipboard(arrangement, latest.range);
      if (!clipboard) {
        setStatus(studioEditStrings.copyRangeEmpty);
        return;
      }
      clipboardRef.current = clipboard;
      setStatus(
        studioEditStrings.copyRangeDone({
          lane: latest.range.allTracks
            ? studioEditStrings.allTracks
            : trackLabel(latest.range.trackId),
          start: formatArrangementTime(latest.range.start),
          end: formatArrangementTime(latest.range.end),
          parts: clipboard.items.length,
        }),
      );
      return;
    }
    const clipboard = copyClipsToClipboard(arrangement, latest.selectedClipIds);
    if (!clipboard) {
      setStatus(studioEditStrings.copyNeedsTarget);
      return;
    }
    clipboardRef.current = clipboard;
    setStatus(studioEditStrings.copyClipsDone(clipboard.items.length));
  }, [refuseEditDuringGesture, trackLabel]);

  const cutSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const latest = latestRef.current;
    const arrangement = historyRef.current.present;
    const range = latest.range;
    const clipboard = range
      ? copyRangeToClipboard(arrangement, range)
      : copyClipsToClipboard(arrangement, latest.selectedClipIds);
    if (!clipboard) {
      setStatus(range ? studioEditStrings.cutRangeEmpty : studioEditStrings.cutNeedsTarget);
      return;
    }
    const next = range
      ? cutRangeFromArrangement(arrangement, range)
      : cutClipsFromArrangement(arrangement, latest.selectedClipIds);
    clipboardRef.current = clipboard;
    applyEdit(next, 'Cut');
    setRange(null);
    setSelection(NO_SELECTION);
    setStatus(studioEditStrings.cutDone(clipboard.items.length));
  }, [applyEdit, refuseEditDuringGesture, setRange, setSelection]);

  const cutTimeSelection = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const range = latestRef.current.range;
    if (!range) {
      setStatus(studioEditStrings.cutTimeNeedsRange);
      return;
    }
    const arrangement = historyRef.current.present;
    const a = Math.min(range.start, range.end);
    const b = Math.max(range.start, range.end);
    const result = cutTimeToClipboard(arrangement, a, b);
    const wasPlaying = isPlayingRef.current;
    const hasMaterial = result.clipboard.items.length > 0;
    if (!applyEdit(result.arrangement, 'Cut Time', undefined, { a, b })) {
      setStatus(
        studioEditStrings.cutTimeNothing({
          start: formatArrangementTime(a),
          end: formatArrangementTime(b),
        }),
      );
      return;
    }
    if (hasMaterial) {
      clipboardRef.current = { ...result.clipboard, allTracks: true };
    }
    if (!wasPlaying) {
      updatePosition(remapTime(positionRef.current, a, b));
    }
    setRange(null);
    setSelection(NO_SELECTION);
    const loopRemoved = arrangement.loop !== null && result.arrangement.loop === null;
    const markersRemoved =
      (arrangement.markers?.length ?? 0) - (result.arrangement.markers?.length ?? 0);
    setStatus(
      studioEditStrings.cutTimeDone({
        start: formatArrangementTime(a),
        end: formatArrangementTime(b),
        clipboard: hasMaterial
          ? studioEditStrings.cutTimeParts(result.clipboard.items.length)
          : studioEditStrings.cutTimeNoSound,
        suffix: `${loopRemoved ? ` ${studioEditStrings.loopRemoved}` : ''}${markersRemoved > 0 ? studioEditStrings.markersRemoved(markersRemoved) : ''}`,
      }),
    );
  }, [applyEdit, refuseEditDuringGesture, setRange, setSelection, updatePosition]);

  const pasteClipboard = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const at = livePosition();
    const plan = planClipboardPaste(historyRef.current.present, clipboardRef.current, {
      at,
      activeTrackId: latestRef.current.activeTrackId,
      isSourceAvailable: (sourceId) =>
        videoSourcesRef.current.has(sourceId) ||
        latestRef.current.sourceStates[sourceId]?.status === 'ready',
    });
    if (!plan.arrangement) {
      const lane = trackLabel(plan.trackId);
      setStatus(
        plan.refusal === 'overlap' && plan.conflict
          ? studioEditStrings.pasteOverlap({
              track: lane,
              start: formatArrangementTime(plan.conflict.start),
              end: formatArrangementTime(plan.conflict.end),
            })
          : plan.refusal === 'lane-kind'
            ? studioEditStrings.pasteLaneKind({ track: lane, at: formatArrangementTime(at) })
            : plan.refusal === 'missing'
              ? studioEditStrings.pasteMissing
              : studioEditStrings.clipboardEmpty,
      );
      return;
    }
    const count = plan.clipIds.length;
    applyEdit(plan.arrangement, studioEditStrings.historyPaste(count));
    setSelection(plan.clipIds);
    setRange(null);
    setStatus(
      studioEditStrings.pasteDone({
        count,
        at: formatArrangementTime(at),
        trackSuffix: plan.trackId
          ? studioEditStrings.pasteTrackSuffix(trackLabel(plan.trackId))
          : '',
      }),
    );
  }, [applyEdit, livePosition, refuseEditDuringGesture, setRange, setSelection, trackLabel]);

  const restoreHistory = useCallback(
    (next: ArrangementHistory, message: string) => {
      if (next === historyRef.current) {
        return;
      }
      updateHistory(next);
      syncPlayback(next.present);
      setRange(null);
      const existing = new Set(next.present.clips.map((clip) => clip.id));
      const current = latestRef.current.selectedClipIds;
      const kept = current.filter((id) => existing.has(id));
      if (kept.length !== current.length) {
        setSelection(kept);
      }
      setStatus(message);
    },
    [setRange, setSelection, syncPlayback, updateHistory],
  );

  const undo = useCallback(() => {
    if (gestureCountRef.current > 0) {
      setStatus(GESTURE_UNDO_BLOCKED_MESSAGE);
      return;
    }
    flushPendingVolume();
    flushPendingMaster();
    flushPendingClipGain();
    const label = historyRef.current.past.at(-1)?.label;
    if (label) {
      restoreHistory(undoHistory(historyRef.current), `Undo: ${label}`);
    }
  }, [flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory]);

  const redo = useCallback(() => {
    if (gestureCountRef.current > 0) {
      setStatus(GESTURE_UNDO_BLOCKED_MESSAGE);
      return;
    }
    flushPendingVolume();
    flushPendingMaster();
    flushPendingClipGain();
    const label = historyRef.current.future[0]?.label;
    if (label) {
      restoreHistory(redoHistory(historyRef.current), `Redo: ${label}`);
    }
  }, [flushPendingClipGain, flushPendingMaster, flushPendingVolume, restoreHistory]);

  const decodeVideoSourceAudio = useCallback(
    async (file: File, sourceId: string, duration: number, signal: AbortSignal) => {
      const settle = (patch: Pick<WorkspaceVideoSource, 'audio' | 'audioNote'>) => {
        const current = videoSourcesRef.current.get(sourceId);
        if (current && !signal.aborted) {
          patchVideoSource({ ...current, ...patch });
        }
      };
      try {
        const result = await decodeVideoAudio(file, getDecodeContext(), signal, duration);
        if (signal.aborted) {
          return;
        }
        if (!result.buffer) {
          settle({
            audio: result.reason === 'no-audio' ? 'none' : 'error',
            audioNote: videoAudioNote(result.reason),
          });
          return;
        }
        const buffer = result.buffer;
        buffersRef.current.set(sourceId, buffer);
        const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
          buffer.getChannelData(index),
        );
        const peaks = computePeaks(channels, buffer.sampleRate, PEAK_BUCKETS_PER_SECOND);
        setSourcePeaks((previous) => new Map(previous).set(sourceId, peaks));
        settle({ audio: 'ready', audioNote: null });
        const present = historyRef.current.present;
        if (present.clips.some((clip) => clip.sourceId === sourceId)) {
          syncPlayback(present, undefined, true);
        }
      } catch {
        settle({ audio: 'error', audioNote: videoAudioNote('decode-failed') });
      }
    },
    [getDecodeContext, patchVideoSource, syncPlayback],
  );

  const runVideoImport = useCallback(
    async (files: readonly File[]) => {
      const signal = importControllerRef.current?.signal;
      if (!signal || signal.aborted) {
        return;
      }
      if (isPlayingRef.current) {
        stopPlayback();
      }
      const messages: string[] = [];
      const report = (message: string) => {
        messages.push(message);
        setStatus(messages.join(' · '));
      };
      for (const file of files) {
        if (signal.aborted) {
          return;
        }
        const kind = classifyVideoFile(file);
        if (kind === 'audio') {
          report(audioFileRejectionMessage(file.name));
          continue;
        }
        if (kind === 'unsupported') {
          report(unsupportedFileMessage(file));
          continue;
        }
        setStatus([...messages, studioVideoStrings.opening(file.name)].join(' · '));
        let probe: Awaited<ReturnType<typeof probeVideoFile>>;
        try {
          probe = await probeVideoFile(file, signal);
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          report(error instanceof Error ? error.message : String(error));
          continue;
        }
        if (signal.aborted) {
          URL.revokeObjectURL(probe.url);
          return;
        }
        for (
          let waited = 0;
          previewActiveRef.current && !signal.aborted && waited < GESTURE_WAIT_LIMIT_MS;
          waited += GESTURE_WAIT_MS
        ) {
          await new Promise((resolve) => window.setTimeout(resolve, GESTURE_WAIT_MS));
        }
        if (signal.aborted) {
          URL.revokeObjectURL(probe.url);
          return;
        }
        videoUrlsRef.current.add(probe.url);
        const tooLong = probe.duration > VIDEO_AUDIO_DECODE_LIMIT_SECONDS;
        const sourceId = `video-${crypto.randomUUID()}`;
        patchVideoSource({
          id: sourceId,
          name: file.name,
          url: probe.url,
          duration: probe.duration,
          width: probe.width,
          height: probe.height,
          audio: tooLong ? 'error' : 'decoding',
          audioNote: tooLong ? videoAudioNote('too-long') : null,
        });
        const result = appendVideoClip(historyRef.current.present, {
          sourceId,
          sourceDuration: probe.duration,
        });
        if (!result) {
          URL.revokeObjectURL(probe.url);
          videoUrlsRef.current.delete(probe.url);
          const remaining = new Map(videoSourcesRef.current);
          remaining.delete(sourceId);
          videoSourcesRef.current = remaining;
          setVideoSourcesState(remaining);
          report(studioVideoStrings.addToTrackFailed(file.name));
          continue;
        }
        if (isPlayingRef.current) {
          stopPlayback();
        }
        applyEdit(result.arrangement, studioVideoStrings.historyAddVideo(file.name));
        setSelectedClipId(null);
        setRange(null);
        seekTo(result.clip.start);
        report(
          studioVideoStrings.added({
            name: file.name,
            start: formatArrangementTime(result.clip.start),
            end: formatArrangementTime(result.clip.start + result.clip.duration),
          }),
        );
        if (!tooLong) {
          decodeChainRef.current = decodeChainRef.current.then(() =>
            decodeVideoSourceAudio(file, sourceId, probe.duration, signal),
          );
        }
      }
    },
    [
      applyEdit,
      decodeVideoSourceAudio,
      patchVideoSource,
      seekTo,
      setRange,
      setSelectedClipId,
      stopPlayback,
    ],
  );

  const importVideoFiles = useCallback(
    (files: readonly File[]) => {
      if (files.length === 0) {
        return;
      }
      const batch = [...files];
      importChainRef.current = importChainRef.current
        .then(() => runVideoImport(batch))
        .catch((error: unknown) => {
          setStatus(
            studioVideoStrings.importFailed(error instanceof Error ? error.message : String(error)),
          );
        });
    },
    [runVideoImport],
  );

  const toggleTrackMute = useCallback(
    (trackId: string) => {
      if (refuseEditDuringGesture()) {
        return;
      }
      const arrangement = historyRef.current.present;
      const track = arrangement.tracks.find((entry) => entry.id === trackId);
      if (!track) {
        return;
      }
      applyEdit(setTrackMix(arrangement, trackId, { mute: !track.mute }), `Mute — ${track.name}`);
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const toggleTrackSolo = useCallback(
    (trackId: string, additive: boolean) => {
      if (refuseEditDuringGesture()) {
        return;
      }
      const arrangement = historyRef.current.present;
      const track = arrangement.tracks.find((entry) => entry.id === trackId);
      if (!track) {
        return;
      }
      applyEdit(toggleSolo(arrangement, trackId, additive), `Solo — ${track.name}`);
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const previewVolumeTarget = useCallback(
    (target: MixVolumeTarget, volume: number) => {
      const key = mixVolumeTargetKey(target);
      if (volumeGestureRef.current?.targetKey !== key && refuseEditDuringGesture()) {
        return;
      }
      const pendingKey = volumeTargetKeyRef.current;
      if (
        volumeBeforeRef.current &&
        pendingKey !== key &&
        (target.kind === 'group' || pendingKey?.startsWith('group:') === true)
      ) {
        flushPendingVolume();
      }
      if (!volumeBeforeRef.current) {
        flushPendingMaster();
        flushPendingClipGain();
      }
      const current = historyRef.current;
      const storedVolume = mixVolumeTargetValue(current.present, target);
      if (storedVolume === undefined) {
        return;
      }
      const next =
        target.kind === 'track'
          ? setTrackMix(current.present, target.id, { volume })
          : setTrackGroupMix(current.present, target.id, { volume });
      if (mixVolumeTargetValue(next, target) === storedVolume) {
        return;
      }
      if (!volumeBeforeRef.current) {
        volumeBeforeRef.current = current.present;
      }
      volumeTargetKeyRef.current = key;
      updateHistory({ ...current, present: next });
      syncPlayback(next);
    },
    [
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      refuseEditDuringGesture,
      syncPlayback,
      updateHistory,
    ],
  );

  const revertVolumeTargetPreview = useCallback(() => {
    const before = volumeBeforeRef.current;
    volumeBeforeRef.current = null;
    volumeTargetKeyRef.current = null;
    if (before) {
      updateHistory({ ...historyRef.current, present: before });
      syncPlayback(before);
    }
  }, [syncPlayback, updateHistory]);

  const commitVolumeTarget = useCallback(
    (target?: MixVolumeTarget) => {
      const gesture = volumeGestureRef.current;
      if (
        gesture
          ? target !== undefined && gesture.targetKey !== mixVolumeTargetKey(target)
          : gestureCountRef.current > 0
      ) {
        return;
      }
      const before = volumeBeforeRef.current;
      volumeBeforeRef.current = null;
      volumeTargetKeyRef.current = null;
      if (before) {
        applyEdit(historyRef.current.present, 'Volume', before);
      }
      if (gesture) {
        volumeGestureRef.current = null;
        gesture.release();
      }
    },
    [applyEdit],
  );

  const cancelVolumeTargetGesture = useCallback(() => {
    const gesture = volumeGestureRef.current;
    if (gesture) {
      volumeGestureRef.current = null;
      revertVolumeTargetPreview();
      gesture.release();
    }
  }, [revertVolumeTargetPreview]);

  const beginVolumeTargetGesture = useCallback(
    (target: MixVolumeTarget, pointerId: number): boolean => {
      const finishOnPointerUp = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          commitVolumeTarget(target);
        }
      };
      const abortOnPointerCancel = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          cancelVolumeTargetGesture();
        }
      };
      const detach = () => {
        window.removeEventListener('pointerup', finishOnPointerUp, true);
        window.removeEventListener('pointercancel', abortOnPointerCancel, true);
      };
      const releaseClaim = claimPointerGesture(pointerId, () => {
        detach();
        volumeGestureRef.current = null;
        revertVolumeTargetPreview();
      });
      if (!releaseClaim) {
        return false;
      }
      flushPendingVolume();
      flushPendingMaster();
      flushPendingClipGain();
      volumeGestureRef.current = {
        targetKey: mixVolumeTargetKey(target),
        release: () => {
          detach();
          releaseClaim();
        },
      };
      window.addEventListener('pointerup', finishOnPointerUp, true);
      window.addEventListener('pointercancel', abortOnPointerCancel, true);
      return true;
    },
    [
      cancelVolumeTargetGesture,
      claimPointerGesture,
      commitVolumeTarget,
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      revertVolumeTargetPreview,
    ],
  );

  const blurVolumeTarget = useCallback(
    (target: MixVolumeTarget) => {
      const gesture = volumeGestureRef.current;
      if (!gesture) {
        commitVolumeTarget(target);
      } else if (gesture.targetKey === mixVolumeTargetKey(target)) {
        cancelVolumeTargetGesture();
      }
    },
    [cancelVolumeTargetGesture, commitVolumeTarget],
  );

  const previewTrackVolume = useCallback(
    (trackId: string, volume: number) =>
      previewVolumeTarget({ kind: 'track', id: trackId }, volume),
    [previewVolumeTarget],
  );

  const commitTrackVolume = useCallback(
    (trackId?: string) =>
      commitVolumeTarget(trackId === undefined ? undefined : { kind: 'track', id: trackId }),
    [commitVolumeTarget],
  );

  const beginTrackVolumeGesture = useCallback(
    (trackId: string, pointerId: number) =>
      beginVolumeTargetGesture({ kind: 'track', id: trackId }, pointerId),
    [beginVolumeTargetGesture],
  );

  const blurTrackVolume = useCallback(
    (trackId: string) => blurVolumeTarget({ kind: 'track', id: trackId }),
    [blurVolumeTarget],
  );

  const previewGroupVolume = useCallback(
    (groupId: string, volume: number) =>
      previewVolumeTarget({ kind: 'group', id: groupId }, volume),
    [previewVolumeTarget],
  );

  const commitGroupVolume = useCallback(
    (groupId: string) => commitVolumeTarget({ kind: 'group', id: groupId }),
    [commitVolumeTarget],
  );

  const beginGroupVolumeGesture = useCallback(
    (groupId: string, pointerId: number) =>
      beginVolumeTargetGesture({ kind: 'group', id: groupId }, pointerId),
    [beginVolumeTargetGesture],
  );

  const blurGroupVolume = useCallback(
    (groupId: string) => blurVolumeTarget({ kind: 'group', id: groupId }),
    [blurVolumeTarget],
  );

  const toggleGroupMute = useCallback(
    (groupId: string) => {
      if (refuseEditDuringGesture()) {
        return;
      }
      const arrangement = historyRef.current.present;
      const group = arrangementGroups(arrangement).find((entry) => entry.id === groupId);
      if (!group) {
        return;
      }
      applyEdit(
        setTrackGroupMix(arrangement, groupId, { mute: group.mute !== true }),
        `Mute — ${group.name}`,
      );
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const toggleGroupSolo = useCallback(
    (groupId: string, additive: boolean) => {
      if (refuseEditDuringGesture()) {
        return;
      }
      const arrangement = historyRef.current.present;
      const group = arrangementGroups(arrangement).find((entry) => entry.id === groupId);
      if (!group) {
        return;
      }
      applyEdit(toggleTrackGroupSolo(arrangement, groupId, additive), `Solo — ${group.name}`);
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const setTrackPan = useCallback(
    (trackId: string, pan: number): boolean => {
      if (refuseEditDuringGesture()) {
        return false;
      }
      const arrangement = historyRef.current.present;
      const track = arrangement.tracks.find((entry) => entry.id === trackId);
      if (!track) {
        return false;
      }
      return applyEdit(setArrangementTrackPan(arrangement, trackId, pan), `Pan — ${track.name}`);
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const restoreStoredTrackPan = useCallback((trackId: string) => {
    const track = historyRef.current.present.tracks.find((entry) => entry.id === trackId);
    if (track) {
      handleRef.current?.setTrackPan(trackId, trackPanValue(track));
    }
  }, []);

  const finishTrackPanGesture = useCallback(
    (trackId: string): { override: TrackPanOverride | null } | null => {
      const gesture = panGestureRef.current;
      if (!gesture || gesture.trackId !== trackId) {
        return null;
      }
      panGestureRef.current = null;
      const override = panOverrideRef.current;
      panOverrideRef.current = null;
      gesture.release();
      return { override };
    },
    [],
  );

  const commitTrackPan = useCallback(
    (trackId: string) => {
      const finished = finishTrackPanGesture(trackId);
      if (finished?.override) {
        setTrackPan(trackId, finished.override.value);
      }
    },
    [finishTrackPanGesture, setTrackPan],
  );

  const cancelTrackPan = useCallback(
    (trackId: string) => {
      if (finishTrackPanGesture(trackId)) {
        restoreStoredTrackPan(trackId);
      }
    },
    [finishTrackPanGesture, restoreStoredTrackPan],
  );

  const beginTrackPanGesture = useCallback(
    (trackId: string, pointerId: number): boolean => {
      const finishOnPointerUp = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          commitTrackPan(trackId);
        }
      };
      const abortOnPointerCancel = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          cancelTrackPan(trackId);
        }
      };
      const detach = () => {
        window.removeEventListener('pointerup', finishOnPointerUp, true);
        window.removeEventListener('pointercancel', abortOnPointerCancel, true);
      };
      const releaseClaim = claimPointerGesture(pointerId, () => {
        detach();
        panGestureRef.current = null;
        panOverrideRef.current = null;
        restoreStoredTrackPan(trackId);
      });
      if (!releaseClaim) {
        return false;
      }
      flushPendingVolume();
      flushPendingMaster();
      flushPendingClipGain();
      panGestureRef.current = {
        trackId,
        release: () => {
          detach();
          releaseClaim();
        },
      };
      window.addEventListener('pointerup', finishOnPointerUp, true);
      window.addEventListener('pointercancel', abortOnPointerCancel, true);
      return true;
    },
    [
      cancelTrackPan,
      claimPointerGesture,
      commitTrackPan,
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      restoreStoredTrackPan,
    ],
  );

  const previewTrackPan = useCallback((trackId: string, pan: number) => {
    if (panGestureRef.current?.trackId !== trackId || !Number.isFinite(pan)) {
      return;
    }
    const value = normalizeTrackPan(pan);
    panOverrideRef.current = { trackId, value };
    handleRef.current?.setTrackPan(trackId, value);
  }, []);

  const toggleMasterMute = useCallback(() => {
    if (refuseEditDuringGesture()) {
      return;
    }
    const arrangement = historyRef.current.present;
    applyEdit(setMasterMix(arrangement, { mute: !arrangement.master.mute }), MASTER_MUTE_LABEL);
  }, [applyEdit, refuseEditDuringGesture]);

  const setClipGain = useCallback(
    (clipId: string, gainDb: number): boolean => {
      if (refuseEditDuringGesture()) {
        return false;
      }
      return applyEdit(setClipGainDb(historyRef.current.present, clipId, gainDb), CLIP_GAIN_LABEL);
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const previewMasterGain = useCallback(
    (gainDb: number) => {
      if (masterGestureRef.current === null && refuseEditDuringGesture()) {
        return;
      }
      if (!masterBeforeRef.current) {
        flushPendingVolume();
        flushPendingClipGain();
      }
      const current = historyRef.current;
      const next = setMasterMix(current.present, { gainDb });
      if (next === current.present) {
        return;
      }
      if (!masterBeforeRef.current) {
        masterBeforeRef.current = current.present;
      }
      updateHistory({ ...current, present: next });
      syncPlayback(next);
    },
    [
      flushPendingClipGain,
      flushPendingVolume,
      refuseEditDuringGesture,
      syncPlayback,
      updateHistory,
    ],
  );

  const revertMasterGainPreview = useCallback(() => {
    const before = masterBeforeRef.current;
    masterBeforeRef.current = null;
    if (before) {
      updateHistory({ ...historyRef.current, present: before });
      syncPlayback(before);
    }
  }, [syncPlayback, updateHistory]);

  const commitMasterGain = useCallback(() => {
    const gesture = masterGestureRef.current;
    if (!gesture && gestureCountRef.current > 0) {
      return;
    }
    const before = masterBeforeRef.current;
    masterBeforeRef.current = null;
    if (before) {
      applyEdit(historyRef.current.present, MASTER_VOLUME_LABEL, before);
    }
    if (gesture) {
      masterGestureRef.current = null;
      gesture.release();
    }
  }, [applyEdit]);

  const cancelMasterGainGesture = useCallback(() => {
    const gesture = masterGestureRef.current;
    if (gesture) {
      masterGestureRef.current = null;
      revertMasterGainPreview();
      gesture.release();
    }
  }, [revertMasterGainPreview]);

  const beginMasterGainGesture = useCallback(
    (pointerId: number): boolean => {
      const finishOnPointerUp = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          commitMasterGain();
        }
      };
      const abortOnPointerCancel = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          cancelMasterGainGesture();
        }
      };
      const detach = () => {
        window.removeEventListener('pointerup', finishOnPointerUp, true);
        window.removeEventListener('pointercancel', abortOnPointerCancel, true);
      };
      const releaseClaim = claimPointerGesture(pointerId, () => {
        detach();
        masterGestureRef.current = null;
        revertMasterGainPreview();
      });
      if (!releaseClaim) {
        return false;
      }
      flushPendingVolume();
      flushPendingMaster();
      flushPendingClipGain();
      masterGestureRef.current = {
        release: () => {
          detach();
          releaseClaim();
        },
      };
      window.addEventListener('pointerup', finishOnPointerUp, true);
      window.addEventListener('pointercancel', abortOnPointerCancel, true);
      return true;
    },
    [
      cancelMasterGainGesture,
      claimPointerGesture,
      commitMasterGain,
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      revertMasterGainPreview,
    ],
  );

  const blurMasterGain = useCallback(() => {
    if (masterGestureRef.current) {
      cancelMasterGainGesture();
    } else {
      commitMasterGain();
    }
  }, [cancelMasterGainGesture, commitMasterGain]);

  const previewClipGainFader = useCallback(
    (clipId: string, gainDb: number) => {
      if (clipGainGestureRef.current?.memberKey !== clipId && refuseEditDuringGesture()) {
        return;
      }
      if (clipGainBeforeRef.current && clipGainMemberKeyRef.current !== clipId) {
        flushPendingClipGain();
      }
      if (!clipGainBeforeRef.current) {
        flushPendingVolume();
        flushPendingMaster();
      }
      const current = historyRef.current;
      const next = setClipGainDb(current.present, clipId, gainDb);
      if (next === current.present) {
        return;
      }
      if (!clipGainBeforeRef.current) {
        clipGainBeforeRef.current = current.present;
      }
      clipGainMemberKeyRef.current = clipId;
      clipGainMemberIdsRef.current = null;
      updateHistory({ ...current, present: next });
      syncPlayback(next);
    },
    [
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      refuseEditDuringGesture,
      syncPlayback,
      updateHistory,
    ],
  );

  const revertClipGainFaderPreview = useCallback(() => {
    const before = clipGainBeforeRef.current;
    clipGainBeforeRef.current = null;
    clipGainMemberKeyRef.current = null;
    clipGainMemberIdsRef.current = null;
    if (before) {
      updateHistory({ ...historyRef.current, present: before });
      syncPlayback(before);
    }
  }, [syncPlayback, updateHistory]);

  const previewClipGainMembers = useCallback(
    (clipIds: readonly string[], anchorDb: number) => {
      const memberKey = clipGainMemberKey(clipIds);
      if (clipGainGestureRef.current?.memberKey !== memberKey && refuseEditDuringGesture()) {
        return;
      }
      if (clipGainBeforeRef.current && clipGainMemberKeyRef.current !== memberKey) {
        flushPendingClipGain();
      }
      if (!clipGainBeforeRef.current) {
        flushPendingVolume();
        flushPendingMaster();
      }
      const current = historyRef.current;
      const baseline = clipGainBeforeRef.current ?? current.present;
      const span = clipGainMemberSpan(baseline, clipIds);
      if (!span || !Number.isFinite(anchorDb)) {
        return;
      }
      const next = applyClipGainTargets(
        current.present,
        clipGainShiftTargets(baseline, span.clipIds, anchorDb - span.maxDb),
      );
      if (next === current.present) {
        return;
      }
      if (!clipGainBeforeRef.current) {
        clipGainBeforeRef.current = current.present;
      }
      clipGainMemberKeyRef.current = memberKey;
      clipGainMemberIdsRef.current = span.clipIds;
      updateHistory({ ...current, present: next });
      syncPlayback(next);
    },
    [
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      refuseEditDuringGesture,
      syncPlayback,
      updateHistory,
    ],
  );

  const setClipGainMembers = useCallback(
    (clipIds: readonly string[], gainDb: number): boolean => {
      if (refuseEditDuringGesture()) {
        return false;
      }
      return applyEdit(
        setClipGainsDb(historyRef.current.present, clipIds, gainDb),
        CLIP_GAIN_LABEL,
      );
    },
    [applyEdit, refuseEditDuringGesture],
  );

  const commitClipGainPending = useCallback(
    (memberKey?: string) => {
      const gesture = clipGainGestureRef.current;
      if (
        gesture
          ? memberKey !== undefined && gesture.memberKey !== memberKey
          : gestureCountRef.current > 0
      ) {
        return;
      }
      const before = clipGainBeforeRef.current;
      const memberIds = clipGainMemberIdsRef.current;
      clipGainBeforeRef.current = null;
      clipGainMemberKeyRef.current = null;
      clipGainMemberIdsRef.current = null;
      const isCommitted = before
        ? applyEdit(historyRef.current.present, CLIP_GAIN_LABEL, before)
        : false;
      if (gesture) {
        clipGainGestureRef.current = null;
        gesture.release();
      }
      const span =
        isCommitted && memberIds && memberIds.length > 1
          ? clipGainMemberSpan(historyRef.current.present, memberIds)
          : null;
      if (span) {
        setStatus(formatClipGainMembersStatus(span));
      }
    },
    [applyEdit],
  );

  const commitClipGainFader = useCallback(
    (clipId?: string) => commitClipGainPending(clipId),
    [commitClipGainPending],
  );

  const commitClipGainMembers = useCallback(
    (clipIds?: readonly string[]) =>
      commitClipGainPending(clipIds === undefined ? undefined : clipGainMemberKey(clipIds)),
    [commitClipGainPending],
  );

  const cancelClipGainFaderGesture = useCallback(() => {
    const gesture = clipGainGestureRef.current;
    if (gesture) {
      clipGainGestureRef.current = null;
      revertClipGainFaderPreview();
      gesture.release();
    }
  }, [revertClipGainFaderPreview]);

  const beginClipGainGesture = useCallback(
    (memberKey: string, pointerId: number): boolean => {
      const finishOnPointerUp = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          commitClipGainPending(memberKey);
        }
      };
      const abortOnPointerCancel = (event: globalThis.PointerEvent) => {
        if (event.pointerId === pointerId) {
          cancelClipGainFaderGesture();
        }
      };
      const detach = () => {
        window.removeEventListener('pointerup', finishOnPointerUp, true);
        window.removeEventListener('pointercancel', abortOnPointerCancel, true);
      };
      const releaseClaim = claimPointerGesture(pointerId, () => {
        detach();
        clipGainGestureRef.current = null;
        revertClipGainFaderPreview();
      });
      if (!releaseClaim) {
        return false;
      }
      flushPendingVolume();
      flushPendingMaster();
      flushPendingClipGain();
      clipGainGestureRef.current = {
        memberKey,
        release: () => {
          detach();
          releaseClaim();
        },
      };
      window.addEventListener('pointerup', finishOnPointerUp, true);
      window.addEventListener('pointercancel', abortOnPointerCancel, true);
      return true;
    },
    [
      cancelClipGainFaderGesture,
      claimPointerGesture,
      commitClipGainPending,
      flushPendingClipGain,
      flushPendingMaster,
      flushPendingVolume,
      revertClipGainFaderPreview,
    ],
  );

  const beginClipGainFaderGesture = useCallback(
    (clipId: string, pointerId: number): boolean => beginClipGainGesture(clipId, pointerId),
    [beginClipGainGesture],
  );

  const beginClipGainMembersGesture = useCallback(
    (clipIds: readonly string[], pointerId: number): boolean =>
      beginClipGainGesture(clipGainMemberKey(clipIds), pointerId),
    [beginClipGainGesture],
  );

  const blurClipGainPending = useCallback(
    (memberKey: string) => {
      const gesture = clipGainGestureRef.current;
      if (!gesture) {
        commitClipGainPending(memberKey);
      } else if (gesture.memberKey === memberKey) {
        cancelClipGainFaderGesture();
      }
    },
    [cancelClipGainFaderGesture, commitClipGainPending],
  );

  const blurClipGainFader = useCallback(
    (clipId: string) => blurClipGainPending(clipId),
    [blurClipGainPending],
  );

  const blurClipGainMembers = useCallback(
    (clipIds: readonly string[]) => blurClipGainPending(clipGainMemberKey(clipIds)),
    [blurClipGainPending],
  );

  const setPxPerSecond = useCallback((value: number) => {
    setPxPerSecondState(clampTimelineZoom(value));
  }, []);

  const exportWav = useCallback(
    async (renderWindow?: ArrangementRenderWindow) => {
      const arrangement = historyRef.current.present;
      if (webAudioUnavailableRef.current || typeof OfflineAudioContext === 'undefined') {
        setExportState({ phase: 'error', message: WEB_AUDIO_UNAVAILABLE_MESSAGE });
        return;
      }
      if (arrangement.clips.length === 0) {
        setExportState({ phase: 'error', message: studioExportStrings.emptyProjectNoFile });
        return;
      }
      const decoding = arrangement.clips.some(
        (clip) => videoSourcesRef.current.get(clip.sourceId)?.audio === 'decoding',
      );
      if (decoding) {
        setExportState({
          phase: 'error',
          message: studioExportStrings.videoDecodingNoFile,
        });
        return;
      }
      if (renderWindow && !isValidArrangementRenderWindow(renderWindow)) {
        setExportState({ phase: 'error', message: studioExportStrings.invalidRangeNoFile });
        return;
      }
      setExportState({ phase: 'rendering', message: studioExportStrings.renderingWav });
      exportAbortRef.current?.abort();
      const controller = new AbortController();
      exportAbortRef.current = controller;
      const { signal } = controller;
      const renderOptions: ArrangementRenderOptions = {
        onProgress: (phase, fraction) => {
          if (!signal.aborted) {
            exportProgress.setProgress({ phase, fraction });
          }
        },
        signal,
      };
      try {
        const { blob, peak, clippedSamples } = renderWindow
          ? await renderArrangementWav(arrangement, buffersRef.current, renderWindow, renderOptions)
          : await renderArrangementWav(arrangement, buffersRef.current, undefined, renderOptions);
        if (signal.aborted) {
          return;
        }
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        const { fileStem } = workspaceCollectionCopy(collection.origin);
        anchor.download = `${fileStem}${renderWindow ? '-range' : ''}.wav`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        const exportedLength = renderWindow
          ? studioExportStrings.exportedRange({
              start: formatArrangementTime(renderWindow.start),
              end: formatArrangementTime(renderWindow.end),
              seconds: studioExportStrings.rangeSeconds(renderWindow.end - renderWindow.start),
            })
          : formatArrangementTime(projectEnd(arrangement));
        const message = studioExportStrings.wavDone(
          exportedLength,
          arrangement.master.mute ? MASTER_MUTED_EXPORT_SUFFIX : '',
        );
        const warning = formatExportOverloadWarning(peak, clippedSamples);
        setExportState(warning ? { phase: 'done', message, warning } : { phase: 'done', message });
      } catch (error) {
        if (signal.aborted) {
          return;
        }
        setExportState({
          phase: 'error',
          message: studioExportStrings.exportFailed(error instanceof Error ? error.message : ''),
        });
      } finally {
        if (exportAbortRef.current === controller) {
          exportAbortRef.current = null;
          exportProgress.setProgress(null);
        }
      }
    },
    [collection.origin, exportProgress],
  );

  const exportMp3 = useCallback(
    async (renderWindow?: ArrangementRenderWindow, options?: { includeWav?: boolean }) => {
      const arrangement = historyRef.current.present;
      if (webAudioUnavailableRef.current || typeof OfflineAudioContext === 'undefined') {
        setExportState({ phase: 'error', message: WEB_AUDIO_UNAVAILABLE_MESSAGE });
        return;
      }
      if (arrangement.clips.length === 0) {
        setExportState({ phase: 'error', message: studioExportStrings.emptyProjectNoFile });
        return;
      }
      const decoding = arrangement.clips.some(
        (clip) => videoSourcesRef.current.get(clip.sourceId)?.audio === 'decoding',
      );
      if (decoding) {
        setExportState({
          phase: 'error',
          message: studioExportStrings.videoDecodingNoFile,
        });
        return;
      }
      if (renderWindow && !isValidArrangementRenderWindow(renderWindow)) {
        setExportState({ phase: 'error', message: studioExportStrings.invalidRangeNoFile });
        return;
      }
      setExportState({ phase: 'rendering', message: studioExportStrings.renderingWav });
      exportAbortRef.current?.abort();
      const controller = new AbortController();
      exportAbortRef.current = controller;
      const { signal } = controller;
      const renderOptions: ArrangementRenderOptions = {
        onProgress: (phase, fraction) => {
          if (!signal.aborted) {
            exportProgress.setProgress({ phase, fraction });
          }
        },
        signal,
      };
      type ArrangementMp3EncoderModule = typeof import('~/lib/arrangement/mp3-encoder.client');
      const encoderSlot: { module: ArrangementMp3EncoderModule | null } = { module: null };
      const resetEncoderOnAbort = () => {
        encoderSlot.module?.resetArrangementMp3Encoder();
      };
      try {
        let rendered: Awaited<ReturnType<typeof renderArrangementWav>>;
        try {
          rendered = renderWindow
            ? await renderArrangementWav(
                arrangement,
                buffersRef.current,
                renderWindow,
                renderOptions,
              )
            : await renderArrangementWav(arrangement, buffersRef.current, undefined, renderOptions);
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          setExportState({
            phase: 'error',
            message: studioExportStrings.exportFailed(error instanceof Error ? error.message : ''),
          });
          return;
        }
        if (signal.aborted) {
          return;
        }
        setExportState({
          phase: 'rendering',
          message: studioExportStrings.encoderLoading,
        });
        exportProgress.setProgress({ phase: 'load', fraction: null });
        signal.addEventListener('abort', resetEncoderOnAbort, { once: true });
        let isLoadTimedOut = false;
        let encoder: Awaited<ReturnType<ArrangementMp3EncoderModule['loadArrangementMp3Encoder']>>;
        let loadTimer: number | undefined;
        try {
          const loadTimeout = new Promise<null>((resolve) => {
            loadTimer = window.setTimeout(() => {
              isLoadTimedOut = true;
              resolve(null);
            }, ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS);
          });
          const encoderLoad = import('~/lib/arrangement/mp3-encoder.client').then((module) => {
            encoderSlot.module = module;
            if (isLoadTimedOut || signal.aborted) {
              module.resetArrangementMp3Encoder();
              return null;
            }
            return module.loadArrangementMp3Encoder();
          });
          encoderLoad.catch(() => undefined);
          const loadedEncoder = await raceArrangementExportAbort(
            Promise.race([encoderLoad, loadTimeout]),
            signal,
          );
          if (signal.aborted) {
            return;
          }
          if (!loadedEncoder) {
            signal.removeEventListener('abort', resetEncoderOnAbort);
            encoderSlot.module?.resetArrangementMp3Encoder();
            setExportState({
              phase: 'error',
              message: studioExportStrings.encoderLoadTimeout(
                ARRANGEMENT_MP3_ENCODER_LOAD_TIMEOUT_MS / 1000,
              ),
            });
            return;
          }
          encoder = loadedEncoder;
        } catch {
          if (signal.aborted) {
            return;
          }
          signal.removeEventListener('abort', resetEncoderOnAbort);
          encoderSlot.module?.resetArrangementMp3Encoder();
          setExportState({
            phase: 'error',
            message: studioExportStrings.encoderLoadFailed,
          });
          return;
        } finally {
          window.clearTimeout(loadTimer);
        }
        setExportState({ phase: 'rendering', message: studioExportStrings.mp3Encoding });
        exportProgress.setProgress({ phase: 'mp3', fraction: 0 });
        let mp3Blob: Blob;
        try {
          mp3Blob = await raceArrangementExportAbort(
            encoder.encode(rendered.blob, (fraction) => {
              if (!signal.aborted) {
                exportProgress.setProgress({ phase: 'mp3', fraction });
              }
            }),
            signal,
          );
        } catch (error) {
          if (signal.aborted) {
            return;
          }
          signal.removeEventListener('abort', resetEncoderOnAbort);
          encoderSlot.module?.resetArrangementMp3Encoder();
          setExportState({
            phase: 'error',
            message: studioExportStrings.mp3Failed(error instanceof Error ? error.message : ''),
          });
          return;
        }
        signal.removeEventListener('abort', resetEncoderOnAbort);
        if (signal.aborted) {
          return;
        }
        try {
          const { fileStem } = workspaceCollectionCopy(collection.origin);
          const files = [
            ...(options?.includeWav
              ? [
                  {
                    blob: rendered.blob,
                    name: `${fileStem}${renderWindow ? '-range' : ''}.wav`,
                  },
                ]
              : []),
            {
              blob: mp3Blob,
              name: `${fileStem}${renderWindow ? '-range' : ''}.mp3`,
            },
          ].map((file) => ({ name: file.name, url: URL.createObjectURL(file.blob) }));
          for (const file of files) {
            const anchor = document.createElement('a');
            anchor.href = file.url;
            anchor.download = file.name;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(file.url), 1000);
          }
          const exportedLength = renderWindow
            ? studioExportStrings.exportedRange({
                start: formatArrangementTime(renderWindow.start),
                end: formatArrangementTime(renderWindow.end),
                seconds: studioExportStrings.rangeSeconds(renderWindow.end - renderWindow.start),
              })
            : formatArrangementTime(projectEnd(arrangement));
          const suffix = arrangement.master.mute ? MASTER_MUTED_EXPORT_SUFFIX : '';
          const message = options?.includeWav
            ? studioExportStrings.bothDone(exportedLength, suffix)
            : studioExportStrings.mp3Done(exportedLength, suffix);
          const warning = formatExportOverloadWarning(rendered.peak, rendered.clippedSamples);
          setExportState(
            warning ? { phase: 'done', message, warning } : { phase: 'done', message },
          );
        } catch (error) {
          setExportState({
            phase: 'error',
            message: studioExportStrings.exportFailed(error instanceof Error ? error.message : ''),
          });
        }
      } finally {
        signal.removeEventListener('abort', resetEncoderOnAbort);
        if (exportAbortRef.current === controller) {
          exportAbortRef.current = null;
          exportProgress.setProgress(null);
        }
      }
    },
    [collection.origin, exportProgress],
  );

  const resetExportState = useCallback(() => {
    setExportState({ phase: 'idle', message: null });
  }, []);

  const cancelExport = useCallback(() => {
    const controller = exportAbortRef.current;
    if (!controller || controller.signal.aborted) {
      return;
    }
    const phase = exportProgress.getProgress()?.phase;
    controller.abort();
    exportAbortRef.current = null;
    exportProgress.setProgress(null);
    setExportState({
      phase: 'cancelled',
      message:
        phase === 'load' || phase === 'mp3'
          ? ARRANGEMENT_EXPORT_CANCELLED_ENCODER_MESSAGE
          : ARRANGEMENT_EXPORT_CANCELLED_MESSAGE,
    });
  }, [exportProgress]);

  useEffect(() => {
    return () => {
      exportAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    importControllerRef.current = controller;
    const urls = videoUrlsRef.current;
    return () => {
      controller.abort();
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const copy = workspaceCollectionCopy(collection.origin);
    if (collection.sources.length === 0) {
      setStatus(copy.empty);
      return () => controller.abort();
    }
    setStatus(copy.loading);
    const decodeContext = getDecodeContext();
    let pending = collection.sources.length;
    for (const source of collection.sources) {
      patchSourceState(source.id, { status: 'loading', duration: 0, error: null });
    }
    let failed = 0;
    const settle = (didFail: boolean) => {
      pending -= 1;
      failed += didFail ? 1 : 0;
      if (pending > 0) {
        return;
      }
      setStatus(failed === 0 ? copy.ready : copy.failed(failed));
    };
    for (const source of collection.sources) {
      collection
        .loadSource(source, decodeContext, controller.signal)
        .then((buffer) => {
          if (controller.signal.aborted) {
            return;
          }
          buffersRef.current.set(source.id, buffer);
          const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
            buffer.getChannelData(index),
          );
          const peaks = computePeaks(channels, buffer.sampleRate, PEAK_BUCKETS_PER_SECOND);
          setSourcePeaks((previous) => new Map(previous).set(source.id, peaks));
          patchSourceState(source.id, { status: 'ready', duration: buffer.duration, error: null });
          settle(false);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }
          patchSourceState(source.id, {
            status: 'error',
            duration: 0,
            error:
              error instanceof Error ? error.message : studioSourceLoadStrings.loadFailedFallback,
          });
          settle(true);
        });
    }
    return () => controller.abort();
  }, [collection, getDecodeContext, patchSourceState]);

  useEffect(() => {
    return () => {
      volumeGestureRef.current?.release();
      volumeGestureRef.current = null;
      masterGestureRef.current?.release();
      masterGestureRef.current = null;
      clipGainGestureRef.current?.release();
      clipGainGestureRef.current = null;
      panGestureRef.current?.release();
      panGestureRef.current = null;
      panOverrideRef.current = null;
      activeGestureRef.current?.release();
      isPlayingRef.current = false;
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (audioPumpTimerRef.current !== null) {
        window.clearInterval(audioPumpTimerRef.current);
        audioPumpTimerRef.current = null;
      }
      stopGraph();
      previewPlayerRef.current?.stopLibraryPreview();
      previewPlayerRef.current = null;
      const ctx = audioContextRef.current;
      audioContextRef.current = null;
      meterTapRef.current = null;
      meterBlocksRef.current = [];
      trackMeterTapsRef.current.clear();
      metronomeBuffersRef.current = null;
      if (ctx) {
        void ctx.close();
      }
    };
  }, [stopGraph]);

  const sourceDurations = useMemo(
    () =>
      new Map([
        ...Object.entries(sourceStates)
          .filter(([, state]) => state.status === 'ready')
          .map(([id, state]): [string, number] => [id, state.duration]),
        ...[...videoSources.values()].map((source): [string, number] => [
          source.id,
          source.duration,
        ]),
      ]),
    [sourceStates, videoSources],
  );

  const arrangement = history.present;
  const end = useMemo(() => projectEnd(arrangement), [arrangement]);

  const value = useMemo<ArrangementContextValue>(
    () => ({
      collection,
      arrangement,
      projectEnd: end,
      undoLabel: history.past.at(-1)?.label ?? null,
      redoLabel: history.future[0]?.label ?? null,
      selectedClipId: selectedClipIds.at(-1) ?? null,
      selectedClipIds,
      selectedSourceId,
      range,
      activeTrackId,
      isPlaying,
      pxPerSecond,
      status,
      statusSequence,
      sourceStates,
      sourcePeaks,
      sourceDurations,
      videoSources,
      exportState,
      exportProgress,
      clipLaneDrag,
      setClipLaneDrag,
      togglePlayback,
      pausePlaybackWithStatus,
      seekTo,
      scrubPlayhead,
      endPlayheadScrub,
      importVideoFiles,
      selectSource,
      addSourceToActiveTrack,
      selectClip,
      toggleClipSelection,
      selectClips,
      selectAllClips,
      getSelectedClipIds,
      getLivePosition: livePosition,
      getPlaybackClock,
      beginPointerGesture,
      claimPointerGesture,
      isArrangementPreviewActive,
      isPointerGestureActive,
      libraryPreviewSourceId,
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      beginLibraryDrag,
      endLibraryDrag,
      getLibraryDragSource,
      dropLibrarySource,
      toggleLoopSelection,
      extendRangeToAllTracks,
      previewLoopArrangement,
      commitLoopRange,
      stepLoopRange,
      setTimeRange,
      setActiveTrack,
      getArrangement,
      previewArrangement,
      commitArrangement,
      nudgeSelectedClip,
      splitSelection,
      deleteSelection,
      duplicateSelection,
      copySelection,
      cutSelection,
      cutTimeSelection,
      pasteClipboard,
      undo,
      redo,
      toggleTrackMute,
      toggleTrackSolo,
      previewTrackVolume,
      commitTrackVolume,
      beginTrackVolumeGesture,
      blurTrackVolume,
      toggleGroupMute,
      toggleGroupSolo,
      previewGroupVolume,
      commitGroupVolume,
      beginGroupVolumeGesture,
      blurGroupVolume,
      setTrackPan,
      beginTrackPanGesture,
      previewTrackPan,
      commitTrackPan,
      cancelTrackPan,
      master: arrangement.master,
      toggleMasterMute,
      setClipGain,
      previewClipGainFader,
      commitClipGainFader,
      beginClipGainFaderGesture,
      blurClipGainFader,
      setClipGainMembers,
      previewClipGainMembers,
      commitClipGainMembers,
      beginClipGainMembersGesture,
      blurClipGainMembers,
      previewMasterGain,
      commitMasterGain,
      beginMasterGainGesture,
      blurMasterGain,
      resetMasterPeak,
      setPxPerSecond,
      setStatus,
      setMetronomeBpm,
      exportWav,
      exportMp3,
      resetExportState,
      cancelExport,
    }),
    [
      collection,
      arrangement,
      end,
      history.past,
      history.future,
      selectedClipIds,
      selectedSourceId,
      range,
      activeTrackId,
      isPlaying,
      pxPerSecond,
      status,
      statusSequence,
      sourceStates,
      sourcePeaks,
      sourceDurations,
      videoSources,
      exportState,
      exportProgress,
      clipLaneDrag,
      togglePlayback,
      pausePlaybackWithStatus,
      seekTo,
      scrubPlayhead,
      endPlayheadScrub,
      importVideoFiles,
      selectSource,
      addSourceToActiveTrack,
      selectClip,
      toggleClipSelection,
      selectClips,
      selectAllClips,
      getSelectedClipIds,
      livePosition,
      getPlaybackClock,
      beginPointerGesture,
      claimPointerGesture,
      isArrangementPreviewActive,
      isPointerGestureActive,
      libraryPreviewSourceId,
      startLibraryPreview,
      stopLibraryPreview,
      getLibraryPreviewOffset,
      beginLibraryDrag,
      endLibraryDrag,
      getLibraryDragSource,
      dropLibrarySource,
      toggleLoopSelection,
      extendRangeToAllTracks,
      previewLoopArrangement,
      commitLoopRange,
      stepLoopRange,
      setTimeRange,
      setActiveTrack,
      getArrangement,
      previewArrangement,
      commitArrangement,
      nudgeSelectedClip,
      splitSelection,
      deleteSelection,
      duplicateSelection,
      copySelection,
      cutSelection,
      cutTimeSelection,
      pasteClipboard,
      undo,
      redo,
      toggleTrackMute,
      toggleTrackSolo,
      previewTrackVolume,
      commitTrackVolume,
      beginTrackVolumeGesture,
      blurTrackVolume,
      toggleGroupMute,
      toggleGroupSolo,
      previewGroupVolume,
      commitGroupVolume,
      beginGroupVolumeGesture,
      blurGroupVolume,
      setTrackPan,
      beginTrackPanGesture,
      previewTrackPan,
      commitTrackPan,
      cancelTrackPan,
      toggleMasterMute,
      setClipGain,
      previewClipGainFader,
      commitClipGainFader,
      beginClipGainFaderGesture,
      blurClipGainFader,
      setClipGainMembers,
      previewClipGainMembers,
      commitClipGainMembers,
      beginClipGainMembersGesture,
      blurClipGainMembers,
      previewMasterGain,
      commitMasterGain,
      beginMasterGainGesture,
      blurMasterGain,
      resetMasterPeak,
      setPxPerSecond,
      setMetronomeBpm,
      exportWav,
      exportMp3,
      resetExportState,
      cancelExport,
    ],
  );

  return (
    <ArrangementPositionContext.Provider value={positionStore}>
      <ArrangementMeterContext.Provider value={meterStore}>
        <ArrangementTrackMeterContext.Provider value={trackMeterStore}>
          <ArrangementContext.Provider value={value}>{children}</ArrangementContext.Provider>
        </ArrangementTrackMeterContext.Provider>
      </ArrangementMeterContext.Provider>
    </ArrangementPositionContext.Provider>
  );
}

export function useArrangement(): ArrangementContextValue {
  const context = useContext(ArrangementContext);
  if (context === undefined) {
    throw new Error('useArrangement must be used within an ArrangementProvider');
  }
  return context;
}

export function useArrangementPositionStore(): ArrangementPositionStore {
  const store = useContext(ArrangementPositionContext);
  if (!store) {
    throw new Error('useArrangementPositionStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useArrangementPosition(): number {
  const store = useArrangementPositionStore();
  return useSyncExternalStore(store.subscribePosition, store.getPosition, store.getPosition);
}

export function useArrangementPositionWriter(writePosition: (position: number) => void): void {
  const store = useArrangementPositionStore();
  usePositionWriterEffect(() => {
    const applyPosition = () => writePosition(store.getPosition());
    applyPosition();
    return store.subscribePosition(applyPosition);
  }, [store, writePosition]);
}

export function useMasterMeterStore(): MasterMeterStore {
  const store = useContext(ArrangementMeterContext);
  if (!store) {
    throw new Error('useMasterMeterStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useMasterMeterWriter(writeMeter: (store: MasterMeterStore) => void): void {
  const store = useMasterMeterStore();
  usePositionWriterEffect(() => {
    const applyMeter = () => writeMeter(store);
    applyMeter();
    return store.subscribeMeter(applyMeter);
  }, [store, writeMeter]);
}

export function useTrackMeterStore(): TrackMeterStore {
  const store = useContext(ArrangementTrackMeterContext);
  if (!store) {
    throw new Error('useTrackMeterStore must be used within an ArrangementProvider');
  }
  return store;
}

export function useTrackMeterWriter(
  trackId: string,
  writeMeter: (frame: MasterMeterState) => void,
): void {
  const store = useTrackMeterStore();
  usePositionWriterEffect(() => {
    const applyMeter = () => writeMeter(store.getTrackMeterFrame(trackId));
    applyMeter();
    return store.subscribeTrackMeters(applyMeter);
  }, [store, trackId, writeMeter]);
}

export type { ArrangementContextValue };
