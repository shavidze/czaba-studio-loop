// PERF-14 premise probe (B round 397->398 planning). HEAD, dev server.
// Usage: node clips200.cjs <baseURL> <rate> <out.json> [viewport WxH] [clips]
// Adds the selected library sound with Add, clicks its name bar, presses Ctrl+D until <clips> audio clips exist,
// then records: whole-page element count, audio clip elements in the DOM, clips whose box intersects the
// timeline viewport, zoom slider min/max/value, 10 zoom keys (5 "-" then 5 "=") with Event Timing keydown
// durations and element counts after each key, and the wall time of the Ctrl+D presses.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, rateArg, out, vp = '1440x900', clipsArg = '200'] = process.argv.slice(2);
const rate = Number(rateArg);
const target = Number(clipsArg);
const [w, h] = vp.split('x').map(Number);
const audio = '[data-clip-kind="audio"]';

async function counts(page) {
  return page.evaluate((sel) => {
    const clips = [...document.querySelectorAll(sel)];
    const scroller = document.querySelector('[data-testid="arrangement-ruler"]')?.closest('[class*="overflow"]') ?? null;
    const view = { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight };
    const visible = clips.filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 0 && r.right > view.left && r.left < view.right && r.bottom > view.top && r.top < view.bottom;
    }).length;
    let clipElements = 0;
    for (const c of clips) clipElements += 1 + c.querySelectorAll('*').length;
    const ruler = document.querySelector('[data-testid="arrangement-ruler"]');
    const zoom = [...document.querySelectorAll('[role="slider"],input[type="range"]')].find(
      (e) => (e.getAttribute('aria-label') ?? '') === 'Zoom (px/s)',
    );
    return {
      page: document.querySelectorAll('*').length,
      clipsInDom: clips.length,
      clipsIntersectingWindow: visible,
      clipSubtreeTotal: clipElements,
      ruler: ruler ? 1 + ruler.querySelectorAll('*').length : null,
      waveformPaths: document.querySelectorAll('[data-testid="arrangement-clip-waveform"] path').length,
      zoom: zoom ? { value: zoom.getAttribute('aria-valuenow') ?? zoom.value, min: zoom.getAttribute('aria-valuemin') ?? zoom.min, max: zoom.getAttribute('aria-valuemax') ?? zoom.max } : null,
      scroller: scroller ? { scrollWidth: scroller.scrollWidth, clientWidth: scroller.clientWidth } : null,
    };
  }, audio);
}

(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript(() => {
    window.__p398 = { events: [], longtasks: [] };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (e.name === 'keydown') window.__p398.events.push({ start: e.startTime, ms: e.duration });
    }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__p398.longtasks.push({ start: e.startTime, ms: Math.round(e.duration) });
    }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(1500);
  const result = { base, rate, viewport: vp, target };
  result.empty = await counts(page);
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await page.locator(audio).first().waitFor();
  await page.waitForTimeout(500);
  result.one = await counts(page);
  const clip = page.locator(audio).first();
  const bar = clip.getByTitle(/ — drag to move$/).first();
  const box = await bar.boundingBox();
  await page.mouse.click(box.x + Math.min(20, box.width / 2), box.y + box.height / 2);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
  const t0 = Date.now();
  for (let n = 1; n < target; n += 1) {
    await page.keyboard.press('Control+d');
    await page.waitForFunction(([sel, want]) => document.querySelectorAll(sel).length >= want, [audio, n + 1], { timeout: 30000 });
  }
  result.ctrlDWallMs = Date.now() - t0;
  await page.waitForTimeout(1500);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  result.full = await counts(page);
  result.starts = await page.locator(audio).evaluateAll((cs) => new Set(cs.map((c) => c.getAttribute('data-clip-start'))).size);
  const keys = [...Array(5).fill('-'), ...Array(5).fill('=')];
  result.zoomKeys = [];
  for (const key of keys) {
    const before = await page.evaluate(() => performance.now());
    await page.keyboard.press(key);
    await page.waitForTimeout(rate > 1 ? 1200 : 500);
    const ev = await page.evaluate((b) => window.__p398.events.filter((e) => e.start >= b).map((e) => Math.round(e.ms)), before);
    const lt = await page.evaluate((b) => window.__p398.longtasks.filter((e) => e.start >= b).map((e) => e.ms), before);
    const c = await counts(page);
    result.zoomKeys.push({ key, keydownMs: ev.length ? Math.max(...ev) : 0, longtasks: lt, page: c.page, clipsInDom: c.clipsInDom, clipsIntersectingWindow: c.clipsIntersectingWindow, zoom: c.zoom?.value });
  }
  for (let i = 0; i < 40; i += 1) await page.keyboard.press('-');
  await page.waitForTimeout(rate > 1 ? 2500 : 1000);
  result.minZoom = await counts(page);
  const ks = result.zoomKeys.map((k) => k.keydownMs).sort((a, b) => a - b);
  result.keydownP95 = ks[Math.min(ks.length - 1, Math.ceil(0.95 * ks.length) - 1)];
  result.keydownMax = ks[ks.length - 1];
  result.pageErrors = errors;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ vp, rate, ctrlDWallMs: result.ctrlDWallMs, empty: result.empty.page, one: result.one.page, oneSubtree: result.one.clipSubtreeTotal, full: { page: result.full.page, clipsInDom: result.full.clipsInDom, vis: result.full.clipsIntersectingWindow, subtree: result.full.clipSubtreeTotal, ruler: result.full.ruler, zoom: result.full.zoom, scroller: result.full.scroller }, distinctStarts: result.starts, keydownP95: result.keydownP95, keydownMax: result.keydownMax, minZoom: { page: result.minZoom.page, vis: result.minZoom.clipsIntersectingWindow, zoom: result.minZoom.zoom }, errors: errors.length }));
  await browser.close();
})();
