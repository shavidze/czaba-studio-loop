import { Link } from '@remix-run/react';
import { ArrowLeft } from 'lucide-react';
import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  NUDGE_AT_TIME_START_MESSAGE,
  useArrangement,
  useArrangementPositionStore,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { workspaceCollectionCopy } from '~/lib/arrangement/collection';
import {
  clipEdgeTimesOnTracks,
  edgeNavigationTrackIds,
  isApplePlatform,
} from '~/lib/arrangement/edge-navigation';
import {
  adjacentGridLine,
  GRID_DEFAULT_DIVISION_SECONDS,
  GRID_DIVISIONS_SECONDS,
  gridLinesVisible,
  resolveGridTimeWithTargets,
} from '~/lib/arrangement/grid';
import {
  adjacentGridDivisionId,
  gridDivisionEndMessage,
  gridDivisionLabel,
  gridDivisionOptions,
  gridDivisionStatusMessage,
  gridDivisionTitle,
  gridMusicalGroupLabel,
  gridTempoClearedMessage,
  gridTripletGroupLabel,
  gridTripletRefusalMessage,
  isMusicalGridDivisionId,
  isTripletGridDivisionId,
  type MusicalGridDivisionId,
  musicalGridDivisionSeconds,
  toggledTripletGridDivisionId,
} from '~/lib/arrangement/grid-divisions';
import {
  arrangementGroups,
  expandShiftSelection,
  groupSelectedRows,
  liveTrackSelection,
  normalizeTrackGroupName,
  renameTrackGroup,
  rowParentId,
  TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE,
  type TrackGroupRow,
  trackGroupCollapseTargets,
  trackGroupCreatedMessage,
  trackGroupDescendantTrackIds,
  trackGroupDissolvedMessage,
  trackGroupOverviewClips,
  trackGroupRefusalMessage,
  trackGroupRows,
  ungroupSelectedRows,
  visibleTrackGroupRows,
} from '~/lib/arrangement/groups';
import { markerSnapTimes } from '~/lib/arrangement/markers';
import { metronomeStatusMessage } from '~/lib/arrangement/metronome';
import {
  clampTrackHeight,
  detailPanelOpenHeightCap,
  type FloatingVideoRect,
  fitLaneHeights,
  floatingVideoLibraryInsetPx,
  placeFloatingVideoOverLibrary,
  TRACK_DEFAULT_HEIGHT_PX,
  type TrackLaneFitEntry,
} from '~/lib/arrangement/panels';
import { clipsInMarquee, unionSelection } from '~/lib/arrangement/selection';
import {
  studioClipEnvelopeStrings,
  studioEditStrings,
  studioGridStrings,
  studioLaneMoveStrings,
  studioTimeTextParts,
  studioTrackGroupStrings,
  studioVideoStrings,
  studioViewStrings,
  studioWorkspaceStrings,
} from '~/lib/arrangement/strings';
import { TEMPO_INVALID_MESSAGE, tempoStatusMessage } from '~/lib/arrangement/tempo';
import {
  anchoredTimelineView,
  clampTimelineZoom,
  fitTimelineView,
  followScrollTarget,
  popZoomHistory,
  pushZoomHistory,
  stepTimelineZoom,
  TIMELINE_STEP_ZOOM_FACTOR,
  TIMELINE_WHEEL_ZOOM_FACTOR,
  type TimelineFollowMode,
  type TimelineView,
  timelineExtent,
  timelineNavigationKey,
  zoomToRangeView,
} from '~/lib/arrangement/view';
import {
  parseWaveformZoom,
  WAVEFORM_ZOOM_DEFAULT,
  WAVEFORM_ZOOM_LEVELS,
  waveformZoomLabel,
  waveformZoomPercent,
  waveformZoomStatus,
} from '~/lib/arrangement/waveform-zoom';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementTrack } from '~/types/arrangement';
import {
  type ArrangementDetailGroup,
  ArrangementDetailPanel,
  type ArrangementDetailSelection,
} from './ArrangementDetailPanel';
import { ArrangementExportDialog } from './ArrangementExportDialog';
import { ArrangementGridMenu } from './ArrangementGridMenu';
import {
  ArrangementGroupHeader,
  TRACK_GROUP_ROW_HEIGHT_PX,
  type TrackGroupOverviewBlock,
} from './ArrangementGroupHeader';
import {
  ARRANGEMENT_HEADER_WIDTH_PX,
  ArrangementLane,
  type TrackHeightChangeSource,
  type TrackRowSelectModifiers,
} from './ArrangementLane';
import { ArrangementLibrary } from './ArrangementLibrary';
import { ArrangementLoopBrace } from './ArrangementLoopBrace';
import { ArrangementMarkerRow, type ArrangementMarkerRowHandle } from './ArrangementMarkerRow';
import { ArrangementMaster } from './ArrangementMaster';
import { ArrangementOverview } from './ArrangementOverview';
import { ArrangementRuler } from './ArrangementRuler';
import { ArrangementTempoRow } from './ArrangementTempoRow';
import { ArrangementTimeText } from './ArrangementTimeText';
import { ArrangementTransport } from './ArrangementTransport';
import { ArrangementVideoDock } from './ArrangementVideoDock';
import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar';

const TIMELINE_TAIL_SECONDS = 30;
const NUDGE_SECONDS = 0.1;
const MARQUEE_THRESHOLD_PX = 4;
const CLIP_LANE_SHIFT_HINT = studioLaneMoveStrings.shiftHint;
const CLIP_LANE_SHIFT_LOCKED_HINT = studioLaneMoveStrings.shiftLockedHint;
const FOLLOW_PAUSED_MESSAGE = studioViewStrings.followPaused;
const ZOOM_RANGE_MISSING_MESSAGE = studioViewStrings.zoomNeedsSelection;
const ZOOM_HISTORY_EMPTY_MESSAGE = studioViewStrings.zoomHistoryEmpty;
const FOLLOW_SCROLL_TOLERANCE_PX = 1;
const VIDEO_EXPANDED_MESSAGE = studioVideoStrings.expanded;
const VIDEO_EXPANDED_LIBRARY_OPENED_MESSAGE = studioVideoStrings.expandedLibraryOpened;
const VIDEO_RETURNED_LIBRARY_COLLAPSED_MESSAGE = studioVideoStrings.returnedLibraryCollapsed;
export const VIDEO_RETURNED_COMPACT_MESSAGE = studioVideoStrings.returnedCompact;
export const VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE =
  studioVideoStrings.returnedLibraryRecollapsed;
const LIBRARY_TRANSITION_FALLBACK_MS = 100;
const SNAP_OFF_MESSAGE = studioGridStrings.snapOff;

function parseTransitionTimesMs(value: string): number[] {
  return value.split(',').map((entry) => {
    const time = entry.trim();
    const amount = Number.parseFloat(time);
    if (!Number.isFinite(amount)) {
      return 0;
    }
    return time.endsWith('ms') ? amount : amount * 1000;
  });
}

function isLibraryWidthAnimating(aside: HTMLElement): boolean {
  return (
    typeof aside.getAnimations === 'function' &&
    aside
      .getAnimations()
      .some(
        (animation) =>
          animation instanceof CSSTransition && animation.transitionProperty === 'width',
      )
  );
}

function libraryWidthTransitionMs(aside: HTMLElement): number {
  const style = getComputedStyle(aside);
  const properties = style.transitionProperty.split(',').map((entry) => entry.trim());
  const durations = parseTransitionTimesMs(style.transitionDuration);
  const delays = parseTransitionTimesMs(style.transitionDelay);
  let longest = 0;
  properties.forEach((property, index) => {
    if (property !== 'width' && property !== 'all') {
      return;
    }
    const duration = durations[index % durations.length] ?? 0;
    if (duration > 0) {
      longest = Math.max(longest, duration + Math.max(0, delays[index % delays.length] ?? 0));
    }
  });
  return longest;
}

interface MarqueeRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MarqueeGesture {
  pointerId: number;
  startX: number;
  startY: number;
  trackId: string;
  clickTime: number;
  base: readonly string[];
  active: boolean;
}

interface TrackLaneLayout {
  autoFit: boolean;
  detailUserResized: boolean;
  folded: Readonly<Record<string, boolean>>;
  collapsedGroups: Readonly<Record<string, boolean>>;
  heights: Readonly<Record<string, number>>;
  detailCap: number | null;
  isMotionArmed: boolean;
}

interface TrackLaneMetrics {
  scrollerClientHeight: number;
  panelRenderedHeight: number;
  timelineChromeHeight: number;
}

const INITIAL_TRACK_LANE_LAYOUT: TrackLaneLayout = {
  autoFit: true,
  detailUserResized: false,
  folded: {},
  collapsedGroups: {},
  heights: {},
  detailCap: null,
  isMotionArmed: false,
};

function trackLaneFitEntries(
  tracks: readonly ArrangementTrack[],
  folded: Readonly<Record<string, boolean>>,
): TrackLaneFitEntry[] {
  return tracks.map((track) => ({ kind: track.kind, folded: folded[track.id] ?? false }));
}

function withTrackGroupRows(
  metrics: TrackLaneMetrics | null,
  renderedGroupRowCount: number,
): TrackLaneMetrics | null {
  const groupRowsHeight = renderedGroupRowCount * TRACK_GROUP_ROW_HEIGHT_PX;
  return metrics && groupRowsHeight > 0
    ? { ...metrics, timelineChromeHeight: metrics.timelineChromeHeight + groupRowsHeight }
    : metrics;
}

function resolveTrackLaneLayout(
  previous: TrackLaneLayout,
  arrangement: Arrangement,
  measured: TrackLaneMetrics | null,
): TrackLaneLayout {
  const rows = visibleTrackGroupRows(trackGroupRows(arrangement), previous.collapsedGroups);
  const tracks = rows.flatMap((row) => (row.kind === 'track' ? [row.track] : []));
  const metrics = withTrackGroupRows(measured, rows.length - tracks.length);
  const lanes = trackLaneFitEntries(tracks, previous.folded);
  let heights = previous.heights;
  if (previous.autoFit && metrics) {
    const fitted = fitLaneHeights({
      visibleRowsHeight: metrics.scrollerClientHeight - metrics.timelineChromeHeight,
      lanes,
    });
    if (
      tracks.some(
        (track, index) => (previous.heights[track.id] ?? TRACK_DEFAULT_HEIGHT_PX) !== fitted[index],
      )
    ) {
      const fittedById = new Map(tracks.map((track, index) => [track.id, fitted[index]]));
      heights = Object.fromEntries(
        arrangement.tracks.map((track) => [
          track.id,
          fittedById.get(track.id) ?? previous.heights[track.id] ?? TRACK_DEFAULT_HEIGHT_PX,
        ]),
      );
    }
  }
  const detailCap =
    previous.autoFit && !previous.detailUserResized && metrics
      ? detailPanelOpenHeightCap({ ...metrics, lanes })
      : null;
  if (heights === previous.heights && detailCap === previous.detailCap) {
    return previous;
  }
  return { ...previous, heights, detailCap };
}

const NO_TRACK_GROUP_OVERVIEW: readonly TrackGroupOverviewBlock[] = [];

