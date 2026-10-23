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
import {
  CLIP_GAIN_MAX_DB,
  CLIP_GAIN_MIN_DB,
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
import { cn } from '~/lib/utils';
import type { ArrangementClip, TimeRange } from '~/types/arrangement';
import { buildPeakShape } from './ArrangementClip';
import { STUDIO_SCROLLBAR_CLASS } from './studio-scrollbar';

const DETAIL_PANEL_TITLE = 'კლიპის დეტალები';
const DETAIL_NOTHING_SELECTED = 'არაფერია არჩეული';
const DETAIL_NO_SELECTION_HINT = 'აირჩიე კლიპი, რომ დეტალები ნახო';
const DETAIL_GROUP_NOTE = 'ჯგუფი ერთად გადაადგილდება · Delete შლის · Ctrl+D აორმაგებს';
const DETAIL_VIDEO_PLACEHOLDER = 'ვიდეოკლიპი · ტალღა არ ჩანს';
const DETAIL_INPUTS_GROUP_REASON = 'range ერთ კლიპზე ისმება — აირჩიე ერთი';
const DETAIL_INPUTS_NONE_REASON = 'ჯერ აირჩიე კლიპი';
const DETAIL_SOURCE_UNCHANGED = 'წყარო უცვლელი რჩება';
const DETAIL_PEAK_COLUMNS = 480;
const DETAIL_CLIP_GAIN_GROUP_REASON = 'Clip Gain ერთ აუდიო კლიპზე ისმება — აირჩიე ერთი';
const DETAIL_CLIP_GAIN_VIDEO_REASON = 'ვიდეო კლიპს Clip Gain არ აქვს — ხმა: ხაზის Volume/Mute';
const DETAIL_CLIP_GAIN_INVALID_MESSAGE = 'Clip Gain: შეიყვანე რიცხვი dB-ში (−60…+24).';
const DETAIL_CLIP_GAIN_PENDING_FULL_TEXT = 'შეუნახავია — Enter ინახავს, Esc აბრუნებს';
const DETAIL_CLIP_GAIN_PENDING_LABEL = 'შეუნახავია';
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
  return `მონიშვნა: ${formatArrangementTime(range.start)} — ${formatArrangementTime(range.end)} · ${laneName}.`;
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
  const peakShape = useMemo(
    () =>
      selection.isVideo
        ? null
        : buildPeakShape(peaks, clip.sourceOffset, clip.duration, DETAIL_PEAK_COLUMNS),
    [selection.isVideo, peaks, clip.sourceOffset, clip.duration],
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
}: ArrangementDetailContentProps) {
  const reasonId = useId();
  const clipGainReasonId = useId();
  const clipGainPendingId = useId();
  const clip = selection?.clip ?? null;
  const clipGainDb = clip?.gainDb;
  const [clipGainText, setClipGainText] = useState(() => clipGainInputText(clipGainDb));
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
    setClipGainText(clipGainInputText(clipGainDb));
  }, [clipGainDb]);

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
      ? DETAIL_CLIP_GAIN_GROUP_REASON
      : DETAIL_INPUTS_NONE_REASON;
  const isClipGainPending =
    clipGainReason === null && clipGainText !== clipGainInputText(clipGainDb);

  const commitClipGain = (trigger: 'enter' | 'blur') => {
    if (!selection || clipGainReason !== null || !isContentMountedRef.current) {
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
      setStatus(`Clip Gain უცვლელია: ${formatMasterGainDb(selection.clip.gainDb ?? 0)}.`);
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
      setClipGainText(clipGainInputText(selection?.clip.gainDb));
    }
  };

  const resetClipGain = () => {
    if (!selection || clipGainReason !== null) {
      return;
    }
    if (isPointerGestureActive()) {
      setStatus(GESTURE_EDIT_BLOCKED_MESSAGE);
      return;
    }
    setStatus(
      setClipGain?.(selection.clip.id, 0)
        ? `Clip Gain: ${selection.title} — ${formatMasterGainDb(0)}.`
        : `Clip Gain უცვლელია: ${formatMasterGainDb(0)}.`,
    );
    setClipGainText(clipGainInputText(0));
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
    'h-6 w-20 rounded-sm border border-outline bg-background px-1 font-mono tabular-nums text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim';

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
              <span className="text-dim">ხაზი</span>{' '}
              <span className="text-foreground">{selection.laneName}</span>
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">დასაწყისი</span>{' '}
              <span className="text-foreground">{formatArrangementTime(selection.clip.start)}</span>{' '}
              · <span className="font-sans text-dim">სიგრძე</span>{' '}
              <span className="text-foreground">
                {formatArrangementTime(selection.clip.duration)}
              </span>
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">წყაროდან</span>{' '}
              <span className="text-foreground">
                {formatArrangementTime(selection.clip.sourceOffset)}
              </span>
            </p>
            <p className="text-dim">{DETAIL_SOURCE_UNCHANGED}</p>
          </>
        ) : group ? (
          <div data-testid="arrangement-detail-group" className="flex flex-col gap-0.5">
            <p className="font-medium text-brand">{group.count} კლიპი</p>
            <p className="shrink-0 truncate text-foreground" title={group.laneNames}>
              <span className="text-dim">ხაზები</span> {group.laneNames}
            </p>
            <p className="font-mono tabular-nums">
              <span className="font-sans text-dim">დასაწყისი</span>{' '}
              <span className="text-foreground">{formatArrangementTime(group.earliestStart)}</span>{' '}
              · <span className="font-sans text-dim">სიგრძე</span>{' '}
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
            საიდან, წმ
            <input
              type="number"
              step={0.001}
              value={startText}
              onChange={(event) => setStartText(event.target.value)}
              onKeyDown={handleRangeInputKeyDown}
              disabled={!clip}
              title={inputsReason ?? undefined}
              aria-label="range-ის დასაწყისი (წამი)"
              aria-describedby={inputsReason ? reasonId : undefined}
              className={inputClass}
              data-testid="arrangement-detail-start"
            />
          </label>
          <label className="flex flex-col text-dim">
            სადამდე, წმ
            <input
              type="number"
              step={0.001}
              value={endText}
              onChange={(event) => setEndText(event.target.value)}
              onKeyDown={handleRangeInputKeyDown}
              disabled={!clip}
              title={inputsReason ?? undefined}
              aria-label="range-ის დასასრული (წამი)"
              aria-describedby={inputsReason ? reasonId : undefined}
              className={inputClass}
              data-testid="arrangement-detail-end"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={applyDetailRange}
          disabled={!clip}
          title={inputsReason ?? undefined}
          className="h-6 w-fit rounded-sm border border-outline px-2 text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:text-dim"
          data-testid="arrangement-detail-apply"
        >
          მონიშვნა
        </button>
        {isNoneState ? rangeReasonNode : null}
      </div>
      <div className="flex w-32 shrink-0 flex-col gap-1" data-testid="arrangement-detail-clip-gain">
        <label className="flex flex-col text-dim">
          Clip Gain, dB
          <input
            type="number"
            step={0.1}
            min={CLIP_GAIN_MIN_DB}
            max={CLIP_GAIN_MAX_DB}
            value={clipGainText}
            onChange={(event) => setClipGainText(event.target.value)}
            onKeyDown={handleClipGainKeyDown}
            onBlur={() => commitClipGain('blur')}
            disabled={clipGainReason !== null}
            title={
              clipGainReason ?? (isClipGainPending ? DETAIL_CLIP_GAIN_PENDING_FULL_TEXT : undefined)
            }
            aria-label="Clip Gain (dB)"
            aria-describedby={
              clipGainReason ? clipGainReasonId : isClipGainPending ? clipGainPendingId : undefined
            }
            data-pending={isClipGainPending ? 'true' : undefined}
            className={cn(
              inputClass,
              isClipGainPending && 'border-warning focus-visible:ring-warning',
            )}
            data-testid="arrangement-detail-clip-gain-input"
          />
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={resetClipGain}
            disabled={clipGainReason !== null || clipGainDb === undefined}
            title={clipGainReason ?? undefined}
            aria-label="Clip Gain-ის განულება (0 dB)"
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
      ? `${group.count} კლიპი`
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
        aria-label="დეტალების სიმაღლე"
        aria-valuemin={DETAIL_PANEL_MIN_HEIGHT_PX}
        aria-valuemax={DETAIL_PANEL_MAX_HEIGHT_PX}
        aria-valuenow={openHeight}
        aria-valuetext={size.isCollapsed ? `დაკეცილია · ${openHeight} px` : `${openHeight} px`}
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
          aria-label={size.isCollapsed ? 'დეტალების გაშლა' : 'დეტალების დაკეცვა'}
          className="h-6 shrink-0 rounded-sm border border-outline px-2 text-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          data-testid="arrangement-detail-toggle"
        >
          {size.isCollapsed ? 'გაშლა ▸' : 'დაკეცვა ▾'}
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
