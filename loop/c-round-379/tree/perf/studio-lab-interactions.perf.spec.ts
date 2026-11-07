import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, expect, type Locator, type Page, test } from '@playwright/test';
import {
  perfInlineLabels,
  perfLibraryAddLabel,
  perfMoveTitlePattern,
  perfRangeBodyTitle,
  perfTrimStartTitle,
  perfUndoButtonPattern,
  perfZoomSliderLabel,
} from './lib/app-labels';
import { loadPerfBudgets, type PerfBudgetRow } from './lib/budgets';
import { installPerfInstrumentation, type PerfWindowSnapshot } from './lib/instrumentation';
import {
  audioClips,
  blurActive,
  isPlaying,
  nowIn,
  rateRowId,
  reactRendererProblem,
  setPlayback,
  snapshot,
  startTasks,
  waitForCollectionReady,
  waitForLibraryReady,
  waitForPlaybackSettled,
  waitForQuiet,
} from './lib/page';
import { buildPerfReportCore, formatLimit, type PerfSample } from './lib/report';
import { median, percentile, roundTo } from './lib/stats';
import {
  disconnectZoomProbe,
  installZoomProbe,
  readZoomProbe,
  resetZoomProbe,
} from './lib/zoom-probe';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const interactionBudgetsPath = path.resolve(
  storeRoot,
  process.env.PERF_BUDGETS_INTERACTIONS ?? path.join('perf', 'budgets.interactions.json'),
);
const resultsDir = path.join(storeRoot, 'test-results', 'perf');

const passesPerRate = 3;
const cpuRates = [1, 6];
const viewport = { width: 1440, height: 900 };
const dragSteps = 60;
const dragDistancePx = 120;
const laneSegmentSteps = 10;
const laneSegmentPx = 40;
const settleMs = 600;
const keySettleMs = 300;
const idleSettleMs = 1000;
const zoomKeyCount = 5;
const clipsTarget = 30;
const selectZoomOutKeyLimit = 16;
const rangeLabelEnd = /\d\d:\d\d\.\d{3} – (\d\d):(\d\d\.\d{3}) ·/;

type DragName = 'range' | 'fade' | 'trim' | 'move';
type PlaybackState = 'stopped' | 'playing';
type ClipKind = 'audio' | 'video';
type VideoDrag = 'move' | 'trim' | 'fade';

const dragNames: DragName[] = ['range', 'fade', 'trim', 'move'];

const interactionSequence = [
  '1x only: load until ready (interact.load.ready-ms), library Add, wait for the waveform and quiet (interact.harness.hook-live)',
  'CPU throttle on (6x passes)',
  'clip click: empty Stems lane click deselects (Clip Gain fader disabled), then a click on the clip header (interact.click.*, interact.harness.click-live)',
  `zoom with 1 clip: ${zoomKeyCount} x "=" then ${zoomKeyCount} x "-", one window per key (interact.zoom.1.*, interact.harness.zoom-live)`,
  `drags stopped: range, fade-in, trim start, move; ${dragSteps} steps, +${dragDistancePx} px; reset after each (interact.drag.<d>.stopped.*)`,
  `drag background-range stopped: press on an empty lane background of another lane; ${dragSteps} steps, +${dragDistancePx} px; reset with a click on the clip name bar (interact.drag.background-range.stopped.*)`,
  `lane drag stopped: press on the clip name bar; ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; 1 step down into the next lane, then ${laneSegmentSteps} steps +${laneSegmentPx} px there; 1 step back up, then ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; release; reset with Ctrl+Z (interact.drag.lane.stopped.*, interact.harness.drag-lane-live)`,
  'Home (seek to 0), then Space -> playing (interact.play.start-*, 1x: interact.harness.audio-running)',
  'drags playing, each after Home (seek to 0): range, fade-in, trim start, move (interact.drag.<d>.playing.*)',
  `lane drag playing, after Home (seek to 0): press on the clip name bar; ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; 1 step down into the next lane, then ${laneSegmentSteps} steps +${laneSegmentPx} px there; 1 step back up, then ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; release; reset with Ctrl+Z (interact.drag.lane.playing.*, interact.harness.drag-lane-live)`,
  'Space -> stopped (interact.play.stop-*)',
  'group setup: click the clip name bar, Ctrl+D (a copy right after it), Ctrl+click the name bar of the first clip (2 clips selected)',
  `group drag stopped: press on the first clip's name bar; ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; 1 step down into the next lane, then ${laneSegmentSteps} steps +${laneSegmentPx} px there; 1 step back up, then ${laneSegmentSteps} steps +${laneSegmentPx} px on its own lane; release; reset with Ctrl+Z (interact.drag.group.stopped.*, interact.harness.drag-group-live)`,
  'group drag playing: Space, then the same gesture after Home (seek to 0); reset with Ctrl+Z; Space (interact.drag.group.playing.*, interact.harness.drag-group-live)',
  'group teardown: Ctrl+Z (the Ctrl+D copy is removed; 1 clip, Undo back at its start entry)',
  `1x only: click the clip header, Ctrl+D x ${clipsTarget - 1} (interact.harness.clips-30), zoom with ${clipsTarget} clips: keys, then the in-first path (5 x "=", 5 x "-") and the out-first path (5 x "-", 5 x "=") with the zoom probe (interact.zoom.30.*, interact.zoom.30.in/out.*), Space, Home, fade-in drag on the first clip (interact.drag.fade.30.playing.*), Space, then Ctrl+wheel out-first (5 x deltaY +100, 5 x -100) with the zoom probe (interact.zoom.30.wheel.*)`,
  `1x only, after the 30-clip block: "-" until 2 clip name bars are visible (at most ${selectZoomOutKeyLimit}), click one name bar (setup), then click the name bar of a visible, unselected clip on the selected clip's lane, then click it again (interact.select.same-lane.${clipsTarget}.*, interact.select.reclick.${clipsTarget}.*, interact.harness.select-same-lane-live)`,
  '1x only, measured last: import public/videos/hero/1.mp4 through the video lane input (1 video clip at 0, Undo "Add video"), "=" until its name bar is at least 480 px wide (at most 16 keys); stopped: move drag on the video clip name bar, trim-start drag, fade-in drag; then Space and the same three drags, each after Home (seek to 0), Space; reset after each with Ctrl+Z; teardown Ctrl+Z (0 video clips, Undo back at its start entry) (interact.drag.video.*, interact.drag.video-trim.*, interact.drag.video-fade.*, interact.harness.drag-video-live, interact.harness.drag-video-trim-live, interact.harness.drag-video-fade-live)',
];

interface InteractionPassResult {
  cpuRate: number;
  pass: number;
  samples: Map<string, PerfSample>;
  problems: string[];
  abortedAt: string | null;
  pageErrors: number;
  reactRenderer: string;
  innerWidth: number;
}

interface ClipState {
  start: string;
  fadeIn: string;
  width: number;
  rangeEnd: number | null;
  rangeElements: number;
}

interface GrabPoint {
  x: number;
  y: number;
}

interface EmptyLanePoint extends GrabPoint {
  trackId: string;
  clipTrackId: string;
}

const sumRendered = (commits: readonly { rendered: number }[]): number =>
  commits.reduce((sum, commit) => sum + commit.rendered, 0);

const maxRendered = (commits: readonly { rendered: number }[]): number =>
  commits.reduce((max, commit) => Math.max(max, commit.rendered), 0);

