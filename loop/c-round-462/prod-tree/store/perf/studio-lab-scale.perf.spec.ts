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
import { perfLibraryAddLabel, perfMoveTitlePattern, perfZoomSliderLabel } from './lib/app-labels';
import { loadPerfBudgets, type PerfBudgetRow } from './lib/budgets';
import { installPerfInstrumentation, type PerfCommitRecord } from './lib/instrumentation';
import {
  audioClips,
  blurActive,
  nowIn,
  rateRowId,
  reactRendererProblem,
  snapshot,
  waitForCollectionReady,
  waitForLibraryReady,
  waitForQuiet,
} from './lib/page';
import { buildPerfReportCore, formatLimit, type PerfSample } from './lib/report';
import { percentile, roundTo } from './lib/stats';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scaleBudgetsPath = path.resolve(
  storeRoot,
  process.env.PERF_BUDGETS_SCALE ?? path.join('perf', 'budgets.scale.json'),
);
const resultsDir = path.join(storeRoot, 'test-results', 'perf');

const passesPerRate = 3;
const cpuRates = [1];
const throttledRate = 6;
const viewport = { width: 1440, height: 900 };
const scaleClipTarget = 200;
const settleMs = 600;
const keySettleMs = 300;
const zoomKeyCount = 5;
const minZoomKeyLimit = 60;
const scrollStepCount = 4;
const navigationTimeoutMs = 120000;
const pressTimeoutMs = 30000;
const audioClipSelector = '[data-clip-kind="audio"]';
const countedLaneSelector = '[data-track-id][data-clip-count]';
const collapsedGroupSelector = '[data-group-collapsed="true"]';
const rulerSelector = '[data-testid="arrangement-ruler"]';

const scaleSequence = [
  'one browser context per pass at 1440x900, perf instrumentation installed before load',
  'a. load: /studio-lab -> waitForLibraryReady -> waitForCollectionReady',
  `b. build: library Add, click the clip name bar, blur; Control+d x${scaleClipTarget - 1}, each waited until the lane data-clip-count equals press + 1 (scale.harness.build-ms = the Control+d loop); self-check lane count ${scaleClipTarget}, >= 1 mounted clip and one distinct data-clip-start per mounted clip, 0 collapsed groups; wait for quiet`,
  'c. default zoom, scroll 0, 1x: scale.dom.page, scale.dom.clip-subtree, scale.clips.model, scale.clips.mounted, scale.clips.in-window (in-window = clips intersecting the lane area: the timeline scroller box minus the first track header width); self-check visible gap here, at f, at g and after each h step: the mounted clips cover the lane area up to the model end with no hole, which assumes the back-to-back Control+d build of step b (equal-length clips, each starting where the previous one ends)',
  `d. zoom keys at 1x: ${zoomKeyCount} x "-" then ${zoomKeyCount} x "=", one window per key until quiet (scale.zoom.*); self-check direction per key and return to the start value`,
  `e. the same keys at ${throttledRate}x CPU (Emulation.setCPUThrottlingRate), ids with .${throttledRate}x; rate back to 1`,
  `f. minimum zoom: "-" until the Zoom slider value equals its min (at most ${minZoomKeyLimit} keys), wait for quiet (scale.*.min-zoom)`,
  'g. minimum zoom, timeline scroller scrollLeft = round((scrollWidth - clientWidth) / 2), wait for quiet (scale.*.min-zoom-mid); self-check scrollLeft > 0 and in-window >= 1',
  `h. scroll page crossings: scrollLeft += clientWidth x${scrollStepCount}, one window per step until quiet (scale.scroll.*)`,
  `i. zoom keys at minimum zoom, scroll as left by h: ${zoomKeyCount} x "=" then ${zoomKeyCount} x "-", one window per key until quiet (scale.zoom.min.*), at 1x, then scrollLeft restored to its value at the start of i, then the same keys at ${throttledRate}x (ids with .${throttledRate}x); self-check direction per key, return to the minimum and the restored scrollLeft`,
];

interface ScalePassResult {
  cpuRate: number;
  pass: number;
  samples: Map<string, PerfSample>;
  problems: string[];
  abortedAt: string | null;
  pageErrors: number;
  reactRenderer: string;
}

interface ScaleDomReading {
  page: number;
  clipSubtree: number;
  model: number;
  mounted: number;
  inWindow: number;
  scrollLeft: number;
  scrollWidth: number;
  clientWidth: number;
  scrollerFound: boolean;
  visibleGap: string | null;
}

