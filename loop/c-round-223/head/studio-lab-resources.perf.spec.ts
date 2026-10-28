import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  type Browser,
  type BrowserContext,
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
} from './lib/budgets';
import { installPerfInstrumentation, type PerfWindowSnapshot } from './lib/instrumentation';
import { countsAgree, median, roundTo } from './lib/stats';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resourceBudgetsPath = path.resolve(
  storeRoot,
  process.env.PERF_BUDGETS_RESOURCES ?? path.join('perf', 'budgets.resources.json'),
);
const resultsDir = path.join(storeRoot, 'test-results', 'perf');

const passesPerRate = 3;
const cpuRates = [1, 6];
const viewport = { width: 1440, height: 900 };
const settleMs = 600;
const quietMs = 200;
const settleCapMs = 3000;
const idleSettleMs = 1000;
const heapPollMs = 50;
const downloadTimeoutMs = 60000;
const doneTextTimeoutMs = 15000;
const actionTimeoutMs = 30000;
const networkQuietMs = 1000;
const networkCapMs = 8000;
const pathTimeoutMs = 30000;
const observerSettleMs = 200;
const passGuardMs = 8 * 60 * 1000;
const expectedReactMajor = '18';
const expectedWavName = 'czaba-studio-lab.wav';
const wavSampleRate = 48000;
const wavBytesPerFrame = 6;
const wavHeaderBytes = 44;
const mebibyte = 1024 * 1024;
const wavDonePattern = /WAV created: (\d+):(\d+\.\d+)/;

const jsRoutes = [
  { key: 'studio-lab', route: '/studio-lab' },
  { key: 'home', route: '/' },
  { key: 'studio-guard', route: '/studio/middle-east' },
];

const resourceDeterminismMetrics = new Set([
  'backing-ready-mib',
  'used-ready-mib',
  'backing-after-export-delta-mib',
  'page-0',
  'page-1',
  'clip-subtree',
  'ruler-1',
  'page-2',
  'ruler-2',
  'page-per-added-clip',
  'longtasks-over-50',
  'peak-backing-delta-mib',
  'bytes',
  'encoded-bytes',
  'decoded-bytes',
  'scripts',
  'third-party-scripts',
]);
const rateSuffix = /\.\d+x$/;

const resourceSequence = [
  'a. /studio-lab -> ready (library Add enabled and the preview waveform drawn); HeapProfiler.collectGarbage, Runtime.getHeapUsage (1x: res.mem.backing-ready-mib, res.mem.used-ready-mib); 1x: res.dom.page-0',
  'b. library Add; wait for the clip waveform and quiet (res.harness.clips-1; 1x: res.dom.page-1, res.dom.clip-subtree, res.dom.ruler-1)',
  'CPU throttle on (6x passes), after ready and Add',
  'c. Export -> WAV checked (default) -> Export WAV; window from the click to the "WAV created" text; heap polled every 50 ms; download header checked; Done (res.export.1.*, res.harness.export-1-produced, res.harness.mem-polls-1)',
  'd. 1x only: GC, then res.mem.backing-after-export-delta-mib',
  'e. click the clip header, blur, Ctrl+D (res.harness.clips-2; 1x: res.dom.page-2, res.dom.ruler-2, res.dom.page-per-added-clip), export again (res.export.2.*, res.harness.export-2-produced, res.harness.mem-polls-2)',
  'f. 1x only: fresh context per route, cache disabled, CDP Network: /studio-lab, /, /studio/middle-east (res.js.<route>.*, res.harness.js-<route>-seen)',
];

interface PassSample {
  value: number;
  detail?: Record<string, number | string | boolean>;
}

interface ResourcePassResult {
  cpuRate: number;
  pass: number;
  samples: Map<string, PassSample>;
  problems: string[];
  abortedAt: string | null;
  pageErrors: number;
  reactRenderer: string;
  innerWidth: number;
  stepMs: Record<string, number>;
}

interface BlockingFrameRecord {
  t: number;
  blocking: number | null;
}

interface BlockingFrameState {
  frames: BlockingFrameRecord[];
  errors: string[];
}

interface HeapSample {
  sentAt: number;
  receivedAt: number;
  backingBytes: number;
}

interface HeapReading {
  backingBytes: number;
  usedBytes: number;
}

