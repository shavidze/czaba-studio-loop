import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Browser,
  type CDPSession,
  expect,
  type Locator,
  type Page,
  test,
} from '@playwright/test';
import {
  isWithinBudget,
  loadPerfBudgets,
  type PerfBudgetLimit,
  type PerfBudgetRow,
} from '/home/runner/czaba-project/store/perf/lib/budgets';
import { installPerfInstrumentation, type PerfWindowSnapshot } from '/home/runner/czaba-project/store/perf/lib/instrumentation';
import { countsAgree, frameIntervals, median, percentile, roundTo } from '/home/runner/czaba-project/store/perf/lib/stats';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const budgetsPath = path.resolve(
  storeRoot,
  process.env.PERF_BUDGETS ?? path.join('perf', 'budgets.json'),
);
const resultsDir = path.join(storeRoot, 'test-results', 'perf');

const passesPerRate = 3;
const cpuRates = [1, 6];
const dragSteps = 60;
const settleMs = 600;
const restartSettleMs = 500;
const quietMs = 200;
const settleCapMs = 3000;
const idleSettleMs = 1000;
const idleMeasureMs = 5000;
const jankFrameMs = 33.4;
const slowPaintMs = 16;
const clipNudgePx = 40;
const injectedBusyMs = 30;
const membersSourceTitle = 'Soft impact';
const expectedReactMajor = '18';

const determinismMetrics = new Set([
  'components-per-commit',
  'restarts',
  'moves-dispatched',
  'move-components-max',
  'move-components-per-move',
]);
const crossRateMetrics = new Set([
  'components-per-commit',
  'restarts',
  'move-components-max',
  'move-components-per-move',
]);
const rateSuffix = /\.\d+x$/;
const wallclockFaderMetrics = new Set([
  'frame-p95',
  'frames-over-33',
  'loaf-count',
  'move-to-paint-p95',
  'move-to-paint-over-16',
  'move-to-paint-samples',
]);

const passSequence = [
  'load until ready (load.*)',
  'library Add click (harness.hook-live)',
  'fader.track.stopped',
  'fader.pan.stopped',
  'fader.master.stopped',
  'fader.clipgain.stopped (click selects the added clip first)',
  'Space -> playing (harness.audio-running)',
  `settle ${idleSettleMs} ms, then ${idleMeasureMs} ms idle playback (play.idle-*)`,
  'fader.track.playing',
  'fader.pan.playing',
  'fader.master.playing',
  'fader.clipgain.playing',
  `clip header drag +${clipNudgePx} px = 1 s at 40 px/s (harness.restart-live)`,
  'Space -> stopped',
  'click Stems lane name, Shift+click SFX lane name, Ctrl+G',
  'fader.group.stopped',
  'Space -> playing',
  'fader.group.playing',
  `library ${membersSourceTitle} -> Add on the active SFX lane; click the added clip, Shift+click ${membersSourceTitle} (members: N = 2)`,
  'fader.clipgain-members.playing',
  'Space -> stopped',
  'fader.clipgain-members.stopped',
  `1x only: Pan — Music drags with an injected ${injectedBusyMs} ms pointermove listener (sync, then deferred), listeners removed, control drag (harness.move-latency-*)`,
];

type FaderState = 'stopped' | 'playing';
type InjectedLoad = 'sync' | 'deferred';

const injectedLoads: InjectedLoad[] = ['sync', 'deferred'];
type FaderName = 'track' | 'pan' | 'master' | 'clipgain' | 'group' | 'clipgain-members';

const ungroupedFaders: FaderName[] = ['track', 'pan', 'master', 'clipgain'];

interface PassSample {
  value: number;
  detail?: Record<string, number | string | boolean>;
}

interface PassResult {
  cpuRate: number;
  pass: number;
  samples: Map<string, PassSample>;
  problems: string[];
  abortedAt: string | null;
  pageErrors: number;
  reactRenderer: string;
}

function reactRendererProblem(versions: readonly string[]): string | null {
  if (versions.length === 0) return 'no React renderer was injected into the devtools hook';
  if (versions.every((version) => version.split('.')[0] === expectedReactMajor)) return null;
  return `React renderer major is not ${expectedReactMajor}: ${versions.join(', ')}`;
}

const nowIn = (page: Page): Promise<number> => page.evaluate(() => performance.now());

