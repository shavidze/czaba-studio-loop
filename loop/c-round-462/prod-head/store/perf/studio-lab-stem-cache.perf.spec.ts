import { mkdirSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, type CDPSession, expect, type Page, test } from '@playwright/test';
import { STEM_CACHE_DB_NAME } from '../app/lib/arrangement/stem-cache';
import { loadPerfBudgets, type PerfBudgetRow } from './lib/budgets';
import { waitForCollectionReady, waitForLibraryReady } from './lib/page';
import { buildPerfReportCore, formatLimit, type PerfSample } from './lib/report';
import { roundTo } from './lib/stats';

const storeRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stemBudgetsPath = path.resolve(
  storeRoot,
  process.env.PERF_BUDGETS_STEM_CACHE ?? path.join('perf', 'budgets.stem-cache.json'),
);
const resultsDir = path.join(storeRoot, 'test-results', 'perf');

const passesPerRate = 3;
const cpuRates = [1];
const viewport = { width: 1440, height: 900 };
const stemPaths = ['/middle-east.mp3', '/videos/hero/hero-music.mp3'];
const stemCacheStoreName = 'entries';
const entriesTimeoutMs = 30000;
const entriesPollMs = 100;
const navigationTimeoutMs = 60000;
const stemEntriesTimeoutMs = 30000;
const resourceBufferSize = 2000;
const throttle = {
  offline: false,
  latency: 40,
  downloadThroughput: 1250000,
  uploadThroughput: 375000,
};

const stemSequence = [
  'one browser context per pass (empty HTTP cache, IndexedDB and OPFS); CDP Network.enable and Network.emulateNetworkConditions {latency 40 ms, download 1,250,000 B/s, upload 375,000 B/s} for every open',
  'a. cold: /studio-lab -> library ready (stem.cold.*); wait until czaba-stem-cache-v2 holds one record per stem (stem.cold.entries-stored)',
  'b. warm, HTTP cache evicted: Network.clearBrowserCache; /studio-lab again -> ready (stem.warm.*, stem.warm-ready-ratio, stem.warm-window-ratio)',
  'c. warm, HTTP cache kept: /studio-lab again -> ready (stem.warm-http.*)',
  'd. warm, DevTools cache disabled: Network.setCacheDisabled(true) (Chromium adds Cache-Control: no-cache); /studio-lab again -> ready (stem.warm-nocache.*); then Network.setCacheDisabled(false)',
  'e. blocked: Network.setBlockedURLs(["*.mp3"]); /studio-lab again -> ready (stem.blocked.ready)',
];

interface StemResourceReading {
  fetchRequests: number;
  audioRequests: number;
  bodyBytes: number;
  transferBytes: number;
  status200: number;
  status304: number;
  windowMs: number;
}

interface CdpMp3Bytes {
  all: number;
  media: number;
}

interface StemPassResult {
  cpuRate: number;
  pass: number;
  samples: Map<string, PerfSample>;
  problems: string[];
  abortedAt: string | null;
  stepMs: Record<string, number>;
}

async function readStemResources(page: Page): Promise<StemResourceReading> {
  return page.evaluate((paths) => {
    const entries = performance
      .getEntriesByType('resource')
      .filter(
        (entry): entry is PerformanceResourceTiming =>
          entry instanceof PerformanceResourceTiming &&
          paths.includes(new URL(entry.name).pathname),
      );
    const fetches = entries.filter((entry) => entry.initiatorType === 'fetch');
    const starts = fetches.map((entry) => entry.startTime);
    const ends = fetches.map((entry) => entry.responseEnd);
    return {
      fetchRequests: fetches.length,
      audioRequests: entries.filter((entry) => entry.initiatorType === 'audio').length,
      bodyBytes: fetches.reduce(
        (sum, entry) => sum + (entry.transferSize > 0 ? entry.encodedBodySize : 0),
        0,
      ),
      transferBytes: fetches.reduce((sum, entry) => sum + entry.transferSize, 0),
      status200: fetches.filter((entry) => entry.responseStatus === 200).length,
      status304: fetches.filter((entry) => entry.responseStatus === 304).length,
      windowMs: fetches.length > 0 ? Math.max(...ends) - Math.min(...starts) : 0,
    };
  }, stemPaths);
}

async function countStemEntries(page: Page): Promise<number> {
  return page.evaluate(
    ({ dbName, storeName }) =>
      new Promise<number>((resolve) => {
        const request = indexedDB.open(dbName);
        request.onupgradeneeded = () => request.transaction?.abort();
        request.onerror = () => resolve(-1);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolve(0);
            return;
          }
          const count = db.transaction(storeName, 'readonly').objectStore(storeName).count();
          count.onsuccess = () => {
            db.close();
            resolve(count.result);
          };
          count.onerror = () => {
            db.close();
            resolve(-1);
          };
        };
      }),
    { dbName: STEM_CACHE_DB_NAME, storeName: stemCacheStoreName },
  );
}

