// B round 366 probe (PERF-9b-ii): stem-cache integrity and changed-validator recovery on a production server.
// Usage: node stem-integrity-probe.mjs <base> <width>x<height> <out.json> [play=1|0]
// Phases: cold -> truncate (middle-east file cut to 1000 B) -> delete-file (hero-music file removed)
//         -> stale-etag (middle-east record etag edited) ; each reopen after Network.clearBrowserCache.
// Records per phase: mp3 requests (path, status, If-None-Match, Cache-Control, encoded bytes), ready text,
// IndexedDB records (key, fileName, size, etag), OPFS files (name, size), optional playback (playhead, analyser peaks).
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');

const [base, size, out, playArg = '1'] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const doPlay = playArg === '1';
const tap = () => {
  const orig = AudioNode.prototype.connect;
  window.__b = { starts: 0 };
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = orig.call(this, dest, ...rest);
    try {
      if (dest instanceof AudioDestinationNode) {
        const ctx = this.context;
        if (!ctx.__an) {
          ctx.__an = ctx.createAnalyser();
          ctx.__an.fftSize = 2048;
          window.__b.an = ctx.__an;
        }
        orig.call(this, ctx.__an);
      }
    } catch (e) {
      window.__b.err = String(e);
    }
    return r;
  };
  const os = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    window.__b.starts++;
    return os.apply(this, a);
  };
};
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
await context.addInitScript(tap);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
let phase = 'cold';
const extra = new Map();
const requests = new Map();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push({ phase, error: String(e).slice(0, 200) }));
cdp.on('Network.requestWillBeSentExtraInfo', (e) => extra.set(e.requestId, e.headers));
cdp.on('Network.requestWillBeSent', (e) => {
  const path = new URL(e.request.url).pathname;
  if (/\.mp3$/.test(path)) requests.set(e.requestId, { phase, path, type: e.type });
});
cdp.on('Network.responseReceived', (e) => {
  const r = requests.get(e.requestId);
  if (r) {
    r.status = e.response.status;
    r.etag = e.response.headers.ETag ?? e.response.headers.etag ?? null;
  }
});
cdp.on('Network.loadingFinished', (e) => {
  const r = requests.get(e.requestId);
  if (r) r.encodedDataLength = e.encodedDataLength;
});
cdp.on('Network.loadingFailed', (e) => {
  const r = requests.get(e.requestId);
  if (r) r.failed = e.errorText;
});
await cdp.send('Network.enable');

const readState = () =>
  page.evaluate(async () => {
    const records = await new Promise((resolve) => {
      const request = indexedDB.open('czaba-stem-cache-v2');
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('entries')) {
          db.close();
          resolve([]);
          return;
        }
        const all = db.transaction('entries', 'readonly').objectStore('entries').getAll();
        all.onsuccess = () => {
          db.close();
          resolve(all.result.map((r) => ({ key: r.key, fileName: r.fileName, size: r.size, etag: r.etag })));
        };
        all.onerror = () => {
          db.close();
          resolve([{ error: String(all.error) }]);
        };
      };
      request.onerror = () => resolve([{ error: String(request.error) }]);
    });
    const files = [];
    try {
      const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('czaba-stem-cache-v2');
      for await (const [name, handle] of dir.entries()) {
        files.push({ name, size: handle.kind === 'file' ? (await handle.getFile()).size : null });
      }
    } catch (error) {
      files.push({ error: String(error).slice(0, 80) });
    }
    return { records, files };
  });

const consistent = (state) =>
  state.records.length === 2 &&
  state.records.every((r) => state.files.some((f) => f.name === r.fileName && f.size === r.size)) &&
  state.files.length === 2;

const settle = async () => {
  let state = null;
  for (let i = 0; i < 40; i += 1) {
    state = await readState();
    if (consistent(state)) return { state, waitedMs: i * 500 };
    await page.waitForTimeout(500);
  }
  return { state, waitedMs: null };
};

const corrupt = (kind, key) =>
  page.evaluate(
    async ({ kind, key }) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('czaba-stem-cache-v2');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const record = await new Promise((resolve, reject) => {
        const r = db.transaction('entries', 'readonly').objectStore('entries').get(key);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
      const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('czaba-stem-cache-v2');
      if (kind === 'truncate') {
        const writable = await (await dir.getFileHandle(record.fileName)).createWritable({ keepExistingData: false });
        await writable.write(new Uint8Array(1000));
        await writable.close();
      } else if (kind === 'delete-file') {
        await dir.removeEntry(record.fileName);
      } else if (kind === 'stale-etag') {
        await new Promise((resolve, reject) => {
          const tx = db.transaction('entries', 'readwrite');
          tx.objectStore('entries').put({ ...record, etag: '"b366-stale"' });
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        });
      }
      db.close();
      return { key, fileName: record.fileName, size: record.size, etag: record.etag };
    },
    { kind, key },
  );

const play = async () => {
  const item = page.locator('[role="option"],[role="treeitem"],li').filter({ hasText: /Middle East/ }).first();
  await item.click();
  await page.keyboard.press('Enter');
  await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 30000 });
  await page.waitForTimeout(1000);
  const button = page.locator('[data-testid="arrangement-transport"] button[data-playing]').first();
  const pos0 = await page.locator('[data-testid="arrangement-position"]').first().innerText().catch(() => null);
  await button.click();
  await page.waitForTimeout(2200);
  const peaks = [];
  for (let i = 0; i < 5; i += 1) {
    peaks.push(
      await page.evaluate(() => {
        const an = window.__b?.an;
        if (!an) return null;
        const a = new Float32Array(an.fftSize);
        an.getFloatTimeDomainData(a);
        let m = 0;
        for (const x of a) m = Math.max(m, Math.abs(x));
        return Number(m.toFixed(4));
      }),
    );
    await page.waitForTimeout(120);
  }
  const pos1 = await page.locator('[data-testid="arrangement-position"]').first().innerText().catch(() => null);
  await button.click();
  return { pos0, pos1, peaks, starts: await page.evaluate(() => window.__b.starts) };
};

const phases = {};
const open = async () => {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(
    () => /ready|failed/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),
    null,
    { timeout: 120000 },
  );
  const readyText = await page.getByTestId('arrangement-status').textContent();
  const settled = await settle();
  const playback = doPlay && /ready/i.test(readyText ?? '') ? await play() : null;
  await page.screenshot({ path: out.replace(/\.json$/, `-${phase}.png`) });
  return { readyText, ...settled, playback };
};

const ME = '/middle-east.mp3';
const HERO = '/videos/hero/hero-music.mp3';
phases.cold = await open();
for (const [name, kind, key] of [
  ['truncate', 'truncate', ME],
  ['delete-file', 'delete-file', HERO],
  ['stale-etag', 'stale-etag', ME],
]) {
  const before = await corrupt(kind, key);
  phase = name;
  await cdp.send('Network.clearBrowserCache');
  phases[name] = { corrupted: before, ...(await open()) };
}

const rows = [...requests.values()].map((r) => r);
for (const [id, r] of requests) {
  const h = extra.get(id) ?? {};
  const get = (k) => h[k] ?? h[k.toLowerCase()] ?? null;
  r.ifNoneMatch = get('If-None-Match');
  r.cacheControl = get('Cache-Control');
  r.range = get('Range');
}
writeFileSync(
  out,
  JSON.stringify({ base, viewport: { width, height }, phases, requests: rows, pageErrors }, null, 1),
);
await browser.close();