const snapshot = (page: Page, from: number, to: number): Promise<PerfWindowSnapshot> =>
  page.evaluate(
    ({ start, end }): PerfWindowSnapshot => {
      const state = window.__czabaPerf;
      if (!state) throw new Error('perf instrumentation is not installed');
      const inside = (t: number): boolean => t >= start && t <= end;
      return {
        commits: state.commits.filter((commit) => inside(commit.t)),
        starts: state.starts.filter((entry) => inside(entry.t)),
        frames: state.frames.filter(inside),
        moves: state.moves.filter(inside),
        downs: state.downs.filter(inside),
        ups: state.ups.filter(inside),
        moveLatency: state.moveLatency.filter((sample) => inside(sample.t)),
        longtasks: state.longtasks.filter((entry) => inside(entry.t)),
        loafs: state.loafs.filter((entry) => inside(entry.t)),
        events: state.events.filter((entry) => inside(entry.t)),
      };
    },
    { start: from, end: to },
  );

const blurActive = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });

const playButton = (page: Page): Locator => page.getByRole('button', { name: /^(Play|Pause)$/ });

const audioRunning = (page: Page): Promise<boolean> =>
  page.evaluate(() => window.__czabaPerf?.audioContextStates().includes('running') ?? false);

async function isPlaying(page: Page): Promise<boolean> {
  const label = await playButton(page).getAttribute('aria-label');
  return label === 'Pause' && (await audioRunning(page));
}

async function setPlayback(page: Page, playing: boolean): Promise<void> {
  await blurActive(page);
  await page.keyboard.press('Space');
  await expect(playButton(page)).toHaveAttribute('aria-label', playing ? 'Pause' : 'Play', {
    timeout: 15000,
  });
}

async function clipGrabPoint(page: Page): Promise<{ x: number; y: number }> {
  const point = await page
    .locator('[data-clip-kind="audio"]')
    .first()
    .evaluate((clip) => {
      const box = clip.getBoundingClientRect();
      const y = box.top + 10;
      const hits: number[] = [];
      const end = Math.min(box.right, window.innerWidth) - 20;
      for (let x = Math.max(box.left, 0) + 20; x <= end; x += 10) {
        const hit = document.elementFromPoint(x, y);
        if (hit !== null && clip.contains(hit)) hits.push(x);
      }
      return hits.length > 20 ? { x: hits[20], y } : null;
    });
  if (!point) throw new Error('the added audio clip has no visible grab point');
  return point;
}

async function clipHeaderPoint(clip: Locator): Promise<{ x: number; y: number }> {
  const point = await clip.evaluate((element) => {
    const box = element.getBoundingClientRect();
    const y = box.top + 10;
    const hits: number[] = [];
    const end = Math.min(box.right, window.innerWidth) - 2;
    for (let x = Math.max(box.left, 0) + 2; x <= end; x += 4) {
      const hit = document.elementFromPoint(x, y);
      if (hit !== null && element.contains(hit)) hits.push(x);
    }
    return hits.length > 0 ? { x: hits[Math.floor(hits.length / 2)], y } : null;
  });
  if (!point) throw new Error('the members clip has no visible header point');
  return point;
}

async function selectClipGainMembers(page: Page): Promise<void> {
  await page
    .getByTestId('arrangement-library-option-title')
    .filter({ hasText: membersSourceTitle })
    .click();
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  const clips = page.locator('[data-clip-kind="audio"]');
  await expect(clips).toHaveCount(2);
  await expect(page.getByTestId('arrangement-clip-waveform')).toHaveCount(2);
  const added = await clipGrabPoint(page);
  await page.mouse.click(added.x, added.y);
  const second = await clipHeaderPoint(clips.filter({ hasText: membersSourceTitle }));
  await page.keyboard.down('Shift');
  await page.mouse.click(second.x, second.y);
  await page.keyboard.up('Shift');
  await expect(page.getByTestId('arrangement-detail-group')).toBeVisible();
}

const slider = (page: Page, name: string | RegExp): Locator =>
  page.getByRole('slider', { name, exact: typeof name === 'string' });

function faderLocator(page: Page, fader: FaderName): Locator {
  switch (fader) {
    case 'track':
      return slider(page, 'Volume — Music');
    case 'pan':
      return slider(page, 'Pan — Music');
    case 'master':
      return slider(page, 'Master Volume');
    case 'clipgain':
    case 'clipgain-members':
      return slider(page, 'Clip Gain — fader');
    case 'group':
      return slider(page, /^Volume — .+ \(group\)$/);
  }
}

