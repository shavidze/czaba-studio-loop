const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-103/browser';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mode = process.argv[2];
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, acceptDownloads: true });
  await ctx.addInitScript((m) => {
    const Orig = window.Worker;
    window.__wd = { ctor: null, msgs: [], term: 0 };
    window.Worker = class extends Orig {
      constructor(url, opts) {
        if (String(url).includes('export-wav.worker')) {
          const body = m === 'stall' ? 'self.onmessage = () => {};' : "self.onmessage = () => self.postMessage({ type: 'error', message: 'C-stub boom' });";
          super(URL.createObjectURL(new Blob([body], { type: 'text/javascript' })), { type: 'module' });
          this.__wav = true;
          window.__wd.ctor = performance.now();
          this.addEventListener('message', () => window.__wd.msgs.push(performance.now()));
        } else super(url, opts);
      }
      terminate() { if (this.__wav) window.__wd.term++; return super.terminate(); }
    };
  }, mode);
  const page = await ctx.newPage();
  const S = { mode, errors: [], downloads: [], forbidden: [] };
  page.on('console', (x) => { if ((x.type() === 'error' || x.type() === 'warning') && !NOISE.test(x.text())) S.errors.push(x.text().slice(0, 300)); });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 300)));
  page.on('download', (d) => S.downloads.push(d.suggestedFilename()));
  page.on('request', (q) => { if (/studio-token|recording-|\/api\/download|r2\./.test(q.url())) S.forbidden.push(q.url()); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(4000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); }); await sleep(300);
  const opt = page.locator('[role=option][data-source-id="demo-middle-east"]');
  await opt.waitFor({ timeout: 90000 }); await opt.scrollIntoViewIfNeeded();
  { const t = Date.now(); while (Date.now() - t < 90000 && (await opt.getAttribute('draggable')) !== 'true') await sleep(200); }
  await opt.focus(); await page.keyboard.press('Enter'); await sleep(1500);
  S.clips = await page.$$eval('[data-clip-id]', (e) => e.length);
  await page.evaluate(() => document.activeElement && document.activeElement.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).click(); await page.waitForSelector('#arrangement-export-title'); await sleep(400);
  await page.getByRole('button', { name: 'WAV-ის ექსპორტი' }).click();
  const snap = () => page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-export-footer]'); return { t: performance.now(), ctor: window.__wd.ctor, term: window.__wd.term, msgs: window.__wd.msgs.length, alert: f?.querySelector('[role=alert]')?.textContent ?? null, status: f?.querySelector('[role=status]')?.textContent ?? null, label: document.querySelector('[data-testid=arrangement-export-progress-label]')?.textContent ?? null, bar: !!document.querySelector('[data-testid=arrangement-export-progress]'), cancel: !!document.querySelector('[data-testid=arrangement-export-cancel]'), closeDisabled: [...f.querySelectorAll('button')].find((b) => b.textContent.trim() === 'დახურვა')?.disabled ?? null }; });
  S.timeline = [];
  const t0 = Date.now(); let alertAt = null;
  while (Date.now() - t0 < (mode === 'stall' ? 45000 : 10000)) {
    const s = await snap(); const last = S.timeline.at(-1);
    if (!last || last.alert !== s.alert || last.label !== s.label || last.term !== s.term) S.timeline.push(s);
    if (s.alert && alertAt === null) { alertAt = s; }
    if (alertAt && Date.now() - t0 > (mode === 'stall' ? 35000 : 3000)) break;
    await sleep(250);
  }
  S.alertDelayMs = alertAt && alertAt.ctor ? Math.round(alertAt.t - alertAt.ctor) : null;
  S.final = await snap();
  await page.screenshot({ path: `${OUT}/wd-${mode}-1280.png` });
  fs.writeFileSync(`${OUT}/wd-${mode}-1280.json`, JSON.stringify(S, null, 1));
  console.log(JSON.stringify({ mode, clips: S.clips, alertDelayMs: S.alertDelayMs, final: S.final, downloads: S.downloads, forbidden: S.forbidden, errors: S.errors }, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
