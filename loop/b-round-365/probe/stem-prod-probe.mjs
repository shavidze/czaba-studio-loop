// B round 365 probe: stem request headers, statuses and cache entries per reopen phase on a production server.
// Usage: node stem-prod-probe.mjs <base> <width>x<height> <out.json>
// Never opens czaba-stem-cache-v2 with indexedDB.open (that would create an empty DB); it reads indexedDB.databases() and OPFS only.
import { writeFileSync } from 'node:fs';
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';

const [base, size, out] = process.argv.slice(2);
const [width, height] = size.split('x').map(Number);
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
let phase = 'cold';
const extra = new Map();
const requests = new Map();
cdp.on('Network.requestWillBeSentExtraInfo', (e) => extra.set(e.requestId, e.headers));
cdp.on('Network.requestWillBeSent', (e) => {
  const path = new URL(e.request.url).pathname;
  if (/\.mp3$/.test(path)) requests.set(e.requestId, { phase, path, type: e.type });
});
cdp.on('Network.responseReceived', (e) => {
  const r = requests.get(e.requestId);
  if (r) r.status = e.response.status;
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

const readyTexts = {};
const storage = {};
const readStorage = async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await page.waitForLoadState('load');
      return await page.evaluate(async () => {
        const dbs = (await indexedDB.databases()).map((db) => `${db.name}@${db.version}`);
        const files = [];
        try {
          const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('czaba-stem-cache-v2');
          for await (const [name, handle] of dir.entries()) {
            files.push({ name, size: handle.kind === 'file' ? (await handle.getFile()).size : null });
          }
        } catch (error) {
          files.push({ error: String(error).slice(0, 80) });
        }
        return { dbs, files };
      });
    } catch {
      await page.waitForTimeout(1000);
    }
  }
  return null;
};
const open = async () => {
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(
    () => /ready|failed/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),
    null,
    { timeout: 90000 },
  );
  await page.waitForTimeout(4000);
  readyTexts[phase] = await page.getByTestId('arrangement-status').textContent();
  storage[phase] = await readStorage();
};

await open();
phase = 'warm-evicted';
await cdp.send('Network.clearBrowserCache');
await open();
await page.screenshot({ path: out.replace(/\.json$/, '-warm-evicted.png') });
phase = 'warm-http';
await open();
phase = 'warm-nocache';
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await open();
await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
phase = 'blocked';
await cdp.send('Network.setBlockedURLs', { urls: ['*.mp3'] });
await open();
await page.screenshot({ path: out.replace(/\.json$/, '-blocked.png') });

const rows = [...requests].map(([id, r]) => {
  const h = extra.get(id) ?? {};
  const get = (key) => h[key] ?? h[key.toLowerCase()] ?? null;
  return { ...r, ifNoneMatch: get('If-None-Match'), cacheControl: get('Cache-Control'), range: get('Range') };
});
writeFileSync(
  out,
  JSON.stringify(
    { base, viewport: { width, height }, innerWidth: await page.evaluate(() => innerWidth), readyTexts, storage, requests: rows },
    null,
    1,
  ),
);
await browser.close();
