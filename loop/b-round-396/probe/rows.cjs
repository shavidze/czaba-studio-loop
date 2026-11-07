// PERF-13d browser rows (B round 396->397 planning; C copies it into c-round-397/).
// Usage: node rows.cjs <baseURL> <rate> <out.json> [viewport WxH]
// Records every AudioBuffer of length 768000 (the 5 worker synth sources), whether copyToChannel got the same
// Float32Array object for channel 0 and 1, and how many of those builds fall inside one longtask entry.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('node:fs');
const [base, rateArg, out, vp = '1440x900'] = process.argv.slice(2);
const rate = Number(rateArg);
const [w, h] = vp.split('x').map(Number);
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: w, height: h } });
  await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  await context.addInitScript(() => {
    const builds = [];
    const longtasks = [];
    window.__p397 = { builds, longtasks };
    const NativeAB = window.AudioBuffer;
    window.AudioBuffer = class extends NativeAB {
      constructor(o) {
        super(o);
        if (o.length === 768000) builds.push({ buffer: this, at: performance.now(), srcs: [], copyMs: 0 });
      }
    };
    const copy = NativeAB.prototype.copyToChannel;
    NativeAB.prototype.copyToChannel = function (src, ch, off) {
      const s = performance.now();
      const r = copy.call(this, src, ch, off);
      const b = builds.find((e) => e.buffer === this);
      if (b) { b.srcs[ch] = src; b.copyMs += performance.now() - s; b.end = performance.now(); }
      return r;
    };
    new PerformanceObserver((l) => { for (const e of l.getEntries()) longtasks.push({ start: e.startTime, end: e.startTime + e.duration, ms: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /Demo collection ready/ }).waitFor({ timeout: 120000 });
  await page.waitForTimeout(3000);
  const result = await page.evaluate(() => {
    const { builds, longtasks } = window.__p397;
    const hash = (f) => { const u = new Uint32Array(f.buffer, f.byteOffset, f.length); let x = 2166136261; for (let i = 0; i < u.length; i++) { x ^= u[i]; x = Math.imul(x, 16777619) >>> 0; } return x.toString(16); };
    const rows = builds.map((b) => ({ at: Math.round(b.at), copyMs: +b.copyMs.toFixed(1), channels: b.srcs.length, sameArray: b.srcs.length === 2 && b.srcs[0] === b.srcs[1], numberOfChannels: b.buffer.numberOfChannels, sampleRate: b.buffer.sampleRate, hash0: hash(b.buffer.getChannelData(0)), hash1: hash(b.buffer.getChannelData(1)) }));
    const perTask = longtasks.map((t) => ({ ms: t.ms, start: Math.round(t.start), builds: builds.filter((b) => b.at >= t.start && b.at <= t.end).length }));
    const containing = perTask.filter((t) => t.builds > 0);
    return {
      status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
      synthBuilds: builds.length,
      sameArrayBuilds: rows.filter((r) => r.sameArray).length,
      maxSynthBuildsPerLongtask: containing.reduce((m, t) => Math.max(m, t.builds), 0),
      longtasksWithBuilds: containing,
      builds: rows,
      hashes: rows.map((r) => r.hash0 + '/' + r.hash1).sort().join(','),
      readyCount: [...document.querySelectorAll('[data-source-id]')].length,
    };
  });
  const stem = page.locator('[data-source-id="demo-stem-pulse"]');
  await stem.click();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  const clips = await page.locator('[data-clip-id]').count();
  await page.keyboard.press('Space');
  await page.waitForTimeout(2000);
  result.play = await page.evaluate(() => ({ playing: document.querySelector('[data-playing]')?.getAttribute('data-playing') ?? null }));
  result.play.clips = clips;
  await page.keyboard.press('Space');
  result.rate = rate; result.viewport = vp; result.base = base; result.pageErrors = errors;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(JSON.stringify({ vp, rate, synthBuilds: result.synthBuilds, sameArrayBuilds: result.sameArrayBuilds, maxSynthBuildsPerLongtask: result.maxSynthBuildsPerLongtask, lt: result.longtasksWithBuilds.map((t) => t.ms + 'ms/' + t.builds).join(' '), errors: errors.length, hashes: result.hashes.slice(0, 60), play: result.play }));
  await browser.close();
})();