async function waitForStemEntries(page: Page, expected: number): Promise<number> {
  const started = Date.now();
  let count = await countStemEntries(page);
  while (count < expected && Date.now() - started < entriesTimeoutMs) {
    await page.waitForTimeout(entriesPollMs);
    count = await countStemEntries(page);
  }
  return count;
}

function trackMp3Bytes(cdp: CDPSession): () => CdpMp3Bytes {
  const types = new Map<string, string>();
  let totals: CdpMp3Bytes = { all: 0, media: 0 };
  cdp.on('Network.requestWillBeSent', (event) => {
    if (new URL(event.request.url).pathname.endsWith('.mp3')) {
      types.set(event.requestId, event.type ?? 'Other');
    }
  });
  cdp.on('Network.dataReceived', (event) => {
    const type = types.get(event.requestId);
    if (type === undefined) return;
    totals = {
      all: totals.all + event.encodedDataLength,
      media: totals.media + (type === 'Media' ? event.encodedDataLength : 0),
    };
  });
  return () => {
    const taken = totals;
    totals = { all: 0, media: 0 };
    return taken;
  };
}

async function waitForStemFetches(page: Page): Promise<void> {
  await page.waitForFunction(
    (paths) => {
      const fetched = new Set(
        performance
          .getEntriesByType('resource')
          .filter(
            (entry): entry is PerformanceResourceTiming =>
              entry instanceof PerformanceResourceTiming && entry.initiatorType === 'fetch',
          )
          .map((entry) => new URL(entry.name).pathname),
      );
      return paths.every((path) => fetched.has(path));
    },
    stemPaths,
    { timeout: stemEntriesTimeoutMs },
  );
}

async function openStudio(page: Page, problems: string[], label: string): Promise<number> {
  await page.goto('/studio-lab', { waitUntil: 'load', timeout: navigationTimeoutMs });
  const readyMs = await waitForLibraryReady(page);
  await waitForCollectionReady(page, problems, label);
  return readyMs;
}

function putReading(
  result: StemPassResult,
  prefix: string,
  readyMs: number,
  reading: StemResourceReading,
): void {
  const put = (metric: string, value: number): void => {
    result.samples.set(`${prefix}.${metric}`, { value });
  };
  put('ready-ms', roundTo(readyMs, 0));
  put('fetch-requests', reading.fetchRequests);
  put('audio-requests', reading.audioRequests);
  put('body-bytes', reading.bodyBytes);
  put('transfer-bytes', reading.transferBytes);
  put('status-200', reading.status200);
  put('status-304', reading.status304);
  put('stem-window-ms', roundTo(reading.windowMs, 0));
}

function putMp3Bytes(result: StemPassResult, prefix: string, mp3Bytes: CdpMp3Bytes): void {
  result.samples.set(`${prefix}.cdp-mp3-bytes`, { value: mp3Bytes.all });
  result.samples.set(`${prefix}.cdp-media-bytes`, { value: mp3Bytes.media });
}