interface ScaleStepRecord {
  keydownMs: number;
  loafMs: number;
  commits: number;
  components: number;
  value: number;
}

const scaleSelectors = {
  audio: audioClipSelector,
  lane: countedLaneSelector,
  ruler: rulerSelector,
  header: '[data-testid="arrangement-track-header"]',
};

const zoomSlider = (page: Page): Locator =>
  page.getByRole('slider', { name: perfZoomSliderLabel, exact: true });

const sumRenderedComponents = (commits: readonly PerfCommitRecord[]): number =>
  commits.reduce((sum, commit) => sum + commit.rendered, 0);

const maxOfValues = (values: readonly number[]): number =>
  values.reduce((max, value) => Math.max(max, value), 0);

const sumOfValues = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0);

function readScaleDom(page: Page): Promise<ScaleDomReading> {
  return page.evaluate((selectors): ScaleDomReading => {
    let scroller = document.querySelector(selectors.ruler)?.parentElement ?? null;
    while (
      scroller &&
      !(
        scroller.scrollWidth > scroller.clientWidth &&
        ['auto', 'scroll'].includes(getComputedStyle(scroller).overflowX)
      )
    ) {
      scroller = scroller.parentElement;
    }
    const clips = [...document.querySelectorAll<HTMLElement>(selectors.audio)];
    const box = scroller?.getBoundingClientRect() ?? null;
    const headerWidth =
      document.querySelector(selectors.header)?.getBoundingClientRect().width ?? 0;
    const laneLeft = box ? box.left + headerWidth : 0;
    const visible = box
      ? clips
          .map((clip) => ({
            rect: clip.getBoundingClientRect(),
            start: Number(clip.dataset.clipStart),
          }))
          .filter(
            ({ rect }) =>
              rect.width > 0 &&
              rect.right > laneLeft &&
              rect.left < box.right &&
              rect.bottom > box.top &&
              rect.top < box.bottom,
          )
          .sort((a, b) => a.rect.left - b.rect.left || a.start - b.start)
      : [];
    const inWindow = visible.length;
    const lanes = [...document.querySelectorAll<HTMLElement>(selectors.lane)];
    const modelCount = lanes.reduce(
      (max, lane) => Math.max(max, Number(lane.getAttribute('data-clip-count'))),
      0,
    );
    const placed = clips
      .map((clip) => ({
        left: clip.getBoundingClientRect().left,
        width: clip.getBoundingClientRect().width,
        start: Number(clip.dataset.clipStart),
      }))
      .sort((a, b) => a.start - b.start);
    const first = placed[0];
    const second = placed.find((clip) => first !== undefined && clip.start > first.start);
    const pxPerSecond =
      first && second ? (second.left - first.left) / (second.start - first.start) : null;
    const modelEndX =
      first && pxPerSecond
        ? first.left - first.start * pxPerSecond + modelCount * first.width
        : null;
    let visibleGap: string | null = null;
    if (box && modelCount > 0) {
      const areaRight = modelEndX === null ? box.right : Math.min(box.right, modelEndX);
      if (visible.length === 0) {
        visibleGap = `no clip in the lane area ${Math.round(laneLeft)}-${Math.round(areaRight)}`;
      } else {
        const head = visible[0];
        const tail = visible[visible.length - 1];
        if (head.rect.left > laneLeft + 1 && head.start > 0) {
          visibleGap = `left edge: first visible clip at ${Math.round(head.rect.left)} > lane ${Math.round(laneLeft)}`;
        } else if (tail.rect.right < areaRight - 1) {
          visibleGap = `right edge: last visible clip ends ${Math.round(tail.rect.right)} < ${Math.round(areaRight)}`;
        } else {
          for (let index = 1; index < visible.length; index += 1) {
            if (visible[index].rect.left - visible[index - 1].rect.right > 1) {
              visibleGap = `hole between ${visible[index - 1].start} and ${visible[index].start}`;
              break;
            }
          }
        }
      }
    }
    return {
      page: document.querySelectorAll('*').length,
      clipSubtree: clips.reduce((sum, clip) => sum + 1 + clip.querySelectorAll('*').length, 0),
      model: [...document.querySelectorAll<HTMLElement>(selectors.lane)].reduce(
        (sum, lane) => sum + Number(lane.getAttribute('data-clip-count')),
        0,
      ),
      mounted: clips.length,
      inWindow,
      scrollLeft: scroller?.scrollLeft ?? 0,
      scrollWidth: scroller?.scrollWidth ?? 0,
      clientWidth: scroller?.clientWidth ?? 0,
      scrollerFound: scroller !== null,
      visibleGap,
    };
  }, scaleSelectors);
}