function trackRowElement(container: HTMLElement | null, rowId: string): HTMLElement | null {
  if (!container) {
    return null;
  }
  for (const row of Array.from(
    container.querySelectorAll<HTMLElement>('[data-track-id], [data-group-id]'),
  )) {
    if ((row.dataset.groupId ?? row.dataset.trackId) === rowId) {
      return row;
    }
  }
  return null;
}

function trackRowNameButton(container: HTMLElement | null, rowId: string): HTMLElement | null {
  const row = trackRowElement(container, rowId);
  if (!row) {
    return null;
  }
  return row.dataset.groupId !== undefined
    ? row.querySelector<HTMLElement>('[data-testid="arrangement-group-name"]')
    : row.querySelector<HTMLElement>(
        '[data-testid="arrangement-track-header"] button[aria-label*="— set as the active track"]',
      );
}

function libraryRailExpandButton(aside: HTMLElement | null): HTMLElement | null {
  return aside?.querySelector<HTMLElement>('[data-testid="arrangement-library-expand"]') ?? null;
}

function rowHasAncestor(
  rows: readonly TrackGroupRow[],
  row: TrackGroupRow,
  ancestorId: string,
): boolean {
  const parents = new Map(rows.map((entry) => [entry.id, entry.parentId]));
  const seen = new Set<string>();
  let cursor = row.parentId;
  while (cursor !== null && !seen.has(cursor)) {
    if (cursor === ancestorId) {
      return true;
    }
    seen.add(cursor);
    cursor = parents.get(cursor) ?? null;
  }
  return false;
}

function focusedTrackRowId(): string | null | undefined {
  const focused = document.activeElement;
  if (!(focused instanceof HTMLElement) || focused === document.body) {
    return null;
  }
  const row = focused.closest<HTMLElement>('[data-track-id], [data-group-id]');
  return row ? (row.dataset.groupId ?? row.dataset.trackId) : undefined;
}

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'number', 'email', 'url', 'password', 'tel']);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (
    target.isContentEditable ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  ) {
    return true;
  }
  return target instanceof HTMLInputElement && TEXT_INPUT_TYPES.has(target.type);
}

function isRoleSliderTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.getAttribute('role') === 'slider';
}

function isSliderTarget(target: EventTarget | null): boolean {
  return (
    (target instanceof HTMLInputElement && target.type === 'range') || isRoleSliderTarget(target)
  );
}

function isRangeInputTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === 'range';
}

function isScrollerGutterPointer(event: ReactPointerEvent<HTMLDivElement>): boolean {
  const scroller = event.currentTarget;
  if (event.target !== scroller) {
    return false;
  }
  const rect = scroller.getBoundingClientRect();
  const x = event.clientX - rect.left - scroller.clientLeft;
  const y = event.clientY - rect.top - scroller.clientTop;
  return x >= scroller.clientWidth || y >= scroller.clientHeight;
}

function isOverviewTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.dataset.timelineOverview !== undefined;
}

function isLoopBraceTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    target.closest('[data-testid="arrangement-loop-brace"]') !== null
  );
}

function isMarkerTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && target.closest('[data-testid="arrangement-marker"]') !== null
  );
}

function isSeparatorTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.getAttribute('role') === 'separator';
}

function shortcutLetter(event: KeyboardEvent): string {
  return event.code.startsWith('Key') ? event.code.slice(3).toLowerCase() : event.key.toLowerCase();
}

function ArrangementPlayheadLine({ pxPerSecond }: { pxPerSecond: number }) {
  const positionStore = useArrangementPositionStore();
  const lineRef = useRef<HTMLDivElement>(null);
  const writePlayheadLine = useCallback(
    (position: number) => {
      if (lineRef.current) {
        lineRef.current.style.left = `${ARRANGEMENT_HEADER_WIDTH_PX + position * pxPerSecond}px`;
      }
    },
    [pxPerSecond],
  );
  useArrangementPositionWriter(writePlayheadLine);
  return (
    <div
      ref={lineRef}
      className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-accent"
      style={{ left: ARRANGEMENT_HEADER_WIDTH_PX + positionStore.getPosition() * pxPerSecond }}
      data-testid="arrangement-playhead"
    />
  );
}