interface WavCheck {
  ok: boolean;
  reason: string;
  frames: number;
  expectedFrames: number;
  bytes: number;
}

interface ScriptRequest {
  url: string;
  encoded: number;
  decoded: number;
}

declare global {
  interface Window {
    __czabaBlockingFrames?: BlockingFrameState;
    __czabaExportDoneAt?: number | null;
  }
}

function installBlockingFrameObserver(): void {
  const state: BlockingFrameState = { frames: [], errors: [] };
  window.__czabaBlockingFrames = state;
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const blocking =
          'blockingDuration' in entry && typeof entry.blockingDuration === 'number'
            ? entry.blockingDuration
            : null;
        state.frames.push({ t: entry.startTime, blocking });
      }
    }).observe({ type: 'long-animation-frame', buffered: true });
  } catch (error) {
    state.errors.push(`long-animation-frame: ${String(error)}`);
  }
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

const blockingFramesIn = (page: Page, from: number, to: number): Promise<BlockingFrameRecord[]> =>
  page.evaluate(
    ({ start, end }) =>
      (window.__czabaBlockingFrames?.frames ?? []).filter(
        (frame) => frame.t >= start && frame.t <= end,
      ),
    { start: from, end: to },
  );

const blurActive = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
  });

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

function reactRendererProblem(versions: readonly string[]): string | null {
  if (versions.length === 0) return 'no React renderer was injected into the devtools hook';
  if (versions.every((version) => version.split('.')[0] === expectedReactMajor)) return null;
  return `React renderer major is not ${expectedReactMajor}: ${versions.join(', ')}`;
}

function rateRowId(base: string, cpuRate: number): string {
  return cpuRate === 1 ? base : `${base}.${cpuRate}x`;
}

const audioClips = (page: Page): Locator => page.locator('[data-clip-kind="audio"]');

const toMebibytes = (bytes: number): number => roundTo(bytes / mebibyte, 1);

const maxOf = (values: readonly number[]): number =>
  values.reduce((max, value) => Math.max(max, value), 0);

async function readHeap(cdp: CDPSession): Promise<HeapReading | null> {
  const heap = await cdp.send('Runtime.getHeapUsage');
  const backingBytes = heap.backingStorageSize;
  const usedBytes = heap.usedSize;
  if (!Number.isFinite(backingBytes) || !Number.isFinite(usedBytes)) return null;
  return { backingBytes, usedBytes };
}

async function readHeapAfterGc(cdp: CDPSession, page: Page): Promise<HeapReading | null> {
  await cdp.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(300);
  return readHeap(cdp);
}

const countPageElements = (page: Page): Promise<number> =>
  page.evaluate(() => document.querySelectorAll('*').length);

const countSubtree = (target: Locator): Promise<number> =>
  target.evaluate((element) => element.querySelectorAll('*').length + 1);

async function measureLoadReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const add = [...document.querySelectorAll('button')].find(
        (button) => button.textContent?.trim() === 'Add',
      );
      const wave = document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
      return add instanceof HTMLButtonElement && !add.disabled && wave !== null;
    },
    undefined,
    { polling: 'raf', timeout: 90000 },
  );
}