function quotedAttributeValue(value: string): string {
  if (/["\\\n\r\f]/.test(value)) {
    throw new Error(`attribute value cannot be quoted safely: ${JSON.stringify(value)}`);
  }
  return `"${value}"`;
}

const clipById = (page: Page, clipId: string): Locator =>
  page.locator(`[data-clip-kind="audio"][data-clip-id=${quotedAttributeValue(clipId)}]`);

const videoClips = (page: Page): Locator => page.locator('[data-clip-kind="video"]');

const videoClipById = (page: Page, clipId: string): Locator =>
  page.locator(`[data-clip-kind="video"][data-clip-id=${quotedAttributeValue(clipId)}]`);

const videoFixturePath = path.join(storeRoot, 'public', 'videos', 'hero', '1.mp4');
const videoGrabWidthPx = 480;
const videoZoomInKeyLimit = 16;
const videoZoomSettleMs = 150;

const clipGainFader = (page: Page): Locator =>
  page.getByRole('slider', { name: perfInlineLabels.clipGainFader.label, exact: true });

const zoomSlider = (page: Page): Locator =>
  page.getByRole('slider', { name: perfZoomSliderLabel, exact: true });

const undoTitle = (page: Page): Promise<string | null> =>
  page.getByRole('button', { name: perfUndoButtonPattern }).first().getAttribute('title');

function dragTarget(clip: Locator, drag: DragName, kind: ClipKind = 'audio'): Locator {
  switch (drag) {
    case 'range':
      return clip.getByTitle(perfRangeBodyTitle, { exact: true });
    case 'fade':
      return clip.getByTestId(
        kind === 'video' ? 'arrangement-video-fade-in-handle' : 'arrangement-clip-fade-in-handle',
      );
    case 'trim':
      return clip.getByTitle(perfTrimStartTitle, { exact: true });
    case 'move':
      return clip.getByTitle(perfMoveTitlePattern);
  }
}

async function readClipState(clip: Locator): Promise<ClipState> {
  return clip.evaluate((element, pattern) => {
    const match = new RegExp(pattern).exec(element.textContent ?? '');
    return {
      start: element.getAttribute('data-clip-start') ?? '',
      fadeIn: element.getAttribute('data-fade-in') ?? '',
      width: Math.round(element.getBoundingClientRect().width * 1000) / 1000,
      rangeEnd: match ? Number(match[1]) * 60 + Number(match[2]) : null,
      rangeElements: document.querySelectorAll('[data-range-start]').length,
    };
  }, rangeLabelEnd.source);
}

async function visibleGrabPoint(
  target: Locator,
  options: { fractionY: number; centreX: boolean; travelPx: number },
): Promise<GrabPoint> {
  await expect(target).toHaveCount(1);
  const point = await target.evaluate(
    (element, { fractionY, centreX, travelPx }) => {
      const box = element.getBoundingClientRect();
      const y = box.top + box.height * fractionY;
      const ownsPoint = (x: number): boolean => {
        const hit = document.elementFromPoint(x, y);
        return hit !== null && element.contains(hit);
      };
      if (centreX) {
        const x = box.left + box.width / 2;
        return x >= 0 && x + travelPx < window.innerWidth && ownsPoint(x) ? { x, y } : null;
      }
      const right = Math.min(box.right, window.innerWidth) - 4;
      const owned: number[] = [];
      for (let x = Math.max(box.left, 0) + 4; x <= right; x += 4) {
        if (ownsPoint(x)) owned.push(x);
      }
      const first = owned.at(0);
      if (first === undefined) return null;
      const x = first + 200;
      return x + travelPx <= right && ownsPoint(x) && ownsPoint(x + travelPx) ? { x, y } : null;
    },
    { ...options },
  );
  if (!point) throw new Error('drag target has no visible grab point inside the viewport');
  return point;
}

function grabOptions(drag: DragName): { fractionY: number; centreX: boolean; travelPx: number } {
  switch (drag) {
    case 'range':
      return { fractionY: 0.6, centreX: false, travelPx: dragDistancePx };
    case 'fade':
      return { fractionY: 0.5, centreX: true, travelPx: dragDistancePx };
    case 'trim':
      return { fractionY: 0.6, centreX: true, travelPx: dragDistancePx };
    case 'move':
      return { fractionY: 0.5, centreX: false, travelPx: dragDistancePx };
  }
}

async function emptyLanePointAfterClip(clip: Locator): Promise<EmptyLanePoint> {
  const found = await clip.evaluate((clipElement) => {
    const ownLane = clipElement.closest('[data-track-id]');
    if (ownLane === null) return { point: null, ownTrack: null };
    const lanes = [...document.querySelectorAll('[data-track-id]')];
    for (const lane of lanes.slice(lanes.indexOf(ownLane) + 1)) {
      if (lane.contains(ownLane) || ownLane.contains(lane)) continue;
      const box = lane.getBoundingClientRect();
      const y = box.top + box.height / 2;
      const right = Math.min(box.right, window.innerWidth) - 4;
      for (let x = Math.max(box.left, 0) + 4; x <= right; x += 8) {
        const hit = document.elementFromPoint(x, y);
        if (
          hit !== null &&
          hit.closest('[data-track-id]') === lane &&
          hit.closest('[data-clip-id]') === null &&
          hit.closest('button, input, [role="slider"]') === null &&
          x > window.innerWidth * 0.5
        ) {
          return {
            point: { x, y, trackId: lane.getAttribute('data-track-id') },
            ownTrack: ownLane.getAttribute('data-track-id'),
          };
        }
      }
    }
    return { point: null, ownTrack: ownLane.getAttribute('data-track-id') };
  });
  if (found.ownTrack === null) {
    throw new Error('the clip is not inside a lane with a data-track-id');
  }
  if (found.point === null) {
    throw new Error(`no lane after the clip's lane ${found.ownTrack} has an empty timeline point`);
  }
  if (found.point.trackId === null) {
    throw new Error('the empty timeline point is on a lane without a data-track-id');
  }
  if (found.point.trackId === found.ownTrack) {
    throw new Error(`the empty point is on the clip's own lane ${found.ownTrack}`);
  }
  return {
    x: found.point.x,
    y: found.point.y,
    trackId: found.point.trackId,
    clipTrackId: found.ownTrack,
  };
}

async function backgroundRangeGrabPoint(
  clip: Locator,
  travelPx: number,
): Promise<EmptyLanePoint | null> {
  const found = await clip.evaluate((clipElement, travel) => {
    const ownLane = clipElement.closest('[data-track-id]');
    if (ownLane === null) return null;
    const ownTrack = ownLane.getAttribute('data-track-id');
    const lanes = [...document.querySelectorAll('[data-track-id]')];
    const ownIndex = lanes.indexOf(ownLane);
    const ordered = [...lanes.slice(ownIndex + 1), ...lanes.slice(0, ownIndex).reverse()];
    for (const lane of ordered) {
      if (lane.contains(ownLane) || ownLane.contains(lane)) continue;
      const box = lane.getBoundingClientRect();
      const y = box.top + box.height / 2;
      if (y < 0 || y >= window.innerHeight) continue;
      const onBackground = (x: number): boolean => {
        if (x < 0 || x >= window.innerWidth) return false;
        const hit = document.elementFromPoint(x, y);
        return (
          hit !== null &&
          hit.hasAttribute('data-grid-seconds') &&
          hit.closest('[data-track-id]') === lane &&
          hit.closest('[data-clip-id]') === null &&
          hit.closest('button, input, [role="slider"]') === null
        );
      };
      const right = Math.min(box.right, window.innerWidth) - 4 - travel;
      for (let x = Math.max(box.left, 0) + 4; x <= right; x += 8) {
        if (onBackground(x) && onBackground(x + travel)) {
          return { x, y, trackId: lane.getAttribute('data-track-id'), ownTrack };
        }
      }
    }
    return { x: 0, y: 0, trackId: null, ownTrack };
  }, travelPx);
  if (found === null || found.ownTrack === null || found.trackId === null) return null;
  if (found.trackId === found.ownTrack) return null;
  return { x: found.x, y: found.y, trackId: found.trackId, clipTrackId: found.ownTrack };
}

async function clipHeaderPoint(clip: Locator): Promise<GrabPoint> {
  return visibleGrabPoint(dragTarget(clip, 'move'), {
    fractionY: 0.5,
    centreX: false,
    travelPx: 0,
  });
}

function dragLive(drag: DragName, before: ClipState, mid: ClipState, end: ClipState): boolean {
  switch (drag) {
    case 'range':
      return mid.rangeEnd !== null && end.rangeEnd !== null && end.rangeEnd > mid.rangeEnd;
    case 'fade':
      return Number(before.fadeIn) < Number(mid.fadeIn) && Number(mid.fadeIn) < Number(end.fadeIn);
    case 'trim':
    case 'move':
      return before.start !== mid.start && mid.start !== end.start;
  }
}

function setLive(
  result: InteractionPassResult,
  id: string,
  live: boolean,
  detail: Record<string, number | string | boolean>,
): void {
  const previous = result.samples.get(id);
  const value = live && (previous === undefined || previous.value === 1) ? 1 : 0;
  result.samples.set(id, { value, detail: { ...(previous?.detail ?? {}), ...detail } });
}

function moveToPaintP95(whole: PerfWindowSnapshot, tUp: number): number {
  const latencies = whole.moveLatency
    .filter((sample) => sample.t <= tUp)
    .map((sample) => sample.latency);
  return roundTo(percentile(latencies, 0.95), 1);
}

interface DragWindow {
  moves: number[];
  firstMove: number;
  up: number;
  commits: PerfWindowSnapshot['commits'];
  release: PerfWindowSnapshot['commits'];
  moveStarts: PerfWindowSnapshot['starts'];
  releaseStarts: PerfWindowSnapshot['starts'];
}

function dragWindow(whole: PerfWindowSnapshot): DragWindow | null {
  const downAt = whole.downs.at(-1);
  const up = downAt === undefined ? undefined : whole.ups.find((t) => t > downAt);
  if (downAt === undefined || up === undefined) return null;
  const moves = whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (firstMove === undefined) return null;
  const inWhole = (t: number): boolean => t > firstMove && t < up;
  return {
    moves,
    firstMove,
    up,
    commits: whole.commits.filter((commit) => inWhole(commit.t)),
    release: whole.commits.filter((commit) => commit.t >= up),
    moveStarts: whole.starts.filter((entry) => inWhole(entry.t)),
    releaseStarts: whole.starts.filter((entry) => entry.t >= up),
  };
}

const componentsPerMove = (commits: readonly { rendered: number }[], count: number): number =>
  roundTo(count ? sumRendered(commits) / count : 0, 3);

const rowWriter =
  (result: InteractionPassResult, baseId: string) =>
  (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${baseId}.${metric}`, result.cpuRate), sample);
  };

async function pressedGesture<T>(
  page: Page,
  grab: GrabPoint,
  gesture: () => Promise<T>,
): Promise<T> {
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  let value: T;
  try {
    value = await gesture();
  } catch (error) {
    await page.mouse.up().catch(() => undefined);
    throw error;
  }
  await page.mouse.up();
  return value;
}

async function resetAfterDrag(
  page: Page,
  clip: Locator,
  drag: DragName,
  grab: GrabPoint,
  undoBefore: string | null,
  before: ClipState,
  label: string,
  problems: string[],
): Promise<void> {
  const from = await nowIn(page);
  if (drag === 'range') {
    await page.mouse.click(grab.x, grab.y);
  } else if ((await undoTitle(page)) !== undoBefore) {
    await blurActive(page);
    await page.keyboard.press('Control+z');
  }
  await waitForQuiet(page, from, settleMs);
  const after = await readClipState(clip);
  const restored =
    after.start === before.start &&
    after.fadeIn === before.fadeIn &&
    after.width === before.width &&
    after.rangeEnd === null &&
    after.rangeElements === 0;
  if (!restored) {
    problems.push(
      `${label}: reset failed: before ${JSON.stringify(before)}, after ${JSON.stringify(after)}`,
    );
  }
  if ((await undoTitle(page)) !== undoBefore) {
    problems.push(`${label}: Undo history not back at its start entry after the reset`);
  }
}

interface DragMeasure {
  drag: DragName;
  state: PlaybackState;
  clip: Locator;
  baseId: string;
  liveId: string;
  rows: 'all' | 'all-but-ratio' | 'thirty';
  kind?: ClipKind;
}

async function measureDrag(
  page: Page,
  measure: DragMeasure,
  result: InteractionPassResult,
): Promise<void> {
  const { drag, state, clip, baseId, liveId } = measure;
  const label = `${baseId} (${result.cpuRate}x)`;
  if (state === 'playing') {
    const from = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('Home');
    await waitForQuiet(page, from, settleMs);
    if (!(await isPlaying(page))) result.problems.push(`playback not running before ${label}`);
  }
  const target = dragTarget(clip, drag, measure.kind ?? 'audio');
  const grab = await visibleGrabPoint(target, grabOptions(drag));
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const t0 = await nowIn(page);
  const { mid, end } = await pressedGesture(page, grab, async () => {
    await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });
    const midState = await readClipState(clip);
    await page.mouse.move(grab.x + dragDistancePx, grab.y, { steps: dragSteps / 2 });
    return { mid: midState, end: await readClipState(clip) };
  });
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const whole = await snapshot(page, t0, tEnd);
  const live = dragLive(drag, before, mid, end);
  setLive(result, rateRowId(liveId, result.cpuRate), live, {
    [`${state}Before`]: JSON.stringify(before),
    [`${state}Mid`]: JSON.stringify(mid),
    [`${state}End`]: JSON.stringify(end),
  });
  if (!live) {
    result.problems.push(
      `${label}: drag did not change its target: before ${JSON.stringify(before)}, mid ${JSON.stringify(mid)}, end ${JSON.stringify(end)}`,
    );
  }
  if (state === 'playing' && !(await isPlaying(page))) {
    result.problems.push(`playback not running after ${label}`);
  }

  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, commits: inWindow, release, moveStarts, releaseStarts } = pointerSpan;
    const put = rowWriter(result, baseId);
    const windowDetail = {
      movesInWindow: moves.length,
      windowCommits: inWindow.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    const perMove = componentsPerMove(inWindow, moves.length);
    if (measure.rows !== 'thirty') {
      if (measure.rows === 'all') {
        put('commits-per-move', {
          value: roundTo(moves.length ? inWindow.length / moves.length : 0, 3),
          detail: windowDetail,
        });
      }
      put('move-components-max', { value: maxRendered(inWindow), detail: windowDetail });
      put('release-commits', {
        value: release.length,
        detail: { releaseComponentsMax: maxRendered(release) },
      });
      put('move-to-paint-p95', { value: moveToPaintP95(whole, tUp) });
      if (state === 'playing') {
        put('move-restarts', { value: moveStarts.length, detail: startTasks(moveStarts) });
      }
    }
    put('move-components-per-move', {
      value: perMove,
      detail: { ...windowDetail, componentsSum: sumRendered(inWindow) },
    });
    if (state === 'playing') {
      put('release-restarts', { value: releaseStarts.length, detail: startTasks(releaseStarts) });
    }
  }
  await resetAfterDrag(page, clip, drag, grab, undoBefore, before, label, result.problems);
}

interface BackgroundRangeRead {
  targetLane: number;
  otherLanes: number;
  readoutEnd: number | null;
}

async function readBackgroundRange(page: Page, trackId: string): Promise<BackgroundRangeRead> {
  return page.evaluate((laneTrackId) => {
    const ranges = [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')];
    const targetLane = ranges.filter(
      (range) => range.closest('[data-track-id]')?.getAttribute('data-track-id') === laneTrackId,
    ).length;
    const readout = document.querySelector('[data-testid="arrangement-range"]');
    const times = [...(readout?.textContent ?? '').matchAll(/(\d+):(\d\d\.\d{3})/g)];
    const end = times.at(1);
    return {
      targetLane,
      otherLanes: ranges.length - targetLane,
      readoutEnd: end === undefined ? null : Number(end[1]) * 60 + Number(end[2]),
    };
  }, trackId);
}

async function measureBackgroundRangeDrag(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<void> {
  const baseId = 'interact.drag.background-range.stopped';
  const liveId = rateRowId('interact.harness.drag-background-range-live', result.cpuRate);
  const label = `${baseId} (${result.cpuRate}x)`;
  const fader = clipGainFader(page);
  const grab = await backgroundRangeGrabPoint(clip, dragDistancePx);
  if (grab === null) {
    result.problems.push(`${label}: no lane-background point on another lane in the viewport`);
    setLive(result, liveId, false, { grab: 'none' });
    return;
  }
  const undoBefore = await undoTitle(page);
  const selectedBefore = await fader.isEnabled();
  const clipBefore = await readClipState(clip);
  const t0 = await nowIn(page);
  const { mid, end } = await pressedGesture(page, grab, async () => {
    await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });
    const midRead = await readBackgroundRange(page, grab.trackId);
    await page.mouse.move(grab.x + dragDistancePx, grab.y, { steps: dragSteps / 2 });
    return { mid: midRead, end: await readBackgroundRange(page, grab.trackId) };
  });
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const whole = await snapshot(page, t0, tEnd);

  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, commits: inWindow, release } = pointerSpan;
    const put = rowWriter(result, baseId);
    const windowDetail = {
      movesInWindow: moves.length,
      windowCommits: inWindow.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    put('commits-per-move', {
      value: roundTo(moves.length ? inWindow.length / moves.length : 0, 3),
      detail: windowDetail,
    });
    put('move-components-max', { value: maxRendered(inWindow), detail: windowDetail });
    put('release-commits', {
      value: release.length,
      detail: { releaseComponentsMax: maxRendered(release) },
    });
    put('move-to-paint-p95', { value: moveToPaintP95(whole, tUp) });
    put('move-components-per-move', {
      value: componentsPerMove(inWindow, moves.length),
      detail: { ...windowDetail, componentsSum: sumRendered(inWindow) },
    });
  }

  const markerBeforeReset = await readInsertMarker(page);
  const header = await clipHeaderPoint(clip);
  const resetFrom = await nowIn(page);
  await page.mouse.click(header.x, header.y);
  await waitForQuiet(page, resetFrom, settleMs);
  const after = await page.evaluate(() => ({
    laneRanges: document.querySelectorAll('[data-testid="arrangement-lane-range"]').length,
    rangeStarts: document.querySelectorAll('[data-range-start]').length,
  }));
  const selectedAfter = await fader.isEnabled();
  const undoAfter = await undoTitle(page);
  const markerAfterReset = await readInsertMarker(page);
  const clipAfter = await readClipState(clip);

  const oneRangeOnTarget = (read: BackgroundRangeRead): boolean =>
    read.targetLane === 1 && read.otherLanes === 0;
  const live =
    oneRangeOnTarget(mid) &&
    oneRangeOnTarget(end) &&
    mid.readoutEnd !== null &&
    end.readoutEnd !== null &&
    end.readoutEnd > mid.readoutEnd &&
    after.laneRanges === 0 &&
    after.rangeStarts === 0;
  setLive(result, liveId, live, {
    trackId: grab.trackId,
    clipTrackId: grab.clipTrackId,
    mid: JSON.stringify(mid),
    end: JSON.stringify(end),
    after: JSON.stringify(after),
  });
  if (!live) {
    result.problems.push(
      `${label}: background range drag not live: mid ${JSON.stringify(mid)}, end ${JSON.stringify(end)}, after reset ${JSON.stringify(after)}`,
    );
  }
  if (
    !selectedAfter ||
    selectedAfter !== selectedBefore ||
    after.laneRanges !== 0 ||
    after.rangeStarts !== 0
  ) {
    result.problems.push(
      `${label}: reset failed: clip selected before ${selectedBefore}, after ${selectedAfter}; ${JSON.stringify(after)}`,
    );
  }
  if (undoAfter !== undoBefore) {
    result.problems.push(`${label}: Undo history changed by the background range drag or reset`);
  }
  if (clipAfter.start !== clipBefore.start || clipAfter.width !== clipBefore.width) {
    result.problems.push(
      `${label}: clip start/width changed by the background range drag or reset: ${clipBefore.start}/${clipBefore.width} -> ${clipAfter.start}/${clipAfter.width}`,
    );
  }
  if (markerBeforeReset === null && markerAfterReset === null) {
    result.problems.push(`${label}: Insert Marker not found`);
  } else if (markerAfterReset !== markerBeforeReset) {
    result.problems.push(
      `${label}: Insert Marker moved by the name-bar reset: ${markerBeforeReset} -> ${markerAfterReset}`,
    );
  }
}

async function readInsertMarker(page: Page): Promise<string | null> {
  return page.evaluate(
    () =>
      document
        .querySelector('[data-testid="arrangement-insert-marker"]')
        ?.getAttribute('data-insert-marker') ?? null,
  );
}

interface LaneGhostRead {
  targetLane: number;
  document: number;
  targetStart: number | null;
}

async function readLaneGhosts(page: Page, trackId: string): Promise<LaneGhostRead> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
  return page.evaluate((laneTrackId) => {
    const ghosts = [...document.querySelectorAll('[data-testid="arrangement-lane-move-ghost"]')];
    const target = ghosts.filter(
      (ghost) =>
        ghost.closest('[data-track-id]')?.getAttribute('data-track-id') === laneTrackId &&
        ghost.getAttribute('data-blocked') === 'false',
    );
    const start = target.at(0)?.getAttribute('data-ghost-start');
    return {
      targetLane: target.length,
      document: ghosts.length,
      targetStart: start === undefined || start === null ? null : Number(start),
    };
  }, trackId);
}

const clipLaneTrackId = (clip: Locator): Promise<string | null> =>
  clip.evaluate(
    (element) => element.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
  );

async function measureLaneDrag(
  page: Page,
  state: PlaybackState,
  clip: Locator,
  result: InteractionPassResult,
): Promise<void> {
  const baseId = `interact.drag.lane.${state}`;
  const label = `${baseId} (${result.cpuRate}x)`;
  if (state === 'playing') {
    const from = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('Home');
    await waitForQuiet(page, from, settleMs);
    if (!(await isPlaying(page))) result.problems.push(`playback not running before ${label}`);
  }
  const grab = await clipHeaderPoint(clip);
  const target = await emptyLanePointAfterClip(clip);
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const t0 = await nowIn(page);
  const { t1, entryGhosts, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(
    page,
    grab,
    async () => {
      await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const crossStart = await nowIn(page);
      await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
      const entry = await readLaneGhosts(page, target.trackId);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const cross = await readLaneGhosts(page, target.trackId);
      const crossEnd = await nowIn(page);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, grab.y, { steps: 1 });
      await page.mouse.move(grab.x + 3 * laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const back = await readLaneGhosts(page, target.trackId);
      return {
        t1: crossStart,
        entryGhosts: entry,
        crossGhosts: cross,
        t2: crossEnd,
        backGhosts: back,
        t3: await nowIn(page),
      };
    },
  );
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const whole = await snapshot(page, t0, tEnd);
  const released = await readClipState(clip);
  const releasedTrackId = await clipLaneTrackId(clip);
  if (state === 'playing' && !(await isPlaying(page))) {
    result.problems.push(`playback not running after ${label}`);
  }

  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, firstMove, up, commits: wholeCommits, release } = pointerSpan;
    const inCross = (t: number): boolean => t > t1 && t < t2;
    const inLane = (t: number): boolean => (t > firstMove && t < t1) || (t > t2 && t < up);
    const crossCommits = whole.commits.filter((commit) => inCross(commit.t));
    const crossMoves = whole.moves.filter(inCross);
    const laneCommits = whole.commits.filter((commit) => inLane(commit.t));
    const laneMoves = whole.moves.filter(inLane);
    const put = rowWriter(result, baseId);
    const settle = roundTo(tEnd - tUp, 0);
    const wholeDetail = {
      movesInWindow: moves.length,
      windowCommits: wholeCommits.length,
      settleMs: settle,
    };
    put('move-components-per-move', {
      value: componentsPerMove(wholeCommits, moves.length),
      detail: { ...wholeDetail, componentsSum: sumRendered(wholeCommits) },
    });
    put('move-components-max', { value: maxRendered(wholeCommits), detail: wholeDetail });
    put('release-commits', {
      value: release.length,
      detail: { releaseComponentsMax: maxRendered(release) },
    });
    put('cross-components-per-move', {
      value: componentsPerMove(crossCommits, crossMoves.length),
      detail: {
        movesInWindow: crossMoves.length,
        windowCommits: crossCommits.length,
        componentsSum: sumRendered(crossCommits),
      },
    });
    put('lane-components-per-move', {
      value: componentsPerMove(laneCommits, laneMoves.length),
      detail: {
        movesInWindow: laneMoves.length,
        windowCommits: laneCommits.length,
        componentsSum: sumRendered(laneCommits),
        backMoves: whole.moves.filter((t) => t > t2 && t < t3).length,
      },
    });
    if (state === 'playing') {
      const { moveStarts, releaseStarts } = pointerSpan;
      put('move-restarts', { value: moveStarts.length, detail: startTasks(moveStarts) });
      put('release-restarts', { value: releaseStarts.length, detail: startTasks(releaseStarts) });
    }
  }

  await resetAfterDrag(page, clip, 'move', grab, undoBefore, before, label, result.problems);
  const reset = await readClipState(clip);
  const resetTrackId = await clipLaneTrackId(clip);
  if (resetTrackId !== target.clipTrackId) {
    result.problems.push(
      `${label}: reset left the clip on lane ${resetTrackId}, not ${target.clipTrackId}`,
    );
  }

  const failed: string[] = [];
  if (crossGhosts.targetLane < 1) {
    failed.push(
      `(a) target-lane ${target.trackId} non-blocked ghosts ${crossGhosts.targetLane} at the cross read`,
    );
  }
  if (
    entryGhosts.targetStart === null ||
    crossGhosts.targetStart === null ||
    !(crossGhosts.targetStart > entryGhosts.targetStart)
  ) {
    failed.push(
      `(e) target-lane ghost start ${entryGhosts.targetStart} at the entry read, ${crossGhosts.targetStart} at the cross read; want it to advance`,
    );
  }
  if (backGhosts.document !== 0) {
    failed.push(`(b) document ghosts ${backGhosts.document} at the back read`);
  }
  if (releasedTrackId !== target.clipTrackId || released.start === before.start) {
    failed.push(
      `(c) after release lane ${releasedTrackId} (want ${target.clipTrackId}), start ${released.start} (before ${before.start})`,
    );
  }
  const resetRestored =
    reset.start === before.start &&
    reset.fadeIn === before.fadeIn &&
    reset.width === before.width &&
    reset.rangeEnd === null &&
    reset.rangeElements === 0 &&
    resetTrackId === target.clipTrackId;
  if (!resetRestored) {
    failed.push(
      `(d) after reset ${JSON.stringify(reset)} on lane ${resetTrackId}, want ${JSON.stringify(before)} on lane ${target.clipTrackId}`,
    );
  }
  const live = failed.length === 0;
  setLive(result, rateRowId('interact.harness.drag-lane-live', result.cpuRate), live, {
    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,
    [`${state}EntryGhostStart`]: entryGhosts.targetStart ?? '',
    [`${state}CrossGhostStart`]: crossGhosts.targetStart ?? '',
    [`${state}BackDocumentGhosts`]: backGhosts.document,
    [`${state}ReleasedTrack`]: releasedTrackId ?? '',
    [`${state}ReleasedStart`]: released.start,
    [`${state}Before`]: JSON.stringify(before),
    [`${state}Reset`]: JSON.stringify(reset),
  });
  for (const failure of failed) {
    result.problems.push(`${label}: lane-drag liveness ${failure}`);
  }
}

interface GroupClips {
  clip: Locator;
  copy: Locator;
  undoBefore: string | null;
  before: ClipState;
}

async function setupGroupClips(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<GroupClips | null> {
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const clipId = await clip.getAttribute('data-clip-id');
  if (clipId === null) {
    result.problems.push('group setup: the clip has no data-clip-id');
    return null;
  }
  const header = await clipHeaderPoint(clip);
  await page.mouse.click(header.x, header.y);
  await blurActive(page);
  const from = await nowIn(page);
  await page.keyboard.press('Control+d');
  await expect(audioClips(page)).toHaveCount(2);
  await waitForQuiet(page, from, settleMs);
  const ids = await audioClips(page).evaluateAll((clips) =>
    clips.map((element) => element.getAttribute('data-clip-id') ?? ''),
  );
  const copyId = ids.find((id) => id !== '' && id !== clipId);
  if (copyId === undefined) {
    result.problems.push(`group setup: no Ctrl+D copy next to clip ${clipId}`);
    return null;
  }
  const again = await clipHeaderPoint(clip);
  await page.keyboard.down('Control');
  try {
    await page.mouse.click(again.x, again.y);
  } finally {
    await page.keyboard.up('Control');
  }
  await waitForQuiet(page, await nowIn(page), settleMs);
  return { clip, copy: clipById(page, copyId), undoBefore, before };
}

async function teardownGroupClips(
  page: Page,
  group: GroupClips,
  result: InteractionPassResult,
): Promise<void> {
  await blurActive(page);
  let presses = 0;
  while (presses < 3 && (presses === 0 || (await undoTitle(page)) !== group.undoBefore)) {
    const from = await nowIn(page);
    await page.keyboard.press('Control+z');
    await waitForQuiet(page, from, settleMs);
    presses += 1;
  }
  if (presses > 1) {
    result.problems.push(
      `group teardown: ${presses} Ctrl+Z presses to reach the start entry; want 1`,
    );
  }
  await expect(audioClips(page)).toHaveCount(1);
  const after = await readClipState(group.clip);
  if (JSON.stringify(after) !== JSON.stringify(group.before)) {
    result.problems.push(
      `group teardown: clip ${JSON.stringify(after)}, want ${JSON.stringify(group.before)}`,
    );
  }
  if ((await undoTitle(page)) !== group.undoBefore) {
    result.problems.push('group teardown: Undo history not back at its start entry');
  }
}

interface VideoClip {
  clip: Locator;
  undoBefore: string | null;
  zoomKeys: number;
}

async function setupVideoClip(
  page: Page,
  result: InteractionPassResult,
): Promise<VideoClip | null> {
  if ((await videoClips(page).count()) !== 0) {
    result.problems.push('video setup: the video lane is not empty');
    return null;
  }
  const undoBefore = await undoTitle(page);
  const from = await nowIn(page);
  await page.getByTestId('arrangement-video-input').setInputFiles(videoFixturePath);
  await expect(videoClips(page)).toHaveCount(1, { timeout: 30_000 });
  await waitForQuiet(page, from, settleMs);
  if ((await undoTitle(page)) === undoBefore) {
    result.problems.push('video setup: the import added no Undo entry');
    return null;
  }
  const clipId = await videoClips(page).first().getAttribute('data-clip-id');
  if (clipId === null) {
    result.problems.push('video setup: the imported video clip has no data-clip-id');
    return null;
  }
  const clip = videoClipById(page, clipId);
  const moveTarget = dragTarget(clip, 'move');
  await blurActive(page);
  let zoomKeys = 0;
  while (
    zoomKeys < videoZoomInKeyLimit &&
    ((await moveTarget.boundingBox())?.width ?? 0) < videoGrabWidthPx
  ) {
    const fromKey = await nowIn(page);
    await page.keyboard.press('=');
    await waitForQuiet(page, fromKey, videoZoomSettleMs);
    zoomKeys += 1;
  }
  const width = (await moveTarget.boundingBox())?.width ?? 0;
  if (width < videoGrabWidthPx) {
    result.problems.push(
      `video setup: name bar ${roundTo(width, 1)} px wide after ${zoomKeys} zoom-in keys; want ${videoGrabWidthPx}`,
    );
    return null;
  }
  return { clip, undoBefore, zoomKeys };
}

const videoDrags: VideoDrag[] = ['move', 'trim', 'fade'];

const videoDragBaseId = (drag: VideoDrag): string =>
  drag === 'move' ? 'interact.drag.video' : `interact.drag.video-${drag}`;

const videoDragLiveId = (drag: VideoDrag): string =>
  drag === 'move' ? 'interact.harness.drag-video-live' : `interact.harness.drag-video-${drag}-live`;

const videoDragMeasure = (drag: VideoDrag, state: PlaybackState, clip: Locator): DragMeasure => ({
  drag,
  state,
  clip,
  baseId: `${videoDragBaseId(drag)}.${state}`,
  liveId: videoDragLiveId(drag),
  rows: 'all-but-ratio',
  kind: 'video',
});

async function teardownVideoClip(
  page: Page,
  video: VideoClip,
  result: InteractionPassResult,
): Promise<void> {
  await blurActive(page);
  let presses = 0;
  while (presses < 3 && (presses === 0 || (await undoTitle(page)) !== video.undoBefore)) {
    const from = await nowIn(page);
    await page.keyboard.press('Control+z');
    await waitForQuiet(page, from, settleMs);
    presses += 1;
  }
  if (presses > 1) {
    result.problems.push(
      `video teardown: ${presses} Ctrl+Z presses to reach the start entry; want 1`,
    );
  }
  await expect(videoClips(page)).toHaveCount(0);
  if ((await undoTitle(page)) !== video.undoBefore) {
    result.problems.push('video teardown: Undo history not back at its start entry');
  }
}

async function measureGroupDrag(
  page: Page,
  state: PlaybackState,
  group: GroupClips,
  result: InteractionPassResult,
): Promise<void> {
  const { clip, copy } = group;
  const baseId = `interact.drag.group.${state}`;
  const label = `${baseId} (${result.cpuRate}x)`;
  if (state === 'playing') {
    const from = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('Home');
    await waitForQuiet(page, from, settleMs);
    if (!(await isPlaying(page))) result.problems.push(`playback not running before ${label}`);
  }
  const grab = await clipHeaderPoint(clip);
  const target = await emptyLanePointAfterClip(clip);
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const copyBefore = await readClipState(copy);
  const t0 = await nowIn(page);
  const { ownCopy, t1, entryGhosts, crossGhosts, t2, backGhosts, t3 } = await pressedGesture(
    page,
    grab,
    async () => {
      await page.mouse.move(grab.x + laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      await page.evaluate(
        () =>
          new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          }),
      );
      const own = await readClipState(copy);
      const crossStart = await nowIn(page);
      await page.mouse.move(grab.x + laneSegmentPx, target.y, { steps: 1 });
      const entry = await readLaneGhosts(page, target.trackId);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, target.y, { steps: laneSegmentSteps });
      const cross = await readLaneGhosts(page, target.trackId);
      const crossEnd = await nowIn(page);
      await page.mouse.move(grab.x + 2 * laneSegmentPx, grab.y, { steps: 1 });
      await page.mouse.move(grab.x + 3 * laneSegmentPx, grab.y, { steps: laneSegmentSteps });
      const back = await readLaneGhosts(page, target.trackId);
      return {
        ownCopy: own,
        t1: crossStart,
        entryGhosts: entry,
        crossGhosts: cross,
        t2: crossEnd,
        backGhosts: back,
        t3: await nowIn(page),
      };
    },
  );
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const whole = await snapshot(page, t0, tEnd);
  const released = await readClipState(clip);
  const copyReleased = await readClipState(copy);
  const releasedTrackId = await clipLaneTrackId(clip);
  const copyReleasedTrackId = await clipLaneTrackId(copy);
  if (state === 'playing' && !(await isPlaying(page))) {
    result.problems.push(`playback not running after ${label}`);
  }

  const pointerSpan = dragWindow(whole);
  if (pointerSpan === null) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const { moves, firstMove, up, commits: wholeCommits, release } = pointerSpan;
    const inCross = (t: number): boolean => t > t1 && t < t2;
    const inLane = (t: number): boolean => (t > firstMove && t < t1) || (t > t2 && t < up);
    const crossCommits = whole.commits.filter((commit) => inCross(commit.t));
    const crossMoves = whole.moves.filter(inCross);
    const laneCommits = whole.commits.filter((commit) => inLane(commit.t));
    const laneMoves = whole.moves.filter(inLane);
    const put = rowWriter(result, baseId);
    const wholeDetail = {
      movesInWindow: moves.length,
      windowCommits: wholeCommits.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    put('move-components-per-move', {
      value: componentsPerMove(wholeCommits, moves.length),
      detail: { ...wholeDetail, componentsSum: sumRendered(wholeCommits) },
    });
    put('move-components-max', { value: maxRendered(wholeCommits), detail: wholeDetail });
    put('release-commits', {
      value: release.length,
      detail: { releaseComponentsMax: maxRendered(release) },
    });
    put('cross-components-per-move', {
      value: componentsPerMove(crossCommits, crossMoves.length),
      detail: {
        movesInWindow: crossMoves.length,
        windowCommits: crossCommits.length,
        componentsSum: sumRendered(crossCommits),
      },
    });
    put('lane-components-per-move', {
      value: componentsPerMove(laneCommits, laneMoves.length),
      detail: {
        movesInWindow: laneMoves.length,
        windowCommits: laneCommits.length,
        componentsSum: sumRendered(laneCommits),
        backMoves: whole.moves.filter((t) => t > t2 && t < t3).length,
      },
    });
    if (state === 'playing') {
      const { moveStarts, releaseStarts } = pointerSpan;
      put('move-restarts', { value: moveStarts.length, detail: startTasks(moveStarts) });
      put('release-restarts', { value: releaseStarts.length, detail: startTasks(releaseStarts) });
    }
  }

  await resetAfterDrag(page, clip, 'move', grab, undoBefore, before, label, result.problems);
  const reset = await readClipState(clip);
  const copyReset = await readClipState(copy);
  const resetTrackId = await clipLaneTrackId(clip);
  const copyResetTrackId = await clipLaneTrackId(copy);

  const failed: string[] = [];
  if (ownCopy.start === copyBefore.start) {
    failed.push(`(f) the copy's start ${ownCopy.start} did not move on the own-lane read`);
  }
  if (crossGhosts.targetLane !== 2) {
    failed.push(
      `(a) target-lane ${target.trackId} non-blocked ghosts ${crossGhosts.targetLane} at the cross read; want 2`,
    );
  }
  if (
    entryGhosts.targetStart === null ||
    crossGhosts.targetStart === null ||
    !(crossGhosts.targetStart > entryGhosts.targetStart)
  ) {
    failed.push(
      `(e) target-lane ghost start ${entryGhosts.targetStart} at the entry read, ${crossGhosts.targetStart} at the cross read; want it to advance`,
    );
  }
  if (backGhosts.document !== 0) {
    failed.push(`(b) document ghosts ${backGhosts.document} at the back read`);
  }
  const releaseDelta = Number(released.start) - Number(before.start);
  const copyDelta = Number(copyReleased.start) - Number(copyBefore.start);
  if (
    releasedTrackId !== target.clipTrackId ||
    copyReleasedTrackId !== target.clipTrackId ||
    !(releaseDelta > 0) ||
    Math.abs(releaseDelta - copyDelta) > 0.0015
  ) {
    failed.push(
      `(c) after release lanes ${releasedTrackId}/${copyReleasedTrackId} (want ${target.clipTrackId}), deltas ${releaseDelta}/${copyDelta}`,
    );
  }
  if (
    JSON.stringify(reset) !== JSON.stringify(before) ||
    JSON.stringify(copyReset) !== JSON.stringify(copyBefore) ||
    resetTrackId !== target.clipTrackId ||
    copyResetTrackId !== target.clipTrackId
  ) {
    failed.push(
      `(d) after reset ${JSON.stringify(reset)} on lane ${resetTrackId} and copy ${JSON.stringify(copyReset)} on lane ${copyResetTrackId}, want ${JSON.stringify(before)} and ${JSON.stringify(copyBefore)} on lane ${target.clipTrackId}`,
    );
  }
  const live = failed.length === 0;
  setLive(result, rateRowId('interact.harness.drag-group-live', result.cpuRate), live, {
    [`${state}OwnCopyStart`]: ownCopy.start,
    [`${state}TargetLaneGhosts`]: crossGhosts.targetLane,
    [`${state}EntryGhostStart`]: entryGhosts.targetStart ?? '',
    [`${state}CrossGhostStart`]: crossGhosts.targetStart ?? '',
    [`${state}BackDocumentGhosts`]: backGhosts.document,
    [`${state}ReleaseDelta`]: roundTo(releaseDelta, 3),
    [`${state}CopyDelta`]: roundTo(copyDelta, 3),
    [`${state}Reset`]: JSON.stringify(reset),
  });
  for (const failure of failed) {
    result.problems.push(`${label}: group-drag liveness ${failure}`);
  }
}