export function StudioWorkspace() {
  const workspace = useArrangement();
  const {
    arrangement,
    collection,
    projectEnd,
    pxPerSecond,
    range,
    selectedClipId,
    selectedClipIds,
    status,
    statusSequence,
    seekTo,
    scrubPlayhead,
    endPlayheadScrub,
    videoSources,
    claimPointerGesture,
    clipLaneDrag,
    isPlaying,
    sourcePeaks,
    setTimeRange,
    setStatus,
    isPointerGestureActive,
  } = workspace;
  const positionStore = useArrangementPositionStore();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [followMode, setFollowModeState] = useState<TimelineFollowMode>('on');
  const [snapEnabled, setSnapEnabled] = useState(false);
  const [envelopeMode, setEnvelopeMode] = useState(false);
  const envelopeModeRef = useRef(envelopeMode);
  envelopeModeRef.current = envelopeMode;
  const [waveformZoom, setWaveformZoom] = useState(WAVEFORM_ZOOM_DEFAULT);
  const [secondsGridDivision, setSecondsGridDivision] = useState<number>(
    GRID_DEFAULT_DIVISION_SECONDS,
  );
  const [musicalGridDivision, setMusicalGridDivision] = useState<MusicalGridDivisionId | null>(
    null,
  );
  const [tempoBpm, setTempoBpm] = useState<number | null>(null);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const snapEnabledRef = useRef(snapEnabled);
  snapEnabledRef.current = snapEnabled;
  const gridSeconds =
    musicalGridDivision !== null && tempoBpm !== null
      ? musicalGridDivisionSeconds(musicalGridDivision, tempoBpm)
      : secondsGridDivision;
  const gridDivisionId =
    musicalGridDivision !== null && tempoBpm !== null
      ? musicalGridDivision
      : String(secondsGridDivision);
  const secondsGridDivisionRef = useRef(secondsGridDivision);
  secondsGridDivisionRef.current = secondsGridDivision;
  const musicalGridDivisionRef = useRef(musicalGridDivision);
  musicalGridDivisionRef.current = musicalGridDivision;
  const tempoBpmRef = useRef(tempoBpm);
  tempoBpmRef.current = tempoBpm;
  const gridDivisionIdRef = useRef(gridDivisionId);
  gridDivisionIdRef.current = gridDivisionId;
  const gridSecondsRef = useRef(gridSeconds);
  gridSecondsRef.current = gridSeconds;
  const [gridMenu, setGridMenu] = useState<{ x: number; y: number } | null>(null);
  const gridMenuOpenRef = useRef(false);
  const gridMenuReturnFocusRef = useRef<HTMLElement | null>(null);
  const [canZoomBack, setCanZoomBack] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineChromeRef = useRef<HTMLDivElement>(null);
  const markerRowRef = useRef<ArrangementMarkerRowHandle>(null);
  const marqueeCleanupRef = useRef<(() => void) | null>(null);
  const workspaceRef = useRef(workspace);
  workspaceRef.current = workspace;
  const getRulerSnapMarkerTimes = useCallback(
    () => markerSnapTimes(workspaceRef.current.getArrangement()),
    [],
  );
  const exportOpenRef = useRef(isExportOpen);
  exportOpenRef.current = isExportOpen;
  const exportKeyEventRef = useRef<KeyboardEvent | null>(null);
  const pxPerSecondRef = useRef(pxPerSecond);
  pxPerSecondRef.current = pxPerSecond;
  const pendingViewRef = useRef<TimelineView | null>(null);
  const zoomHistoryRef = useRef<TimelineView[]>([]);
  const followModeRef = useRef<TimelineFollowMode>('on');
  const autoScrollLeftRef = useRef(0);
  const scrollListenersRef = useRef(new Set<() => void>());
  const viewportWidthRef = useRef(0);
  const lastScrollLeftRef = useRef(0);
  const [trackLaneLayout, setTrackLaneLayout] =
    useState<TrackLaneLayout>(INITIAL_TRACK_LANE_LAYOUT);
  const trackLaneLayoutRef = useRef(trackLaneLayout);
  trackLaneLayoutRef.current = trackLaneLayout;
  const trackLaneMetricsRef = useRef<TrackLaneMetrics | null>(null);
  const [trackSelection, setTrackSelection] = useState<readonly string[]>([]);
  const trackSelectionRef = useRef(trackSelection);
  trackSelectionRef.current = trackSelection;
  const trackSelectionAnchorRef = useRef<string | null>(null);
  const allTrackRows = useMemo(() => trackGroupRows(arrangement), [arrangement]);
  const trackRows = useMemo(
    () => visibleTrackGroupRows(allTrackRows, trackLaneLayout.collapsedGroups),
    [allTrackRows, trackLaneLayout.collapsedGroups],
  );
  const trackRowsLayoutKey = trackRows
    .map((row) => (row.kind === 'group' ? `group:${row.id}` : row.id))
    .join('|');
  const trackRowsLayoutKeyRef = useRef(trackRowsLayoutKey);
  const trackRowsRef = useRef(trackRows);
  trackRowsRef.current = trackRows;
  const pendingRowFocusRef = useRef<string | null>(null);
  const [isLibraryCollapsed, setIsLibraryCollapsed] = useState(false);
  const [isVideoExpanded, setIsVideoExpanded] = useState(false);
  const [libraryOpenedForVideo, setLibraryOpenedForVideo] = useState(false);
  const [videoFloatAnchor, setVideoFloatAnchor] = useState<FloatingVideoRect | null>(null);
  const libraryAsideRef = useRef<HTMLElement>(null);
  const libraryBodyRef = useRef<HTMLDivElement>(null);
  const detailPanelRef = useRef<HTMLElement>(null);
  const floatingVideoStateRef = useRef({
    isLibraryCollapsed,
    isVideoExpanded,
    libraryOpenedForVideo,
  });
  floatingVideoStateRef.current = { isLibraryCollapsed, isVideoExpanded, libraryOpenedForVideo };
  const pendingLibraryRailFocusRef = useRef(false);

  const measureFloatingVideoAnchor = useCallback((): FloatingVideoRect | null => {
    const aside = libraryAsideRef.current;
    const body = libraryBodyRef.current;
    if (!aside || !body) {
      return null;
    }
    const rect = aside.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    return placeFloatingVideoOverLibrary(
      { left: rect.left, width: rect.width, bodyTop: bodyRect.top, bodyBottom: bodyRect.bottom },
      { viewportWidth: window.innerWidth, viewportHeight: window.innerHeight },
    );
  }, []);

  const expandFloatingVideo = useCallback(() => {
    const state = floatingVideoStateRef.current;
    if (state.isVideoExpanded) {
      return;
    }
    setIsVideoExpanded(true);
    if (state.isLibraryCollapsed) {
      setLibraryOpenedForVideo(true);
      setIsLibraryCollapsed(false);
      setVideoFloatAnchor(null);
      workspaceRef.current.setStatus(VIDEO_EXPANDED_LIBRARY_OPENED_MESSAGE);
      return;
    }
    const aside = libraryAsideRef.current;
    setVideoFloatAnchor(
      aside && isLibraryWidthAnimating(aside) ? null : measureFloatingVideoAnchor(),
    );
    workspaceRef.current.setStatus(VIDEO_EXPANDED_MESSAGE);
  }, [measureFloatingVideoAnchor]);

  const returnFloatingVideo = useCallback(() => {
    const state = floatingVideoStateRef.current;
    if (!state.isVideoExpanded) {
      return;
    }
    setIsVideoExpanded(false);
    setVideoFloatAnchor(null);
    if (state.libraryOpenedForVideo) {
      const focusedElement = document.activeElement;
      pendingLibraryRailFocusRef.current =
        focusedElement instanceof HTMLElement &&
        focusedElement !== document.body &&
        libraryAsideRef.current?.contains(focusedElement) === true;
      setLibraryOpenedForVideo(false);
      setIsLibraryCollapsed(true);
      workspaceRef.current.setStatus(VIDEO_RETURNED_LIBRARY_RECOLLAPSED_MESSAGE);
      return;
    }
    workspaceRef.current.setStatus(VIDEO_RETURNED_COMPACT_MESSAGE);
  }, []);

  const changeVideoExpanded = useCallback(
    (expanded: boolean) => {
      if (expanded) {
        expandFloatingVideo();
      } else {
        returnFloatingVideo();
      }
    },
    [expandFloatingVideo, returnFloatingVideo],
  );

  const changeLibraryCollapsed = useCallback((collapsed: boolean) => {
    const state = floatingVideoStateRef.current;
    setLibraryOpenedForVideo(false);
    if (collapsed && state.isVideoExpanded) {
      setIsVideoExpanded(false);
      setVideoFloatAnchor(null);
      workspaceRef.current.setStatus(VIDEO_RETURNED_LIBRARY_COLLAPSED_MESSAGE);
    }
    setIsLibraryCollapsed(collapsed);
  }, []);

  const isAwaitingVideoPlacement =
    isVideoExpanded && videoFloatAnchor === null && !isLibraryCollapsed;
  const libraryBottomInsetPx = isVideoExpanded ? floatingVideoLibraryInsetPx(videoFloatAnchor) : 0;

  useEffect(() => {
    const aside = libraryAsideRef.current;
    if (!isAwaitingVideoPlacement || !aside) {
      return;
    }
    const placeFloatingVideo = () => setVideoFloatAnchor(measureFloatingVideoAnchor());
    const transitionMs = libraryWidthTransitionMs(aside);
    if (transitionMs <= 0) {
      const frame = requestAnimationFrame(placeFloatingVideo);
      return () => cancelAnimationFrame(frame);
    }
    const handleLibraryTransitionEnd = (event: TransitionEvent) => {
      if (event.target === aside && event.propertyName === 'width') {
        placeFloatingVideo();
      }
    };
    aside.addEventListener('transitionend', handleLibraryTransitionEnd);
    aside.addEventListener('transitioncancel', handleLibraryTransitionEnd);
    const fallback = window.setTimeout(
      placeFloatingVideo,
      transitionMs + LIBRARY_TRANSITION_FALLBACK_MS,
    );
    return () => {
      aside.removeEventListener('transitionend', handleLibraryTransitionEnd);
      aside.removeEventListener('transitioncancel', handleLibraryTransitionEnd);
      window.clearTimeout(fallback);
    };
  }, [isAwaitingVideoPlacement, measureFloatingVideoAnchor]);

  const refreshTrackLaneLayout = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const panel = detailPanelRef.current;
    const metrics: TrackLaneMetrics = {
      scrollerClientHeight: scroller.clientHeight,
      panelRenderedHeight: panel ? panel.offsetHeight : 0,
      timelineChromeHeight: timelineChromeRef.current?.offsetHeight ?? 0,
    };
    trackLaneMetricsRef.current = metrics;
    const isPanelAnimating =
      panel !== null &&
      typeof panel.getAnimations === 'function' &&
      panel.getAnimations().length > 0;
    if (isPanelAnimating) {
      return;
    }
    const arrangementNow = workspaceRef.current.arrangement;
    setTrackLaneLayout((previous) => {
      const next = resolveTrackLaneLayout(previous, arrangementNow, metrics);
      return next.heights !== previous.heights && next.isMotionArmed
        ? { ...next, isMotionArmed: false }
        : next;
    });
  }, []);

  const handleDetailPanelTransitionEnd = useCallback(
    (event: { target: EventTarget; propertyName: string }) => {
      if (event.propertyName === 'height' && event.target === detailPanelRef.current) {
        refreshTrackLaneLayout();
      }
    },
    [refreshTrackLaneLayout],
  );

  const toggleTrackFold = useCallback((trackId: string) => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const arrangementNow = current.arrangement;
    setTrackLaneLayout((previous) =>
      resolveTrackLaneLayout(
        {
          ...previous,
          folded: { ...previous.folded, [trackId]: !(previous.folded[trackId] ?? false) },
          isMotionArmed: true,
        },
        arrangementNow,
        trackLaneMetricsRef.current,
      ),
    );
  }, []);

  const changeTrackHeight = useCallback(
    (trackId: string, height: number, source: TrackHeightChangeSource) => {
      const tracks = workspaceRef.current.arrangement.tracks;
      const track = tracks.find((entry) => entry.id === trackId);
      if (!track) {
        return;
      }
      const nextHeight = clampTrackHeight(track.kind, height);
      const isMotionArmed = source === 'key';
      setTrackLaneLayout((previous) => {
        if (
          !previous.autoFit &&
          previous.detailCap === null &&
          !previous.folded[trackId] &&
          previous.heights[trackId] === nextHeight &&
          previous.isMotionArmed === isMotionArmed
        ) {
          return previous;
        }
        return {
          ...previous,
          autoFit: false,
          detailCap: null,
          folded: previous.folded[trackId]
            ? { ...previous.folded, [trackId]: false }
            : previous.folded,
          heights: {
            ...Object.fromEntries(
              tracks.map((entry) => [
                entry.id,
                previous.heights[entry.id] ?? TRACK_DEFAULT_HEIGHT_PX,
              ]),
            ),
            [trackId]: nextHeight,
          },
          isMotionArmed,
        };
      });
    },
    [],
  );

  const snapshotTrackLaneLayout = useCallback((trackId: string) => {
    const snapshot = trackLaneLayoutRef.current;
    return () => {
      setTrackLaneLayout((previous) =>
        resolveTrackLaneLayout(
          {
            ...previous,
            autoFit: snapshot.autoFit,
            heights: snapshot.heights,
            folded: { ...previous.folded, [trackId]: snapshot.folded[trackId] ?? false },
            detailCap: snapshot.detailCap,
            isMotionArmed: false,
          },
          workspaceRef.current.arrangement,
          trackLaneMetricsRef.current,
        ),
      );
    };
  }, []);

  const markDetailPanelUserResized = useCallback(() => {
    const wasResized = trackLaneLayoutRef.current.detailUserResized;
    setTrackLaneLayout((previous) =>
      previous.detailUserResized
        ? previous
        : { ...previous, detailUserResized: true, detailCap: null },
    );
    return () => {
      if (wasResized) {
        return;
      }
      setTrackLaneLayout((previous) =>
        resolveTrackLaneLayout(
          { ...previous, detailUserResized: false },
          workspaceRef.current.arrangement,
          trackLaneMetricsRef.current,
        ),
      );
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (trackRowsLayoutKeyRef.current === trackRowsLayoutKey) {
      return;
    }
    trackRowsLayoutKeyRef.current = trackRowsLayoutKey;
    refreshTrackLaneLayout();
  }, [trackRowsLayoutKey, refreshTrackLaneLayout]);

  useIsomorphicLayoutEffect(() => {
    const rowId = pendingRowFocusRef.current;
    if (rowId === null) {
      return;
    }
    pendingRowFocusRef.current = null;
    trackRowNameButton(scrollerRef.current, rowId)?.focus({ preventScroll: true });
  });

  useIsomorphicLayoutEffect(() => {
    const shouldRescueFocus = pendingLibraryRailFocusRef.current;
    pendingLibraryRailFocusRef.current = false;
    if (!shouldRescueFocus) {
      return;
    }
    const focusedElement = document.activeElement;
    if (focusedElement === null || focusedElement === document.body) {
      libraryRailExpandButton(libraryAsideRef.current)?.focus({ preventScroll: true });
    }
  });

  const replaceTrackSelection = useCallback((rowIds: readonly string[], anchor: string | null) => {
    trackSelectionRef.current = rowIds;
    trackSelectionAnchorRef.current = anchor;
    setTrackSelection(rowIds);
  }, []);

  const selectTrackRow = useCallback(
    (rowId: string, modifiers: TrackRowSelectModifiers) => {
      const arrangementNow = workspaceRef.current.getArrangement();
      const live = liveTrackSelection(arrangementNow, trackSelectionRef.current);
      if (modifiers.toggle) {
        replaceTrackSelection(
          live.includes(rowId) ? live.filter((id) => id !== rowId) : [...live, rowId],
          rowId,
        );
        return;
      }
      const anchor = trackSelectionAnchorRef.current;
      const anchorParent = anchor === null ? undefined : rowParentId(arrangementNow, anchor);
      if (
        modifiers.range &&
        anchor !== null &&
        anchorParent !== undefined &&
        anchorParent === rowParentId(arrangementNow, rowId)
      ) {
        replaceTrackSelection(expandShiftSelection(arrangementNow, anchor, rowId), anchor);
        return;
      }
      replaceTrackSelection([rowId], rowId);
    },
    [replaceTrackSelection],
  );

  const groupSelectedTrackRows = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const before = current.getArrangement();
    const result = groupSelectedRows(before, liveTrackSelection(before, trackSelectionRef.current));
    if (result.kind === 'refused') {
      current.setStatus(trackGroupRefusalMessage(result.reason));
      return;
    }
    const focusedId = focusedTrackRowId();
    const focusFollows =
      focusedId === null ||
      (focusedId !== undefined &&
        trackSelectionRef.current.includes(focusedId) &&
        document.activeElement === trackRowNameButton(scrollerRef.current, focusedId));
    if (!current.commitArrangement(result.arrangement, 'Group Tracks', before)) {
      return;
    }
    replaceTrackSelection([result.group.id], result.group.id);
    if (focusFollows) {
      pendingRowFocusRef.current = result.group.id;
    }
    current.setStatus(trackGroupCreatedMessage(result.group.name, result.memberNames));
  }, [replaceTrackSelection]);

  const ungroupSelectedTrackRows = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const before = current.getArrangement();
    const result = ungroupSelectedRows(
      before,
      liveTrackSelection(before, trackSelectionRef.current),
    );
    if (result.kind === 'refused') {
      current.setStatus(trackGroupRefusalMessage(result.reason));
      return;
    }
    const focusedId = focusedTrackRowId();
    const focusInDissolved =
      typeof focusedId === 'string' && result.dissolved.some((group) => group.id === focusedId);
    if (!current.commitArrangement(result.arrangement, 'Ungroup Tracks', before)) {
      return;
    }
    replaceTrackSelection(result.childIds, result.childIds[0] ?? null);
    if (focusInDissolved && result.childIds.length > 0) {
      pendingRowFocusRef.current = result.childIds[0];
    }
    current.setStatus(trackGroupDissolvedMessage(result.dissolved));
  }, [replaceTrackSelection]);

  const renameTrackGroupRow = useCallback((groupId: string, draft: string) => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const before = current.getArrangement();
    const group = arrangementGroups(before).find((entry) => entry.id === groupId);
    if (!group) {
      return;
    }
    const name = normalizeTrackGroupName(draft);
    if (name.length === 0) {
      current.setStatus(studioTrackGroupStrings.renameEmpty(group.name));
      return;
    }
    const next = renameTrackGroup(before, groupId, name);
    if (next === before) {
      return;
    }
    if (!current.commitArrangement(next, 'Rename Group', before)) {
      return;
    }
    current.setStatus(studioTrackGroupStrings.renamed(name));
  }, []);

  const setTrackGroupsCollapsed = useCallback(
    (groupIds: readonly string[], collapse: boolean) => {
      const current = workspaceRef.current;
      if (current.isPointerGestureActive() || current.isArrangementPreviewActive()) {
        current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
        return;
      }
      const arrangementNow = current.getArrangement();
      const collapsedGroups = { ...trackLaneLayoutRef.current.collapsedGroups };
      for (const groupId of groupIds) {
        collapsedGroups[groupId] = collapse;
      }
      const allRows = trackGroupRows(arrangementNow);
      const visibleIds = new Set(
        visibleTrackGroupRows(allRows, collapsedGroups).map((row) => row.id),
      );
      const hiddenIds = new Set(
        collapse ? allRows.flatMap((row) => (visibleIds.has(row.id) ? [] : [row.id])) : [],
      );
      const focusedId = focusedTrackRowId();
      const focusHidden = typeof focusedId === 'string' && hiddenIds.has(focusedId);
      const focusedElement = document.activeElement;
      if (focusHidden && focusedElement instanceof HTMLElement) {
        focusedElement.blur();
      }
      setTrackLaneLayout((latest) =>
        resolveTrackLaneLayout(
          {
            ...latest,
            collapsedGroups: Object.fromEntries([
              ...Object.entries(latest.collapsedGroups),
              ...groupIds.map((groupId) => [groupId, collapse]),
            ]),
            isMotionArmed: true,
          },
          arrangementNow,
          trackLaneMetricsRef.current,
        ),
      );
      if (hiddenIds.size === 0) {
        return;
      }
      if (focusHidden) {
        const keeper = groupIds.find(
          (groupId) =>
            visibleIds.has(groupId) &&
            allRows.some((row) => row.id === focusedId && rowHasAncestor(allRows, row, groupId)),
        );
        if (keeper !== undefined) {
          pendingRowFocusRef.current = keeper;
        }
      }
      const selection = trackSelectionRef.current;
      const anchor = trackSelectionAnchorRef.current;
      const anchorHidden = anchor !== null && hiddenIds.has(anchor);
      if (anchorHidden || selection.some((id) => hiddenIds.has(id))) {
        replaceTrackSelection(
          selection.filter((id) => !hiddenIds.has(id)),
          anchorHidden ? null : anchor,
        );
      }
      const clipIds = current.getSelectedClipIds();
      const hiddenClipIds = new Set(
        arrangementNow.clips.flatMap((clip) => (hiddenIds.has(clip.trackId) ? [clip.id] : [])),
      );
      if (clipIds.some((id) => hiddenClipIds.has(id))) {
        current.selectClips(clipIds.filter((id) => !hiddenClipIds.has(id)));
      }
      const rangeNow = current.range;
      if (rangeNow && !rangeNow.allTracks && hiddenIds.has(rangeNow.trackId)) {
        current.setTimeRange(null);
      }
    },
    [replaceTrackSelection],
  );

  const toggleTrackGroupCollapse = useCallback(
    (groupId: string) => {
      setTrackGroupsCollapsed(
        [groupId],
        trackLaneLayoutRef.current.collapsedGroups[groupId] !== true,
      );
    },
    [setTrackGroupsCollapsed],
  );

  const toggleSelectedTrackGroupsCollapse = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive() || current.isArrangementPreviewActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const arrangementNow = current.getArrangement();
    const collapsedGroups = trackLaneLayoutRef.current.collapsedGroups;
    const targets = trackGroupCollapseTargets(
      visibleTrackGroupRows(trackGroupRows(arrangementNow), collapsedGroups),
      liveTrackSelection(arrangementNow, trackSelectionRef.current),
      collapsedGroups,
    );
    if (targets.kind === 'refused') {
      current.setStatus(TRACK_GROUP_COLLAPSE_EMPTY_MESSAGE);
      return;
    }
    setTrackGroupsCollapsed(targets.groupIds, targets.kind === 'collapse');
  }, [setTrackGroupsCollapsed]);

  const notifyTimelineScroll = useCallback(() => {
    for (const listener of scrollListenersRef.current) {
      listener();
    }
  }, []);

  const subscribeTimelineScroll = useCallback((listener: () => void) => {
    scrollListenersRef.current.add(listener);
    return () => {
      scrollListenersRef.current.delete(listener);
    };
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const observer = new ResizeObserver(() => {
      viewportWidthRef.current = scroller.clientWidth;
      setViewportWidth(scroller.clientWidth);
      refreshTrackLaneLayout();
      notifyTimelineScroll();
    });
    observer.observe(scroller);
    viewportWidthRef.current = scroller.clientWidth;
    setViewportWidth(scroller.clientWidth);
    refreshTrackLaneLayout();
    return () => observer.disconnect();
  }, [notifyTimelineScroll, refreshTrackLaneLayout]);

  const setFollowMode = useCallback((next: TimelineFollowMode) => {
    followModeRef.current = next;
    setFollowModeState(next);
  }, []);

  const getTimelineViewportPx = useCallback((): number => {
    const scroller = scrollerRef.current;
    return scroller ? Math.max(0, scroller.clientWidth - ARRANGEMENT_HEADER_WIDTH_PX) : 0;
  }, []);

  const getTimelineView = useCallback(
    (): TimelineView =>
      pendingViewRef.current ?? {
        pxPerSecond: pxPerSecondRef.current,
        scrollLeft: scrollerRef.current?.scrollLeft ?? 0,
      },
    [],
  );

  const applyTimelineView = useCallback((view: TimelineView) => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const zoom = clampTimelineZoom(view.pxPerSecond);
    const scrollLeft = Math.max(0, view.scrollLeft);
    if (Math.abs(zoom - pxPerSecondRef.current) < 1e-9) {
      if (pendingViewRef.current) {
        pendingViewRef.current = null;
        workspaceRef.current.setPxPerSecond(zoom);
      }
      scroller.scrollLeft = scrollLeft;
      lastScrollLeftRef.current = scroller.scrollLeft;
      return;
    }
    pendingViewRef.current = { pxPerSecond: zoom, scrollLeft };
    workspaceRef.current.setPxPerSecond(zoom);
  }, []);

  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const pending = pendingViewRef.current;
    if (scroller && pending !== null && pxPerSecond > 0) {
      pendingViewRef.current = null;
      scroller.scrollLeft = pending.scrollLeft;
      lastScrollLeftRef.current = scroller.scrollLeft;
    }
  }, [pxPerSecond]);

  const pauseFollowForNavigation = useCallback(() => {
    if (workspaceRef.current.isPlaying && followModeRef.current === 'on') {
      setFollowMode('paused');
      workspaceRef.current.setStatus(FOLLOW_PAUSED_MESSAGE);
    }
  }, [setFollowMode]);

  const pushTimelineHistory = useCallback(() => {
    zoomHistoryRef.current = pushZoomHistory(zoomHistoryRef.current, getTimelineView());
    setCanZoomBack(true);
  }, [getTimelineView]);

  const fitTimeline = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      return;
    }
    const extent = timelineExtent(current.projectEnd, current.arrangement.loop);
    pushTimelineHistory();
    pauseFollowForNavigation();
    applyTimelineView(fitTimelineView(extent, getTimelineViewportPx()));
    current.setStatus(studioViewStrings.fitStatus(formatArrangementTime(extent)));
  }, [applyTimelineView, getTimelineViewportPx, pauseFollowForNavigation, pushTimelineHistory]);

  const zoomTimelineToRange = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      return;
    }
    const selected = current.range;
    if (!selected) {
      current.setStatus(ZOOM_RANGE_MISSING_MESSAGE);
      return;
    }
    pushTimelineHistory();
    pauseFollowForNavigation();
    applyTimelineView(zoomToRangeView(selected, getTimelineViewportPx()));
    current.setStatus(
      studioViewStrings.zoomedToSelection({
        start: formatArrangementTime(selected.start),
        end: formatArrangementTime(selected.end),
      }),
    );
  }, [applyTimelineView, getTimelineViewportPx, pauseFollowForNavigation, pushTimelineHistory]);

  const zoomTimelineBack = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive()) {
      return;
    }
    const popped = popZoomHistory(zoomHistoryRef.current);
    if (!popped) {
      current.setStatus(ZOOM_HISTORY_EMPTY_MESSAGE);
      return;
    }
    zoomHistoryRef.current = popped.history;
    setCanZoomBack(popped.history.length > 0);
    pauseFollowForNavigation();
    applyTimelineView(popped.view);
    current.setStatus(
      popped.history.length > 0 ? studioViewStrings.zoomBackMore : studioViewStrings.zoomBackDone,
    );
  }, [applyTimelineView, pauseFollowForNavigation]);

  const stepTimelineZoomBy = useCallback(
    (factor: number, useRange: boolean) => {
      const current = workspaceRef.current;
      if (current.isPointerGestureActive()) {
        return;
      }
      pauseFollowForNavigation();
      applyTimelineView(
        stepTimelineZoom({
          view: getTimelineView(),
          factor,
          viewportPx: getTimelineViewportPx(),
          range: useRange ? current.range : null,
          playhead: positionStore.getPosition(),
        }),
      );
    },
    [
      applyTimelineView,
      getTimelineView,
      getTimelineViewportPx,
      pauseFollowForNavigation,
      positionStore,
    ],
  );

  const setTimelineZoomFromSlider = useCallback(
    (zoom: number) => {
      stepTimelineZoomBy(clampTimelineZoom(zoom) / getTimelineView().pxPerSecond, false);
    },
    [getTimelineView, stepTimelineZoomBy],
  );

  const handleRulerDoubleClick = useCallback(() => {
    if (workspaceRef.current.range) {
      zoomTimelineToRange();
      return;
    }
    fitTimeline();
  }, [fitTimeline, zoomTimelineToRange]);

  const toggleFollow = useCallback(() => {
    const previous = followModeRef.current;
    const next: TimelineFollowMode = previous === 'on' ? 'off' : 'on';
    autoScrollLeftRef.current = scrollerRef.current?.scrollLeft ?? 0;
    setFollowMode(next);
    workspaceRef.current.setStatus(
      next === 'off'
        ? studioViewStrings.followOff
        : previous === 'paused'
          ? studioViewStrings.followResumed
          : studioViewStrings.followOn,
    );
  }, [setFollowMode]);

  const toggleSnap = useCallback(() => {
    const next = !snapEnabledRef.current;
    snapEnabledRef.current = next;
    setSnapEnabled(next);
    workspaceRef.current.setStatus(
      next
        ? studioGridStrings.snapOnStatus(gridDivisionLabel(gridDivisionIdRef.current))
        : SNAP_OFF_MESSAGE,
    );
  }, []);

  const toggleEnvelopeMode = useCallback(() => {
    const current = workspaceRef.current;
    if (current.isPointerGestureActive() || current.isArrangementPreviewActive()) {
      current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const next = !envelopeModeRef.current;
    envelopeModeRef.current = next;
    setEnvelopeMode(next);
    current.setStatus(next ? studioClipEnvelopeStrings.modeOn : studioClipEnvelopeStrings.modeOff);
  }, []);

  const changeGridDivision = useCallback((id: string) => {
    const tempo = tempoBpmRef.current;
    if (isMusicalGridDivisionId(id)) {
      if (tempo === null) {
        return;
      }
      musicalGridDivisionRef.current = id;
      gridSecondsRef.current = musicalGridDivisionSeconds(id, tempo);
      setMusicalGridDivision(id);
    } else {
      const step = GRID_DIVISIONS_SECONDS.find((division) => String(division) === id);
      if (step === undefined) {
        return;
      }
      secondsGridDivisionRef.current = step;
      musicalGridDivisionRef.current = null;
      gridSecondsRef.current = step;
      setSecondsGridDivision(step);
      setMusicalGridDivision(null);
    }
    gridDivisionIdRef.current = id;
    workspaceRef.current.setStatus(gridDivisionStatusMessage(id, tempo, snapEnabledRef.current));
  }, []);

  const changeTempo = useCallback((next: number | null) => {
    tempoBpmRef.current = next;
    setTempoBpm(next);
    if (next === null) {
      setMetronomeOn(false);
    }
    const musical = musicalGridDivisionRef.current;
    if (musical !== null && next !== null) {
      gridSecondsRef.current = musicalGridDivisionSeconds(musical, next);
    }
    if (musical !== null && next === null) {
      const seconds = secondsGridDivisionRef.current;
      musicalGridDivisionRef.current = null;
      gridSecondsRef.current = seconds;
      gridDivisionIdRef.current = String(seconds);
      setMusicalGridDivision(null);
      workspaceRef.current.setStatus(gridTempoClearedMessage(seconds));
      return;
    }
    workspaceRef.current.setStatus(tempoStatusMessage(next));
  }, []);

  const toggleMetronome = useCallback(() => {
    if (tempoBpm === null) {
      return;
    }
    const next = !metronomeOn;
    setMetronomeOn(next);
    workspaceRef.current.setStatus(metronomeStatusMessage(next ? tempoBpm : null));
  }, [metronomeOn, tempoBpm]);

  useEffect(() => {
    workspaceRef.current.setMetronomeBpm(metronomeOn && tempoBpm !== null ? tempoBpm : null);
  }, [metronomeOn, tempoBpm]);

  const rejectTempo = useCallback(() => {
    workspaceRef.current.setStatus(TEMPO_INVALID_MESSAGE);
  }, []);

  const stepGridDivision = useCallback(
    (direction: 'narrow' | 'widen') => {
      const current = gridDivisionIdRef.current;
      const next = adjacentGridDivisionId(current, direction);
      if (next === null) {
        workspaceRef.current.setStatus(gridDivisionEndMessage(current, direction));
      } else {
        changeGridDivision(next);
      }
    },
    [changeGridDivision],
  );

  const toggleGridTriplet = useCallback(() => {
    const current = gridDivisionIdRef.current;
    const tempo = tempoBpmRef.current;
    const next = toggledTripletGridDivisionId(current);
    if (next === null || tempo === null) {
      workspaceRef.current.setStatus(gridTripletRefusalMessage(current, tempo));
      return;
    }
    changeGridDivision(next);
  }, [changeGridDivision]);

  const closeGridMenu = useCallback(() => {
    if (!gridMenuOpenRef.current) {
      return;
    }
    gridMenuOpenRef.current = false;
    setGridMenu(null);
    const returnFocus = gridMenuReturnFocusRef.current;
    gridMenuReturnFocusRef.current = null;
    if (returnFocus?.isConnected && returnFocus !== returnFocus.ownerDocument.body) {
      returnFocus.focus({ preventScroll: true });
    }
  }, []);

  const handleGridMenuRequest = useCallback((event: ReactMouseEvent<HTMLDivElement>) => {
    if (exportOpenRef.current || workspaceRef.current.isPointerGestureActive()) {
      return;
    }
    if (!gridMenuOpenRef.current) {
      const focused = event.currentTarget.ownerDocument.activeElement;
      gridMenuReturnFocusRef.current = focused instanceof HTMLElement ? focused : null;
      gridMenuOpenRef.current = true;
    }
    setGridMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const chooseGridMenuDivision = useCallback(
    (id: string) => {
      changeGridDivision(id);
      closeGridMenu();
    },
    [changeGridDivision, closeGridMenu],
  );

  const toggleGridMenuSnap = useCallback(() => {
    toggleSnap();
    closeGridMenu();
  }, [toggleSnap, closeGridMenu]);

  const toggleGridMenuTriplet = useCallback(() => {
    toggleGridTriplet();
    closeGridMenu();
  }, [toggleGridTriplet, closeGridMenu]);

  const isGridMenuOpen = gridMenu !== null;
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!isGridMenuOpen) {
      return;
    }
    const openScrollTop = scroller?.scrollTop ?? 0;
    const closeGridMenuOnUserScroll = () => {
      if (scroller && scroller.scrollTop !== openScrollTop) {
        closeGridMenu();
        return;
      }
      if (scroller && workspaceRef.current.isPlaying && followModeRef.current === 'on') {
        const left = scroller.scrollLeft;
        const clampedByBrowser =
          left < autoScrollLeftRef.current &&
          left >= scroller.scrollWidth - scroller.clientWidth - FOLLOW_SCROLL_TOLERANCE_PX;
        if (
          clampedByBrowser ||
          Math.abs(left - autoScrollLeftRef.current) <= FOLLOW_SCROLL_TOLERANCE_PX
        ) {
          return;
        }
      }
      closeGridMenu();
    };
    scroller?.addEventListener('scroll', closeGridMenuOnUserScroll);
    window.addEventListener('resize', closeGridMenu);
    window.addEventListener('blur', closeGridMenu);
    return () => {
      scroller?.removeEventListener('scroll', closeGridMenuOnUserScroll);
      window.removeEventListener('resize', closeGridMenu);
      window.removeEventListener('blur', closeGridMenu);
    };
  }, [isGridMenuOpen, closeGridMenu]);

  const handleTimelineScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const left = scroller.scrollLeft;
    const previousLeft = lastScrollLeftRef.current;
    lastScrollLeftRef.current = left;
    const clampedByBrowser =
      left < autoScrollLeftRef.current &&
      left >= scroller.scrollWidth - scroller.clientWidth - FOLLOW_SCROLL_TOLERANCE_PX;
    const followAutoScroll =
      workspaceRef.current.isPlaying &&
      followModeRef.current === 'on' &&
      (clampedByBrowser ||
        Math.abs(left - autoScrollLeftRef.current) <= FOLLOW_SCROLL_TOLERANCE_PX);
    if (left !== previousLeft && !followAutoScroll) {
      markerRowRef.current?.closeMenu();
    }
    if (!workspaceRef.current.isPlaying || clampedByBrowser) {
      autoScrollLeftRef.current = left;
    } else if (
      followModeRef.current === 'on' &&
      Math.abs(left - autoScrollLeftRef.current) > FOLLOW_SCROLL_TOLERANCE_PX
    ) {
      pauseFollowForNavigation();
    }
    notifyTimelineScroll();
  }, [notifyTimelineScroll, pauseFollowForNavigation]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    autoScrollLeftRef.current = scrollerRef.current?.scrollLeft ?? 0;
    if (followModeRef.current === 'paused') {
      setFollowMode('on');
    }
  }, [isPlaying, setFollowMode]);

  useEffect(
    () =>
      positionStore.subscribePosition(() => {
        const scroller = scrollerRef.current;
        const current = workspaceRef.current;
        if (
          !scroller ||
          followModeRef.current !== 'on' ||
          !current.isPlaying ||
          current.isPointerGestureActive()
        ) {
          return;
        }
        const target = followScrollTarget({
          position: positionStore.getPosition(),
          view: pendingViewRef.current ?? {
            pxPerSecond: pxPerSecondRef.current,
            scrollLeft: lastScrollLeftRef.current,
          },
          viewportPx: Math.max(0, viewportWidthRef.current - ARRANGEMENT_HEADER_WIDTH_PX),
        });
        if (target === null) {
          return;
        }
        scroller.scrollLeft = target;
        lastScrollLeftRef.current = target;
        autoScrollLeftRef.current = target;
      }),
    [positionStore],
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const handleTimelineWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return;
      }
      event.preventDefault();
      if (event.deltaY === 0 || workspaceRef.current.isPointerGestureActive()) {
        return;
      }
      const view = getTimelineView();
      const screenX = Math.max(
        0,
        event.clientX - scroller.getBoundingClientRect().left - ARRANGEMENT_HEADER_WIDTH_PX,
      );
      const time = Math.max(0, (screenX + view.scrollLeft) / view.pxPerSecond);
      const factor = event.deltaY < 0 ? TIMELINE_WHEEL_ZOOM_FACTOR : 1 / TIMELINE_WHEEL_ZOOM_FACTOR;
      pauseFollowForNavigation();
      applyTimelineView(anchoredTimelineView(view.pxPerSecond * factor, time, screenX));
    };
    scroller.addEventListener('wheel', handleTimelineWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', handleTimelineWheel);
  }, [applyTimelineView, getTimelineView, pauseFollowForNavigation]);

  const navigationKeysRef = useRef({
    stepTimelineZoomBy,
    zoomTimelineToRange,
    zoomTimelineBack,
  });
  navigationKeysRef.current = { stepTimelineZoomBy, zoomTimelineToRange, zoomTimelineBack };

  useEffect(() => () => marqueeCleanupRef.current?.(), []);

  const releaseEditFocusOnTimelinePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const focused = event.currentTarget.ownerDocument.activeElement;
      if (
        focused instanceof HTMLElement &&
        (((isRangeInputTarget(focused) || isTypingTarget(focused)) &&
          !isRangeInputTarget(event.target)) ||
          (isLoopBraceTarget(focused) && !isLoopBraceTarget(event.target)) ||
          (isMarkerTarget(focused) && !isMarkerTarget(event.target))) &&
        !isScrollerGutterPointer(event) &&
        !workspaceRef.current.isPointerGestureActive() &&
        !(event.target instanceof Node && focused.contains(event.target))
      ) {
        focused.blur();
      }
    },
    [],
  );

  const releaseTypingFocusBeforeRangePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const focused = event.currentTarget.ownerDocument.activeElement;
      if (
        focused instanceof HTMLElement &&
        isTypingTarget(focused) &&
        isRangeInputTarget(event.target) &&
        !workspaceRef.current.isPointerGestureActive()
      ) {
        focused.blur();
      }
    },
    [],
  );

  const handleLaneBackgroundPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>, trackId: string) => {
      if (event.button !== 0 || event.target !== event.currentTarget) {
        return;
      }
      const current = workspaceRef.current;
      const releaseGesture = current.claimPointerGesture(event.pointerId, () => cleanup());
      if (!releaseGesture) {
        return;
      }
      event.preventDefault();
      marqueeCleanupRef.current?.();
      const laneRect = event.currentTarget.getBoundingClientRect();
      const gesture: MarqueeGesture = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        trackId,
        clickTime: Math.max(0, (event.clientX - laneRect.left) / current.pxPerSecond),
        base: event.ctrlKey || event.metaKey ? current.getSelectedClipIds() : [],
        active: false,
      };
      const updateMarquee = (clientX: number, clientY: number) => {
        const container = timelineRef.current;
        if (!container) {
          return;
        }
        const latest = workspaceRef.current;
        const box = container.getBoundingClientRect();
        const left = Math.max(
          ARRANGEMENT_HEADER_WIDTH_PX,
          Math.min(gesture.startX, clientX) - box.left,
        );
        const right = Math.max(left, Math.max(gesture.startX, clientX) - box.left);
        const top = Math.min(gesture.startY, clientY);
        const bottom = Math.max(gesture.startY, clientY);
        setMarquee({ left, top: top - box.top, width: right - left, height: bottom - top });
        const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-track-id]'));
        const trackOrder = rows.map((row) => row.dataset.trackId ?? '');
        const hit = rows
          .map((row, index) => ({ index, rect: row.getBoundingClientRect() }))
          .filter(({ rect }) => rect.bottom > top && rect.top < bottom)
          .map(({ index }) => index);
        const found =
          hit.length === 0
            ? []
            : clipsInMarquee(latest.arrangement, trackOrder, {
                t0: (left - ARRANGEMENT_HEADER_WIDTH_PX) / latest.pxPerSecond,
                t1: (right - ARRANGEMENT_HEADER_WIDTH_PX) / latest.pxPerSecond,
                firstTrack: hit[0],
                lastTrack: hit[hit.length - 1],
              });
        latest.selectClips(unionSelection(gesture.base, found));
      };
      const handleMove = (move: PointerEvent) => {
        if (move.pointerId !== gesture.pointerId) {
          return;
        }
        if (
          !gesture.active &&
          Math.hypot(move.clientX - gesture.startX, move.clientY - gesture.startY) <
            MARQUEE_THRESHOLD_PX
        ) {
          return;
        }
        if (!gesture.active) {
          gesture.active = true;
          workspaceRef.current.setTimeRange(null);
        }
        updateMarquee(move.clientX, move.clientY);
      };
      const cleanup = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
        marqueeCleanupRef.current = null;
        releaseGesture();
        setMarquee(null);
      };
      const finish = (end: PointerEvent) => {
        if (end.pointerId !== gesture.pointerId) {
          return;
        }
        cleanup();
        if (gesture.active || end.type !== 'pointerup') {
          return;
        }
        const latest = workspaceRef.current;
        latest.setActiveTrack(gesture.trackId);
        latest.selectClip(null);
        latest.setTimeRange(null);
        latest.seekTo(
          resolveGridTimeWithTargets(
            gesture.clickTime,
            snapEnabledRef.current ? gridSecondsRef.current : null,
            gridSecondsRef.current,
            end.altKey,
            markerSnapTimes(latest.getArrangement()),
          ),
        );
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
      marqueeCleanupRef.current = cleanup;
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        exportOpenRef.current ||
        exportKeyEventRef.current === event ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        floatingVideoStateRef.current.isVideoExpanded
      ) {
        event.preventDefault();
        returnFloatingVideo();
        return;
      }
      const current = workspaceRef.current;
      const modifier = event.ctrlKey || event.metaKey;
      const key = shortcutLetter(event);
      const onOverview = isOverviewTarget(event.target);
      if (event.key === ' ' && !modifier && (!isRoleSliderTarget(event.target) || onOverview)) {
        event.preventDefault();
        if (!event.repeat) {
          current.togglePlayback();
        }
        return;
      }
      const navigationKey = timelineNavigationKey({
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        inTextField: isTypingTarget(event.target),
        onSlider: isSliderTarget(event.target) && !onOverview,
      });
      if (navigationKey) {
        event.preventDefault();
        const navigation = navigationKeysRef.current;
        if (navigationKey === 'zoom-in' || navigationKey === 'zoom-out') {
          navigation.stepTimelineZoomBy(
            navigationKey === 'zoom-in' ? TIMELINE_STEP_ZOOM_FACTOR : 1 / TIMELINE_STEP_ZOOM_FACTOR,
            true,
          );
          return;
        }
        if (!event.repeat) {
          if (navigationKey === 'zoom-range') {
            navigation.zoomTimelineToRange();
          } else {
            navigation.zoomTimelineBack();
          }
        }
        return;
      }
      if (
        current.isPointerGestureActive() &&
        ((modifier &&
          (key === 'e' ||
            key === 'l' ||
            key === 'd' ||
            key === 'c' ||
            key === 'x' ||
            key === 'v' ||
            event.key === 'ArrowLeft' ||
            event.key === 'ArrowRight')) ||
          (!modifier &&
            (key === 'm' ||
              event.key === 'Delete' ||
              event.key === 'Backspace' ||
              event.key === 'ArrowLeft' ||
              event.key === 'ArrowRight' ||
              event.key === 'Enter')))
      ) {
        event.preventDefault();
        current.setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
        return;
      }
      if (modifier && key === 'e') {
        event.preventDefault();
        if (!event.repeat) {
          current.splitSelection();
        }
        return;
      }
      if (modifier && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          current.redo();
        } else {
          current.undo();
        }
        return;
      }
      if (modifier && key === 'y') {
        event.preventDefault();
        current.redo();
        return;
      }
      if (modifier && key === 'l') {
        event.preventDefault();
        if (!event.repeat) {
          if (event.shiftKey) {
            current.extendRangeToAllTracks();
          } else {
            current.toggleLoopSelection();
          }
        }
        return;
      }
      if (modifier && key === 'a') {
        event.preventDefault();
        current.selectAllClips();
        return;
      }
      if (modifier && key === 'd') {
        event.preventDefault();
        if (!event.repeat) {
          current.duplicateSelection();
        }
        return;
      }
      if (modifier && key === 'c' && !event.shiftKey) {
        if (window.getSelection()?.isCollapsed === false) {
          return;
        }
        event.preventDefault();
        if (!event.repeat) {
          current.copySelection();
        }
        return;
      }
      if (modifier && key === 'x') {
        event.preventDefault();
        if (!event.repeat) {
          if (event.shiftKey) {
            current.cutTimeSelection();
          } else {
            current.cutSelection();
          }
        }
        return;
      }
      if (modifier && key === 'v' && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          current.pasteClipboard();
        }
        return;
      }
      if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        !event.metaKey &&
        !event.shiftKey &&
        ((event.ctrlKey && !event.altKey) ||
          (event.altKey &&
            !event.ctrlKey &&
            isApplePlatform(navigator.platform, navigator.userAgent)))
      ) {
        if (
          isSliderTarget(event.target) ||
          isSeparatorTarget(event.target) ||
          isLoopBraceTarget(event.target) ||
          onOverview
        ) {
          return;
        }
        event.preventDefault();
        const arrangementNow = current.getArrangement();
        const edgeTimes = clipEdgeTimesOnTracks(
          arrangementNow,
          edgeNavigationTrackIds(arrangementNow, {
            activeTrackId: current.activeTrackId,
            selectedClipIds: current.selectedClipIds,
            range: current.range,
          }),
        );
        markerRowRef.current?.stepMarker(event.key === 'ArrowLeft' ? -1 : 1, edgeTimes, {
          keyRepeat: event.repeat,
        });
        return;
      }
      if (modifier && key === 'g' && !event.altKey) {
        event.preventDefault();
        if (!event.repeat) {
          if (event.shiftKey) {
            ungroupSelectedTrackRows();
          } else {
            groupSelectedTrackRows();
          }
        }
        return;
      }
      if (modifier) {
        return;
      }
      if (key === 'm' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          markerRowRef.current?.beginAddMarker();
        }
        return;
      }
      if (key === 'g' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          toggleSnap();
        }
        return;
      }
      if (key === 'a' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          toggleEnvelopeMode();
        }
        return;
      }
      if (key === 'u' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          toggleSelectedTrackGroupsCollapse();
        }
        return;
      }
      if (
        (event.code === 'Digit1' || event.code === 'Digit2') &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (event.repeat) {
          return;
        }
        stepGridDivision(event.code === 'Digit1' ? 'narrow' : 'widen');
        return;
      }
      if (event.code === 'Digit3' && !event.altKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) {
          toggleGridTriplet();
        }
        return;
      }
      if (event.key === 'Home' && !isSliderTarget(event.target)) {
        event.preventDefault();
        if (!isSeparatorTarget(event.target)) {
          current.seekTo(0);
        }
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (isRangeInputTarget(event.target) || isMarkerTarget(event.target)) {
          return;
        }
        event.preventDefault();
        if (!event.repeat) {
          current.deleteSelection();
        }
        return;
      }
      if (
        (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
        current.selectedClipId &&
        !isSliderTarget(event.target) &&
        !isLoopBraceTarget(event.target) &&
        !isSeparatorTarget(event.target) &&
        !isMarkerTarget(event.target)
      ) {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' ? -1 : 1;
        if (!snapEnabledRef.current) {
          current.nudgeSelectedClip(direction * NUDGE_SECONDS, { keyRepeat: event.repeat });
          return;
        }
        const anchor = current
          .getArrangement()
          .clips.find((clip) => clip.id === current.selectedClipId);
        if (!anchor) {
          return;
        }
        const target = adjacentGridLine(anchor.start, gridSecondsRef.current, direction);
        if (target === null) {
          if (!event.repeat || current.status !== NUDGE_AT_TIME_START_MESSAGE) {
            current.setStatus(NUDGE_AT_TIME_START_MESSAGE);
          }
          return;
        }
        current.nudgeSelectedClip(target - anchor.start, { keyRepeat: event.repeat });
        return;
      }
      if (
        event.key === 'Enter' &&
        !(event.target instanceof HTMLButtonElement) &&
        !isSliderTarget(event.target) &&
        !isSeparatorTarget(event.target)
      ) {
        event.preventDefault();
        if (!event.repeat) {
          current.addSourceToActiveTrack();
        }
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        event.key === ' ' &&
        !exportOpenRef.current &&
        !isTypingTarget(event.target) &&
        !(event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
      }
    };
    const handleStrayFileDrag = (event: DragEvent) => {
      if (event.defaultPrevented || !event.dataTransfer?.types.includes('Files')) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = 'none';
    };
    const markExportKeyEvent = (event: KeyboardEvent) => {
      exportKeyEventRef.current = exportOpenRef.current ? event : null;
    };
    window.addEventListener('keydown', markExportKeyEvent, true);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('dragover', handleStrayFileDrag);
    window.addEventListener('drop', handleStrayFileDrag);
    return () => {
      window.removeEventListener('keydown', markExportKeyEvent, true);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('dragover', handleStrayFileDrag);
      window.removeEventListener('drop', handleStrayFileDrag);
    };
  }, [
    groupSelectedTrackRows,
    returnFloatingVideo,
    stepGridDivision,
    toggleGridTriplet,
    toggleEnvelopeMode,
    toggleSelectedTrackGroupsCollapse,
    toggleSnap,
    ungroupSelectedTrackRows,
  ]);

  const activeTrackId = workspace.activeTrackId;
  const trackGroupOverviews = useMemo(() => {
    const selected = new Set(selectedClipIds);
    const overviews = new Map<string, readonly TrackGroupOverviewBlock[]>();
    for (const row of trackRows) {
      if (row.kind === 'group' && trackLaneLayout.collapsedGroups[row.id] === true) {
        overviews.set(
          row.id,
          trackGroupOverviewClips(arrangement, row.id).map((block) => ({
            ...block,
            selected: selected.has(block.clipId),
          })),
        );
      }
    }
    return overviews;
  }, [arrangement, trackRows, trackLaneLayout.collapsedGroups, selectedClipIds]);
  const selectedTrackRowIds = useMemo(
    () => new Set(liveTrackSelection(arrangement, trackSelection)),
    [arrangement, trackSelection],
  );
  const viewportSeconds = Math.max(0, viewportWidth - ARRANGEMENT_HEADER_WIDTH_PX) / pxPerSecond;
  const timelineSeconds = Math.ceil(Math.max(projectEnd + TIMELINE_TAIL_SECONDS, viewportSeconds));
  const timelineWidth = timelineSeconds * pxPerSecond;
  const extent = useMemo(
    () => timelineExtent(projectEnd, arrangement.loop),
    [projectEnd, arrangement.loop],
  );
  const transportNavigation = useMemo(
    () => ({
      followMode,
      canZoomBack,
      onToggleFollow: toggleFollow,
      onZoomToRange: zoomTimelineToRange,
      onZoomBack: zoomTimelineBack,
      onFit: fitTimeline,
      onZoomSlider: setTimelineZoomFromSlider,
    }),
    [
      followMode,
      canZoomBack,
      toggleFollow,
      zoomTimelineToRange,
      zoomTimelineBack,
      fitTimeline,
      setTimelineZoomFromSlider,
    ],
  );
  const laneMoveRefusal =
    clipLaneDrag?.ghosts.find((ghost) => ghost.blocked && ghost.message)?.message ?? null;
  const selectedClip = arrangement.clips.find((clip) => clip.id === selectedClipId);
  const selectedTitle = selectedClip
    ? (videoSources.get(selectedClip.sourceId)?.name ??
      collection.sources.find((source) => source.id === selectedClip.sourceId)?.title ??
      selectedClip.sourceId)
    : null;
  const detailSelection = useMemo((): ArrangementDetailSelection | null => {
    if (!selectedClip || selectedClipIds.length > 1) {
      return null;
    }
    const track = arrangement.tracks.find((entry) => entry.id === selectedClip.trackId);
    return {
      clip: selectedClip,
      title: selectedTitle ?? selectedClip.sourceId,
      laneName: track?.name ?? selectedClip.trackId,
      isVideo: track?.kind === 'video',
    };
  }, [selectedClip, selectedTitle, selectedClipIds.length, arrangement.tracks]);
  const detailGroup = useMemo((): ArrangementDetailGroup | null => {
    if (selectedClipIds.length < 2) {
      return null;
    }
    const clips = arrangement.clips.filter((clip) => selectedClipIds.includes(clip.id));
    if (clips.length < 2) {
      return null;
    }
    const earliestStart = Math.min(...clips.map((clip) => clip.start));
    const latestEnd = Math.max(...clips.map((clip) => clip.start + clip.duration));
    const laneNames = arrangement.tracks
      .filter((track) => clips.some((clip) => clip.trackId === track.id))
      .map((track) => track.name)
      .join(', ');
    const audioTrackIds = new Set(
      arrangement.tracks.filter((track) => track.kind === 'audio').map((track) => track.id),
    );
    const audioGains = clips
      .filter((clip) => audioTrackIds.has(clip.trackId))
      .map((clip) => clip.gainDb ?? 0);
    return {
      count: clips.length,
      laneNames,
      earliestStart,
      spanLength: latestEnd - earliestStart,
      clipIds: clips.map((clip) => clip.id),
      hasNonAudioClip: audioGains.length < clips.length,
      minClipGainDb: audioGains.length > 0 ? Math.min(...audioGains) : 0,
      maxClipGainDb: audioGains.length > 0 ? Math.max(...audioGains) : 0,
    };
  }, [arrangement.clips, arrangement.tracks, selectedClipIds]);
  const detailPeaks = selectedClip ? sourcePeaks.get(selectedClip.sourceId) : undefined;
  const measureTimelineFit = useCallback(() => {
    const scroller = scrollerRef.current;
    const timeline = timelineRef.current;
    if (!scroller || !timeline) {
      return null;
    }
    return {
      scrollerClientHeight: scroller.clientHeight,
      timelineContentHeight: timeline.offsetHeight,
    };
  }, []);
  const gridLinesShown = gridLinesVisible(gridSeconds, pxPerSecond);
  const gridTriplet = isTripletGridDivisionId(gridDivisionId);
  const gridOptions = gridDivisionOptions(tempoBpm, gridTriplet);
  const loopTimesText = arrangement.loop
    ? `Loop ${formatArrangementTime(arrangement.loop.start)} — ${formatArrangementTime(arrangement.loop.end)}${arrangement.loop.enabled ? '' : ' · off'}`
    : null;

  return (
    <div
      className="studio-container flex h-screen flex-col overflow-hidden bg-background text-foreground"
      data-studio-theme="obsidian"
      data-lenis-prevent
      onPointerDownCapture={releaseTypingFocusBeforeRangePointerDown}
    >
      <header className="flex items-center justify-between border-b border-outline bg-surface px-3 py-1.5">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-0.75 rounded-sm px-1 text-sm font-medium text-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            data-testid="arrangement-exit"
          >
            <ArrowLeft className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            CZABA
          </Link>
          <h1 className="text-sm font-medium">
            {`${workspaceCollectionCopy(collection.origin).heading} `}
            <span className="font-normal text-muted">{studioWorkspaceStrings.headingSuffix}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <ArrangementMaster />
          <span className="rounded-sm border border-accent px-2 py-0.5 text-xs text-accent">
            {workspaceCollectionCopy(collection.origin).badge}
          </span>
        </div>
      </header>
      <ArrangementTransport
        onOpenExport={() => setIsExportOpen(true)}
        navigation={transportNavigation}
      />
      <div className="flex min-h-0 flex-1">
        <ArrangementLibrary
          isCollapsed={isLibraryCollapsed}
          onCollapsedChange={changeLibraryCollapsed}
          asideRef={libraryAsideRef}
          bodyRef={libraryBodyRef}
          bottomInsetPx={libraryBottomInsetPx}
        />
        <div
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          onTransitionEnd={handleDetailPanelTransitionEnd}
        >
          <ArrangementVideoDock
            overview={
              <ArrangementOverview
                arrangement={arrangement}
                extent={extent}
                pxPerSecond={pxPerSecond}
                getTimelineView={getTimelineView}
                getTimelineViewportPx={getTimelineViewportPx}
                subscribeTimelineScroll={subscribeTimelineScroll}
                applyTimelineView={applyTimelineView}
                onNavigationMove={pauseFollowForNavigation}
                onFit={fitTimeline}
                claimPointerGesture={claimPointerGesture}
              />
            }
            isVideoExpanded={isVideoExpanded}
            videoFloatAnchor={videoFloatAnchor}
            onVideoExpandedChange={changeVideoExpanded}
            claimPointerGesture={claimPointerGesture}
          />
          <div
            ref={scrollerRef}
            onScroll={handleTimelineScroll}
            onPointerDownCapture={releaseEditFocusOnTimelinePointerDown}
            className={cn('relative min-h-0 min-w-0 flex-1 overflow-auto', STUDIO_SCROLLBAR_CLASS)}
            data-testid="arrangement-timeline-scroller"
          >
            <div
              ref={timelineRef}
              className="relative"
              style={{ width: ARRANGEMENT_HEADER_WIDTH_PX + timelineWidth }}
            >
              <div ref={timelineChromeRef} className="sticky top-0 z-30 flex flex-col">
                <div className="flex">
                  <div
                    className="sticky left-0 z-30 flex shrink-0 items-center gap-2 border-r border-b border-outline bg-surface px-2 text-xs text-muted"
                    style={{ width: ARRANGEMENT_HEADER_WIDTH_PX }}
                    data-testid="arrangement-grid-control"
                    data-snap={snapEnabled ? 'on' : 'off'}
                    data-grid-seconds={gridSeconds}
                    data-grid-division={gridDivisionId}
                    data-grid-lines={gridLinesShown ? 'visible' : 'hidden'}
                    data-envelope-mode={envelopeMode ? 'on' : 'off'}
                    data-waveform-zoom={waveformZoom}
                  >
                    <button
                      type="button"
                      onClick={toggleSnap}
                      aria-pressed={snapEnabled}
                      aria-keyshortcuts="G"
                      title={
                        snapEnabled ? studioGridStrings.snapOnTitle : studioGridStrings.snapOff
                      }
                      className={cn(
                        'h-6 shrink-0 rounded-md border border-transparent bg-foreground/5 px-1.5 text-xs leading-none text-muted motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        snapEnabled &&
                          'border-accent bg-accent/20 text-accent hover:text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20',
                      )}
                      data-testid="arrangement-snap-toggle"
                    >
                      Snap
                    </button>
                    <select
                      value={gridDivisionId}
                      onChange={(event) => {
                        const next = gridOptions.find((option) => option.id === event.target.value);
                        if (next !== undefined) {
                          changeGridDivision(next.id);
                        }
                      }}
                      onKeyDown={(event) => {
                        if (
                          exportOpenRef.current ||
                          (event.code !== 'Digit1' &&
                            event.code !== 'Digit2' &&
                            event.code !== 'Digit3') ||
                          event.ctrlKey ||
                          event.metaKey ||
                          event.altKey ||
                          event.shiftKey
                        ) {
                          return;
                        }
                        event.preventDefault();
                        if (event.repeat) {
                          return;
                        }
                        if (event.code === 'Digit3') {
                          toggleGridTriplet();
                        } else {
                          stepGridDivision(event.code === 'Digit1' ? 'narrow' : 'widen');
                        }
                      }}
                      aria-label={studioGridStrings.menuLabel}
                      aria-keyshortcuts={tempoBpm !== null ? '1 2 3' : '1 2'}
                      title={gridDivisionTitle(gridDivisionId, gridLinesShown)}
                      className="h-6 shrink-0 rounded-md border border-outline bg-surface px-1 text-xs leading-none tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      data-testid="arrangement-grid-division"
                    >
                      {gridOptions
                        .filter((option) => option.family === 'seconds')
                        .map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      {tempoBpm !== null ? (
                        <optgroup
                          label={
                            gridTriplet
                              ? gridTripletGroupLabel(tempoBpm)
                              : gridMusicalGroupLabel(tempoBpm)
                          }
                        >
                          {gridOptions
                            .filter((option) => option.family === 'musical')
                            .map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                        </optgroup>
                      ) : null}
                    </select>
                    <button
                      type="button"
                      onClick={toggleEnvelopeMode}
                      aria-pressed={envelopeMode}
                      aria-keyshortcuts="A"
                      title={
                        envelopeMode
                          ? studioClipEnvelopeStrings.toggleOnTitle
                          : studioClipEnvelopeStrings.toggleOffTitle
                      }
                      className={cn(
                        'h-6 shrink-0 rounded-md border border-transparent bg-foreground/5 px-1.5 text-xs leading-none text-muted motion-safe:transition-[background-color,color]! motion-safe:duration-180! motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]! motion-reduce:transition-none! enabled:hover:bg-foreground/8 enabled:active:bg-foreground/12 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        envelopeMode &&
                          'border-accent bg-accent/20 text-accent hover:text-accent enabled:hover:bg-accent/20 enabled:active:bg-accent/20',
                      )}
                      data-testid="arrangement-envelope-toggle"
                    >
                      Env
                    </button>
                    <select
                      value={String(waveformZoom)}
                      onChange={(event) => {
                        const next = parseWaveformZoom(event.target.value);
                        if (next !== null) {
                          setWaveformZoom(next);
                          setStatus(waveformZoomStatus(next));
                        }
                      }}
                      aria-label={studioViewStrings.waveformZoomLabel}
                      title={studioViewStrings.waveformZoomTitle(waveformZoomPercent(waveformZoom))}
                      className={cn(
                        'h-6 shrink-0 appearance-none rounded-md border border-outline bg-surface px-1 text-xs leading-none tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                        waveformZoom !== WAVEFORM_ZOOM_DEFAULT &&
                          'border-accent bg-accent/20 text-accent',
                      )}
                      data-testid="arrangement-waveform-zoom"
                    >
                      {WAVEFORM_ZOOM_LEVELS.map((level) => (
                        <option key={level} value={String(level)}>
                          {waveformZoomLabel(level)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <ArrangementRuler
                    seconds={timelineSeconds}
                    pxPerSecond={pxPerSecond}
                    onSeek={seekTo}
                    onScrub={scrubPlayhead}
                    onScrubEnd={endPlayheadScrub}
                    onGestureClaim={claimPointerGesture}
                    getTimelineView={getTimelineView}
                    applyTimelineView={applyTimelineView}
                    onNavigationMove={pauseFollowForNavigation}
                    onRulerDoubleClick={handleRulerDoubleClick}
                    snapSeconds={snapEnabled ? gridSeconds : null}
                    gridSeconds={gridSeconds}
                    getSnapMarkerTimes={getRulerSnapMarkerTimes}
                  />
                </div>
                <ArrangementTempoRow
                  seconds={timelineSeconds}
                  pxPerSecond={pxPerSecond}
                  tempoBpm={tempoBpm}
                  onTempoChange={changeTempo}
                  onTempoInvalid={rejectTempo}
                  metronomeOn={metronomeOn}
                  onMetronomeToggle={toggleMetronome}
                  getTimelineView={getTimelineView}
                  getTimelineViewportPx={getTimelineViewportPx}
                  subscribeTimelineScroll={subscribeTimelineScroll}
                />
                <ArrangementMarkerRow
                  ref={markerRowRef}
                  timelineWidth={timelineWidth}
                  pxPerSecond={pxPerSecond}
                  snapSeconds={snapEnabled ? gridSeconds : null}
                  gridSeconds={gridSeconds}
                />
                <div className="flex">
                  <div
                    className="sticky left-0 z-30 flex h-4 shrink-0 items-center overflow-hidden whitespace-nowrap border-r border-b border-outline bg-surface px-2 text-xs text-muted"
                    style={{ width: ARRANGEMENT_HEADER_WIDTH_PX }}
                  >
                    {loopTimesText ? (
                      <span
                        className="font-mono tracking-tight tabular-nums"
                        title={loopTimesText}
                        data-testid="arrangement-loop-times"
                      >
                        {loopTimesText}
                      </span>
                    ) : (
                      <span className="text-label font-medium uppercase tracking-label">Loop</span>
                    )}
                  </div>
                  <ArrangementLoopBrace
                    seconds={timelineSeconds}
                    pxPerSecond={pxPerSecond}
                    snapSeconds={snapEnabled ? gridSeconds : null}
                    gridSeconds={gridSeconds}
                  />
                </div>
              </div>
              {trackRows.map((row) =>
                row.kind === 'group' ? (
                  <ArrangementGroupHeader
                    key={`group:${row.id}`}
                    group={row.group}
                    depth={row.depth}
                    selected={selectedTrackRowIds.has(row.id)}
                    timelineWidth={timelineWidth}
                    collapsed={trackLaneLayout.collapsedGroups[row.id] === true}
                    containsActive={
                      activeTrackId !== null &&
                      trackLaneLayout.collapsedGroups[row.id] === true &&
                      trackGroupDescendantTrackIds(arrangement, row.id).includes(activeTrackId)
                    }
                    overviewClips={trackGroupOverviews.get(row.id) ?? NO_TRACK_GROUP_OVERVIEW}
                    pxPerSecond={pxPerSecond}
                    onSelectGroup={selectTrackRow}
                    onRenameGroup={renameTrackGroupRow}
                    onToggleCollapse={toggleTrackGroupCollapse}
                  />
                ) : (
                  <ArrangementLane
                    key={row.id}
                    track={row.track}
                    selected={selectedTrackRowIds.has(row.id)}
                    depth={row.depth}
                    onSelectTrack={selectTrackRow}
                    timelineWidth={timelineWidth}
                    onBackgroundPointerDown={handleLaneBackgroundPointerDown}
                    onGridMenuRequest={handleGridMenuRequest}
                    height={trackLaneLayout.heights[row.id] ?? TRACK_DEFAULT_HEIGHT_PX}
                    folded={trackLaneLayout.folded[row.id] ?? false}
                    isMotionArmed={trackLaneLayout.isMotionArmed}
                    onToggleTrackFold={toggleTrackFold}
                    onChangeTrackHeight={changeTrackHeight}
                    onSnapshotTrackLayout={snapshotTrackLaneLayout}
                    gridSeconds={gridSeconds}
                    snapSeconds={snapEnabled ? gridSeconds : null}
                    envelopeMode={envelopeMode}
                    waveformZoom={waveformZoom}
                  />
                ),
              )}
              {marquee ? (
                <div
                  className="pointer-events-none absolute z-20 border border-brand bg-brand/10"
                  style={marquee}
                  data-testid="arrangement-marquee"
                />
              ) : null}
              <ArrangementPlayheadLine pxPerSecond={pxPerSecond} />
            </div>
          </div>
          <ArrangementDetailPanel
            selection={detailSelection}
            group={detailGroup}
            peaks={detailPeaks}
            range={range}
            setTimeRange={setTimeRange}
            setStatus={setStatus}
            isPointerGestureActive={isPointerGestureActive}
            setClipGain={workspace.setClipGain}
            getArrangement={workspace.getArrangement}
            previewClipGainFader={workspace.previewClipGainFader}
            commitClipGainFader={workspace.commitClipGainFader}
            beginClipGainFaderGesture={workspace.beginClipGainFaderGesture}
            blurClipGainFader={workspace.blurClipGainFader}
            setClipGainMembers={workspace.setClipGainMembers}
            previewClipGainMembers={workspace.previewClipGainMembers}
            commitClipGainMembers={workspace.commitClipGainMembers}
            beginClipGainMembersGesture={workspace.beginClipGainMembersGesture}
            blurClipGainMembers={workspace.blurClipGainMembers}
            claimPointerGesture={claimPointerGesture}
            measureTimelineFit={measureTimelineFit}
            openHeightCap={trackLaneLayout.detailCap}
            isLaneAutoFitOn={trackLaneLayout.autoFit}
            onUserResize={markDetailPanelUserResized}
            panelRef={detailPanelRef}
          />
        </div>
      </div>
      <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-outline bg-surface px-3 py-1.5 text-xs">
        <output
          className="block w-full basis-full break-words text-foreground"
          aria-live="polite"
          data-testid="arrangement-status"
        >
          <span key={statusSequence}>{status}</span>
        </output>
        {range ? (
          <p className="tabular-nums text-foreground" data-testid="arrangement-range">
            <ArrangementTimeText
              parts={studioTimeTextParts.rangeReadout({
                start: formatArrangementTime(range.start),
                end: formatArrangementTime(range.end),
                length: formatArrangementTime(range.end - range.start),
              })}
            />{' '}
            {range.allTracks ? (
              <span data-testid="arrangement-range-all-lanes">
                {studioEditStrings.allTracks} ·{' '}
              </span>
            ) : null}
            <span className="text-accent" data-testid="arrangement-delete-hint">
              {studioWorkspaceStrings.rangeDeleteHint}
            </span>
          </p>
        ) : null}
        {selectedClipIds.length > 1 ? (
          <p className="font-medium text-brand" data-testid="arrangement-selection-count">
            {studioWorkspaceStrings.clipsSelected(selectedClipIds.length)}
          </p>
        ) : null}
        {selectedClip ? (
          <p
            className="basis-full truncate tabular-nums text-muted"
            title={studioWorkspaceStrings.selectedClipTitle({
              title: selectedTitle ?? selectedClip.sourceId,
              start: formatArrangementTime(selectedClip.start),
              length: formatArrangementTime(selectedClip.duration),
              offset: formatArrangementTime(selectedClip.sourceOffset),
            })}
            data-testid="arrangement-selected-clip"
          >
            {studioWorkspaceStrings.clipLabel}{' '}
            <span className="text-foreground">{selectedTitle}</span>
            <ArrangementTimeText
              parts={studioTimeTextParts.selectedClipDetail({
                start: formatArrangementTime(selectedClip.start),
                length: formatArrangementTime(selectedClip.duration),
                offset: formatArrangementTime(selectedClip.sourceOffset),
              })}
            />
          </p>
        ) : (
          <p
            className="basis-full tabular-nums text-muted"
            aria-hidden="true"
            data-testid="arrangement-selected-clip-reserve"
          >
            &nbsp;
          </p>
        )}
        {clipLaneDrag ? (
          <p className="text-muted" data-testid="arrangement-lane-move-hint">
            {laneMoveRefusal ? (
              <span className="font-medium text-accent" data-testid="arrangement-lane-move-refusal">
                {laneMoveRefusal} ·{' '}
              </span>
            ) : null}
            {clipLaneDrag.timeLocked ? CLIP_LANE_SHIFT_LOCKED_HINT : CLIP_LANE_SHIFT_HINT}
          </p>
        ) : (
          <p className="text-dim" data-testid="arrangement-shortcut-hint">
            Space · Home · Ctrl+E · Ctrl+D · Ctrl+C / X / V · Ctrl+Shift+X (Cut Time) · Ctrl+Shift+L
            · Ctrl+L · Ctrl+A · Delete / Backspace · Ctrl+Z / Ctrl+Shift+Z · ←/→ · Enter · +/− · Z/X
            · Ctrl+wheel · Ctrl+G / Ctrl+Shift+G · F2 · U
          </p>
        )}
      </footer>
      {gridMenu ? (
        <ArrangementGridMenu
          x={gridMenu.x}
          y={gridMenu.y}
          divisions={gridOptions}
          checkedId={gridDivisionId}
          snapEnabled={snapEnabled}
          onChooseDivision={chooseGridMenuDivision}
          onToggleSnap={toggleGridMenuSnap}
          tripletChecked={tempoBpm !== null ? gridTriplet : null}
          onToggleTriplet={toggleGridMenuTriplet}
          onClose={closeGridMenu}
        />
      ) : null}
      <ArrangementExportDialog isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
    </div>
  );
}