function faderRowId(fader: FaderName, state: FaderState, metric: string, cpuRate: number): string {
  const base = `fader.${fader}.${state}.${metric}`;
  if (wallclockFaderMetrics.has(metric)) return `${base}.${cpuRate}x`;
  return cpuRate === 1 ? base : `${base}.${cpuRate}x`;
}

async function waitForQuiet(page: Page, from: number, minMs: number): Promise<number> {
  await page.waitForTimeout(minMs);
  for (;;) {
    const quiet = await page.evaluate(
      ({ start, quietFor, cap }) => {
        const state = window.__czabaPerf;
        const now = performance.now();
        const lastCommit = state?.commits.at(-1)?.t ?? 0;
        const lastStart = state?.starts.at(-1)?.t ?? 0;
        return now - Math.max(lastCommit, lastStart) >= quietFor || now - start >= cap;
      },
      { start: from, quietFor: quietMs, cap: settleCapMs },
    );
    if (quiet) return nowIn(page);
    await page.waitForTimeout(50);
  }
}

const sliderValue = async (locator: Locator): Promise<number> => Number(await locator.inputValue());

function startTasks(starts: readonly { task: number }[]): Record<string, number | string> {
  const perTask = new Map<number, number>();
  for (const start of starts) perTask.set(start.task, (perTask.get(start.task) ?? 0) + 1);
  return { tasks: perTask.size, startsPerTask: [...perTask.values()].join(',') };
}

interface FaderDrag {
  t0: number;
  tUp: number;
  tEnd: number;
  gesture: PerfWindowSnapshot;
  whole: PerfWindowSnapshot;
  values: Record<string, number | string>;
}

interface MoveWindow {
  movesInWindow: number;
  componentsMax: number;
  componentsSum: number;
  windowCommits: number;
  downCommits: number;
  downComponentsMax: number;
  releaseCommits: number;
  releaseComponentsMax: number;
}

async function dragFader(
  page: Page,
  fader: FaderName,
  state: FaderState,
  label: string,
  problems: string[],
): Promise<FaderDrag> {
  if (fader === 'clipgain') {
    const point = await clipGrabPoint(page);
    await page.mouse.click(point.x, point.y);
  }
  const locator = faderLocator(page, fader);
  await expect(locator).toHaveCount(1);
  await expect(locator).toBeEnabled();
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error(`fader ${fader} has no box`);
  if (state === 'playing' && !(await isPlaying(page))) {
    problems.push(`playback not running before ${label}`);
  }
  const maxAttribute = await locator.getAttribute('max');
  if (maxAttribute === null) throw new Error(`fader ${fader} has no max attribute`);
  const valueMax = Number(maxAttribute);
  const y = box.y + box.height / 2;
  const t0 = await nowIn(page);
  await page.mouse.move(box.x + box.width * 0.5, y);
  await page.mouse.down();
  const valueStart = await sliderValue(locator);
  await page.mouse.move(box.x + box.width * 0.05, y, { steps: dragSteps });
  const valueLow = await sliderValue(locator);
  await page.mouse.move(box.x + box.width * 0.95, y, { steps: dragSteps });
  const valueHigh = await sliderValue(locator);
  await page.mouse.up();
  const tUp = await nowIn(page);
  const tEnd = await waitForQuiet(page, tUp, settleMs);
  const strict = valueLow < valueStart && valueStart < valueHigh;
  const atMax = valueLow < valueStart && valueStart === valueMax && valueHigh === valueMax;
  if (!strict && !atMax) {
    problems.push(
      `${label} did not move at both ends: ${valueStart} -> ${valueLow} -> ${valueHigh} (max ${valueMax})`,
    );
  }
  if (state === 'playing' && !(await isPlaying(page))) {
    problems.push(`playback not running after ${label}`);
  }
  return {
    t0,
    tUp,
    tEnd,
    gesture: await snapshot(page, t0, tUp),
    whole: await snapshot(page, t0, tEnd),
    values: {
      valueStart,
      valueLow,
      valueHigh,
      valueMax,
      endsCase: strict ? 'strict' : atMax ? 'max' : 'none',
    },
  };
}

