import {
  type KeyboardEvent,
  memo,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  formatArrangementTime,
  GESTURE_EDIT_BLOCKED_MESSAGE,
  useArrangementPositionWriter,
} from '~/contexts/ArrangementContext';
import { useIsomorphicLayoutEffect } from '~/hooks/useIsomorphicLayoutEffect';
import { useRelativeFaderDrag } from '~/hooks/useRelativeFaderDrag';
import {
  clipGainMemberSpan,
  formatClipGainMembersStatus,
  formatClipGainRange,
} from '~/lib/arrangement/clip-gain-multi';
import {
  CLIP_GAIN_MAX_DB,
  CLIP_GAIN_MIN_DB,
  clipLinearGain,
  formatMasterGainDb,
  normalizeClipGainDb,
} from '~/lib/arrangement/model';
import {
  clampDetailPanelHeight,
  clampDetailRangeToClip,
  DETAIL_PANEL_COLLAPSED_HEIGHT_PX,
  DETAIL_PANEL_DEFAULT_HEIGHT_PX,
  DETAIL_PANEL_MAX_HEIGHT_PX,
  DETAIL_PANEL_MIN_HEIGHT_PX,
  DETAIL_RANGE_INVALID_MESSAGE,
  type DetailPanelFitMetrics,
  detailPanelStartsOpen,
  stepDetailPanelHeight,
} from '~/lib/arrangement/panels';
import { studioDetailStrings } from '~/lib/arrangement/strings';
import { cn } from '~/lib/utils';
import type { Arrangement, ArrangementClip, TimeRange } from '~/types/arrangement';
import { buildPeakShape } from './ArrangementClip';
import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar';

const DETAIL_PANEL_TITLE = studioDetailStrings.panelTitle;
const DETAIL_NOTHING_SELECTED = studioDetailStrings.nothingSelected;
const DETAIL_NO_SELECTION_HINT = studioDetailStrings.noSelectionHint;
const DETAIL_GROUP_NOTE = studioDetailStrings.multiClipNote;
const DETAIL_VIDEO_PLACEHOLDER = studioDetailStrings.videoPlaceholder;
const DETAIL_INPUTS_GROUP_REASON = studioDetailStrings.rangeMultiReason;
const DETAIL_INPUTS_NONE_REASON = studioDetailStrings.noneReason;
const DETAIL_SOURCE_UNCHANGED = studioDetailStrings.sourceUnchanged;
const DETAIL_PEAK_COLUMNS = 480;
const DETAIL_CLIP_GAIN_STEP_DB = 0.1;
const DETAIL_CLIP_GAIN_FINE_DIVISOR = 10;
const DETAIL_CLIP_GAIN_GROUP_REASON = studioDetailStrings.clipGainMultiReason;
const DETAIL_CLIP_GAIN_VIDEO_REASON = studioDetailStrings.clipGainVideoReason;
const DETAIL_CLIP_GAIN_INVALID_MESSAGE = studioDetailStrings.clipGainInvalid;
const DETAIL_CLIP_GAIN_PENDING_FULL_TEXT = studioDetailStrings.pendingFull;
const DETAIL_CLIP_GAIN_PENDING_LABEL = studioDetailStrings.pendingLabel;
const DETAIL_CLIP_GAIN_PENDING_HINT = DETAIL_CLIP_GAIN_PENDING_FULL_TEXT.slice(
  DETAIL_CLIP_GAIN_PENDING_LABEL.length,
);

export interface ArrangementDetailSelection {
  clip: ArrangementClip;
  title: string;
  laneName: string;
  isVideo: boolean;
}

export interface ArrangementDetailGroup {
  count: number;
  laneNames: string;
  earliestStart: number;
  spanLength: number;
  clipIds: readonly string[];
  hasNonAudioClip: boolean;
  minClipGainDb: number;
  maxClipGainDb: number;
}

interface ArrangementDetailContentProps {
  selection: ArrangementDetailSelection | null;
  group: ArrangementDetailGroup | null;
  peaks: Float32Array | undefined;
  range: TimeRange | null;
  setTimeRange: (range: TimeRange | null) => void;
  setStatus: (message: string) => void;
  isPointerGestureActive: () => boolean;
  setClipGain?: (clipId: string, gainDb: number) => boolean;
  getArrangement?: () => Arrangement;
  previewClipGainFader?: (clipId: string, gainDb: number) => void;
  commitClipGainFader?: (clipId?: string) => void;
  beginClipGainFaderGesture?: (clipId: string, pointerId: number) => boolean;
  blurClipGainFader?: (clipId: string) => void;
  setClipGainMembers?: (clipIds: readonly string[], gainDb: number) => boolean;
  previewClipGainMembers?: (clipIds: readonly string[], anchorDb: number) => void;
  commitClipGainMembers?: (clipIds?: readonly string[]) => void;
  beginClipGainMembersGesture?: (clipIds: readonly string[], pointerId: number) => boolean;
  blurClipGainMembers?: (clipIds: readonly string[]) => void;
}