async function measureZoom(
  page: Page,
  clipCount: 1 | 30,
  result: InteractionPassResult,
): Promise<void> {
  const base = `interact.zoom.${clipCount}`;
  const liveId = clipCount === 1 ? 'interact.harness.zoom-live' : 'interact.harness.zoom-30-live';
  const slider = zoomSlider(page);
  await expect(slider).toHaveCount(1);
  const keys = [
    ...Array.from({ length: zoomKeyCount }, () => '='),
    ...Array.from({ length: zoomKeyCount }, () => '-'),
  ];
  let commits = 0;
  let components = 0;
  let componentsMax = 0;
  let longestMs = 0;
  let longestLoaf = 0;
  let wrongDirection = 0;
  const sliderMin = Number((await slider.getAttribute('min')) || Number.NaN);
  const sliderMax = Number((await slider.getAttribute('max')) || Number.NaN);
  if (!Number.isFinite(sliderMin) || !Number.isFinite(sliderMax)) {
    result.problems.push(`${base}: zoom slider min/max missing`);
    return;
  }
  const values: number[] = [Number(await slider.inputValue())];
  for (const key of keys) {
    await blurActive(page);
    const t0 = await nowIn(page);
    await page.keyboard.press(key);
    const tEnd = await waitForQuiet(page, t0, keySettleMs);
    const keyWindow = await snapshot(page, t0, tEnd);
    const value = Number(await slider.inputValue());
    const previous = values.at(-1) ?? value;
    if (key === '=' ? !(value > previous) : !(value < previous)) wrongDirection += 1;
    values.push(value);
    commits += keyWindow.commits.length;
    components += sumRendered(keyWindow.commits);
    componentsMax = Math.max(componentsMax, maxRendered(keyWindow.commits));
    const lastCommit = keyWindow.commits.at(-1)?.t;
    if (lastCommit !== undefined) longestMs = Math.max(longestMs, lastCommit - t0);
    longestLoaf = Math.max(longestLoaf, ...keyWindow.loafs.map((entry) => entry.duration), 0);
  }
  const put = (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${base}.${metric}`, result.cpuRate), sample);
  };
  put('commits-per-key', { value: roundTo(commits / keys.length, 3), detail: { commits } });
  put('components-per-key', {
    value: roundTo(components / keys.length, 3),
    detail: { components },
  });
  put('components-max', { value: componentsMax });
  put('key-window-longest-ms', {
    value: roundTo(longestMs, 1),
    detail: { longestLoafMs: roundTo(longestLoaf, 1) },
  });
  const symmetric = values.every((value, index) => value === values[values.length - 1 - index]);
  const unclamped = values.every((value) => value > sliderMin && value < sliderMax);
  const live = wrongDirection === 0 && symmetric && unclamped;
  result.samples.set(rateRowId(liveId, result.cpuRate), {
    value: live ? 1 : 0,
    detail: { sliderValues: values.join(','), sliderMin, sliderMax },
  });
  if (!live) {
    const rule =
      wrongDirection > 0
        ? 'did not move the right way on every key'
        : !symmetric
          ? 'did not return along the same values'
          : `reached its min ${sliderMin} or max ${sliderMax}`;
    result.problems.push(`${base}: Zoom (px/s) slider ${rule}: ${values.join(', ')}`);
  }
}

type ZoomPathDirection = 'in' | 'out';

interface ZoomProbeStep {
  zoomIn: boolean;
  act: () => Promise<void>;
}

interface ZoomProbeStepRecord {
  value: number;
  keydownMs: number;
  loafMs: number;
  commits: number;
  pathRewrites: number;
  rulerMutations: number;
}

const zoomWheelDeltaY = 100;
const zoomWheelOffsetX = 224 + 300;
const zoomWheelOffsetY = 60;

async function runZoomProbeSteps(
  page: Page,
  steps: readonly ZoomProbeStep[],
  label: string,
  problems: string[],
): Promise<{ startValue: number; records: ZoomProbeStepRecord[] }> {
  const slider = zoomSlider(page);
  await expect(slider).toHaveCount(1);
  const startValue = Number(await slider.inputValue());
  const records: ZoomProbeStepRecord[] = [];
  await page.evaluate(installZoomProbe);
  try {
    for (const [index, step] of steps.entries()) {
      await blurActive(page);
      await page.evaluate(resetZoomProbe);
      const t0 = await nowIn(page);
      await step.act();
      const tEnd = await waitForQuiet(page, t0, keySettleMs);
      const stepWindow = await snapshot(page, t0, tEnd);
      const probe = await page.evaluate(readZoomProbe);
      const loafMs = await page.evaluate(
        ({ start, end }) =>
          (window.__czabaPerf?.loafs ?? [])
            .filter((entry) => entry.t <= end && entry.t + entry.duration >= start)
            .reduce((max, entry) => Math.max(max, entry.duration), 0),
        { start: t0, end: tEnd },
      );
      if (!probe.connected)
        problems.push(`${label}: zoom probe not connected at step ${index + 1}`);
      records.push({
        value: Number(await slider.inputValue()),
        keydownMs: stepWindow.events
          .filter((entry) => entry.name === 'keydown')
          .reduce((max, entry) => Math.max(max, entry.duration), 0),
        loafMs,
        commits: stepWindow.commits.length,
        pathRewrites: probe.pathRewrites,
        rulerMutations: probe.rulerMutations,
      });
    }
  } finally {
    await page.evaluate(disconnectZoomProbe);
  }
  return { startValue, records };
}

const sumOf = (values: readonly number[]): number => values.reduce((sum, value) => sum + value, 0);

const maxOf = (values: readonly number[]): number =>
  values.reduce((max, value) => Math.max(max, value), 0);

const wrongZoomSteps = (
  startValue: number,
  steps: readonly ZoomProbeStep[],
  records: readonly ZoomProbeStepRecord[],
): number =>
  records.filter((record, index) => {
    const previous = index === 0 ? startValue : records[index - 1].value;
    return steps[index].zoomIn ? !(record.value > previous) : !(record.value < previous);
  }).length;

async function measureZoomPath(
  page: Page,
  direction: ZoomPathDirection,
  result: InteractionPassResult,
): Promise<void> {
  const base = `interact.zoom.${clipsTarget}.${direction}`;
  const liveId = `interact.harness.zoom-${clipsTarget}-${direction}-path-live`;
  const slider = zoomSlider(page);
  await expect(slider).toHaveCount(1);
  const sliderMin = Number((await slider.getAttribute('min')) || Number.NaN);
  const sliderMax = Number((await slider.getAttribute('max')) || Number.NaN);
  if (!Number.isFinite(sliderMin) || !Number.isFinite(sliderMax)) {
    result.problems.push(`${base}: zoom slider min/max missing`);
    return;
  }
  const firstKey = direction === 'in' ? '=' : '-';
  const secondKey = direction === 'in' ? '-' : '=';
  const keys = [
    ...Array.from({ length: zoomKeyCount }, () => firstKey),
    ...Array.from({ length: zoomKeyCount }, () => secondKey),
  ];
  const steps = keys.map(
    (key): ZoomProbeStep => ({
      zoomIn: key === '=',
      act: () => page.keyboard.press(key),
    }),
  );
  const { startValue, records } = await runZoomProbeSteps(page, steps, base, result.problems);
  const keydown = records.map((record) => roundTo(record.keydownMs, 1));
  const loafs = records.map((record) => roundTo(record.loafMs, 1));
  const commits = records.map((record) => record.commits);
  const rewrites = records.map((record) => record.pathRewrites);
  const ruler = records.map((record) => record.rulerMutations);
  const put = (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${base}.${metric}`, result.cpuRate), sample);
  };
  put('keydown-max-ms', { value: maxOf(keydown), detail: { perKey: keydown.join(',') } });
  put('keydown-median-ms', { value: median(keydown), detail: { perKey: keydown.join(',') } });
  put('loaf-max-ms', { value: maxOf(loafs), detail: { perKey: loafs.join(',') } });
  put('commits-per-key', {
    value: roundTo(sumOf(commits) / keys.length, 3),
    detail: { perKey: commits.join(','), max: maxOf(commits) },
  });
  put('path-rewrites', { value: sumOf(rewrites), detail: { perKey: rewrites.join(',') } });
  put('ruler-mutations', { value: sumOf(ruler), detail: { perKey: ruler.join(',') } });

  const values = [startValue, ...records.map((record) => record.value)];
  const wrongDirection = wrongZoomSteps(startValue, steps, records);
  const symmetric = values.every((value, index) => value === values[values.length - 1 - index]);
  const unclamped = values.every((value) => value > sliderMin && value < sliderMax);
  const live = records.length === keys.length && wrongDirection === 0 && symmetric && unclamped;
  result.samples.set(rateRowId(liveId, result.cpuRate), {
    value: live ? 1 : 0,
    detail: { sliderValues: values.join(','), sliderMin, sliderMax },
  });
  if (!live) {
    const rule =
      wrongDirection > 0
        ? 'did not move the right way on every key'
        : !symmetric
          ? 'did not return along the same values'
          : `reached its min ${sliderMin} or max ${sliderMax}`;
    result.problems.push(`${base}: Zoom (px/s) slider ${rule}: ${values.join(', ')}`);
  }
}