function setTimelineScroll(page: Page, mode: 'middle' | 'page' | number): Promise<number> {
  return page.evaluate(
    ({ selector, scrollMode }) => {
      let scroller = document.querySelector(selector)?.parentElement ?? null;
      while (
        scroller &&
        !(
          scroller.scrollWidth > scroller.clientWidth &&
          ['auto', 'scroll'].includes(getComputedStyle(scroller).overflowX)
        )
      ) {
        scroller = scroller.parentElement;
      }
      if (!scroller) return -1;
      scroller.scrollLeft =
        typeof scrollMode === 'number'
          ? scrollMode
          : scrollMode === 'middle'
            ? Math.round((scroller.scrollWidth - scroller.clientWidth) / 2)
            : scroller.scrollLeft + scroller.clientWidth;
      return scroller.scrollLeft;
    },
    { selector: rulerSelector, scrollMode: mode },
  );
}

async function measureScaleStep(page: Page, act: () => Promise<void>): Promise<ScaleStepRecord> {
  await blurActive(page);
  const t0 = await nowIn(page);
  await act();
  const tEnd = await waitForQuiet(page, t0, keySettleMs);
  const stepWindow = await snapshot(page, t0, tEnd);
  const loafMs = await page.evaluate(
    ({ start, end }) =>
      (window.__czabaPerf?.loafs ?? [])
        .filter((entry) => entry.t <= end && entry.t + entry.duration >= start)
        .reduce((max, entry) => Math.max(max, entry.duration), 0),
    { start: t0, end: tEnd },
  );
  return {
    keydownMs: stepWindow.events
      .filter((entry) => entry.name === 'keydown')
      .reduce((max, entry) => Math.max(max, entry.duration), 0),
    loafMs,
    commits: stepWindow.commits.length,
    components: sumRenderedComponents(stepWindow.commits),
    value: Number(await zoomSlider(page).inputValue()),
  };
}

function putDomReading(
  result: ScalePassResult,
  suffix: string,
  reading: ScaleDomReading,
  ids: readonly ('page' | 'clip-subtree' | 'model' | 'mounted' | 'in-window')[],
): void {
  const detail = {
    scrollLeft: reading.scrollLeft,
    scrollWidth: reading.scrollWidth,
    clientWidth: reading.clientWidth,
  };
  const values = {
    page: { id: 'scale.dom.page', value: reading.page },
    'clip-subtree': { id: 'scale.dom.clip-subtree', value: reading.clipSubtree },
    model: { id: 'scale.clips.model', value: reading.model },
    mounted: { id: 'scale.clips.mounted', value: reading.mounted },
    'in-window': { id: 'scale.clips.in-window', value: reading.inWindow },
  };
  for (const key of ids) {
    const row = values[key];
    result.samples.set(`${row.id}${suffix}`, { value: row.value, detail });
  }
  if (!reading.scrollerFound) {
    result.problems.push(`timeline scroller not found${suffix ? ` (${suffix})` : ''}`);
  }
}

