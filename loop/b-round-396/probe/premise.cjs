// B round 396->397 premise probe (PERF-13d): long tasks / LoAF at 6x around demo AudioBuffer creation, at HEAD.
// Usage: node premise.cjs <baseURL> <rate> <out.json> [viewport]
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
    const ev = [];
    window.__p = ev;
    const t = () => Math.round(performance.now() * 10) / 10;
    const NativeAB = window.AudioBuffer;
    window.AudioBuffer = class extends NativeAB {
      constructor(o) { const s = performance.now(); super(o); ev.push({ k: 'new AudioBuffer', at: t(), ms: +(performance.now() - s).toFixed(2), len: o.length, ch: o.numberOfChannels }); }
    };
    const copy = NativeAB.prototype.copyToChannel;
    NativeAB.prototype.copyToChannel = function (src, ch, off) { const s = performance.now(); const r = copy.call(this, src, ch, off); ev.push({ k: 'copyToChannel', at: t(), ms: +(performance.now() - s).toFixed(2), len: src.length, ch }); return r; };
    const NativeF32 = Float32Array;
    try {
      new PerformanceObserver((l) => { for (const e of l.getEntries()) ev.push({ k: 'loaf', at: Math.round(e.startTime), ms: Math.round(e.duration), blocking: Math.round(e.blockingDuration), scripts: (e.scripts || []).map((s) => ({ ms: Math.round(s.duration), inv: s.invoker, src: (s.sourceURL || '').split('/').slice(-2).join('/'), fn: s.sourceFunctionName })) }); }).observe({ type: 'long-animation-frame', buffered: true });
    } catch (e) { ev.push({ k: 'loaf-unsupported' }); }
    new PerformanceObserver((l) => { for (const e of l.getEntries()) ev.push({ k: 'longtask', at: Math.round(e.startTime), ms: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true });
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  if (rate > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/studio-lab', { waitUntil: 'load', timeout: 180000 });
  await page.getByTestId('arrangement-status').filter({ hasText: /ready/i }).waitFor({ timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(6000);
  const result = await page.evaluate(() => ({ ev: window.__p, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null }));
  result.rate = rate; result.viewport = vp; result.pageErrors = errors;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  const ab = result.ev.filter((e) => e.k !== 'loaf' && e.k !== 'longtask');
  const lt = result.ev.filter((e) => e.k === 'longtask');
  console.log('status', result.status, 'buffers', ab.length, 'abMsSum', ab.reduce((a, e) => a + (e.ms || 0), 0).toFixed(1));
  console.log(JSON.stringify(ab));
  console.log('longtasks', JSON.stringify(lt));
  await browser.close();
})();