function checkWavFile(
  filePath: string,
  suggestedName: string,
  clipSeconds: number | null,
): WavCheck {
  const fail = (reason: string, bytes: number): WavCheck => ({
    ok: false,
    reason,
    frames: 0,
    expectedFrames: 0,
    bytes,
  });
  const file = readFileSync(filePath);
  const bytes = file.length;
  if (suggestedName !== expectedWavName) return fail(`file name ${suggestedName}`, bytes);
  if (bytes < wavHeaderBytes) return fail(`file has ${bytes} bytes`, bytes);
  const riff = file.toString('ascii', 0, 4);
  const wave = file.toString('ascii', 8, 12);
  const fmt = file.toString('ascii', 12, 16);
  const dataTag = file.toString('ascii', 36, 40);
  if (riff !== 'RIFF' || wave !== 'WAVE' || fmt !== 'fmt ' || dataTag !== 'data') {
    return fail(`chunk tags ${riff}/${wave}/${fmt}/${dataTag}`, bytes);
  }
  const audioFormat = file.readUInt16LE(20);
  const channels = file.readUInt16LE(22);
  const sampleRate = file.readUInt32LE(24);
  const bits = file.readUInt16LE(34);
  if (audioFormat !== 1 || channels !== 2 || sampleRate !== wavSampleRate || bits !== 24) {
    return fail(
      `header format ${audioFormat}, ${channels} ch, ${sampleRate} Hz, ${bits}-bit`,
      bytes,
    );
  }
  const dataBytes = file.readUInt32LE(40);
  if (dataBytes !== bytes - wavHeaderBytes) {
    return fail(`data size ${dataBytes} != file size - 44 (${bytes - wavHeaderBytes})`, bytes);
  }
  if (dataBytes % wavBytesPerFrame !== 0)
    return fail(`data size ${dataBytes} not frame aligned`, bytes);
  const frames = dataBytes / wavBytesPerFrame;
  if (clipSeconds === null) return fail('no "WAV created: mm:ss.mmm" length text', bytes);
  const expectedFrames = Math.round(clipSeconds * wavSampleRate);
  if (frames !== expectedFrames && frames !== expectedFrames + 1) {
    return {
      ok: false,
      reason: `frames ${frames} vs ${expectedFrames}`,
      frames,
      expectedFrames,
      bytes,
    };
  }
  return { ok: true, reason: '', frames, expectedFrames, bytes };
}

