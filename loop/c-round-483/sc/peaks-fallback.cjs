// PERF-14c-i browser probe (B round 402->403 planning). Usage: node peaks-fallback.cjs <baseURL> <mode none|failing|normal> <out.json> [WxH]
// none: window.Worker deleted before load (no-Worker main-thread path). failing: every Worker fires onerror right after construction
// (failWorker fallback loop for every queued job). normal: untouched. Reads: "Demo collection ready", library sources that are ready
// (no "loading" status), one clip added with Add and its waveform path, page errors.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, mode, out, vp = '1440x900'] = process.argv.slice(2);
const [w, h] = vp.split('x').map(Number);
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript((m) => {
    window.__workers = { created: 0, failed: 0 };
    const Native = window.Worker;
    if (m === 'none') { delete window.Worker; window.Worker = undefined; return; }
    window.Worker = class extends Native {
      constructor(url, opts) {
        super(url, opts);
        window.__workers.created += 1;
        if (m === 'failing' && String(url).includes('peaks')) {
          window.__workers.failed += 1;
          setTimeout(() => this.onerror?.(new Event('error')), 0);
        }
      }
    };
  }, mode);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const t0 = Date.now();
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  let ready = true;
  try { await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 }); } catch { ready = false; }
  const readyMs = Date.now() - t0;
  await page.waitForTimeout(1000);
  const status = await page.getByTestId('arrangement-status').textContent().catch(() => null);
  const loadingText = await page.evaluate(() => document.body.innerText.match(/Loading|Decoding|loading/g)?.length ?? 0);
  let clip = null;
  try {
    await page.getByRole('button', { name: 'Add', exact: true }).click({ timeout: 10000 });
    await page.locator('[data-clip-kind="audio"]').first().waitFor({ timeout: 10000 });
    await page.waitForTimeout(800);
    clip = await page.evaluate(() => {
      const svg = document.querySelector('[data-clip-kind="audio"] [data-testid="arrangement-clip-waveform"]');
      const d = svg?.querySelector('path')?.getAttribute('d') ?? '';
      return { waveform: !!svg, columns: Number((svg?.getAttribute('viewBox') || '0 0 0').split(' ')[2]), pathChars: d.length };
    });
  } catch (e) { clip = { error: String(e).split('\n')[0] }; }
  const workers = await page.evaluate(() => window.__workers);
  const result = { base, mode, viewport: vp, ready, readyMs, status, loadingText, clip, workers, pageErrors: errors };
  await page.screenshot({ path: out.replace(/\.json$/, '.png') });
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify(result));
  await browser.close();
})();