function moveWindow(drag: FaderDrag, label: string, problems: string[]): MoveWindow | null {
  const downAt = drag.gesture.downs.at(-1);
  if (downAt === undefined) {
    problems.push(`${label}: no in-page pointerdown recorded`);
    return null;
  }
  const up = drag.whole.ups.find((t) => t > downAt);
  if (up === undefined) {
    problems.push(`${label}: no in-page pointerup recorded`);
    return null;
  }
  const moves = drag.whole.moves.filter((t) => t > downAt && t < up);
  const firstMove = moves.at(0);
  if (firstMove === undefined) {
    problems.push(`${label}: no pointermove between pointerdown and pointerup`);
    return null;
  }
  const commits = drag.whole.commits;
  const inWindow = commits.filter((commit) => commit.t > firstMove && commit.t < up);
  const release = commits.filter((commit) => commit.t >= up);
  const down = commits.filter((commit) => commit.t >= downAt && commit.t <= firstMove);
  const rendered = inWindow.map((commit) => commit.rendered);
  return {
    movesInWindow: moves.length,
    componentsMax: rendered.length ? Math.max(...rendered) : 0,
    componentsSum: rendered.reduce((sum, n) => sum + n, 0),
    windowCommits: inWindow.length,
    downCommits: down.length,
    downComponentsMax: down.length ? Math.max(...down.map((commit) => commit.rendered)) : 0,
    releaseCommits: release.length,
    releaseComponentsMax: release.length
      ? Math.max(...release.map((commit) => commit.rendered))
      : 0,
  };
}

function moveToPaint(drag: FaderDrag): { p95: number; over16: number; samples: number } {
  const latencies = drag.whole.moveLatency
    .filter((sample) => sample.t <= drag.tUp)
    .map((sample) => sample.latency);
  return {
    p95: roundTo(percentile(latencies, 0.95), 1),
    over16: roundTo(
      latencies.length
        ? latencies.filter((latency) => latency > slowPaintMs).length / latencies.length
        : 0,
      3,
    ),
    samples: latencies.length,
  };
}

async function measureFader(
  page: Page,
  fader: FaderName,
  state: FaderState,
  result: PassResult,
): Promise<void> {
  const label = `fader.${fader}.${state}`;
  const drag = await dragFader(page, fader, state, label, result.problems);
  const { gesture, whole } = drag;
  const moves = gesture.moves.length;
  const rendered = whole.commits.map((commit) => commit.rendered);
  if (rendered.length === 0) result.problems.push(`no commits during ${label}`);
  const intervals = frameIntervals(gesture.frames);
  const moveStats = moveWindow(drag, label, result.problems);
  const paint = moveToPaint(drag);
  const put = (metric: string, sample: PassSample): void => {
    result.samples.set(faderRowId(fader, state, metric, result.cpuRate), sample);
  };
  put('components-per-commit', {
    value: median(rendered),
    detail: {
      max: rendered.length ? Math.max(...rendered) : 0,
      commits: rendered.length,
      settleMs: roundTo(drag.tEnd - drag.tUp, 0),
      ...drag.values,
    },
  });
  put('commits-per-move', { value: roundTo(moves ? rendered.length / moves : 0, 3) });
  put('moves-dispatched', { value: moves });
  if (state === 'playing') {
    put('restarts', { value: whole.starts.length, detail: startTasks(whole.starts) });
  }
  put('frame-p95', {
    value: roundTo(percentile(intervals, 0.95), 1),
    detail: { frames: intervals.length },
  });
  put('frames-over-33', { value: intervals.filter((interval) => interval > jankFrameMs).length });
  put('loaf-count', { value: gesture.loafs.length });
  put('move-to-paint-p95', { value: paint.p95, detail: { samples: paint.samples } });
  put('move-to-paint-over-16', { value: paint.over16, detail: { samples: paint.samples } });
  put('move-to-paint-samples', {
    value: paint.samples,
    detail: { movesDispatched: moves, missing: moves - paint.samples },
  });
  if (moveStats) {
    const windowDetail = {
      movesInWindow: moveStats.movesInWindow,
      windowCommits: moveStats.windowCommits,
      downCommits: moveStats.downCommits,
      downComponentsMax: moveStats.downComponentsMax,
    };
    put('move-components-max', { value: moveStats.componentsMax, detail: windowDetail });
    put('move-components-per-move', {
      value: roundTo(
        moveStats.movesInWindow ? moveStats.componentsSum / moveStats.movesInWindow : 0,
        3,
      ),
      detail: { ...windowDetail, componentsSum: moveStats.componentsSum },
    });
    put('release-commits', {
      value: moveStats.releaseCommits,
      detail: { releaseComponentsMax: moveStats.releaseComponentsMax },
    });
  }
  if (result.cpuRate === 1 && fader === 'track' && state === 'stopped') {
    result.samples.set('harness.move-samples-live', {
      value: moves - paint.samples,
      detail: { movesDispatched: moves, samples: paint.samples },
    });
    if (moveStats) {
      result.samples.set('harness.move-window-live', {
        value: moveStats.componentsMax,
        detail: {
          windowCommits: moveStats.windowCommits,
          movesInWindow: moveStats.movesInWindow,
        },
      });
    }
  }
}

