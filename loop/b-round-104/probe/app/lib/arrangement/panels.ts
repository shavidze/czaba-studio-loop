export const DETAIL_PANEL_DEFAULT_HEIGHT_PX = 144;
export const DETAIL_PANEL_MIN_HEIGHT_PX = 120;
export const DETAIL_PANEL_MAX_HEIGHT_PX = 280;
export const DETAIL_PANEL_COLLAPSED_HEIGHT_PX = 36;
export const DETAIL_PANEL_KEY_STEP_PX = 16;
export const DETAIL_RANGE_TOLERANCE_SECONDS = 0.01;
export const DETAIL_RANGE_INVALID_MESSAGE =
  'მონაკვეთი კლიპის საზღვრებში უნდა იყოს; დასასრული დასაწყისზე მეტი უნდა იყოს.';

export interface DetailPanelFitMetrics {
  scrollerClientHeight: number;
  timelineContentHeight: number;
}

export interface DetailRangeInput {
  start: number;
  end: number;
  clipStart: number;
  clipEnd: number;
}

export function clampDetailPanelHeight(height: number): number {
  if (!Number.isFinite(height)) {
    return DETAIL_PANEL_DEFAULT_HEIGHT_PX;
  }
  return Math.min(DETAIL_PANEL_MAX_HEIGHT_PX, Math.max(DETAIL_PANEL_MIN_HEIGHT_PX, height));
}

export function stepDetailPanelHeight(height: number, direction: 1 | -1): number {
  return clampDetailPanelHeight(height + direction * DETAIL_PANEL_KEY_STEP_PX);
}

export function detailPanelStartsOpen(metrics: DetailPanelFitMetrics): boolean {
  const { scrollerClientHeight, timelineContentHeight } = metrics;
  if (
    !Number.isFinite(scrollerClientHeight) ||
    !Number.isFinite(timelineContentHeight) ||
    scrollerClientHeight <= 0 ||
    timelineContentHeight <= 0
  ) {
    return false;
  }
  const openingCost = DETAIL_PANEL_DEFAULT_HEIGHT_PX - DETAIL_PANEL_COLLAPSED_HEIGHT_PX;
  return scrollerClientHeight - openingCost >= timelineContentHeight;
}

export type TrackLaneKind = 'audio' | 'video';

export const TRACK_DEFAULT_HEIGHT_PX = 80;
export const TRACK_AUDIO_MIN_HEIGHT_PX = 60;
export const TRACK_VIDEO_MIN_HEIGHT_PX = 52;
export const TRACK_MAX_HEIGHT_PX = 180;
export const TRACK_KEY_STEP_PX = 8;
export const TRACK_ROW_BORDER_PX = 1;
export const TRACK_FOLDED_ROW_HEIGHT_PX = 36;
export const TRACK_VIDEO_FIT_SHARE = 0.2;

export interface TrackLaneFitEntry {
  kind: TrackLaneKind;
  folded: boolean;
}

export interface TrackLaneFitInput {
  visibleRowsHeight: number;
  lanes: readonly TrackLaneFitEntry[];
}

export interface DetailPanelCapInput {
  scrollerClientHeight: number;
  panelRenderedHeight: number;
  timelineChromeHeight: number;
  lanes: readonly TrackLaneFitEntry[];
}

export function trackMinHeight(kind: TrackLaneKind): number {
  return kind === 'video' ? TRACK_VIDEO_MIN_HEIGHT_PX : TRACK_AUDIO_MIN_HEIGHT_PX;
}

export function clampTrackHeight(kind: TrackLaneKind, height: number): number {
  if (!Number.isFinite(height)) {
    return TRACK_DEFAULT_HEIGHT_PX;
  }
  return Math.min(TRACK_MAX_HEIGHT_PX, Math.max(trackMinHeight(kind), Math.round(height)));
}

export function stepTrackHeight(kind: TrackLaneKind, height: number, direction: 1 | -1): number {
  return clampTrackHeight(kind, height + direction * TRACK_KEY_STEP_PX);
}