async function measureExport(
  page: Page,
  cdp: CDPSession,
  clips: number,
  readyBackingBytes: number,
  result: ResourcePassResult,
): Promise<void> {
  const put = (metric: string, sample: PassSample): void => {
    result.samples.set(rateRowId(`res.export.${clips}.${metric}`, result.cpuRate), sample);
  };
  const putLive = (metric: string, value: number, detail: PassSample['detail']): void => {
    result.samples.set(rateRowId(`res.harness.${metric}`, result.cpuRate), { value, detail });
  };
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('arrangement-export-format-wav')).toBeChecked();
  const primary = dialog.getByRole('button', { name: 'Export WAV', exact: true });
  await expect(primary).toBeEnabled();
  await page.waitForTimeout(300);

  const textBefore = (await dialog.textContent()) ?? '';
  if (textBefore.includes('WAV created:')) {
    throw new Error(`export ${clips}: the dialog shows "WAV created" before the click`);
  }
  await page.evaluate(() => {
    window.__czabaExportDoneAt = null;
    const observer = new MutationObserver(() => {
      const text = document.querySelector('[role="dialog"]')?.textContent ?? '';
      if (!text.includes('WAV created:')) return;
      window.__czabaExportDoneAt = performance.now();
      observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  });
  const timeOrigin = await page.evaluate(() => performance.timeOrigin);

  const heapSamples: HeapSample[] = [];
  let heapErrors = 0;
  let polling = true;
  const pollLoop = (async () => {
    while (polling) {
      const sentAt = Date.now();
      try {
        const heap = await readHeap(cdp);
        if (heap)
          heapSamples.push({ sentAt, receivedAt: Date.now(), backingBytes: heap.backingBytes });
        else heapErrors += 1;
      } catch {
        heapErrors += 1;
      }
      const wait = Math.max(0, heapPollMs - (Date.now() - sentAt));
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  })();

  const downloadPromise = page
    .waitForEvent('download', { timeout: downloadTimeoutMs })
    .catch(() => null);
  let t1: number | null = null;
  try {
    const beforeClick = await nowIn(page);
    await primary.click();
    const download = await downloadPromise;
    try {
      const doneHandle = await page.waitForFunction(
        () => window.__czabaExportDoneAt ?? 0,
        undefined,
        {
          polling: 100,
          timeout: download ? doneTextTimeoutMs : 1000,
        },
      );
      t1 = await doneHandle.jsonValue();
    } catch {
      t1 = null;
    }
    const endSentAt = Date.now();
    const endHeap = t1 === null ? null : await readHeap(cdp).catch(() => null);
    polling = false;
    await pollLoop;
    await page.waitForTimeout(observerSettleMs);
    const pointerDowns = await page.evaluate(
      (from) => (window.__czabaPerf?.downs ?? []).filter((t) => t >= from),
      beforeClick,
    );
    const clickDown = pointerDowns.at(0);
    if (clickDown === undefined) {
      result.problems.push(`export ${clips}: no pointerdown recorded for the Export WAV click`);
    }
    const t0 = clickDown ?? beforeClick;
    const windowEnd = t1 ?? (await nowIn(page));
    const doneText = t1 === null ? null : await page.getByText(/^WAV created:/).textContent();
    const lengthMatch = doneText ? wavDonePattern.exec(doneText) : null;
    const clipSeconds = lengthMatch ? Number(lengthMatch[1]) * 60 + Number(lengthMatch[2]) : null;

    const perfWindow = await snapshot(page, t0, windowEnd);
    const blockingFrames = await blockingFramesIn(page, t0, windowEnd);
    const longtaskDurations = perfWindow.longtasks.map((entry) => entry.duration);
    put('wall-ms', { value: roundTo(windowEnd - t0, 0), detail: { textSeen: t1 !== null } });
    put('longtasks-over-50', {
      value: longtaskDurations.filter((duration) => duration > 50).length,
      detail: { durations: longtaskDurations.map((duration) => roundTo(duration, 0)).join(',') },
    });
    put('longtask-max', { value: roundTo(maxOf(longtaskDurations), 0) });
    const missingBlocking = blockingFrames.filter((frame) => frame.blocking === null).length;
    if (missingBlocking > 0) {
      result.problems.push(
        `export ${clips}: ${missingBlocking} long-animation-frame entries have no blockingDuration`,
      );
    } else {
      put('loaf-blocking-max', {
        value: roundTo(maxOf(blockingFrames.map((frame) => frame.blocking ?? 0)), 0),
        detail: { frames: blockingFrames.length },
      });
    }
    const windowStartEpoch = timeOrigin + t0;
    const windowEndEpoch = timeOrigin + windowEnd;
    const inWindow = heapSamples.filter(
      (sample) => sample.sentAt >= windowStartEpoch && sample.receivedAt <= windowEndEpoch,
    );
    putLive(`mem-polls-${clips}`, inWindow.length, {
      errors: heapErrors,
      allSamples: heapSamples.length,
    });
    if (inWindow.length < 5) {
      result.problems.push(
        `export ${clips}: only ${inWindow.length} valid backingStorageSize samples in the window (${heapErrors} invalid)`,
      );
    }
    if (inWindow.length > 0 && endHeap) {
      const windowPeak = maxOf(inWindow.map((sample) => sample.backingBytes));
      put('peak-backing-delta-mib', {
        value: toMebibytes(Math.max(windowPeak, endHeap.backingBytes) - readyBackingBytes),
        detail: {
          samples: inWindow.length,
          windowPeakMib: toMebibytes(windowPeak - readyBackingBytes),
          endSampleMib: toMebibytes(endHeap.backingBytes - readyBackingBytes),
          endSampleLagMs: roundTo(endSentAt - windowEndEpoch, 0),
        },
      });
    } else if (t1 !== null) {
      result.problems.push(
        `export ${clips}: no peak (${inWindow.length} window samples, end sample ${endHeap ? 'read' : 'missing'})`,
      );
    }

    if (download === null) {
      putLive(`export-${clips}-produced`, 0, { reason: 'no download within 60 s' });
      result.problems.push(`export ${clips}: no download within ${downloadTimeoutMs / 1000} s`);
    } else {
      const filePath = await Promise.race([
        download.path(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('download.path() timed out')), pathTimeoutMs);
        }),
      ]);
      const check = checkWavFile(filePath, download.suggestedFilename(), clipSeconds);
      putLive(`export-${clips}-produced`, check.ok ? 1 : 0, {
        reason: check.reason,
        frames: check.frames,
        expectedFrames: check.expectedFrames,
        doneText: doneText ?? '',
      });
      if (check.ok) put('bytes', { value: check.bytes });
      else result.problems.push(`export ${clips}: WAV check failed: ${check.reason}`);
    }
  } finally {
    polling = false;
    await pollLoop;
  }
  const done = dialog.getByRole('button', { name: 'Done', exact: true });
  if (t1 !== null && (await done.count()) === 1) await done.click();
  else await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10000 });
}

async function duplicateFirstClip(page: Page): Promise<void> {
  const header = audioClips(page)
    .first()
    .getByTitle(/ — drag to move$/);
  const box = await header.boundingBox();
  if (!box) throw new Error('the clip header has no bounding box');
  await header.click({ position: { x: Math.min(40, box.width / 2), y: box.height / 2 } });
  await blurActive(page);
  await page.keyboard.press('Control+d');
  await expect(audioClips(page))
    .toHaveCount(2, { timeout: 10000 })
    .catch(() => undefined);
}