async function buildScaleClips(page: Page, result: ScalePassResult): Promise<void> {
  await page.getByRole('button', { name: perfLibraryAddLabel, exact: true }).click();
  await expect(audioClips(page)).toHaveCount(1);
  const clip = audioClips(page).first();
  const trackId = await clip.evaluate(
    (element) => element.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null,
  );
  if (trackId === null) throw new Error('the added clip has no [data-track-id] lane');
  const lane = page.locator(`[data-track-id="${trackId}"][data-clip-count]`);
  await expect(lane).toHaveAttribute('data-clip-count', '1');
  await waitForQuiet(page, await nowIn(page), settleMs);
  const bar = clip.getByTitle(perfMoveTitlePattern).first();
  const box = await bar.boundingBox();
  if (box === null) throw new Error('the clip name bar has no box');
  await page.mouse.click(box.x + Math.min(20, box.width / 2), box.y + box.height / 2);
  await blurActive(page);
  const started = Date.now();
  for (let press = 1; press < scaleClipTarget; press += 1) {
    await page.keyboard.press('Control+d');
    await expect(lane).toHaveAttribute('data-clip-count', String(press + 1), {
      timeout: pressTimeoutMs,
    });
  }
  const buildMs = Date.now() - started;
  const check = await page.evaluate(
    ({ audio, laneSelector, collapsed }) => ({
      laneCount: Number(document.querySelector(laneSelector)?.getAttribute('data-clip-count')),
      mountedClips: document.querySelectorAll(audio).length,
      distinctStarts: new Set(
        [...document.querySelectorAll(audio)].map(
          (element) => element.getAttribute('data-clip-start') ?? '',
        ),
      ).size,
      collapsedGroups: document.querySelectorAll(collapsed).length,
    }),
    {
      audio: audioClipSelector,
      laneSelector: `[data-track-id="${trackId}"][data-clip-count]`,
      collapsed: collapsedGroupSelector,
    },
  );
  result.samples.set('scale.harness.build-ms', {
    value: buildMs,
    detail: { trackId, ...check },
  });
  if (check.laneCount !== scaleClipTarget) {
    result.problems.push(`build: lane ${trackId} data-clip-count ${check.laneCount}`);
  }
  if (check.mountedClips < 1 || check.distinctStarts !== check.mountedClips) {
    result.problems.push(
      `build: ${check.distinctStarts} distinct data-clip-start values on ${check.mountedClips} mounted clips`,
    );
  }
  if (check.collapsedGroups !== 0) {
    result.problems.push(`build: ${check.collapsedGroups} collapsed groups`);
  }
  await waitForQuiet(page, await nowIn(page), settleMs);
}

async function measureZoomKeys(
  page: Page,
  result: ScalePassResult,
  rowPrefix = 'scale.zoom',
  firstKey: '-' | '=' = '-',
): Promise<void> {
  const slider = zoomSlider(page);
  await expect(slider).toHaveCount(1);
  const startValue = Number(await slider.inputValue());
  const secondKey = firstKey === '-' ? '=' : '-';
  const keys = [
    ...Array.from({ length: zoomKeyCount }, () => firstKey),
    ...Array.from({ length: zoomKeyCount }, () => secondKey),
  ];
  const records: ScaleStepRecord[] = [];
  for (const key of keys) {
    records.push(await measureScaleStep(page, () => page.keyboard.press(key)));
  }
  const keydown = records.map((record) => roundTo(record.keydownMs, 1));
  const commits = records.map((record) => record.commits);
  const components = records.map((record) => record.components);
  const values = [startValue, ...records.map((record) => record.value)];
  const put = (metric: string, sample: PerfSample): void => {
    result.samples.set(rateRowId(`${rowPrefix}.${metric}`, result.cpuRate), sample);
  };
  put('keydown-p95-ms', {
    value: percentile(keydown, 0.95),
    detail: { perKey: keydown.join(',') },
  });
  put('keydown-max-ms', { value: maxOfValues(keydown), detail: { perKey: keydown.join(',') } });
  put('commits-per-key', {
    value: roundTo(sumOfValues(commits) / keys.length, 3),
    detail: { perKey: commits.join(','), max: maxOfValues(commits) },
  });
  put('components-per-key', {
    value: roundTo(sumOfValues(components) / keys.length, 3),
    detail: { perKey: components.join(','), max: maxOfValues(components) },
  });
  const wrongDirection = records.filter((record, index) => {
    const previous = values[index];
    return keys[index] === '=' ? !(record.value > previous) : !(record.value < previous);
  }).length;
  if (wrongDirection > 0 || values[values.length - 1] !== startValue) {
    result.problems.push(
      `${rowPrefix} keys at ${result.cpuRate}x: ${wrongDirection} keys moved the wrong way; slider values ${values.join(',')}`,
    );
  }
}

async function reachMinimumZoom(page: Page, result: ScalePassResult): Promise<void> {
  const slider = zoomSlider(page);
  const sliderMin = Number(await slider.getAttribute('min'));
  let value = Number(await slider.inputValue());
  let presses = 0;
  await blurActive(page);
  while (value !== sliderMin && presses < minZoomKeyLimit) {
    const before = value;
    await page.keyboard.press('-');
    presses += 1;
    const moved = await expect
      .poll(async () => Number(await slider.inputValue()), { timeout: pressTimeoutMs })
      .not.toBe(before)
      .then(
        () => true,
        () => false,
      );
    value = Number(await slider.inputValue());
    if (!moved) break;
  }
  if (value !== sliderMin) {
    result.problems.push(
      `minimum zoom not reached after ${presses} keys: slider ${value}, min ${sliderMin}`,
    );
  }
  await waitForQuiet(page, await nowIn(page), settleMs);
}

