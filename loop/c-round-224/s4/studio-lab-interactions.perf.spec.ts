import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, expect, type Locator, type Page, test } from '@playwright/test';
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
  waitForQuiet,
} from './lib/page';
import { buildPerfReportCore, formatLimit, type PerfSample } from './lib/report';
import { percentile, roundTo } from './lib/stats';

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
const settleMs = 600;
const keySettleMs = 300;
const idleSettleMs = 1000;
const zoomKeyCount = 5;
const clipsTarget = 30;
const rangeLabelEnd = /\d\d:\d\d\.\d{3} – (\d\d):(\d\d\.\d{3}) ·/;

type DragName = 'range' | 'fade' | 'trim' | 'move';
type PlaybackState = 'stopped' | 'playing';

const dragNames: DragName[] = ['range', 'fade', 'trim', 'move'];

const interactionSequence = [
  '1x only: load until ready (interact.load.ready-ms), library Add, wait for the waveform and quiet (interact.harness.hook-live)',
  'CPU throttle on (6x passes)',
  'clip click: empty Stems lane click deselects (Clip Gain fader disabled), then a click on the clip header (interact.click.*, interact.harness.click-live)',
  `zoom with 1 clip: ${zoomKeyCount} x "=" then ${zoomKeyCount} x "-", one window per key (interact.zoom.1.*, interact.harness.zoom-live)`,
  `drags stopped: range, fade-in, trim start, move; ${dragSteps} steps, +${dragDistancePx} px; reset after each (interact.drag.<d>.stopped.*)`,
  'Home (seek to 0), then Space -> playing (interact.play.start-*, 1x: interact.harness.audio-running)',
  'drags playing, each after Home (seek to 0): range, fade-in, trim start, move (interact.drag.<d>.playing.*)',
  'Space -> stopped (interact.play.stop-*)',
  `1x only: click the clip header, Ctrl+D x ${clipsTarget - 1} (interact.harness.clips-30), zoom with ${clipsTarget} clips (interact.zoom.30.*), Space, Home, fade-in drag on the first clip (interact.drag.fade.30.playing.*), Space`,
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

const clipGainFader = (page: Page): Locator =>
  page.getByRole('slider', { name: 'Clip Gain — fader', exact: true });

const zoomSlider = (page: Page): Locator =>
  page.getByRole('slider', { name: 'Zoom (px/s)', exact: true });

const undoTitle = (page: Page): Promise<string | null> =>
  page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');

function dragTarget(clip: Locator, drag: DragName): Locator {
  switch (drag) {
    case 'range':
      return clip.getByTitle('drag = time selection · click = playhead', { exact: true });
    case 'fade':
      return clip.getByTestId('arrangement-clip-fade-in-handle');
    case 'trim':
      return clip.getByTitle('Trim — left edge', { exact: true });
    case 'move':
      return clip.getByTitle(/ — drag to move$/);
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

async function emptyLanePoint(page: Page, trackId: string): Promise<GrabPoint> {
  const laneLocator = page.locator(`[data-track-id=${quotedAttributeValue(trackId)}]`);
  const point = await laneLocator.evaluate((lane) => {
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
        return { x, y };
      }
    }
    return null;
  });
  if (!point) throw new Error(`lane ${trackId} has no empty timeline point`);
  return point;
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
  rows: 'all' | 'thirty';
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
  const target = dragTarget(clip, drag);
  const grab = await visibleGrabPoint(target, grabOptions(drag));
  const undoBefore = await undoTitle(page);
  const before = await readClipState(clip);
  const t0 = await nowIn(page);
  await page.mouse.move(grab.x, grab.y);
  await page.mouse.down();
  await page.mouse.move(grab.x + dragDistancePx / 2, grab.y, { steps: dragSteps / 2 });
  const mid = await readClipState(clip);
  await page.mouse.move(grab.x + dragDistancePx, grab.y, { steps: dragSteps / 2 });
  const end = await readClipState(clip);
  await page.mouse.up();
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

  const downAt = whole.downs.at(-1);
  const up = downAt === undefined ? undefined : whole.ups.find((t) => t > downAt);
  const moves =
    downAt === undefined || up === undefined ? [] : whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (downAt === undefined || up === undefined || firstMove === undefined) {
    result.problems.push(`${label}: no in-page pointerdown, pointermove and pointerup sequence`);
  } else {
    const inWindow = whole.commits.filter((commit) => commit.t > firstMove && commit.t < up);
    const release = whole.commits.filter((commit) => commit.t >= up);
    const moveStarts = whole.starts.filter((entry) => entry.t > firstMove && entry.t < up);
    const releaseStarts = whole.starts.filter((entry) => entry.t >= up);
    const put = (metric: string, sample: PerfSample): void => {
      result.samples.set(rateRowId(`${baseId}.${metric}`, result.cpuRate), sample);
    };
    const windowDetail = {
      movesInWindow: moves.length,
      windowCommits: inWindow.length,
      settleMs: roundTo(tEnd - tUp, 0),
    };
    const perMove = roundTo(moves.length ? sumRendered(inWindow) / moves.length : 0, 3);
    if (measure.rows === 'all') {
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
    ...Array.from({ length: clipCount === 1 ? zoomKeyCount - 1 : zoomKeyCount }, () => '-'),
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
  const unclamped = values.every((value) => value > sliderMin && value < (clipCount === 30 ? Math.max(...values) : sliderMax));
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

async function measureClipClick(
  page: Page,
  clip: Locator,
  result: InteractionPassResult,
): Promise<void> {
  const fader = clipGainFader(page);
  const selectedAfterAdd = await fader.isEnabled();
  const emptyFrom = await nowIn(page);
  const empty = await emptyLanePoint(page, 'stems');
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
    },
  });
  if (!live) {
    result.problems.push(
      `clip click: Clip Gain fader enabled after Add ${selectedAfterAdd}, disabled after the empty-lane click ${deselected}, enabled after the clip click ${selected}`,
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
  const readyHandle = await page.waitForFunction(
    () => {
      const add = [...document.querySelectorAll('button')].find(
        (button) => button.textContent?.trim() === 'Add',
      );
      const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
      return add instanceof HTMLButtonElement && !add.disabled && wave !== null
        ? performance.now()
        : 0;
    },
    undefined,
    { polling: 'raf', timeout: 90000 },
  );
  const readyMs = await readyHandle.jsonValue();
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
    await page.waitForTimeout(idleSettleMs);

    step = 'library Add';
    const addStart = await nowIn(page);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
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
    step = 'pause';
    await measurePlayback(page, false, result);

    if (cpuRate === 1) {
      step = `Ctrl+D to ${clipsTarget} clips`;
      await buildThirtyClips(page, clip, result);
      step = `zoom with ${clipsTarget} clips`;
      await measureZoom(page, 30, result);
      step = `play with ${clipsTarget} clips`;
      await setPlayback(page, true);
      await page.waitForTimeout(idleSettleMs);
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