export interface ArrangementDetailPanelProps extends ArrangementDetailContentProps {
  claimPointerGesture: (pointerId: number, abort: () => void) => (() => void) | null;
  measureTimelineFit: () => DetailPanelFitMetrics | null;
  openHeightCap?: number | null;
  isLaneAutoFitOn?: boolean;
  onUserResize?: () => () => void;
  panelRef?: RefObject<HTMLElement>;
}

interface DetailPanelSize {
  isCollapsed: boolean;
  expandedHeight: number;
}

function detailRangeAppliedMessage(range: TimeRange, laneName: string): string {
  return studioDetailStrings.rangeApplied({
    start: formatArrangementTime(range.start),
    end: formatArrangementTime(range.end),
    track: laneName,
  });
}

function rangeInputText(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function parseSecondsInput(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

function clipGainInputText(gainDb: number | undefined): string {
  return (gainDb ?? 0).toFixed(1);
}

function ArrangementDetailPlayhead({
  clipStart,
  clipDuration,
}: {
  clipStart: number;
  clipDuration: number;
}) {
  const playheadRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(false);
  const writeDetailPlayhead = useCallback(
    (position: number) => {
      const playhead = playheadRef.current;
      if (!playhead) {
        return;
      }
      const inside =
        clipDuration > 0 && position >= clipStart && position <= clipStart + clipDuration;
      if (inside) {
        playhead.style.transform = `translateX(${((position - clipStart) / clipDuration) * 100}%)`;
      }
      if (inside !== visibleRef.current) {
        visibleRef.current = inside;
        playhead.style.display = inside ? 'block' : 'none';
      }
    },
    [clipStart, clipDuration],
  );
  useArrangementPositionWriter(writeDetailPlayhead);
  return (
    <div
      ref={playheadRef}
      className="pointer-events-none absolute inset-0 z-10 will-change-transform"
      style={{ display: 'none' }}
      data-testid="arrangement-detail-playhead"
    >
      <div className="absolute inset-y-0 left-0 w-px bg-accent" />
    </div>
  );
}

function ArrangementDetailWaveform({
  selection,
  peaks,
  range,
  videoClipGainReason,
}: {
  selection: ArrangementDetailSelection;
  peaks: Float32Array | undefined;
  range: TimeRange | null;
  videoClipGainReason?: ReactNode;
}) {
  const { clip } = selection;
  const gainScale = clipLinearGain(clip);
  const peakShape = useMemo(
    () =>
      selection.isVideo
        ? null
        : buildPeakShape(peaks, clip.sourceOffset, clip.duration, DETAIL_PEAK_COLUMNS, gainScale),
    [selection.isVideo, peaks, clip.sourceOffset, clip.duration, gainScale],
  );
  const clipEnd = clip.start + clip.duration;
  const overlay =
    range &&
    clip.duration > 0 &&
    range.trackId === clip.trackId &&
    range.end > clip.start &&
    range.start < clipEnd
      ? {
          left: ((Math.max(range.start, clip.start) - clip.start) / clip.duration) * 100,
          width:
            ((Math.min(range.end, clipEnd) - Math.max(range.start, clip.start)) / clip.duration) *
            100,
        }
      : null;
  return (
    <div
      className="relative min-h-0 min-w-32 flex-1 overflow-hidden rounded-sm border border-outline bg-background text-brand/70 contain-strict"
      data-testid="arrangement-detail-waveform"
    >
      {selection.isVideo ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-elevated px-2 text-center">
          <p className="text-muted" data-testid="arrangement-detail-video-placeholder">
            {DETAIL_VIDEO_PLACEHOLDER}
          </p>
          {videoClipGainReason}
        </div>
      ) : peakShape ? (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${peakShape.columns} 2`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d={peakShape.path} fill="currentColor" />
        </svg>
      ) : null}
      {overlay ? (
        <div
          className="pointer-events-none absolute inset-y-0 border-x-2 border-foreground bg-foreground/30"
          style={{ left: `${overlay.left}%`, width: `${overlay.width}%` }}
          data-testid="arrangement-detail-range"
        />
      ) : null}
      <ArrangementDetailPlayhead clipStart={clip.start} clipDuration={clip.duration} />
    </div>
  );
}

function ArrangementDetailContentInner({
  selection,
  group,
  peaks,
  range,
  setTimeRange,
  setStatus,
  isPointerGestureActive,
  setClipGain,
  getArrangement,
  previewClipGainFader,
  commitClipGainFader,
  beginClipGainFaderGesture,
  blurClipGainFader,
  setClipGainMembers,
  previewClipGainMembers,
  commitClipGainMembers,
  beginClipGainMembersGesture,
  blurClipGainMembers,
}: ArrangementDetailContentProps) {
  const reasonId = useId();
  const clipGainReasonId = useId();
  const clipGainPendingId = useId();
  const clipGainRangeId = useId();
  const clip = selection?.clip ?? null;
  const clipGainDb = clip?.gainDb;
  const clipGainGroup = clip ? null : group;
  const clipGainSpanGroup = clipGainGroup?.hasNonAudioClip === false ? clipGainGroup : null;
  const clipGainMinDb = clipGainSpanGroup ? clipGainSpanGroup.minClipGainDb : (clipGainDb ?? 0);
  const clipGainMaxDb = clipGainSpanGroup ? clipGainSpanGroup.maxClipGainDb : (clipGainDb ?? 0);
  const isClipGainMixed = clipGainSpanGroup !== null && clipGainMinDb !== clipGainMaxDb;
  const clipGainRangeText = formatClipGainRange(clipGainMinDb, clipGainMaxDb);
  const displayedClipGainText = isClipGainMixed ? '' : clipGainInputText(clipGainMaxDb);
  const [clipGainText, setClipGainText] = useState(displayedClipGainText);
  const isContentMountedRef = useRef(false);
  const rangeOnClip =
    clip && range && range.trackId === clip.trackId && range.end > clip.start
      ? range.start < clip.start + clip.duration
      : false;
  const clipStart = clip?.start;
  const clipDuration = clip?.duration;
  const onClipStart = clip && range && rangeOnClip ? Math.max(range.start, clip.start) : null;
  const onClipEnd =
    clip && range && rangeOnClip ? Math.min(range.end, clip.start + clip.duration) : null;
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (clipStart === undefined || clipDuration === undefined) {
      return;
    }
    setStartText(rangeInputText(onClipStart ?? clipStart));
    setEndText(rangeInputText(onClipEnd ?? clipStart + clipDuration));
  }, [onClipStart, onClipEnd, clipStart, clipDuration]);

  useIsomorphicLayoutEffect(() => {
    isContentMountedRef.current = true;
    return () => {
      isContentMountedRef.current = false;
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    setClipGainText(displayedClipGainText);
  }, [displayedClipGainText]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    const preventFocusedNumberInputWheel = (event: WheelEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement &&
        target.type === 'number' &&
        target === document.activeElement
      ) {
        event.preventDefault();
      }
    };
    content.addEventListener('wheel', preventFocusedNumberInputWheel, { passive: false });
    return () => content.removeEventListener('wheel', preventFocusedNumberInputWheel);
  }, []);

  const inputsReason = clip ? null : group ? DETAIL_INPUTS_GROUP_REASON : DETAIL_INPUTS_NONE_REASON;

  const applyDetailRange = () => {
    if (!selection) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const target = selection.clip;
    const clipEnd = target.start + target.duration;
    const clamped = clampDetailRangeToClip({
      start: parseSecondsInput(startText),
      end: parseSecondsInput(endText),
      clipStart: target.start,
      clipEnd,
    });
    if (!clamped) {
      setStatus(DETAIL_RANGE_INVALID_MESSAGE);
      return;
    }
    const next: TimeRange = { ...clamped, trackId: target.trackId };
    setStartText(rangeInputText(clamped.start));
    setEndText(rangeInputText(clamped.end));
    setTimeRange(next);
    setStatus(detailRangeAppliedMessage(next, selection.laneName));
  };

  const handleRangeInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        applyDetailRange();
      }
    }
  };

  const clipGainReason = clip
    ? selection?.isVideo
      ? DETAIL_CLIP_GAIN_VIDEO_REASON
      : null
    : group
      ? group.hasNonAudioClip
        ? DETAIL_CLIP_GAIN_GROUP_REASON
        : null
      : DETAIL_INPUTS_NONE_REASON;
  const isClipGainPending = clipGainReason === null && clipGainText !== displayedClipGainText;

  const commitClipGainMembersText = (trigger: 'enter' | 'blur', clipIds: readonly string[]) => {
    if (clipGainText === displayedClipGainText) {
      if (trigger === 'enter') {
        setStatus(studioDetailStrings.clipGainUnchanged(clipGainRangeText));
      }
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      if (trigger === 'enter') {
        setClipGainText(displayedClipGainText);
      }
      return;
    }
    const value = parseSecondsInput(clipGainText);
    if (!Number.isFinite(value)) {
      setStatus(DETAIL_CLIP_GAIN_INVALID_MESSAGE);
      setClipGainText(displayedClipGainText);
      return;
    }
    const stored = normalizeClipGainDb(value);
    if (setClipGainMembers?.(clipIds, value)) {
      setStatus(formatClipGainMembersStatus({ clipIds, minDb: stored, maxDb: stored }));
      setClipGainText(clipGainInputText(stored));
      return;
    }
    if (trigger === 'enter') {
      setStatus(studioDetailStrings.clipGainUnchanged(clipGainRangeText));
    }
    setClipGainText(displayedClipGainText);
  };

  const commitClipGain = (trigger: 'enter' | 'blur') => {
    if (clipGainReason !== null || !isContentMountedRef.current) {
      return;
    }
    if (!selection) {
      if (clipGainGroup) {
        commitClipGainMembersText(trigger, clipGainGroup.clipIds);
      }
      return;
    }
    const currentText = clipGainInputText(selection.clip.gainDb);
    if (trigger === 'blur' && clipGainText === currentText) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      if (trigger === 'enter') {
        setClipGainText(currentText);
      }
      return;
    }
    const value = parseSecondsInput(clipGainText);
    if (!Number.isFinite(value)) {
      setStatus(DETAIL_CLIP_GAIN_INVALID_MESSAGE);
      setClipGainText(currentText);
      return;
    }
    const stored = normalizeClipGainDb(value);
    if (setClipGain?.(selection.clip.id, value)) {
      setStatus(`Clip Gain: ${selection.title} — ${formatMasterGainDb(stored)}.`);
      setClipGainText(clipGainInputText(stored));
      return;
    }
    if (trigger === 'enter') {
      setStatus(
        studioDetailStrings.clipGainUnchanged(formatMasterGainDb(selection.clip.gainDb ?? 0)),
      );
    }
    setClipGainText(currentText);
  };

  const handleClipGainKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!event.repeat) {
        commitClipGain('enter');
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setClipGainText(displayedClipGainText);
    }
  };

  const clipGainInputRef = useRef<HTMLInputElement>(null);
  const clipGainDragIdsRef = useRef<readonly string[] | null>(null);
  const selectedClipGainIds: readonly string[] | null = clip
    ? [clip.id]
    : (clipGainGroup?.clipIds ?? null);
  const isClipGainFaderEnabled =
    clipGainReason === null &&
    selectedClipGainIds !== null &&
    (clipGainGroup ? previewClipGainMembers : previewClipGainFader) !== undefined;

  const clipGainTargetIds = (): readonly string[] | null => {
    const dragIds = clipGainDragIdsRef.current;
    if (dragIds !== null && isPointerGestureActive()) {
      return dragIds;
    }
    clipGainDragIdsRef.current = null;
    return selectedClipGainIds;
  };

  const readClipGainAnchorDb = (clipIds: readonly string[]): number => {
    const arrangement = getArrangement?.();
    return (arrangement ? clipGainMemberSpan(arrangement, clipIds)?.maxDb : undefined) ?? 0;
  };

  const previewClipGainTargets = (clipIds: readonly string[], value: number) => {
    const [firstId] = clipIds;
    if (clipIds.length > 1) {
      previewClipGainMembers?.(clipIds, value);
    } else if (firstId !== undefined) {
      previewClipGainFader?.(firstId, value);
    }
  };

  const clipGainFaderDrag = useRelativeFaderDrag({
    min: CLIP_GAIN_MIN_DB,
    max: CLIP_GAIN_MAX_DB,
    step: DETAIL_CLIP_GAIN_STEP_DB,
    fineDivisor: DETAIL_CLIP_GAIN_FINE_DIVISOR,
    readStoredValue: () => {
      const clipIds = clipGainTargetIds();
      return clipIds === null ? 0 : readClipGainAnchorDb(clipIds);
    },
    isPointerGestureActive,
    beginGesture: (pointerId) => {
      const clipIds = selectedClipGainIds;
      const [firstId] = clipIds ?? [];
      if (clipIds === null || firstId === undefined) {
        return false;
      }
      const isBegun =
        clipIds.length > 1
          ? beginClipGainMembersGesture?.(clipIds, pointerId) === true
          : beginClipGainFaderGesture?.(firstId, pointerId) === true;
      clipGainDragIdsRef.current = isBegun ? clipIds : null;
      return isBegun;
    },
    previewValue: (value) => {
      const clipIds = clipGainTargetIds();
      if (clipIds !== null) {
        previewClipGainTargets(clipIds, value);
      }
    },
    refuseGesture: () => setStatus(GESTURE_EDIT_BLOCKED_MESSAGE),
  });

  const handleClipGainFaderPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    if (!isClipGainFaderEnabled) {
      return;
    }
    clipGainFaderDrag.onPointerDown(event);
  };

  const commitClipGainFaderValue = () => {
    const clipIds = clipGainTargetIds();
    const [firstId] = clipIds ?? [];
    if (clipIds !== null && clipIds.length > 1) {
      commitClipGainMembers?.(clipIds);
    } else if (firstId !== undefined) {
      commitClipGainFader?.(firstId);
    }
  };

  const blurClipGainFaderValue = () => {
    const clipIds = clipGainTargetIds();
    const [firstId] = clipIds ?? [];
    if (clipIds !== null && clipIds.length > 1) {
      blurClipGainMembers?.(clipIds);
    } else if (firstId !== undefined) {
      blurClipGainFader?.(firstId);
    }
  };

  const resetClipGainMembers = (
    clipIds: readonly string[],
    trigger: 'button' | 'fader',
  ): boolean => {
    const isReset = setClipGainMembers?.(clipIds, 0) === true;
    if (isReset) {
      setStatus(formatClipGainMembersStatus({ clipIds, minDb: 0, maxDb: 0 }));
    } else if (trigger === 'button') {
      setStatus(studioDetailStrings.clipGainUnchanged(formatMasterGainDb(0)));
    }
    return isReset;
  };

  const resetClipGainFader = () => {
    const [firstId] = selectedClipGainIds ?? [];
    if (!isClipGainFaderEnabled || selectedClipGainIds === null || firstId === undefined) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    if (selectedClipGainIds.length > 1) {
      resetClipGainMembers(selectedClipGainIds, 'fader');
      return;
    }
    previewClipGainFader?.(firstId, 0);
    commitClipGainFader?.(firstId);
  };

  const resetClipGain = (resetButton: HTMLButtonElement) => {
    if (clipGainReason !== null) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    const resetHeldFocus = document.activeElement === resetButton;
    if (!selection) {
      const isGroupReset = clipGainGroup
        ? resetClipGainMembers(clipGainGroup.clipIds, 'button')
        : false;
      setClipGainText(clipGainInputText(0));
      if (isGroupReset && resetHeldFocus) {
        clipGainInputRef.current?.focus();
      }
      return;
    }
    const isReset = setClipGain?.(selection.clip.id, 0) === true;
    setStatus(
      isReset
        ? `Clip Gain: ${selection.title} — ${formatMasterGainDb(0)}.`
        : studioDetailStrings.clipGainUnchanged(formatMasterGainDb(0)),
    );
    setClipGainText(clipGainInputText(0));
    if (isReset && resetHeldFocus) {
      clipGainInputRef.current?.focus();
    }
  };

  const isGroupState = !clip && group !== null;
  const isNoneState = !clip && group === null;
  const rangeReasonNode = inputsReason ? (
    <p id={reasonId} className="text-dim" data-testid="arrangement-detail-reason">
      {inputsReason}
    </p>
  ) : null;
  const clipGainReasonNode = clipGainReason ? (
    <p id={clipGainReasonId} className="text-dim" data-testid="arrangement-detail-clip-gain-reason">
      {clipGainReason}
    </p>
  ) : null;

  const inputClass =
    'h-6 w-20 rounded-sm border border-outline-strong bg-background px-1 font-mono tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim';

  return (
    <div
      ref={contentRef}
      className={cn('flex min-h-0 flex-1 gap-3 overflow-y-auto px-3 py-2', STUDIO_SCROLLBAR_CLASS)}
      data-testid="arrangement-detail-content"
    >
      <div className="flex w-72 shrink-0 flex-col gap-0.5 leading-4">
        {selection ? (
          <>
            <p className="shrink-0 truncate font-medium text-foreground" title={selection.title}>
              {selection.title}
            </p>
            <p className="shrink-0 truncate">
              <span className="text-dim">{studioDetailStrings.trackLabel}</span>{' '}
              <span className="text-foreground">{selection.laneName}</span>
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">{studioDetailStrings.startLabel}</span>{' '}
              <span className="text-foreground">{formatArrangementTime(selection.clip.start)}</span>{' '}
              · <span className="font-sans text-dim">{studioDetailStrings.lengthLabel}</span>{' '}
              <span className="text-foreground">
                {formatArrangementTime(selection.clip.duration)}
              </span>
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">{studioDetailStrings.sourceOffsetLabel}</span>{' '}
              <span className="text-foreground">
                {formatArrangementTime(selection.clip.sourceOffset)}
              </span>
            </p>
            <p className="text-dim">{DETAIL_SOURCE_UNCHANGED}</p>
          </>
        ) : group ? (
          <div data-testid="arrangement-detail-group" className="flex flex-col gap-0.5">
            <p className="font-medium text-brand">{studioDetailStrings.clipCount(group.count)}</p>
            <p className="shrink-0 truncate text-foreground" title={group.laneNames}>
              <span className="text-dim">{studioDetailStrings.tracksLabel}</span> {group.laneNames}
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">{studioDetailStrings.startLabel}</span>{' '}
              <span className="text-foreground">{formatArrangementTime(group.earliestStart)}</span>{' '}
              · <span className="font-sans text-dim">{studioDetailStrings.lengthLabel}</span>{' '}
              <span className="text-foreground">{formatArrangementTime(group.spanLength)}</span>
            </p>
            <p className="text-dim">{DETAIL_GROUP_NOTE}</p>
          </div>
        ) : (
          <p className="text-muted" data-testid="arrangement-detail-hint">
            {DETAIL_NO_SELECTION_HINT}
          </p>
        )}
      </div>
      {selection ? (
        <ArrangementDetailWaveform
          selection={selection}
          peaks={peaks}
          range={range}
          videoClipGainReason={selection.isVideo ? clipGainReasonNode : null}
        />
      ) : (
        <div className="flex min-w-32 flex-1 flex-col gap-0.5 rounded-sm border border-outline bg-background px-2 py-1">
          {isGroupState ? rangeReasonNode : null}
          {isGroupState ? clipGainReasonNode : null}
        </div>
      )}
      <div className="flex w-44 shrink-0 flex-col gap-1">
        <div className="flex gap-1">
          <label className="flex flex-col text-dim">
            {studioDetailStrings.rangeFromLabel}
            <input
              type="number"
              step={0.001}
              value={startText}
              onChange={(event) => setStartText(event.target.value)}
              onKeyDown={handleRangeInputKeyDown}
              disabled={!clip}
              title={inputsReason ?? undefined}
              aria-label={studioDetailStrings.rangeStartLabel}
              aria-describedby={inputsReason ? reasonId : undefined}
              className={inputClass}
              data-testid="arrangement-detail-start"
            />
          </label>
          <label className="flex flex-col text-dim">
            {studioDetailStrings.rangeToLabel}
            <input
              type="number"
              step={0.001}
              value={endText}
              onChange={(event) => setEndText(event.target.value)}
              onKeyDown={handleRangeInputKeyDown}
              disabled={!clip}
              title={inputsReason ?? undefined}
              aria-label={studioDetailStrings.rangeEndLabel}
              aria-describedby={inputsReason ? reasonId : undefined}
              className={inputClass}
              data-testid="arrangement-detail-end"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={applyDetailRange}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && event.repeat) {
              event.preventDefault();
            }
          }}
          disabled={!clip}
          title={inputsReason ?? undefined}
          className="h-6 w-fit rounded-sm border border-outline px-2 text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim"
          data-testid="arrangement-detail-apply"
        >
          {studioDetailStrings.applyRange}
        </button>
        {isNoneState ? rangeReasonNode : null}
      </div>
      <div className="flex w-52 shrink-0 flex-col gap-1" data-testid="arrangement-detail-clip-gain">
        <label className="flex flex-col text-dim">
          Clip Gain, dB
          <span className="flex items-center gap-1">
            <input
              ref={clipGainInputRef}
              type="number"
              step={DETAIL_CLIP_GAIN_STEP_DB}
              min={CLIP_GAIN_MIN_DB}
              max={CLIP_GAIN_MAX_DB}
              value={clipGainText}
              onChange={(event) => setClipGainText(event.target.value)}
              onKeyDown={handleClipGainKeyDown}
              onBlur={() => commitClipGain('blur')}
              disabled={clipGainReason !== null}
              title={
                clipGainReason ??
                (isClipGainPending
                  ? DETAIL_CLIP_GAIN_PENDING_FULL_TEXT
                  : isClipGainMixed
                    ? clipGainRangeText
                    : undefined)
              }
              aria-label="Clip Gain (dB)"
              aria-describedby={
                clipGainReason
                  ? clipGainReasonId
                  : [
                      isClipGainMixed ? clipGainRangeId : null,
                      isClipGainPending ? clipGainPendingId : null,
                    ]
                      .filter((id) => id !== null)
                      .join(' ') || undefined
              }
              data-pending={isClipGainPending ? 'true' : undefined}
              className={cn(
                inputClass,
                'shrink-0',
                isClipGainPending && 'border-warning focus-visible:ring-warning',
              )}
              data-testid="arrangement-detail-clip-gain-input"
            />
            {isClipGainMixed ? (
              <span
                id={clipGainRangeId}
                className="whitespace-nowrap font-mono tabular-nums text-foreground"
                data-testid="arrangement-detail-clip-gain-range"
              >
                {clipGainRangeText}
              </span>
            ) : null}
          </span>
        </label>
        <div className="flex items-center gap-1">
          <input
            ref={clipGainFaderDrag.ref}
            type="range"
            min={CLIP_GAIN_MIN_DB}
            max={CLIP_GAIN_MAX_DB}
            step={DETAIL_CLIP_GAIN_STEP_DB}
            value={clipGainMaxDb}
            onChange={(event) => {
              const clipIds = clipGainTargetIds();
              if (isClipGainFaderEnabled && clipIds !== null) {
                previewClipGainTargets(clipIds, Number(event.target.value));
              }
            }}
            onPointerDown={handleClipGainFaderPointerDown}
            onDoubleClick={resetClipGainFader}
            onPointerUp={commitClipGainFaderValue}
            onLostPointerCapture={commitClipGainFaderValue}
            onKeyUp={() => {
              if (!isPointerGestureActive()) {
                commitClipGainFaderValue();
              }
            }}
            onBlur={blurClipGainFaderValue}
            disabled={!isClipGainFaderEnabled}
            title={clipGainReason ?? undefined}
            aria-label="Clip Gain — fader"
            aria-valuetext={clipGainRangeText}
            aria-describedby={clipGainReason ? clipGainReasonId : undefined}
            className="h-4 w-24 shrink-0 touch-none accent-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            data-testid="arrangement-detail-clip-gain-fader"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => resetClipGain(event.currentTarget)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && event.repeat) {
                event.preventDefault();
              }
            }}
            disabled={
              clipGainReason !== null ||
              (clipGainGroup
                ? clipGainMinDb === 0 && clipGainMaxDb === 0
                : clipGainDb === undefined)
            }
            title={clipGainReason ?? undefined}
            aria-label={studioDetailStrings.clipGainResetLabel}
            className="h-6 w-fit rounded-sm border border-outline px-2 text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim"
            data-testid="arrangement-detail-clip-gain-reset"
          >
            0 dB
          </button>
          {isClipGainPending ? (
            <p
              id={clipGainPendingId}
              className="min-w-0 truncate text-warning"
              title={DETAIL_CLIP_GAIN_PENDING_FULL_TEXT}
              data-testid="arrangement-detail-clip-gain-pending"
            >
              {DETAIL_CLIP_GAIN_PENDING_LABEL}
              <span className="sr-only">{DETAIL_CLIP_GAIN_PENDING_HINT}</span>
            </p>
          ) : null}
        </div>
        {isNoneState ? clipGainReasonNode : null}
      </div>
    </div>
  );
}

const ArrangementDetailContent = memo(ArrangementDetailContentInner);

export function ArrangementDetailPanel({
  claimPointerGesture,
  measureTimelineFit,
  openHeightCap = null,
  isLaneAutoFitOn = true,
  onUserResize,
  panelRef,
  ...contentProps
}: ArrangementDetailPanelProps) {
  const contentId = useId();
  const [size, setSize] = useState<DetailPanelSize>({
    isCollapsed: true,
    expandedHeight: DETAIL_PANEL_DEFAULT_HEIGHT_PX,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitionArmed, setIsTransitionArmed] = useState(false);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const openHeight =
    openHeightCap === null ? size.expandedHeight : Math.min(size.expandedHeight, openHeightCap);
  const openHeightRef = useRef(openHeight);
  openHeightRef.current = openHeight;
  const committedCapRef = useRef(openHeightCap);
  const committedOpenHeightRef = useRef(openHeight);
  const committedSizeRef = useRef(size);
  const isCapUpdate =
    committedCapRef.current !== openHeightCap &&
    committedOpenHeightRef.current !== openHeight &&
    committedSizeRef.current === size;
  const autoFitClampRef = useRef<{ from: number; to: number } | null>(null);
  const decidedRef = useRef(false);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (decidedRef.current) {
      return;
    }
    decidedRef.current = true;
    const metrics = measureTimelineFit();
    if (metrics && detailPanelStartsOpen(metrics)) {
      setSize((previous) => ({ ...previous, isCollapsed: false }));
    }
  }, [measureTimelineFit]);

  useIsomorphicLayoutEffect(() => {
    const releasedCap = committedCapRef.current;
    const isCapResize =
      releasedCap !== openHeightCap &&
      committedOpenHeightRef.current !== openHeight &&
      committedSizeRef.current === size;
    committedCapRef.current = openHeightCap;
    committedOpenHeightRef.current = openHeight;
    committedSizeRef.current = size;
    if (isCapResize) {
      setIsTransitionArmed(false);
    }
    if (
      releasedCap !== null &&
      openHeightCap === null &&
      !isLaneAutoFitOn &&
      size.expandedHeight > releasedCap
    ) {
      autoFitClampRef.current = { from: size.expandedHeight, to: releasedCap };
      setSize((previous) => ({
        ...previous,
        expandedHeight: Math.min(previous.expandedHeight, releasedCap),
      }));
    }
    const autoFitClamp = autoFitClampRef.current;
    if (autoFitClamp && isLaneAutoFitOn) {
      autoFitClampRef.current = null;
      setSize((previous) =>
        previous.expandedHeight === autoFitClamp.to
          ? { ...previous, expandedHeight: autoFitClamp.from }
          : previous,
      );
    }
  }, [openHeightCap, openHeight, size, isLaneAutoFitOn]);

  useEffect(() => () => dragCleanupRef.current?.(), []);

  const toggleDetailPanel = () => {
    setIsTransitionArmed(true);
    setSize((previous) => ({ ...previous, isCollapsed: !previous.isCollapsed }));
  };

  const handleToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== ' ') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) {
      toggleDetailPanel();
    }
  };

  const handleToggleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const handleSeparatorKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (dragCleanupRef.current) {
      return;
    }
    const renderedOpenHeight = openHeightRef.current;
    if (!sizeRef.current.isCollapsed) {
      autoFitClampRef.current = null;
      onUserResize?.();
    }
    setIsTransitionArmed(true);
    setSize((previous) =>
      previous.isCollapsed
        ? { ...previous, isCollapsed: false }
        : {
            isCollapsed: false,
            expandedHeight: stepDetailPanelHeight(
              renderedOpenHeight,
              event.key === 'ArrowUp' ? 1 : -1,
            ),
          },
    );
  };

  const handleSeparatorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.buttons === 0) {
      return;
    }
    let before = sizeRef.current;
    let undoUserResize: (() => void) | undefined;
    const pointerId = event.pointerId;
    const releaseGesture = claimPointerGesture(pointerId, () => {
      sizeRef.current = before;
      setSize(before);
      undoUserResize?.();
      cleanup();
    });
    if (!releaseGesture) {
      return;
    }
    before = sizeRef.current;
    event.preventDefault();
    event.stopPropagation();
    dragCleanupRef.current?.();
    const startY = event.clientY;
    const startHeight = openHeightRef.current;
    let hasResized = false;
    const handleMove = (move: PointerEvent) => {
      if (move.pointerId !== pointerId || (!hasResized && move.clientY === startY)) {
        return;
      }
      if (!hasResized) {
        hasResized = true;
        autoFitClampRef.current = null;
        undoUserResize = onUserResize?.();
      }
      setSize({
        isCollapsed: false,
        expandedHeight: clampDetailPanelHeight(startHeight - (move.clientY - startY)),
      });
    };
    const finish = (end: PointerEvent) => {
      if (end.pointerId !== pointerId) {
        return;
      }
      if (end.type === 'pointercancel') {
        setSize(before);
        undoUserResize?.();
      }
      cleanup();
    };
    function cleanup() {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      if (dragCleanupRef.current === cleanup) {
        dragCleanupRef.current = null;
      }
      setIsDragging(false);
      releaseGesture?.();
    }
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    dragCleanupRef.current = cleanup;
    setIsDragging(true);
    setSize((previous) => (previous.isCollapsed ? { ...previous, isCollapsed: false } : previous));
  };

  const renderedHeight = size.isCollapsed ? DETAIL_PANEL_COLLAPSED_HEIGHT_PX : openHeight;
  const { selection, group } = contentProps;
  const headerLabel = selection
    ? selection.title
    : group
      ? studioDetailStrings.clipCount(group.count)
      : DETAIL_NOTHING_SELECTED;

  return (
    <section
      ref={panelRef}
      className={cn(
        'relative flex shrink-0 flex-col overflow-hidden border-t border-outline bg-surface text-xs',
        isTransitionArmed &&
          !isDragging &&
          !isCapUpdate &&
          'motion-safe:transition-[height] motion-safe:duration-300',
      )}
      style={{ height: renderedHeight }}
      aria-label={DETAIL_PANEL_TITLE}
      data-testid="arrangement-detail-panel"
      data-collapsed={size.isCollapsed ? 'true' : 'false'}
    >
      {/* biome-ignore lint/a11y/useSemanticElements: a focusable resize handle needs role=separator with aria-valuenow; a native <hr> is a static, non-interactive separator */}
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="horizontal"
        aria-label={studioDetailStrings.heightLabel}
        aria-valuemin={DETAIL_PANEL_MIN_HEIGHT_PX}
        aria-valuemax={DETAIL_PANEL_MAX_HEIGHT_PX}
        aria-valuenow={openHeight}
        aria-valuetext={
          size.isCollapsed ? studioDetailStrings.collapsedValueText(openHeight) : `${openHeight} px`
        }
        aria-controls={contentId}
        onPointerDown={handleSeparatorPointerDown}
        onKeyDown={handleSeparatorKeyDown}
        className="absolute inset-x-0 top-0 z-20 h-1.5 cursor-row-resize touch-none hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
        data-testid="arrangement-detail-separator"
      />
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-outline px-3">
        <h2 className="shrink-0 font-medium text-muted">{DETAIL_PANEL_TITLE}</h2>
        <span
          className="min-w-0 flex-1 truncate text-foreground"
          data-testid="arrangement-detail-header-label"
        >
          {headerLabel}
        </span>
        <button
          type="button"
          onClick={toggleDetailPanel}
          onKeyDown={handleToggleKeyDown}
          onKeyUp={handleToggleKeyUp}
          aria-expanded={!size.isCollapsed}
          aria-controls={contentId}
          aria-label={
            size.isCollapsed ? studioDetailStrings.expandLabel : studioDetailStrings.collapseLabel
          }
          className="h-6 shrink-0 rounded-sm border border-outline px-2 text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          data-testid="arrangement-detail-toggle"
        >
          {size.isCollapsed ? studioDetailStrings.expandText : studioDetailStrings.collapseText}
        </button>
      </div>
      <div id={contentId} hidden={size.isCollapsed} className="flex min-h-0 flex-1 flex-col">
        <ArrangementDetailContent
          key={selection?.clip.id ?? (group ? 'group' : 'none')}
          {...contentProps}
        />
      </div>
    </section>
  );
}