async function measureZoomWheel(page: Page, result: InteractionPassResult): Promise<void> {
  const base = `interact.zoom.${clipsTarget}.wheel`;
  const liveId = `interact.harness.zoom-${clipsTarget}-wheel-live`;
  const scrollerBox = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
  if (scrollerBox === null) {
    result.problems.push(`${base}: the timeline scroller has no bounding box`);
    return;
  }
  const hoverFrom = await nowIn(page);
  await page.mouse.move(scrollerBox.x + zoomWheelOffsetX, scrollerBox.y + zoomWheelOffsetY);
  await waitForQuiet(page, hoverFrom, keySettleMs);
  const steps = Array.from({ length: zoomKeyCount * 2 }, (_, index): ZoomProbeStep => {
    const zoomIn = index >= zoomKeyCount;
    return {
      zoomIn,
      act: async () => {
        await page.keyboard.down('Control');
        await page.mouse.wheel(0, zoomIn ? -zoomWheelDeltaY : zoomWheelDeltaY);
        await page.keyboard.up('Control');
      },
    };
  });
  const { startValue, records } = await runZoomProbeSteps(page, steps, base, result.problems);
  const loafs = records.map((record) => roundTo(record.loafMs, 1));
  const commits = records.map((record) => record.commits);
  const rewrites = records.map((record) => record.pathRewrites);
  const put = (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${base}.${metric}`, result.cpuRate), sample);
  };
  put('loaf-max-ms', { value: maxOf(loafs), detail: { perStep: loafs.join(',') } });
  put('commits-per-step', {
    value: roundTo(sumOf(commits) / steps.length, 3),
    detail: { perStep: commits.join(','), max: maxOf(commits) },
  });
  put('path-rewrites', { value: sumOf(rewrites), detail: { perStep: rewrites.join(',') } });

  const values = [startValue, ...records.map((record) => record.value)];
  const wrongDirection = wrongZoomSteps(startValue, steps, records);
  const live = records.length === steps.length && wrongDirection === 0;
  result.samples.set(rateRowId(liveId, result.cpuRate), {
    value: live ? 1 : 0,
    detail: { sliderValues: values.join(','), wrongDirection },
  });
  if (!live) {
    result.problems.push(
      `${base}: Zoom (px/s) slider did not move the right way on every Ctrl+wheel step: ${values.join(', ')}`,
    );
  }
}

async function measureClipClick(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<void> {
  const fader = clipGainFader(page);
  const selectedAfterAdd = await fader.isEnabled();
  const emptyFrom = await nowIn(page);
  const empty = await emptyLanePointAfterClip(clip);
  await page.mouse.click(empty.x, empty.y);
  await waitForQuiet(page, emptyFrom, settleMs);
  const deselected = await fader.isDisabled();
  const header = await clipHeaderPoint(clip);
  const t0 = await nowIn(page);
  await page.mouse.click(header.x, header.y);
  const tEnd = await waitForQuiet(page, t0, settleMs);
  const clickWindow = await snapshot(page, t0, tEnd);
  const selected = await fader.isEnabled();
  const eventMax = clickWindow.events.reduce((max, entry) => Math.max(max, entry.duration), 0);
  const loafMax = clickWindow.loafs.reduce((max, entry) => Math.max(max, entry.duration), 0);
  const put = (id: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(id, result.cpuRate), sample);
  };
  put('interact.click.commits', { value: clickWindow.commits.length });
  put('interact.click.components', {
    value: sumRendered(clickWindow.commits),
    detail: { perCommit: clickWindow.commits.map((commit) => commit.rendered).join(',') },
  });
  put('interact.click.event-duration-max', {
    value: roundTo(clickWindow.events.length ? eventMax : loafMax, 1),
    detail: {
      source: clickWindow.events.length
        ? 'event-timing'
        : clickWindow.loafs.length
          ? 'loaf'
          : 'none',
      events: clickWindow.events.map((entry) => entry.name).join(','),
    },
  });
  const live = selectedAfterAdd && deselected && selected && (await fader.count()) === 1;
  put('interact.harness.click-live', {
    value: live ? 1 : 0,
    detail: {
      faderEnabledAfterAdd: selectedAfterAdd,
      faderDisabledBeforeClick: deselected,
      faderEnabledAfterClick: selected,
      clipTrackId: empty.clipTrackId,
      emptyLaneTrackId: empty.trackId,
    },
  });
  if (!live) {
    result.problems.push(
      `clip click: Clip Gain fader enabled after Add ${selectedAfterAdd}, disabled after the empty-lane click ${deselected}, enabled after the clip click ${selected}`,
    );
  }
}

interface SelectionReadout {
  detailStart: number | null;
  activeTracks: string[];
  rangeElements: number;
}

async function readSelectionReadout(page: Page): Promise<SelectionReadout> {
  return page.evaluate(() => {
    const start = document.querySelector<HTMLInputElement>(
      '[data-testid="arrangement-detail-start"]',
    );
    return {
      detailStart: start && !start.disabled && start.value !== '' ? Number(start.value) : null,
      activeTracks: [...document.querySelectorAll('[data-track-id] button[aria-pressed="true"]')]
        .map((button) => button.closest('[data-track-id]')?.getAttribute('data-track-id') ?? '')
        .filter((trackId) => trackId !== ''),
      rangeElements: document.querySelectorAll('[data-range-start]').length,
    };
  });
}

async function visibleClipHeaderCount(page: Page): Promise<number> {
  const clips = audioClips(page);
  const count = await clips.count();
  let visible = 0;
  for (let index = 0; index < count; index += 1) {
    if ((await clipHeaderPoint(clips.nth(index)).catch(() => null)) !== null) visible += 1;
  }
  return visible;
}

async function zoomOutUntilTwoClipHeaders(
  page: Page,
): Promise<{ presses: number; visible: number }> {
  let presses = 0;
  let visible = await visibleClipHeaderCount(page);
  while (visible < 2 && presses < selectZoomOutKeyLimit) {
    const from = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('-');
    await waitForQuiet(page, from, keySettleMs);
    presses += 1;
    visible = await visibleClipHeaderCount(page);
  }
  return { presses, visible };
}

async function unselectedClipOnSelectedLane(
  page: Page,
  selectedStart: number | null,
  laneTrackId: string | null,
): Promise<{ clip: Locator; header: GrabPoint; start: number; trackId: string | null } | null> {
  const clips = audioClips(page);
  const count = await clips.count();
  for (let index = 0; index < count; index += 1) {
    const candidate = clips.nth(index);
    const start = Number(await candidate.getAttribute('data-clip-start'));
    if (!Number.isFinite(start)) continue;
    if (selectedStart !== null && Math.abs(start - selectedStart) < 0.0005) continue;
    const trackId = await candidate.evaluate(
      (element) => element.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
    );
    if (laneTrackId !== null && trackId !== laneTrackId) continue;
    const header = await clipHeaderPoint(candidate).catch(() => null);
    if (header !== null) return { clip: candidate, header, start, trackId };
  }
  return null;
}

async function measureSelectSameLane(page: Page, result: InteractionPassResult): Promise<void> {
  const base = `interact.select.same-lane.${clipsTarget}`;
  const reclickBase = `interact.select.reclick.${clipsTarget}`;
  const liveId = 'interact.harness.select-same-lane-live';
  const zoomOut = await zoomOutUntilTwoClipHeaders(page);
  const zoomOutPresses = zoomOut.presses;
  if (zoomOut.visible < 2) {
    result.problems.push(
      `${base}: ${zoomOut.visible} visible clip name bars after ${zoomOutPresses} "-" presses (limit ${selectZoomOutKeyLimit})`,
    );
    return;
  }
  const setup = await unselectedClipOnSelectedLane(page, null, null);
  if (setup === null) {
    result.problems.push(`${base}: no visible clip name bar to select before the measured click`);
    return;
  }
  const setupFrom = await nowIn(page);
  await page.mouse.click(setup.header.x, setup.header.y);
  await waitForQuiet(page, setupFrom, settleMs);
  const before = await readSelectionReadout(page);
  if (before.detailStart === null) {
    result.problems.push(`${base}: no single selected clip in the detail panel before the click`);
    return;
  }
  const target = await unselectedClipOnSelectedLane(page, before.detailStart, setup.trackId);
  if (target === null) {
    result.problems.push(`${base}: no visible unselected clip name bar on the selected lane`);
    return;
  }
  const t0 = await nowIn(page);
  await page.mouse.click(target.header.x, target.header.y);
  const tEnd = await waitForQuiet(page, t0, settleMs);
  const selectWindow = await snapshot(page, t0, tEnd);
  const after = await readSelectionReadout(page);
  const r0 = await nowIn(page);
  await page.mouse.click(target.header.x, target.header.y);
  const rEnd = await waitForQuiet(page, r0, settleMs);
  const reclickWindow = await snapshot(page, r0, rEnd);
  const afterReclick = await readSelectionReadout(page);
  const put = (id: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(id, result.cpuRate), sample);
  };
  const perCommit = (commits: readonly { rendered: number }[]): string =>
    commits.map((commit) => commit.rendered).join(',');
  put(`${base}.commits`, { value: selectWindow.commits.length });
  put(`${base}.components`, {
    value: sumRendered(selectWindow.commits),
    detail: { perCommit: perCommit(selectWindow.commits) },
  });
  put(`${reclickBase}.commits`, { value: reclickWindow.commits.length });
  put(`${reclickBase}.components`, {
    value: sumRendered(reclickWindow.commits),
    detail: { perCommit: perCommit(reclickWindow.commits) },
  });
  const clickedIsSelected =
    after.detailStart !== null && Math.abs(after.detailStart - target.start) < 0.0005;
  const activeUnchanged = after.activeTracks.join(',') === before.activeTracks.join(',');
  const live =
    clickedIsSelected && activeUnchanged && before.rangeElements === 0 && after.rangeElements === 0;
  put(liveId, {
    value: live ? 1 : 0,
    detail: {
      zoomOutPresses,
      detailStartBefore: before.detailStart,
      detailStartAfter: after.detailStart ?? -1,
      detailStartAfterReclick: afterReclick.detailStart ?? -1,
      clickedStart: target.start,
      activeTracksBefore: before.activeTracks.join(','),
      activeTracksAfter: after.activeTracks.join(','),
      rangeElementsBefore: before.rangeElements,
      rangeElementsAfter: after.rangeElements,
    },
  });
  if (!live) {
    result.problems.push(
      `${base}: clicked clip selected ${clickedIsSelected}, active track unchanged ${activeUnchanged}, range elements ${before.rangeElements} -> ${after.rangeElements}`,
    );
  }
}

async function measurePlayback(
  page: Page,
  playing: boolean,
  result: InteractionPassResult,
): Promise<void> {
  if (playing) {
    const homeFrom = await nowIn(page);
    await blurActive(page);
    await page.keyboard.press('Home');
    await waitForQuiet(page, homeFrom, settleMs);
  }
  const t0 = await nowIn(page);
  await setPlayback(page, playing);
  const tEnd = await waitForQuiet(page, t0, idleSettleMs);
  const playWindow = await snapshot(page, t0, tEnd);
  const prefix = playing ? 'interact.play.start' : 'interact.play.stop';
  const put = (id: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(id, result.cpuRate), sample);
  };
  put(`${prefix}-commits`, { value: playWindow.commits.length });
  put(`${prefix}-components`, { value: sumRendered(playWindow.commits) });
  if (!playing) return;
  put(`${prefix}-sources`, {
    value: playWindow.starts.length,
    detail: startTasks(playWindow.starts),
  });
  const running = await isPlaying(page);
  if (result.cpuRate === 1) {
    result.samples.set('interact.harness.audio-running', {
      value: running && playWindow.starts.length >= 1 ? 1 : 0,
      detail: { contextRunning: running, starts: playWindow.starts.length },
    });
  }
  if (!running || playWindow.starts.length === 0) {
    result.problems.push(
      `play: audio not running (context running ${running}, start() calls ${playWindow.starts.length})`,
    );
  }
}

async function measureLoadReady(page: Page, result: InteractionPassResult): Promise<void> {
  const readyMs = await waitForLibraryReady(page);
  if (result.cpuRate === 1) {
    result.samples.set('interact.load.ready-ms', { value: roundTo(readyMs, 0) });
  }
}

async function buildThirtyClips(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<void> {
  const header = await clipHeaderPoint(clip);
  await page.mouse.click(header.x, header.y);
  await blurActive(page);
  for (let press = 1; press < clipsTarget; press += 1) {
    await page.keyboard.press('Control+d');
    await expect(audioClips(page)).toHaveCount(press + 1);
  }
  const count = await audioClips(page).count();
  const starts = await audioClips(page).evaluateAll((clips) =>
    clips.map((element) => element.getAttribute('data-clip-start') ?? ''),
  );
  const distinctStarts = new Set(starts).size;
  result.samples.set('interact.harness.clips-30', { value: count, detail: { distinctStarts } });
  if (distinctStarts !== clipsTarget) {
    result.problems.push(
      `Ctrl+D copies overlap: ${distinctStarts} distinct clip starts of ${count}`,
    );
  }
  await waitForQuiet(page, await nowIn(page), settleMs);
}

async function runInteractionPass(
  browser: Browser,
  cpuRate: number,
  pass: number,
): Promise<InteractionPassResult> {
  const result: InteractionPassResult = {
    cpuRate,
    pass,
    samples: new Map(),
    problems: [],
    abortedAt: null,
    pageErrors: 0,
    reactRenderer: '',
    innerWidth: 0,
  };
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
  });
  await context.addInitScript(installPerfInstrumentation);
  const page = await context.newPage();
  page.on('pageerror', () => {
    result.pageErrors += 1;
  });
  let step = 'load';
  try {
    await page.goto('/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await measureLoadReady(page, result);
    result.innerWidth = await page.evaluate(() => window.innerWidth);
    const observerErrors = await page.evaluate(() => window.__czabaPerf?.observerErrors ?? []);
    for (const error of observerErrors) result.problems.push(`observer unavailable: ${error}`);
    const rendererVersions = await page.evaluate(
      () => window.__czabaPerf?.rendererVersions() ?? [],
    );
    result.reactRenderer = rendererVersions.join(', ');
    const rendererProblem = reactRendererProblem(rendererVersions);
    if (rendererProblem) result.problems.push(rendererProblem);
    await waitForCollectionReady(page, result.problems, 'after load');

    step = 'library Add';
    const addStart = await nowIn(page);
    await page.getByRole('button', { name: perfLibraryAddLabel, exact: true }).click();
    await expect(audioClips(page)).toHaveCount(1);
    await expect(page.getByTestId('arrangement-clip-waveform')).toHaveCount(1);
    const added = await snapshot(page, addStart, await waitForQuiet(page, addStart, settleMs));
    if (cpuRate === 1) {
      result.samples.set('interact.harness.hook-live', { value: added.commits.length });
    }
    const clipId = await audioClips(page).first().getAttribute('data-clip-id');
    if (clipId === null) throw new Error('the added audio clip has no data-clip-id');
    const clip = clipById(page, clipId);

    if (cpuRate > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    }

    step = 'clip click';
    await measureClipClick(page, clip, result);
    step = 'zoom with 1 clip';
    await measureZoom(page, 1, result);
    for (const drag of dragNames) {
      step = `drag ${drag} stopped`;
      await measureDrag(
        page,
        {
          drag,
          state: 'stopped',
          clip,
          baseId: `interact.drag.${drag}.stopped`,
          liveId: `interact.harness.drag-${drag}-live`,
          rows: 'all',
        },
        result,
      );
    }
    step = 'drag background-range stopped';
    await measureBackgroundRangeDrag(page, clip, result);
    step = 'drag lane stopped';
    await measureLaneDrag(page, 'stopped', clip, result);
    step = 'play';
    await measurePlayback(page, true, result);
    for (const drag of dragNames) {
      step = `drag ${drag} playing`;
      await measureDrag(
        page,
        {
          drag,
          state: 'playing',
          clip,
          baseId: `interact.drag.${drag}.playing`,
          liveId: `interact.harness.drag-${drag}-live`,
          rows: 'all',
        },
        result,
      );
    }
    step = 'drag lane playing';
    await measureLaneDrag(page, 'playing', clip, result);
    step = 'pause';
    await measurePlayback(page, false, result);
    step = 'group setup';
    const group = await setupGroupClips(page, clip, result);
    if (group !== null) {
      step = 'drag group stopped';
      await measureGroupDrag(page, 'stopped', group, result);
      step = 'play for the group drag';
      await setPlayback(page, true);
      await waitForPlaybackSettled(page, result.problems, 'play for the group drag');
      step = 'drag group playing';
      await measureGroupDrag(page, 'playing', group, result);
      step = 'stop after the group drag';
      await setPlayback(page, false);
      step = 'group teardown';
      await teardownGroupClips(page, group, result);
    } else {
      setLive(result, rateRowId('interact.harness.drag-group-live', result.cpuRate), false, {
        setup: 'failed',
      });
      if ((await audioClips(page).count()) === 2) {
        await blurActive(page);
        await page.keyboard.press('Control+z');
        await expect(audioClips(page)).toHaveCount(1);
      }
    }

    if (cpuRate === 1) {
      step = `Ctrl+D to ${clipsTarget} clips`;
      await buildThirtyClips(page, clip, result);
      step = `zoom with ${clipsTarget} clips`;
      await measureZoom(page, 30, result);
      step = `zoom in-first path with ${clipsTarget} clips`;
      await measureZoomPath(page, 'in', result);
      step = `zoom out-first path with ${clipsTarget} clips`;
      await measureZoomPath(page, 'out', result);
      step = `play with ${clipsTarget} clips`;
      await setPlayback(page, true);
      await waitForPlaybackSettled(page, result.problems, `play with ${clipsTarget} clips`);
      step = `drag fade playing with ${clipsTarget} clips`;
      await measureDrag(
        page,
        {
          drag: 'fade',
          state: 'playing',
          clip,
          baseId: 'interact.drag.fade.30.playing',
          liveId: 'interact.harness.drag-fade-30-live',
          rows: 'thirty',
        },
        result,
      );
      step = `stop with ${clipsTarget} clips`;
      await setPlayback(page, false);
      step = `zoom Ctrl+wheel out-first with ${clipsTarget} clips`;
      await measureZoomWheel(page, result);
      step = `select same lane with ${clipsTarget} clips`;
      await measureSelectSameLane(page, result);
      step = 'video setup';
      const video = await setupVideoClip(page, result);
      if (video !== null) {
        for (const drag of videoDrags) {
          step = `drag ${videoDragBaseId(drag)} stopped`;
          await measureDrag(page, videoDragMeasure(drag, 'stopped', video.clip), result);
        }
        step = 'play for the video drags';
        await setPlayback(page, true);
        await waitForPlaybackSettled(page, result.problems, 'play for the video drags');
        for (const drag of videoDrags) {
          step = `drag ${videoDragBaseId(drag)} playing`;
          await measureDrag(page, videoDragMeasure(drag, 'playing', video.clip), result);
        }
        for (const drag of videoDrags) {
          setLive(result, videoDragLiveId(drag), true, { zoomKeys: video.zoomKeys });
        }
        step = 'stop after the video drags';
        await setPlayback(page, false);
        step = 'video teardown';
        await teardownVideoClip(page, video, result);
      } else {
        for (const drag of videoDrags) {
          setLive(result, videoDragLiveId(drag), false, { setup: 'failed' });
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.abortedAt = step;
    result.problems.push(`aborted at ${step}: ${message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
  if (result.pageErrors > 0) result.problems.push(`${result.pageErrors} page errors`);
  return result;
}

function buildInteractionReport(
  budgets: readonly PerfBudgetRow[],
  passes: readonly InteractionPassResult[],
  startedAt: Date,
  chromium: string,
) {
  const { complete, failures, rows } = buildPerfReportCore({
    budgets,
    passes,
    cpuRates,
    passesPerRate,
    assertWhenPartial: false,
  });

  const finishedAt = new Date();
  return {
    harness: 'PERF-1b-i',
    complete,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    budgetsFile: path.relative(storeRoot, interactionBudgetsPath),
    chromium,
    reactRenderer: [
      ...new Set(passes.map((pass) => pass.reactRenderer).filter((version) => version.length > 0)),
    ].join(' | '),
    viewport: `${viewport.width}x${viewport.height}`,
    innerWidths: [...new Set(passes.map((pass) => pass.innerWidth))],
    cpuRates,
    passesPerRate,
    dragSteps,
    dragDistancePx,
    sequence: interactionSequence,
    passes: passes.map((pass) => ({
      cpuRate: pass.cpuRate,
      pass: pass.pass,
      abortedAt: pass.abortedAt,
      pageErrors: pass.pageErrors,
      problems: pass.problems,
    })),
    failures,
    rows,
  };
}

test('studio-lab perf harness PERF-1b-i', async ({ browser }) => {
  const startedAt = new Date();
  const budgets = loadPerfBudgets(interactionBudgetsPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const write = (report: ReturnType<typeof buildInteractionReport>): void => {
    mkdirSync(resultsDir, { recursive: true });
    const json = `${JSON.stringify(report, null, 2)}\n`;
    writeFileSync(path.join(resultsDir, `perf-1b-i-${stamp}.json`), json);
    writeFileSync(path.join(resultsDir, 'latest-interactions.json'), json);
  };
  const passes: InteractionPassResult[] = [];
  for (const cpuRate of cpuRates) {
    for (let pass = 1; pass <= passesPerRate; pass += 1) {
      passes.push(await runInteractionPass(browser, cpuRate, pass));
      write(buildInteractionReport(budgets, passes, startedAt, browser.version()));
    }
  }

  const report = buildInteractionReport(budgets, passes, startedAt, browser.version());
  write(report);
  const table = report.rows.map(
    (row) =>
      `${row.id.padEnd(58)} ${row.mode.padEnd(6)} median ${String(row.median).padStart(8)}  min ${String(row.min).padStart(8)}  max ${String(row.max).padStart(8)}  budget ${formatLimit(row.budget).padEnd(8)} ${row.pass === null ? '' : row.pass ? 'PASS' : 'FAIL'}`,
  );
  console.log(
    [
      `PERF-1b-i results (${report.durationMs} ms) -> test-results/perf/latest-interactions.json`,
      ...table,
    ].join('\n'),
  );

  expect(report.failures, report.failures.join('\n')).toEqual([]);
});