async function runStemPass(browser: Browser, pass: number): Promise<StemPassResult> {
  const result: StemPassResult = {
    cpuRate: 1,
    pass,
    samples: new Map(),
    problems: [],
    abortedAt: null,
    stepMs: {},
  };
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => {
    localStorage.setItem('czaba_analytics_consent', 'denied');
  });
  await context.addInitScript((size) => {
    performance.setResourceTimingBufferSize(size);
  }, resourceBufferSize);
  let step = 'cold';
  let stepStart = Date.now();
  const beginStep = (name: string): void => {
    result.stepMs[step] = Date.now() - stepStart;
    step = name;
    stepStart = Date.now();
  };
  try {
    const page = await context.newPage();
    const cdp: CDPSession = await context.newCDPSession(page);
    const takeMp3Bytes = trackMp3Bytes(cdp);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', throttle);

    const coldReady = await openStudio(page, result.problems, 'cold');
    await waitForStemFetches(page);
    const cold = await readStemResources(page);
    putReading(result, 'stem.cold', coldReady, cold);
    result.samples.set('stem.harness.cold-body-live', {
      value: cold.bodyBytes > 1000000 ? 1 : 0,
      detail: { bodyBytes: cold.bodyBytes },
    });
    const stored = await waitForStemEntries(page, stemPaths.length);
    result.samples.set('stem.cold.entries-stored', { value: stored });

    beginStep('warm');
    await cdp.send('Network.clearBrowserCache');
    putMp3Bytes(result, 'stem.cold', takeMp3Bytes());
    const warmReady = await openStudio(page, result.problems, 'warm');
    await waitForStemFetches(page);
    const warm = await readStemResources(page);
    putReading(result, 'stem.warm', warmReady, warm);
    result.samples.set('stem.warm-ready-ratio', {
      value: roundTo(warmReady / coldReady, 3),
      detail: { warmReadyMs: roundTo(warmReady, 0), coldReadyMs: roundTo(coldReady, 0) },
    });
    if (cold.windowMs <= 0) result.problems.push('cold stem window is 0 ms');
    result.samples.set('stem.warm-window-ratio', {
      value: cold.windowMs > 0 ? roundTo(warm.windowMs / cold.windowMs, 3) : Number.NaN,
      detail: { warmWindowMs: roundTo(warm.windowMs, 0), coldWindowMs: roundTo(cold.windowMs, 0) },
    });

    beginStep('warm-http');
    putMp3Bytes(result, 'stem.warm', takeMp3Bytes());
    const httpReady = await openStudio(page, result.problems, 'warm-http');
    await waitForStemFetches(page);
    putReading(result, 'stem.warm-http', httpReady, await readStemResources(page));

    beginStep('warm-nocache');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    putMp3Bytes(result, 'stem.warm-http', takeMp3Bytes());
    const noCacheReady = await openStudio(page, result.problems, 'warm-nocache');
    await waitForStemFetches(page);
    putReading(result, 'stem.warm-nocache', noCacheReady, await readStemResources(page));
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });

    beginStep('blocked');
    await cdp.send('Network.setBlockedURLs', { urls: ['*.mp3'] });
    putMp3Bytes(result, 'stem.warm-nocache', takeMp3Bytes());
    let blockedReady = 0;
    try {
      await openStudio(page, result.problems, 'blocked');
      blockedReady = 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.problems.push(`blocked open: ${message.split('\n')[0]}`);
    }
    result.samples.set('stem.blocked.ready', { value: blockedReady });
    result.samples.set('stem.blocked.entries', { value: await countStemEntries(page) });
    await cdp.send('Network.setBlockedURLs', { urls: [] });
    beginStep('done');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.abortedAt = step;
    result.problems.push(`aborted at ${step}: ${message.split('\n')[0]}`);
  } finally {
    result.stepMs[step] = Date.now() - stepStart;
    await context.close();
  }
  return result;
}

function buildStemReport(
  budgets: readonly PerfBudgetRow[],
  passes: readonly StemPassResult[],
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
    harness: 'PERF-9b',
    complete,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    budgetsFile: path.relative(storeRoot, stemBudgetsPath),
    chromium,
    viewport: `${viewport.width}x${viewport.height}`,
    machine: { cpus: cpus().length, cpuRate: 1 },
    throttle,
    passesPerRate,
    sequence: stemSequence,
    passes: passes.map((pass) => ({
      pass: pass.pass,
      abortedAt: pass.abortedAt,
      problems: pass.problems,
      stepMs: pass.stepMs,
    })),
    failures,
    rows,
  };
}

test('studio-lab perf harness PERF-9b stem cache', async ({ browser }) => {
  const startedAt = new Date();
  const budgets = loadPerfBudgets(stemBudgetsPath);
  const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
  const write = (report: ReturnType<typeof buildStemReport>): void => {
    mkdirSync(resultsDir, { recursive: true });
    const json = `${JSON.stringify(report, null, 2)}\n`;
    writeFileSync(path.join(resultsDir, `perf-9b-${stamp}.json`), json);
    writeFileSync(path.join(resultsDir, 'latest-stem-cache.json'), json);
  };
  const passes: StemPassResult[] = [];
  for (let pass = 1; pass <= passesPerRate; pass += 1) {
    passes.push(await runStemPass(browser, pass));
    write(buildStemReport(budgets, passes, startedAt, browser.version()));
  }
  const report = buildStemReport(budgets, passes, startedAt, browser.version());
  write(report);
  const table = report.rows.map(
    (row) =>
      `${row.id.padEnd(40)} ${row.mode.padEnd(6)} median ${String(row.median).padStart(10)}  min ${String(row.min).padStart(10)}  max ${String(row.max).padStart(10)}  budget ${formatLimit(row.budget).padEnd(8)} ${row.pass === null ? '' : row.pass ? 'PASS' : 'FAIL'}`,
  );
  console.log(
    [
      `PERF-9b results (${report.durationMs} ms) -> test-results/perf/latest-stem-cache.json`,
      ...table,
    ].join('\n'),
  );
  expect(report.failures, report.failures.join('\n')).toEqual([]);
});