export function trackRowHeight(height: number, folded: boolean): number {
  return folded ? TRACK_FOLDED_ROW_HEIGHT_PX : height + TRACK_ROW_BORDER_PX;
}

export function minimumLaneRowsHeight(lanes: readonly TrackLaneFitEntry[]): number {
  return lanes.reduce(
    (total, lane) => total + trackRowHeight(trackMinHeight(lane.kind), lane.folded),
    0,
  );
}

export function fitLaneHeights(input: TrackLaneFitInput): number[] {
  const { visibleRowsHeight, lanes } = input;
  const defaults = lanes.map(() => TRACK_DEFAULT_HEIGHT_PX);
  if (!Number.isFinite(visibleRowsHeight) || visibleRowsHeight <= 0) {
    return defaults;
  }
  const open = lanes.filter((lane) => !lane.folded);
  const free =
    visibleRowsHeight -
    (lanes.length - open.length) * TRACK_FOLDED_ROW_HEIGHT_PX -
    open.length * TRACK_ROW_BORDER_PX;
  if (open.length * TRACK_DEFAULT_HEIGHT_PX <= free) {
    return defaults;
  }
  const videoCount = open.filter((lane) => lane.kind === 'video').length;
  const audioCount = open.length - videoCount;
  const video = Math.min(
    TRACK_DEFAULT_HEIGHT_PX,
    Math.max(
      TRACK_VIDEO_MIN_HEIGHT_PX,
      Math.min(
        Math.round(free * TRACK_VIDEO_FIT_SHARE),
        free - audioCount * TRACK_AUDIO_MIN_HEIGHT_PX,
      ),
    ),
  );
  const audio =
    audioCount === 0
      ? TRACK_DEFAULT_HEIGHT_PX
      : Math.min(
          TRACK_DEFAULT_HEIGHT_PX,
          Math.max(TRACK_AUDIO_MIN_HEIGHT_PX, Math.floor((free - videoCount * video) / audioCount)),
        );
  return lanes.map((lane) =>
    lane.folded ? TRACK_DEFAULT_HEIGHT_PX : lane.kind === 'video' ? video : audio,
  );
}

export function detailPanelOpenHeightCap(input: DetailPanelCapInput): number | null {
  const { scrollerClientHeight, panelRenderedHeight, timelineChromeHeight, lanes } = input;
  if (
    ![scrollerClientHeight, panelRenderedHeight, timelineChromeHeight].every(Number.isFinite) ||
    scrollerClientHeight <= 0 ||
    panelRenderedHeight <= 0
  ) {
    return null;
  }
  const columnHeight = scrollerClientHeight + panelRenderedHeight;
  const cap = Math.floor(
    columnHeight - Math.max(0, timelineChromeHeight) - minimumLaneRowsHeight(lanes),
  );
  if (cap >= DETAIL_PANEL_MAX_HEIGHT_PX) {
    return null;
  }
  return Math.max(DETAIL_PANEL_MIN_HEIGHT_PX, cap);
}

export const FLOATING_VIDEO_OFFSET_PX = 8;
export const FLOATING_VIDEO_MAX_WIDTH_PX = 640;
export const FLOATING_VIDEO_LIBRARY_INSET_PX = 16;
export const FLOATING_VIDEO_KEY_STEP_PX = 16;
export const FLOATING_VIDEO_ASPECT_RATIO = 16 / 9;
export const FLOATING_VIDEO_MIN_WIDTH_PX = 160;
export const FLOATING_VIDEO_BODY_SHARE = 0.5;

export interface FloatingVideoRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FloatingVideoViewport {
  viewportWidth: number;
  viewportHeight: number;
}

export interface FloatingVideoLibraryRect {
  left: number;
  width: number;
  bodyTop: number;
  bodyBottom: number;
}

const FLOATING_VIDEO_ARROW_STEPS: ReadonlyMap<string, readonly [number, number]> = new Map<
  string,
  readonly [number, number]