async function windowListenerCount(cdp: CDPSession, type: string): Promise<number> {
  const { result } = await cdp.send('Runtime.evaluate', { expression: 'window' });
  if (!result.objectId) throw new Error('window has no CDP object id');
  const { listeners } = await cdp.send('DOMDebugger.getEventListeners', {
    objectId: result.objectId,
  });
  await cdp.send('Runtime.releaseObject', { objectId: result.objectId });
  return listeners.filter((listener) => listener.type === type).length;
}

const injectBusyListener = (page: Page, load: InjectedLoad): Promise<void> =>
  page.evaluate(
    ({ mode, busyMs }) => {
      const spin = (): void => {
        let now = performance.now();
        const until = now + busyMs;
        while (now < until) now = performance.now();
      };
      const channel = new MessageChannel();
      channel.port1.onmessage = spin;
      const listener = mode === 'sync' ? spin : () => channel.port2.postMessage(null);
      window.addEventListener('pointermove', listener);
      window.__czabaPerfInjected = () => {
        window.removeEventListener('pointermove', listener);
        channel.port1.close();
      };
    },
    { mode: load, busyMs: injectedBusyMs },
  );

const removeBusyListener = (page: Page): Promise<boolean> =>
  page.evaluate(() => {
    const remove = window.__czabaPerfInjected;
    window.__czabaPerfInjected = undefined;
    remove?.();
    return remove !== undefined;
  });

async function measureMoveLatencyLiveness(page: Page, result: PassResult): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  try {
    await measureLivenessDrags(page, cdp, result);
  } finally {
    await cdp.detach();
  }
}

async function measureLivenessDrags(
  page: Page,
  cdp: CDPSession,
  result: PassResult,
): Promise<void> {
  const listenersAtStart = await windowListenerCount(cdp, 'pointermove');
  for (const load of injectedLoads) {
    const id = `harness.move-latency-live.${load}`;
    await injectBusyListener(page, load);
    let drag: FaderDrag;
    try {
      drag = await dragFader(page, 'pan', 'stopped', id, result.problems);
    } finally {
      if (!(await removeBusyListener(page)))
        result.problems.push(`${id}: listener was not installed`);
    }
    const paint = moveToPaint(drag);
    result.samples.set(id, {
      value: paint.p95,
      detail: { samples: paint.samples, over16: paint.over16, injectedBusyMs, ...drag.values },
    });
  }
  const listenersAfter = await windowListenerCount(cdp, 'pointermove');
  if (listenersAfter !== listenersAtStart) {
    result.problems.push(
      `injected pointermove listeners not removed: ${listenersAtStart} at start, ${listenersAfter} after`,
    );
  }
  const control = await dragFader(
    page,
    'pan',
    'stopped',
    'harness.move-latency-control',
    result.problems,
  );
  const paint = moveToPaint(control);
  if (paint.p95 >= injectedBusyMs) {
    result.problems.push(
      `harness.move-latency-control p95 ${paint.p95} ms >= ${injectedBusyMs} ms: the liveness rows prove nothing`,
    );
  }
  result.samples.set('harness.move-latency-control', {
    value: paint.p95,
    detail: {
      samples: paint.samples,
      over16: paint.over16,
      pointermoveListenersAtStart: listenersAtStart,
      pointermoveListenersAfterRemoval: listenersAfter,
      ...control.values,
    },
  });
}

async function measureLoad(page: Page, result: PassResult): Promise<void> {
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
  const load = await snapshot(page, 0, readyMs);
  const rendered = load.commits.map((commit) => commit.rendered);
  const longest = load.longtasks.reduce((max, entry) => Math.max(max, entry.duration), 0);
  result.samples.set('load.ready-ms', { value: roundTo(readyMs, 0) });
  result.samples.set('load.longtask-max', { value: roundTo(longest, 0) });
  result.samples.set('load.longtasks-over-50', {
    value: load.longtasks.filter((entry) => entry.duration > 50).length,
  });
  result.samples.set('load.commits', { value: rendered.length });
  result.samples.set('load.components', { value: rendered.reduce((sum, n) => sum + n, 0) });
}