async function newResourceContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport, acceptDownloads: true });
  await context.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
  });
  return context;
}

async function runResourcePass(
  browser: Browser,
  cpuRate: number,
  pass: number,
): Promise<ResourcePassResult> {
  const result: ResourcePassResult = {
    cpuRate,
    pass,
    samples: new Map(),
    problems: [],
    abortedAt: null,
    pageErrors: 0,
    reactRenderer: '',
    innerWidth: 0,
    stepMs: {},
  };
  const record = cpuRate === 1;
  const context = await newResourceContext(browser);
  await context.addInitScript(installPerfInstrumentation);
  await context.addInitScript(installBlockingFrameObserver);
  const page = await context.newPage();
  page.setDefaultTimeout(actionTimeoutMs);
  page.on('pageerror', () => {
    result.pageErrors += 1;
  });
  let step = 'load';
  let stepStart = Date.now();
  const beginStep = (name: string): void => {
    result.stepMs[step] = Date.now() - stepStart;
    step = name;
    stepStart = Date.now();
  };
  try {
    const cdp = await context.newCDPSession(page);
    await page.goto('/studio-lab', { waitUntil: 'load', timeout: 120000 });
    await measureLoadReady(page);
    result.innerWidth = await page.evaluate(() => window.innerWidth);
    const observerErrors = await page.evaluate(() => [
      ...(window.__czabaPerf?.observerErrors ?? []),
      ...(window.__czabaBlockingFrames?.errors ?? []),
    ]);
    for (const error of observerErrors) result.problems.push(`observer unavailable: ${error}`);
    const rendererVersions = await page.evaluate(
      () => window.__czabaPerf?.rendererVersions() ?? [],
    );
    result.reactRenderer = rendererVersions.join(', ');
    const rendererProblem = reactRendererProblem(rendererVersions);
    if (rendererProblem) result.problems.push(rendererProblem);
    await page.waitForTimeout(idleSettleMs);

    beginStep('ready heap');
    const ready = await readHeapAfterGc(cdp, page);
    if (!ready) throw new Error('Runtime.getHeapUsage gave no finite backingStorageSize at ready');
    if (record) {
      result.samples.set('res.mem.backing-ready-mib', { value: toMebibytes(ready.backingBytes) });
      result.samples.set('res.mem.used-ready-mib', { value: toMebibytes(ready.usedBytes) });
      result.samples.set('res.dom.page-0', { value: await countPageElements(page) });
    }

    beginStep('library Add');
    const addStart = await nowIn(page);
    await page.getByRole('button', { name: 'Add', exact: true }).click();
    await expect(audioClips(page)).toHaveCount(1);
    await expect(page.getByTestId('arrangement-clip-waveform')).toHaveCount(1);
    await waitForQuiet(page, addStart, settleMs);
    await blurActive(page);
    const clipsAfterAdd = await audioClips(page).count();
    result.samples.set(rateRowId('res.harness.clips-1', cpuRate), { value: clipsAfterAdd });
    if (clipsAfterAdd !== 1) result.problems.push(`after Add: ${clipsAfterAdd} clips, expected 1`);
    const ruler = page.getByTestId('arrangement-ruler');
    let pageOne = 0;
    if (record) {
      pageOne = await countPageElements(page);
      result.samples.set('res.dom.page-1', { value: pageOne });
      result.samples.set('res.dom.clip-subtree', {
        value: await countSubtree(audioClips(page).first()),
      });
      result.samples.set('res.dom.ruler-1', { value: await countSubtree(ruler) });
    }

    if (cpuRate > 1) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    }

    beginStep('export 1 clip');
    await measureExport(page, cdp, 1, ready.backingBytes, result);

    if (record) {
      beginStep('after export GC');
      const after = await readHeapAfterGc(cdp, page);
      if (after) {
        result.samples.set('res.mem.backing-after-export-delta-mib', {
          value: toMebibytes(after.backingBytes - ready.backingBytes),
        });
      } else {
        result.problems.push(
          'after export: Runtime.getHeapUsage gave no finite backingStorageSize',
        );
      }
    }

    beginStep('Ctrl+D');
    await duplicateFirstClip(page);
    await waitForQuiet(page, await nowIn(page), settleMs);
    await blurActive(page);
    const clipsAfterDuplicate = await audioClips(page).count();
    result.samples.set(rateRowId('res.harness.clips-2', cpuRate), { value: clipsAfterDuplicate });
    if (clipsAfterDuplicate !== 2) {
      throw new Error(`after Ctrl+D: ${clipsAfterDuplicate} clips, expected 2`);
    }
    if (record) {
      const pageTwo = await countPageElements(page);
      result.samples.set('res.dom.page-2', { value: pageTwo });
      result.samples.set('res.dom.ruler-2', { value: await countSubtree(ruler) });
      result.samples.set('res.dom.page-per-added-clip', { value: pageTwo - pageOne });
    }

    beginStep('export 2 clips');
    await measureExport(page, cdp, 2, ready.backingBytes, result);
    beginStep('done');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.abortedAt = step;
    result.problems.push(`aborted at ${step}: ${message.split('\n')[0]}`);
  } finally {
    result.stepMs[step] = Date.now() - stepStart;
    await context.close();
  }
  if (result.pageErrors > 0) result.problems.push(`${result.pageErrors} page errors`);
  if (record) {
    for (const { key, route } of jsRoutes) {
      const started = Date.now();
      await measureRouteScripts(browser, key, route, result);
      result.stepMs[`js ${key}`] = Date.now() - started;
    }
  }
  return result;
}

