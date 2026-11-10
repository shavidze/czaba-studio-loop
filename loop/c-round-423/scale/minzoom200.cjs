// PERF-14c premise probe (B round 402->403 planning). Production build of HEAD.
// Usage: node minzoom200.cjs <baseURL> <rate> <out.json> [viewport WxH] [clips]
// 200 audio clips via Add + Ctrl+D (counted from the lane model, data-clip-count), then:
// default-zoom 10 keys, then 40 x "-" to min zoom, then 3 x "=", then 10 keys alternating "-"/"=" near min zoom.
// Per key: Event Timing keydown max, long tasks, mounted clips, waveform paths, sum of path d length.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, rateArg, out, vp = '1440x900', clipsArg = '200'] = process.argv.slice(2);
const rate = Number(rateArg);
const target = Number(clipsArg);
const [w, h] = vp.split('x').map(Number);
const audio = '[data-clip-kind="audio"]';
async function counts(page) {
  return page.evaluate((sel) => {
    const model = [...document.querySelectorAll('[data-clip-count]')].reduce((s, e) => s + Number(e.getAttribute('data-clip-count') || 0), 0);
    const paths = [...document.querySelectorAll('[data-testid="arrangement-clip-waveform"] path')];
    const zoom = [...document.querySelectorAll('[role="slider"],input[type="range"]')].find((e) => (e.getAttribute('aria-label') ?? '') === 'Zoom (px/s)');
    return { page: document.querySelectorAll('*').length, model, mounted: document.querySelectorAll(sel).length, paths: paths.length,
      pathChars: paths.reduce((s, p) => s + (p.getAttribute('d') || '').length, 0),
      maxColumns: Math.max(0, ...[...document.querySelectorAll('[data-testid="arrangement-clip-waveform"]')].map((s) => Number((s.getAttribute('viewBox') || '0 0 0').split(' ')[2]))),
      zoom: zoom ? (zoom.getAttribute('aria-valuenow') ?? zoom.value) : null };
  }, audio);
}
async function keySeq(page, keys) {
  const outKeys = [];
  for (const key of keys) {
    const before = await page.evaluate(() => performance.now());
    await page.keyboard.press(key);
    await page.waitForTimeout(rate > 1 ? 1200 : 500);
    const ev = await page.evaluate((b) => window.__p.events.filter((e) => e.start >= b).map((e) => Math.round(e.ms)), before);
    const lt = await page.evaluate((b) => window.__p.longtasks.filter((e) => e.start >= b).map((e) => e.ms), before);
    const c = await counts(page);
    outKeys.push({ key, keydownMs: ev.length ? Math.max(...ev) : 0, longtasks: lt, ...c });
  }
  const ks = outKeys.map((k) => k.keydownMs).sort((a, b) => a - b);
  return { keys: outKeys, p95: ks[Math.min(ks.length - 1, Math.ceil(0.95 * ks.length) - 1)], max: ks[ks.length - 1] };
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript(() => {
    window.__p = { events: [], longtasks: [] };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'keydown') window.__p.events.push({ start: e.startTime, ms: e.duration }); }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__p.longtasks.push({ start: e.startTime, ms: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(1500);
  const result = { base, rate, viewport: vp, target };
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator(audio).first().waitFor();
  await page.waitForTimeout(500);
  const bar = page.locator(audio).first().getByTitle(/ — drag to move$/).first();
  const box = await bar.boundingBox();
  await page.mouse.click(box.x + Math.min(20, box.width / 2), box.y + box.height / 2);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  for (let n = 1; n < target; n += 1) {
    await page.keyboard.press('Control+d');
    await page.waitForFunction((want) => [...document.querySelectorAll('[data-clip-count]')].reduce((s, e) => s + Number(e.getAttribute('data-clip-count') || 0), 0) >= want, n + 1, { timeout: 30000 });
  }
  await page.waitForTimeout(1500);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  result.full = await counts(page);
  result.defaultZoom = await keySeq(page, [...Array(5).fill('-'), ...Array(5).fill('=')]);
  for (let i = 0; i < 40; i += 1) await page.keyboard.press('-');
  await page.waitForTimeout(rate > 1 ? 3000 : 1200);
  result.minZoom = await counts(page);
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('=');
  await page.waitForTimeout(rate > 1 ? 3000 : 1200);
  result.nearMin = await keySeq(page, ['-', '=', '-', '=', '-', '=', '-', '=', '-', '=']);
  result.pageErrors = errors;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ vp, rate, full: result.full, defaultP95: result.defaultZoom.p95, defaultMax: result.defaultZoom.max, minZoom: result.minZoom, nearMinP95: result.nearMin.p95, nearMinMax: result.nearMin.max, nearMinMounted: result.nearMin.keys.map((k) => k.mounted), nearMinPathChars: result.nearMin.keys[0].pathChars, maxCols: result.nearMin.keys.map((k)=>k.maxColumns), errors: errors.length }));
  await browser.close();
})();