async function runPass(browser: Browser, cpuRate: number, pass: number): Promise<PassResult> {
  const result: PassResult = {
    cpuRate,
    pass,
    samples: new Map(),
    problems: [],
    abortedAt: null,
    pageErrors: 0,
    reactRenderer: '',
  };
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
  });
  await context.addInitScript(installPerfInstrumentation);
  const page = await context.newPage();
  page.on('pageerror', () => {
    result.pageErrors += 1;
  });
  const record = cpuRate === 1;
  let step = 'load';
  try {
    await page.goto('/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await measureLoad(page, result);
    if (!record) result.samples.clear();
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
    await page.waitForTimeout(2000);
    const added = await snapshot(page, addStart, await nowIn(page));
    await expect(page.locator('[data-clip-kind="audio"]')).toHaveCount(1);
    if (record) result.samples.set('harness.hook-live', { value: added.commits.length });

    if (cpuRate > 1) {
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    }

    for (const fader of ungroupedFaders) {
      step = `fader.${fader}.stopped`;
      await measureFader(page, fader, 'stopped', result);
    }

    step = 'play + idle';
    const playPress = await nowIn(page);
    await setPlayback(page, true);
    await page.waitForTimeout(idleSettleMs);
    const running = await isPlaying(page);
    const idleStart = await nowIn(page);
    await page.waitForTimeout(idleMeasureMs);
    const idleEnd = await nowIn(page);
    const idle = await snapshot(page, idleStart, idleEnd);
    if (record) {
      const played = await snapshot(page, playPress, idleEnd);
      result.samples.set('harness.audio-running', {
        value: running && played.starts.length >= 1 ? 1 : 0,
        detail: { contextRunning: running, starts: played.starts.length },
      });
      const rendered = idle.commits.map((commit) => commit.rendered);
      result.samples.set('play.idle-commits', { value: rendered.length });
      result.samples.set('play.idle-components', {
        value: rendered.reduce((sum, n) => sum + n, 0),
      });
      result.samples.set('play.idle-longtasks-over-50', {
        value: idle.longtasks.filter((entry) => entry.duration > 50).length,
      });
    }

    for (const fader of ungroupedFaders) {
      step = `fader.${fader}.playing`;
      await measureFader(page, fader, 'playing', result);
    }

    step = 'clip drag (harness.restart-live)';
    const clip = page.locator('[data-clip-kind="audio"]').first();
    const startBefore = await clip.getAttribute('data-clip-start');
    const grab = await clipGrabPoint(page);
    const nudgeStart = await nowIn(page);
    await page.mouse.move(grab.x, grab.y);
    await page.mouse.down();
    await page.mouse.move(grab.x + clipNudgePx, grab.y, { steps: 10 });
    await page.mouse.up();
    const nudgeUp = await nowIn(page);
    const nudge = await snapshot(
      page,
      nudgeStart,
      await waitForQuiet(page, nudgeUp, restartSettleMs),
    );
    const startAfter = await clip.getAttribute('data-clip-start');
    if (startAfter === startBefore) result.problems.push(`clip drag did not move the clip`);
    if (record) {
      result.samples.set('harness.restart-live', {
        value: nudge.starts.length,
        detail: {
          clipStartBefore: startBefore ?? '',
          clipStartAfter: startAfter ?? '',
          ...startTasks(nudge.starts),
        },
      });
    }
    if (!(await isPlaying(page))) result.problems.push('playback not running after clip drag');

    step = 'stop + Ctrl+G group';
    await setPlayback(page, false);
    await page
      .getByRole('button', { name: 'Stems — set as the active track', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'SFX — set as the active track', exact: true })
      .click({ modifiers: ['Shift'] });
    await blurActive(page);
    await page.keyboard.press('Control+g');
    await expect(faderLocator(page, 'group')).toHaveCount(1);
    step = 'fader.group.stopped';
    await measureFader(page, 'group', 'stopped', result);
    step = 'play for fader.group.playing';
    await setPlayback(page, true);
    await page.waitForTimeout(idleSettleMs);
    step = 'fader.group.playing';
    await measureFader(page, 'group', 'playing', result);
    step = 'select Clip Gain members';
    await selectClipGainMembers(page);
    step = 'fader.clipgain-members.playing';
    await measureFader(page, 'clipgain-members', 'playing', result);
    step = 'stop for fader.clipgain-members.stopped';
    await setPlayback(page, false);
    step = 'fader.clipgain-members.stopped';
    await measureFader(page, 'clipgain-members', 'stopped', result);
    if (record) {
      step = 'move-latency liveness';
      await measureMoveLatencyLiveness(page, result);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.abortedAt = step;
    result.problems.push(`aborted at ${step}: ${message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
  return result;
}

const formatLimit = (limit: PerfBudgetLimit | null): string =>
  limit ? `${limit.op} ${limit.value}` : '—';

function buildReport(
  budgets: readonly PerfBudgetRow[],
  passes: readonly PassResult[],
  startedAt: Date,
  chromium: string,
) {
  const complete = passes.length === cpuRates.length * passesPerRate;
  const failures: string[] = passes.flatMap((pass) =>
    pass.problems.map((problem) => `${pass.cpuRate}x pass ${pass.pass}: ${problem}`),
  );
  const samplesById = new Map<string, PassSample[]>();
  for (const pass of passes) {
    for (const [id, sample] of pass.samples) {
      samplesById.set(id, [...(samplesById.get(id) ?? []), sample]);
    }
  }
  const budgetIds = new Set(budgets.map((row) => row.id));
  for (const id of samplesById.keys()) {
    if (!budgetIds.has(id)) failures.push(`measured row without a budget row: ${id}`);
  }

  const rowRate = (id: string): number => Number(rateSuffix.exec(id)?.[0].slice(1, -1) ?? 1);
  const abortedRates = new Set(
    passes.filter((pass) => pass.abortedAt !== null).map((pass) => pass.cpuRate),
  );
  let shortByAbort = 0;
  const medians = new Map<string, number>();
  const rows = budgets.map((row) => {
    const samples = samplesById.get(row.id) ?? [];
    const values = samples.map((sample) => sample.value);
    if (complete && values.length !== passesPerRate) {
      if (abortedRates.has(rowRate(row.id))) {
        shortByAbort += 1;
      } else {
        failures.push(`row not measured ${passesPerRate} times: ${row.id} (${values.length})`);
      }
    }
    const rowMedian = median(values);
    if (values.length > 0) medians.set(row.id, rowMedian);
    const withinBudget = row.budget && values.length ? isWithinBudget(rowMedian, row.budget) : null;
    const passed = row.mode === 'assert' ? withinBudget === true : null;
    if (complete && passed === false) {
      failures.push(
        `assert failed ${row.id}: measured median ${rowMedian} [${values.join(', ')}], budget ${formatLimit(row.budget)}`,
      );
    }
    if (determinismMetrics.has(row.metric) && !countsAgree(values)) {
      failures.push(`nondeterministic count ${row.id}: [${values.join(', ')}]`);
    }
    return {
      ...row,
      samples: values,
      details: samples.map((sample) => sample.detail ?? null),
      median: values.length ? rowMedian : null,
      min: values.length ? Math.min(...values) : null,
      max: values.length ? Math.max(...values) : null,
      withinBudget,
      pass: passed,
    };
  });
  if (shortByAbort > 0) {
    failures.push(`${shortByAbort} rows short of ${passesPerRate} samples because a pass aborted`);
  }
  for (const row of budgets) {
    if (!crossRateMetrics.has(row.metric) || rateSuffix.test(row.id)) continue;
    for (const cpuRate of cpuRates.filter((rate) => rate !== 1)) {
      const other = medians.get(`${row.id}.${cpuRate}x`);
      const base = medians.get(row.id);
      if (other === undefined || base === undefined) continue;
      if (!countsAgree([base, other])) {
        failures.push(`nondeterministic count ${row.id}: 1x ${base} vs ${cpuRate}x ${other}`);
      }
    }
  }

  const finishedAt = new Date();
  return {
    harness: 'PERF-1a',
    complete,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    budgetsFile: path.relative(storeRoot, budgetsPath),
    chromium,
    reactRenderer: [
      ...new Set(passes.map((pass) => pass.reactRenderer).filter((version) => version.length > 0)),
    ].join(' | '),
    viewport: '1440x900',
    cpuRates,
    passesPerRate,
    dragSteps,
    sequence: passSequence,
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

export { buildReport as builder };