async function measureRouteScripts(
  browser: Browser,
  key: string,
  route: string,
  result: ResourcePassResult,
): Promise<void> {
  const context = await newResourceContext(browser);
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(actionTimeoutMs);
    const cdp = await context.newCDPSession(page);
    const scripts = new Map<string, ScriptRequest>();
    const decodedByRequest = new Map<string, number>();
    const encodedByRequest = new Map<string, number>();
    let lastNetworkAt = Date.now();
    cdp.on('Network.requestWillBeSent', () => {
      lastNetworkAt = Date.now();
    });
    cdp.on('Network.responseReceived', (event) => {
      lastNetworkAt = Date.now();
      if (event.type === 'Script') {
        scripts.set(event.requestId, { url: event.response.url, encoded: 0, decoded: 0 });
      }
    });
    cdp.on('Network.dataReceived', (event) => {
      lastNetworkAt = Date.now();
      decodedByRequest.set(
        event.requestId,
        (decodedByRequest.get(event.requestId) ?? 0) + event.dataLength,
      );
    });
    cdp.on('Network.loadingFinished', (event) => {
      lastNetworkAt = Date.now();
      encodedByRequest.set(event.requestId, event.encodedDataLength);
    });
    cdp.on('Network.loadingFailed', () => {
      lastNetworkAt = Date.now();
    });
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    const response = await page.goto(route, { waitUntil: 'load', timeout: 60000 });
    const status = response?.status() ?? 0;
    const loadedAt = Date.now();
    while (Date.now() - lastNetworkAt < networkQuietMs && Date.now() - loadedAt < networkCapMs) {
      await page.waitForTimeout(100);
    }
    const origin = new URL(page.url()).origin;
    const requests = [...scripts.entries()].map(([requestId, request]) => ({
      ...request,
      encoded: encodedByRequest.get(requestId) ?? 0,
      decoded: decodedByRequest.get(requestId) ?? 0,
      finished: encodedByRequest.has(requestId),
    }));
    const thirdParty = requests.filter((request) => new URL(request.url).origin !== origin);
    const unfinished = requests.filter((request) => !request.finished).length;
    const put = (metric: string, value: number): void => {
      result.samples.set(`res.js.${key}.${metric}`, { value });
    };
    put(
      'encoded-bytes',
      requests.reduce((sum, request) => sum + request.encoded, 0),
    );
    put(
      'decoded-bytes',
      requests.reduce((sum, request) => sum + request.decoded, 0),
    );
    put('scripts', requests.length);
    put('third-party-scripts', thirdParty.length);
    const seen = status === 200 ? requests.length : 0;
    result.samples.set(`res.harness.js-${key}-seen`, {
      value: seen,
      detail: { status, unfinished, quietWaitMs: Date.now() - loadedAt },
    });
    if (seen === 0)
      result.problems.push(`js ${route}: status ${status}, ${requests.length} scripts`);
    if (unfinished > 0)
      result.problems.push(`js ${route}: ${unfinished} script requests unfinished`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.problems.push(`js ${route} aborted: ${message.split('\n')[0]}`);
  } finally {
    await context.close();
  }
}

