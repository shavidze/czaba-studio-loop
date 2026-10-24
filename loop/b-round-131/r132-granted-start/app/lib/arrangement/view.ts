import type { ArrangementLoop, TimeRange } from '~/types/arrangement';

export const TIMELINE_ZOOM_MIN = 0.5;
export const TIMELINE_ZOOM_MAX = 320;
export const TIMELINE_ZOOM_DEFAULT = 40;
export const TIMELINE_WHEEL_ZOOM_FACTOR = 1.15;
export const TIMELINE_STEP_ZOOM_FACTOR = 1.25;
export const TIMELINE_DRAG_THRESHOLD_PX = 4;
export const TIMELINE_DRAG_DEAD_ZONE_PX = 6;
export const TIMELINE_DRAG_ZOOM_SCALE_PX = 140;
export const TIMELINE_FIT_PADDING_PX = 4;
export const TIMELINE_RANGE_FILL = 0.6;
export const TIMELINE_MIN_EXTENT_SECONDS = 10;
export const TIMELINE_FOLLOW_EDGE_PX = 24;
export const TIMELINE_OVERVIEW_PAN_SECONDS = 5;
export const TIMELINE_ZOOM_SLIDER_STEPS = 1000;
export const RULER_TICK_STEPS_SECONDS = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600] as const;
export const RULER_LABEL_SPACING_PX = 40;
export const RULER_FRACTION_LABEL_SPACING_PX = 56;
export const RULER_LABEL_OFFSET_PX = 5;
export const RULER_LABEL_CHAR_WIDTH_PX = 8;
export const RULER_TICK_LINE_PX = 1;
const TIMELINE_ZOOM_HISTORY_LIMIT = 50;

export interface TimelineView {
  pxPerSecond: number;
  scrollLeft: number;
}

export type TimelineFollowMode = 'on' | 'paused' | 'off';

export interface OverviewFrame {
  left: number;
  width: number;
}

export interface TimelineDragInput {
  start: TimelineView;
  anchorTime: number;
  anchorScreenX: number;
  dx: number;
  dy: number;
}

export interface OverviewDragInput extends TimelineDragInput {
  overviewWidthPx: number;
  extent: number;
}

export interface StepZoomInput {
  view: TimelineView;
  factor: number;
  viewportPx: number;
  range: TimeRange | null;
  playhead: number;
}

export interface FollowScrollInput {
  position: number;
  view: TimelineView;
  viewportPx: number;
}

export function clampTimelineZoom(pxPerSecond: number): number {
  if (!Number.isFinite(pxPerSecond)) {
    return TIMELINE_ZOOM_DEFAULT;
  }
  return Math.min(TIMELINE_ZOOM_MAX, Math.max(TIMELINE_ZOOM_MIN, pxPerSecond));
}

export function timelineExtent(projectEnd: number, loop: ArrangementLoop | null): number {
  return Math.max(projectEnd, loop?.end ?? 0, TIMELINE_MIN_EXTENT_SECONDS);
}

export function visibleTimelineSeconds(view: TimelineView, viewportPx: number): number {
  return Math.max(0, viewportPx) / view.pxPerSecond;
}

export function fitTimelineView(extent: number, viewportPx: number): TimelineView {
  const usable = Math.max(1, viewportPx - TIMELINE_FIT_PADDING_PX);
  return { pxPerSecond: clampTimelineZoom(usable / Math.max(extent, 1e-6)), scrollLeft: 0 };
}

export function anchoredTimelineView(
  pxPerSecond: number,
  anchorTime: number,
  anchorScreenX: number,
): TimelineView {
  const zoom = clampTimelineZoom(pxPerSecond);
  return { pxPerSecond: zoom, scrollLeft: Math.max(0, anchorTime * zoom - anchorScreenX) };
}

export function zoomTimelineAround(
  view: TimelineView,
  pxPerSecond: number,
  anchorTime: number,
): TimelineView {
  return anchoredTimelineView(
    pxPerSecond,
    anchorTime,
    anchorTime * view.pxPerSecond - view.scrollLeft,
  );
}

export function stepZoomAnchor({ view, viewportPx, range, playhead }: StepZoomInput): {
  time: number;
  screenX: number;
} {
  const time = range ? (range.start + range.end) / 2 : playhead;
  const screenX = time * view.pxPerSecond - view.scrollLeft;
  const visible = screenX >= 0 && screenX <= viewportPx;
  return { time, screenX: visible ? screenX : viewportPx / 2 };
}

export function stepTimelineZoom(input: StepZoomInput): TimelineView {
  const anchor = stepZoomAnchor(input);
  return anchoredTimelineView(input.view.pxPerSecond * input.factor, anchor.time, anchor.screenX);
}

export function zoomToRangeView(range: TimeRange, viewportPx: number): TimelineView {
  const length = Math.max(0.01, range.end - range.start);
  const zoom = clampTimelineZoom((viewportPx * TIMELINE_RANGE_FILL) / length);
  const centre = (range.start + range.end) / 2;
  return { pxPerSecond: zoom, scrollLeft: Math.max(0, centre * zoom - viewportPx / 2) };
}

export function pushZoomHistory(
  history: readonly TimelineView[],
  view: TimelineView,
): TimelineView[] {
  return [...history, view].slice(-TIMELINE_ZOOM_HISTORY_LIMIT);
}

export function popZoomHistory(
  history: readonly TimelineView[],
): { view: TimelineView; history: TimelineView[] } | null {
  const view = history.at(-1);
  return view ? { view, history: history.slice(0, -1) } : null;
}