async function measureScrollSteps(page: Page, result: ScalePassResult): Promise<void> {
  const start = await readScaleDom(page);
  const scrollLefts: number[] = [];
  const records: ScaleStepRecord[] = [];
  for (let step = 0; step < scrollStepCount; step += 1) {
    records.push(
      await measureScaleStep(page, async () => {
        scrollLefts.push(await setTimelineScroll(page, 'page'));
      }),
    );
    const afterStep = await readScaleDom(page);
    if (afterStep.visibleGap) {
      result.problems.push(`scroll step ${step + 1}: ${afterStep.visibleGap}`);
    }
  }
  const commits = records.map((record) => record.commits);
  const components = records.map((record) => record.components);
  const loafs = records.map((record) => roundTo(record.loafMs, 1));
  const detail = { startScrollLeft: start.scrollLeft, scrollLefts: scrollLefts.join(',') };
  const short = scrollLefts.filter(
    (value, index) =>
      value - (index === 0 ? start.scrollLeft : scrollLefts[index - 1]) !== start.clientWidth,
  ).length;
  if (short > 0) {
    result.problems.push(
      `scroll steps: ${short} of ${scrollStepCount} did not move by clientWidth ${start.clientWidth} (from ${start.scrollLeft}: ${scrollLefts.join(',')})`,
    );
  }
  result.samples.set('scale.scroll.commits-per-step', {
    value: roundTo(sumOfValues(commits) / scrollStepCount, 3),
    detail: { ...detail, perStep: commits.join(',') },
  });
  result.samples.set('scale.scroll.components-per-step', {
    value: roundTo(sumOfValues(components) / scrollStepCount, 3),
    detail: { ...detail, perStep: components.join(',') },
  });
  result.samples.set('scale.scroll.loaf-max-ms', {
    value: maxOfValues(loafs),
    detail: { ...detail, perStep: loafs.join(',') },
  });
}

async function runScalePass(browser: Browser, pass: number): Promise<ScalePassResult> {
  const result: ScalePassResult = {
    cpuRate: 1,
    pass,
    samples: new Map(),
    problems: [],
    abortedAt: null,
    pageErrors: 0,
    reactRenderer: '',
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
  let step = 'a. load';
  try {
    await page.goto('/studio-lab', { waitUntil: 'load', timeout: navigationTimeoutMs });
    await waitForLibraryReady(page);
    const observerErrors = await page.evaluate(() => window.__czabaPerf?.observerErrors ?? []);
    for (const error of observerErrors) result.problems.push(`observer unavailable: ${error}`);
    const rendererVersions = await page.evaluate(
      () => window.__czabaPerf?.rendererVersions() ?? [],
    );
    result.reactRenderer = rendererVersions.join(', ');
    const rendererProblem = reactRendererProblem(rendererVersions);
    if (rendererProblem) result.problems.push(rendererProblem);
    await waitForCollectionReady(page, result.problems, 'after load');

    step = 'b. build 200 clips';
    await buildScaleClips(page, result);

    step = 'c. default zoom';
    const atStart = await readScaleDom(page);
    if (atStart.scrollLeft !== 0) {
      result.problems.push(`default zoom: timeline scrollLeft ${atStart.scrollLeft}, not 0`);
    }
    putDomReading(result, '', atStart, ['page', 'clip-subtree', 'model', 'mounted', 'in-window']);
    if (atStart.visibleGap) result.problems.push(`default zoom: ${atStart.visibleGap}`);

    step = 'd. zoom keys 1x';
    await measureZoomKeys(page, result);

    step = `e. zoom keys ${throttledRate}x`;
    const cdp: CDPSession = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttledRate });
    result.cpuRate = throttledRate;
    try {
      await measureZoomKeys(page, result);
    } finally {
      result.cpuRate = 1;
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }

    step = 'f. minimum zoom';
    await reachMinimumZoom(page, result);
    const atMinimum = await readScaleDom(page);
    if (atMinimum.scrollLeft !== 0) {
      result.problems.push(`minimum zoom: timeline scrollLeft ${atMinimum.scrollLeft}, not 0`);
    }
    putDomReading(result, '.min-zoom', atMinimum, ['page', 'mounted', 'in-window']);
    if (atMinimum.visibleGap) result.problems.push(`minimum zoom: ${atMinimum.visibleGap}`);

    step = 'g. minimum zoom, middle';
    const middle = await setTimelineScroll(page, 'middle');
    await waitForQuiet(page, await nowIn(page), settleMs);
    const mid = await readScaleDom(page);
    putDomReading(result, '.min-zoom-mid', mid, ['page', 'mounted', 'in-window']);
    if (mid.visibleGap) result.problems.push(`middle scroll: ${mid.visibleGap}`);
    if (middle <= 0 || mid.scrollLeft <= 0) {
      result.problems.push(`middle scroll: scrollLeft ${mid.scrollLeft} (set ${middle})`);
    }
    if (mid.inWindow < 1) {
      result.problems.push(`middle scroll: ${mid.inWindow} clips in the window`);
    }

    step = 'h. scroll page crossings';
    await measureScrollSteps(page, result);

    step = 'i. zoom keys at minimum zoom 1x';
    await waitForQuiet(page, await nowIn(page), settleMs);
    const minStart = await readScaleDom(page);
    await measureZoomKeys(page, result, 'scale.zoom.min', '=');

    step = `i. zoom keys at minimum zoom ${throttledRate}x`;
    const restored = await setTimelineScroll(page, minStart.scrollLeft);
    await waitForQuiet(page, await nowIn(page), settleMs);
    if (restored !== minStart.scrollLeft) {
      result.problems.push(
        `minimum zoom keys: scrollLeft ${restored} before ${throttledRate}x, not ${minStart.scrollLeft}`,
      );
    }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttledRate });
    result.cpuRate = throttledRate;
    try {
      await measureZoomKeys(page, result, 'scale.zoom.min', '=');
    } finally {
      result.cpuRate = 1;
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.abortedAt = step;
    result.problems.push(`aborted at ${step}: ${message.split('\n')[0]}`);
  } finally {
    result.cpuRate = 1;
    await context.close();
  }
  if (result.pageErrors > 0) result.problems.push(`${result.pageErrors} page errors`);
  return result;
}