const formatLimit = (limit: PerfBudgetLimit | null): string =>
  limit ? `${limit.op} ${limit.value}` : '—';

function buildResourceReport(
  budgets: readonly PerfBudgetRow[],
  passes: readonly ResourcePassResult[],
  startedAt: Date,
  chromium: string,
  guardProblems: readonly string[],
) {
  const complete = passes.length === cpuRates.length * passesPerRate;
  const failures: string[] = [
    ...guardProblems,
    ...passes.flatMap((pass) =>
      pass.problems.map((problem) => `${pass.cpuRate}x pass ${pass.pass}: ${problem}`),
    ),
  ];
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
    const withinBudget = row.budget && values.length ? isWithinBudget(rowMedian, row.budget) : null;
    const passed = row.mode === 'assert' ? withinBudget === true : null;
    if ((complete || values.length > 0) && passed === false) {
      failures.push(
        `assert failed ${row.id}: measured median ${rowMedian} [${values.join(', ')}], budget ${formatLimit(row.budget)}`,
      );
    }
    if (
      row.kind === 'deterministic' &&
      resourceDeterminismMetrics.has(row.metric) &&
      !countsAgree(values)
    ) {
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

  const finishedAt = new Date();
  return {
    harness: 'PERF-1b-ii',
    complete,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    budgetsFile: path.relative(storeRoot, resourceBudgetsPath),
    chromium,
    reactRenderer: [
      ...new Set(passes.map((pass) => pass.reactRenderer).filter((version) => version.length > 0)),
    ].join(' | '),
    viewport: `${viewport.width}x${viewport.height}`,
    innerWidths: [...new Set(passes.map((pass) => pass.innerWidth))],
    cpuRates,
    passesPerRate,
    sequence: resourceSequence,
    passes: passes.map((pass) => ({
      cpuRate: pass.cpuRate,
      pass: pass.pass,
      abortedAt: pass.abortedAt,
      pageErrors: pass.pageErrors,
      problems: pass.problems,
      stepMs: pass.stepMs,
    })),
    failures,
    rows,
  };
}

test('studio-lab perf harness PERF-1b-ii', async ({ browser }) => {
  const startedAt = new Date();
  const budgets = loadPerfBudgets(resourceBudgetsPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const write = (report: ReturnType<typeof buildResourceReport>): void => {
    mkdirSync(resultsDir, { recursive: true });
    const json = `${JSON.stringify(report, null, 2)}\n`;
    writeFileSync(path.join(resultsDir, `perf-1b-ii-${stamp}.json`), json);
    writeFileSync(path.join(resultsDir, 'latest-resources.json'), json);
  };
  const passes: ResourcePassResult[] = [];
  const guardProblems: string[] = [];
  for (const cpuRate of cpuRates) {
    for (let pass = 1; pass <= passesPerRate; pass += 1) {
      if (Date.now() - startedAt.getTime() > passGuardMs) {
        guardProblems.push(
          `time guard: ${cpuRate}x pass ${pass} not started after ${passGuardMs / 60000} min`,
        );
        continue;
      }
      passes.push(await runResourcePass(browser, cpuRate, pass));
      write(buildResourceReport(budgets, passes, startedAt, browser.version(), guardProblems));
    }
  }

  const report = buildResourceReport(budgets, passes, startedAt, browser.version(), guardProblems);
  write(report);
  const table = report.rows.map(
    (row) =>
      `${row.id.padEnd(48)} ${row.mode.padEnd(6)} median ${String(row.median).padStart(10)}  min ${String(row.min).padStart(10)}  max ${String(row.max).padStart(10)}  budget ${formatLimit(row.budget).padEnd(6)} ${row.pass === null ? '' : row.pass ? 'PASS' : 'FAIL'}`,
  );
  console.log(
    [
      `PERF-1b-ii results (${report.durationMs} ms) -> test-results/perf/latest-resources.json`,
      ...table,
    ].join('\n'),
  );

  expect(report.failures, report.failures.join('\n')).toEqual([]);
});
