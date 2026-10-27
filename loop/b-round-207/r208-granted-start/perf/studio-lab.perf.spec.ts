import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, expect, type Locator, type Page, test } from '@playwright/test';
import {
  isWithinBudget,
  loadPerfBudgets,
  type PerfBudgetLimit,
  type PerfBudgetRow,
} from './lib/budgets';
import { installPerfInstrumentation, type PerfWindowSnapshot } from './lib/instrumentation';
import { countsAgree, frameIntervals, median, percentile, roundTo } from './lib/stats';

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
const slowEventMs = 16;
const clipNudgePx = 40;

const determinismMetrics = new Set(['components-per-commit', 'restarts', 'moves-dispatched']);
const crossRateMetrics = new Set(['components-per-commit', 'restarts']);
const rateSuffix = /\.\d+x$/;
const wallclockFaderMetrics = new Set([
  'frame-p95',
  'frames-over-33',
  'loaf-count',
  'event-share-16',
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
];

type FaderState = 'stopped' | 'playing';
type FaderName = 'track' | 'pan' | 'master' | 'clipgain' | 'group';

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

async function measureFader(
  page: Page,
  fader: FaderName,
  state: FaderState,
  result: PassResult,
): Promise<void> {
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
    result.problems.push(`playback not running before fader.${fader}.playing`);
  }
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
  if (!(valueLow < valueHigh)) {
    result.problems.push(
      `fader.${fader}.${state} did not move: ${valueStart} -> ${valueLow} -> ${valueHigh}`,
    );
  }
  if (state === 'playing' && !(await isPlaying(page))) {
    result.problems.push(`playback not running after fader.${fader}.playing`);
  }
  const gesture = await snapshot(page, t0, tUp);
  const whole = await snapshot(page, t0, tEnd);
  const moves = gesture.moves.length;
  const rendered = whole.commits.map((commit) => commit.rendered);
  if (rendered.length === 0) result.problems.push(`no commits during fader.${fader}.${state}`);
  const intervals = frameIntervals(gesture.frames);
  const slowEvents = gesture.events.filter(
    (entry) =>
      (entry.name === 'pointermove' || entry.name === 'input') && entry.duration >= slowEventMs,
  ).length;
  const put = (metric: string, sample: PassSample): void => {
    result.samples.set(faderRowId(fader, state, metric, result.cpuRate), sample);
  };
  put('components-per-commit', {
    value: median(rendered),
    detail: {
      max: rendered.length ? Math.max(...rendered) : 0,
      commits: rendered.length,
      settleMs: roundTo(tEnd - tUp, 0),
      valueStart,
      valueLow,
      valueHigh,
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
  put('event-share-16', {
    value: roundTo(moves ? slowEvents / moves : 0, 3),
    detail: { slowEvents, eventEntries: gesture.events.length },
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
    await setPlayback(page, true);
    await page.waitForTimeout(idleSettleMs);
    const running = await isPlaying(page);
    if (record) result.samples.set('harness.audio-running', { value: running ? 1 : 0 });
    const idleStart = await nowIn(page);
    await page.waitForTimeout(idleMeasureMs);
    const idle = await snapshot(page, idleStart, await nowIn(page));
    if (record) {
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

test('studio-lab perf harness PERF-1a', async ({ browser }) => {
  const startedAt = new Date();
  const budgets = loadPerfBudgets(budgetsPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const write = (report: ReturnType<typeof buildReport>): void => {
    mkdirSync(resultsDir, { recursive: true });
    const json = `${JSON.stringify(report, null, 2)}\n`;
    writeFileSync(path.join(resultsDir, `perf-1a-${stamp}.json`), json);
    writeFileSync(path.join(resultsDir, 'latest.json'), json);
  };
  const passes: PassResult[] = [];
  for (const cpuRate of cpuRates) {
    for (let pass = 1; pass <= passesPerRate; pass += 1) {
      passes.push(await runPass(browser, cpuRate, pass));
      write(buildReport(budgets, passes, startedAt, browser.version()));
    }
  }

  const report = buildReport(budgets, passes, startedAt, browser.version());
  write(report);
  const table = report.rows.map(
    (row) =>
      `${row.id.padEnd(52)} ${row.mode.padEnd(6)} median ${String(row.median).padStart(8)}  min ${String(row.min).padStart(8)}  max ${String(row.max).padStart(8)}  budget ${formatLimit(row.budget).padEnd(8)} ${row.pass === null ? '' : row.pass ? 'PASS' : 'FAIL'}`,
  );
  console.log(
    [`PERF-1a results (${report.durationMs} ms) -> test-results/perf/latest.json`, ...table].join(
      '\n',
    ),
  );

  expect(report.failures, report.failures.join('\n')).toEqual([]);
});