>([
  ['ArrowLeft', [-FLOATING_VIDEO_KEY_STEP_PX, 0]],
  ['ArrowRight', [FLOATING_VIDEO_KEY_STEP_PX, 0]],
  ['ArrowUp', [0, -FLOATING_VIDEO_KEY_STEP_PX]],
  ['ArrowDown', [0, FLOATING_VIDEO_KEY_STEP_PX]],
]);

function clampFloatingVideoAxis(position: number, size: number, viewportSize: number): number {
  if (![position, size, viewportSize].every(Number.isFinite)) {
    return 0;
  }
  return Math.max(0, Math.min(viewportSize - size, position));
}

export function clampFloatingVideoRect(
  rect: FloatingVideoRect,
  viewport: FloatingVideoViewport,
): FloatingVideoRect {
  return {
    ...rect,
    left: clampFloatingVideoAxis(rect.left, rect.width, viewport.viewportWidth),
    top: clampFloatingVideoAxis(rect.top, rect.height, viewport.viewportHeight),
  };
}

export function placeFloatingVideoOverLibrary(
  library: FloatingVideoLibraryRect,
  viewport: FloatingVideoViewport,
): FloatingVideoRect {
  const { left, width: libraryWidth, bodyTop, bodyBottom } = library;
  const bodyHeight = bodyBottom - bodyTop;
  const availableHeight = bodyHeight - 2 * FLOATING_VIDEO_OFFSET_PX;
  const width = [libraryWidth, bodyTop, bodyBottom].every(Number.isFinite)
    ? Math.max(
        FLOATING_VIDEO_MIN_WIDTH_PX,
        Math.min(
          FLOATING_VIDEO_MAX_WIDTH_PX,
          libraryWidth - FLOATING_VIDEO_LIBRARY_INSET_PX,
          availableHeight * FLOATING_VIDEO_ASPECT_RATIO,
          bodyHeight * FLOATING_VIDEO_BODY_SHARE * FLOATING_VIDEO_ASPECT_RATIO,
        ),
      )
    : 0;
  const height = width / FLOATING_VIDEO_ASPECT_RATIO;
  return clampFloatingVideoRect(
    {
      left: left + FLOATING_VIDEO_OFFSET_PX,
      top: Math.max(
        bodyTop + FLOATING_VIDEO_OFFSET_PX,
        bodyBottom - FLOATING_VIDEO_OFFSET_PX - height,
      ),
      width,
      height,
    },
    viewport,
  );
}

export function floatingVideoLibraryInsetPx(rect: FloatingVideoRect | null): number {
  if (!rect || !Number.isFinite(rect.height) || rect.height <= 0) {
    return 0;
  }
  return rect.height + 2 * FLOATING_VIDEO_OFFSET_PX;
}

export function stepFloatingVideoRect(
  rect: FloatingVideoRect,
  key: string,
  viewport: FloatingVideoViewport,
): FloatingVideoRect | null {
  const step = FLOATING_VIDEO_ARROW_STEPS.get(key);
  if (!step) {
    return null;
  }
  return clampFloatingVideoRect(
    { ...rect, left: rect.left + step[0], top: rect.top + step[1] },
    viewport,
  );
}

export function clampDetailRangeToClip(
  input: DetailRangeInput,
): { start: number; end: number } | null {
  if (!isDetailRangeInsideClip(input)) {
    return null;
  }
  const { clipStart, clipEnd } = input;
  const start = Math.min(clipEnd, Math.max(clipStart, input.start));
  const end = Math.min(clipEnd, Math.max(clipStart, input.end));
  return end > start ? { start, end } : null;
}

export function isDetailRangeInsideClip(input: DetailRangeInput): boolean {
  const { start, end, clipStart, clipEnd } = input;
  if (![start, end, clipStart, clipEnd].every(Number.isFinite) || end <= start) {
    return false;
  }
  const low = clipStart - DETAIL_RANGE_TOLERANCE_SECONDS - 1e-9;
  const high = clipEnd + DETAIL_RANGE_TOLERANCE_SECONDS + 1e-9;
  return start >= low && start <= high && end >= low && end <= high;
}
