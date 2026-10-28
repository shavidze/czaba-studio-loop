// C round 216 independent probe (PROBE-216). Own CDP code; not derived from the spec.
// usage: node probe.cjs <baseUrl> <outJson> [runs]
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/playwright'));

const base = process.argv[2];
const out = process.argv[3];
const runs = Number(process.argv[4] || 3);
const MiB = 1024 * 1024;

async function heap(cdp) {
  const h = await cdp.send('Runtime.getHeapUsage');
  return h.backingStorageSize;
}

async function gcHeap(cdp, page) {
  await cdp.send('HeapProfiler.collectGarbage');
  await page.waitForTimeout(300);
  return heap(cdp);
}

async function memRun(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const cdp = await ctx.newCDPSession(page);
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
  const add = page.getByRole('button', { name: 'Add', exact: true });
  await add.waitFor({ timeout: 60000 });
  await page.waitForFunction(() => {
    const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add');
    return b && !b.disabled && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect');
  }, undefined, { timeout: 60000 });
  await page.waitForTimeout(1000);
  const ready = await gcHeap(cdp, page);
  await add.click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor();
  await page.waitForTimeout(800);
  const subtree = await page.locator('[data-clip-kind="audio"]').first().evaluate((el) => el.getElementsByTagName('*').length + 1);
  const pageCount = await page.evaluate(() => document.getElementsByTagName('*').length);
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  const dlg = page.getByRole('dialog');
  const btn = dlg.getByRole('button', { name: 'Export WAV', exact: true });
  await btn.waitFor();
  const dlP = page.waitForEvent('download', { timeout: 60000 });
  const samples = [];
  let stop = false;
  let textAt = null;
  const t0 = Date.now();
  const poller = (async () => {
    while (!stop) {
      const s = Date.now();
      try { samples.push({ t: s - t0, v: await heap(cdp) }); } catch { /* ignore */ }
      const wait = 25 - (Date.now() - s);
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    }
  })();
  await btn.click();
  const textP = dlg.getByText(/^WAV created:/).waitFor({ timeout: 60000 }).then(() => { textAt = Date.now() - t0; });
  const dl = await dlP;
  const dlAt = Date.now() - t0;
  await textP;
  await new Promise((r) => setTimeout(r, 400));
  stop = true;
  await poller;
  const created = await dlg.getByText(/^WAV created:/).textContent();
  const file = await dl.path();
  const buf = fs.readFileSync(file);
  await dlg.getByRole('button', { name: 'Done', exact: true }).click();
  const afterGc = await gcHeap(cdp, page);
  const peakAll = Math.max(...samples.map((s) => s.v));
  const peakToText = Math.max(...samples.filter((s) => s.t <= textAt).map((s) => s.v));
  await ctx.close();
  return {
    readyMiB: +(ready / MiB).toFixed(2),
    subtree,
    page1: pageCount,
    samples: samples.length,
    textAtMs: textAt,
    downloadAtMs: dlAt,
    peakDeltaThroughEndMiB: +((peakAll - ready) / MiB).toFixed(2),
    peakDeltaUpToTextMiB: +((peakToText - ready) / MiB).toFixed(2),
    afterGcDeltaMiB: +((afterGc - ready) / MiB).toFixed(2),
    created,
    filename: dl.suggestedFilename(),
    fileBytes: buf.length,
    errors,
  };
}

async function jsRun(browser, route) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  const scripts = new Map();
  const finished = new Map();
  cdp.on('Network.responseReceived', (e) => { if (e.type === 'Script') scripts.set(e.requestId, e.response.url); });
  cdp.on('Network.loadingFinished', (e) => finished.set(e.requestId, e.encodedDataLength));
  const resp = await page.goto(`${base}${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  let enc = 0;
  for (const id of scripts.keys()) enc += finished.get(id) || 0;
  const status = resp ? resp.status() : 0;
  await ctx.close();
  return { route, status, scripts: scripts.size, encoded: enc };
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const res = { base, chromium: browser.version(), mem: [], js: [] };
  for (let i = 0; i < runs; i += 1) res.mem.push(await memRun(browser));
  for (let i = 0; i < runs; i += 1) res.js.push(await jsRun(browser, '/studio-lab'));
  await browser.close();
  fs.writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