export function dragZoomLift(dy: number): number {
  return Math.abs(dy) > TIMELINE_DRAG_DEAD_ZONE_PX
    ? dy - Math.sign(dy) * TIMELINE_DRAG_DEAD_ZONE_PX
    : 0;
}

export function dragZoomLevel(startZoom: number, dy: number): number {
  return clampTimelineZoom(startZoom * Math.exp(-dragZoomLift(dy) / TIMELINE_DRAG_ZOOM_SCALE_PX));
}

export function rulerDragView({
  start,
  anchorTime,
  anchorScreenX,
  dx,
  dy,
}: TimelineDragInput): TimelineView {
  return anchoredTimelineView(dragZoomLevel(start.pxPerSecond, dy), anchorTime, anchorScreenX + dx);
}

export function overviewDragView({
  start,
  anchorTime,
  anchorScreenX,
  dx,
  dy,
  overviewWidthPx,
  extent,
}: OverviewDragInput): TimelineView {
  const time = anchorTime + (overviewWidthPx > 0 ? (dx / overviewWidthPx) * extent : 0);
  return anchoredTimelineView(dragZoomLevel(start.pxPerSecond, dy), time, anchorScreenX);
}

export function overviewFrame(
  view: TimelineView,
  viewportPx: number,
  extent: number,
): OverviewFrame {
  const visibleStart = view.scrollLeft / view.pxPerSecond;
  const width = Math.min(1, visibleTimelineSeconds(view, viewportPx) / extent);
  return { left: Math.min(1, Math.max(0, visibleStart / extent)), width };
}

export function overviewTimeAt(fraction: number, extent: number): number {
  return Math.min(1, Math.max(0, fraction)) * extent;
}

export function centreTimelineView(
  view: TimelineView,
  time: number,
  viewportPx: number,
): TimelineView {
  return anchoredTimelineView(view.pxPerSecond, time, viewportPx / 2);
}

export function followScrollTarget({
  position,
  view,
  viewportPx,
}: FollowScrollInput): number | null {
  const x = position * view.pxPerSecond - view.scrollLeft;
  if (x > viewportPx - TIMELINE_FOLLOW_EDGE_PX || x < 0) {
    return Math.max(0, position * view.pxPerSecond - viewportPx / 3);
  }
  return null;
}

export function rulerTickStep(pxPerSecond: number): number {
  for (const step of RULER_TICK_STEPS_SECONDS) {
    const spacing = step < 1 ? RULER_FRACTION_LABEL_SPACING_PX : RULER_LABEL_SPACING_PX;
    if (step * pxPerSecond >= spacing) {
      return step;
    }
  }
  return RULER_TICK_STEPS_SECONDS[RULER_TICK_STEPS_SECONDS.length - 1];
}

export function formatRulerLabel(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds - minutes * 60;
  const whole = Math.floor(rest);
  const tenths = Math.round((rest - whole) * 10);
  const base = `${minutes}:${String(whole).padStart(2, '0')}`;
  return tenths > 0 ? `${base}.${tenths}` : base;
}

export interface RulerTickMark {
  time: number;
  label: string | null;
}

export function rulerTickMarks(seconds: number, pxPerSecond: number): RulerTickMark[] {
  const step = rulerTickStep(pxPerSecond);
  const rulerWidthPx = seconds * pxPerSecond;
  return Array.from({ length: Math.floor(seconds / step) + 1 }, (_, index) => {
    const time = index * step;
    const label = formatRulerLabel(time);
    const labelEndPx =
      time * pxPerSecond + RULER_LABEL_OFFSET_PX + label.length * RULER_LABEL_CHAR_WIDTH_PX;
    return { time, label: labelEndPx <= rulerWidthPx ? label : null };
  }).filter((mark) => mark.time * pxPerSecond + RULER_TICK_LINE_PX <= rulerWidthPx);
}

export function zoomFromSliderPosition(position: number): number {
  const fraction = Math.min(1, Math.max(0, position / TIMELINE_ZOOM_SLIDER_STEPS));
  return clampTimelineZoom(TIMELINE_ZOOM_MIN * (TIMELINE_ZOOM_MAX / TIMELINE_ZOOM_MIN) ** fraction);
}

export function sliderPositionFromZoom(pxPerSecond: number): number {
  const zoom = clampTimelineZoom(pxPerSecond);
  return Math.round(
    (Math.log(zoom / TIMELINE_ZOOM_MIN) / Math.log(TIMELINE_ZOOM_MAX / TIMELINE_ZOOM_MIN)) *
      TIMELINE_ZOOM_SLIDER_STEPS,
  );
}

export function formatZoomReadout(pxPerSecond: number): string {
  return `${Math.round(pxPerSecond * 10) / 10} px/წმ`;
}

export type TimelineNavigationKey = 'zoom-in' | 'zoom-out' | 'zoom-range' | 'zoom-back';

export interface TimelineNavigationKeyInput {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  inTextField: boolean;
  onSlider: boolean;
}

export function timelineNavigationKey(
  input: TimelineNavigationKeyInput,
): TimelineNavigationKey | null {
  if (input.inTextField || input.onSlider || input.ctrlKey || input.metaKey || input.altKey) {
    return null;
  }
  if (input.key === '+' || input.key === '=' || input.code === 'NumpadAdd') {
    return 'zoom-in';
  }
  if (input.key === '-' || input.key === '_' || input.code === 'NumpadSubtract') {
    return 'zoom-out';
  }
  if (input.shiftKey) {
    return null;
  }
  if (input.code === 'KeyZ' || input.key.toLowerCase() === 'z') {
    return 'zoom-range';
  }
  if (input.code === 'KeyX' || input.key.toLowerCase() === 'x') {
    return 'zoom-back';
  }
  return null;
}