function buildScaleReport(
  budgets: readonly PerfBudgetRow[],
  passes: readonly ScalePassResult[],
  startedAt: Date,
  chromium: string,
) {
  const { complete, failures, rows } = buildPerfReportCore({
    budgets,
    passes,
    cpuRates,
    passesPerRate,
    assertWhenPartial: true,
  });
  const finishedAt = new Date();
  return {
    harness: 'PERF-14a',
    complete,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    budgetsFile: path.relative(storeRoot, scaleBudgetsPath),
    chromium,
    reactRenderer: [
      ...new Set(passes.map((pass) => pass.reactRenderer).filter((version) => version.length > 0)),
    ].join(' | '),
    viewport: `${viewport.width}x${viewport.height}`,
    clipTarget: scaleClipTarget,
    passesPerRate,
    sequence: scaleSequence,
    passes: passes.map((pass) => ({
      pass: pass.pass,
      abortedAt: pass.abortedAt,
      pageErrors: pass.pageErrors,
      problems: pass.problems,
    })),
    failures,
    rows,
  };
}

test('studio-lab perf harness PERF-14a scale', async ({ browser }) => {
  const startedAt = new Date();
  const budgets = loadPerfBudgets(scaleBudgetsPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const write = (report: ReturnType<typeof buildScaleReport>): void => {
    mkdirSync(resultsDir, { recursive: true });
    const json = `${JSON.stringify(report, null, 2)}\n`;
    writeFileSync(path.join(resultsDir, `perf-14a-${stamp}.json`), json);
    writeFileSync(path.join(resultsDir, 'latest-scale.json'), json);
  };
  const passes: ScalePassResult[] = [];
  for (let pass = 1; pass <= passesPerRate; pass += 1) {
    passes.push(await runScalePass(browser, pass));
    write(buildScaleReport(budgets, passes, startedAt, browser.version()));
  }
  const report = buildScaleReport(budgets, passes, startedAt, browser.version());
  write(report);
  const table = report.rows.map(
    (row) =>
      `${row.id.padEnd(40)} ${row.mode.padEnd(6)} median ${String(row.median).padStart(9)}  min ${String(row.min).padStart(9)}  max ${String(row.max).padStart(9)}  budget ${formatLimit(row.budget).padEnd(8)} ${row.pass === null ? '' : row.pass ? 'PASS' : 'FAIL'}`,
  );
  console.log(
    [
      `PERF-14a results (${report.durationMs} ms) -> test-results/perf/latest-scale.json`,
      ...table,
    ].join('\n'),
  );
  expect(report.failures, report.failures.join('\n')).toEqual([]);
});
