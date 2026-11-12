// B round 467->468 floor-control variant of store-scroll-probe.cjs: env HIDE_CSS is injected as a <style> after DOMContentLoaded (visibility only, layout and page height unchanged). Usage: node store-scroll-probe.cjs <baseUrl> <outJson> [cpuRate]
// Per page, viewport and pass: fresh context, LeadMagnet suppressed (localStorage czaba_lead_magnet submitted:true),
// wait 4 s, 20 wheel ticks of 120 px 60 ms apart, 2 s settle. Records rAF dt, longtask, LoAF (with scripts) in one page.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, outPath, cpuArg] = process.argv.slice(2);
const cpu = Number(cpuArg || 1);
(async () => {
  const out = { base, cpu, rows: [] };
  const browser = await chromium.launch();
  for (const path of ['/', '/free-downloads']) for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) for (let pass = 1; pass <= 3; pass++) {
    const ctx = await browser.newContext({ viewport: vp });
    await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastShown: Date.now(), dismissed: true, submitted: true })); } catch {} });
    if (process.env.HIDE_CSS) await ctx.addInitScript((css) => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }); }, process.env.HIDE_CSS);
    const page = await ctx.newPage();
    if (cpu > 1) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    await page.goto(base + path, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      const t0 = performance.now(); window.__t0 = t0; window.__f = []; window.__lt = []; window.__loaf = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ t: Math.round(e.startTime - t0), d: Math.round(e.duration) }); }).observe({ type: 'longtask' });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ t: Math.round(e.startTime - t0), d: Math.round(e.duration), block: Math.round(e.blockingDuration), styleLayout: e.styleAndLayoutStart ? Math.round(e.startTime + e.duration - e.styleAndLayoutStart) : 0, scripts: e.scripts.map((s) => ({ d: Math.round(s.duration), inv: String(s.invoker).slice(0, 60), src: (s.sourceURL || '').split('/').pop(), fn: s.sourceFunctionName })) }); }).observe({ type: 'long-animation-frame' });
      let last = performance.now();
      const tick = (t) => { window.__f.push({ t: Math.round(t - t0), dt: +(t - last).toFixed(1), y: Math.round(scrollY) }); last = t; if (t - t0 < 5200) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(60); }
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const f = window.__f.slice(1); const moving = f.filter((x, i) => i > 0 && x.y !== f[i - 1].y);
      const dts = moving.map((x) => x.dt).sort((a, b) => a - b); const p = (q) => (dts.length ? dts[Math.floor(q * (dts.length - 1))] : null);
      return { dialogs: document.querySelectorAll('[role=dialog]').length, bodyStyle: document.body.getAttribute('style'), htmlClass: document.documentElement.className, maxScroll: document.documentElement.scrollHeight - innerHeight, finalY: Math.round(scrollY), movingFrames: moving.length, p50: p(0.5), p95: p(0.95), max: p(1), movingOver33: dts.filter((d) => d > 33.4).length, slowFrames: f.filter((x) => x.dt > 33.4).map((x) => [x.t, x.dt, x.y]), longtasks: window.__lt, loaf: window.__loaf };
    });
    Object.assign(r, { path, viewport: `${vp.width}x${vp.height}`, pass });
    out.rows.push(r);
    console.log(path, r.viewport, pass, 'dlg', r.dialogs, 'final', r.finalY, '/', r.maxScroll, 'moving', r.movingFrames, 'p95', r.p95, 'max', r.max, '>33', r.movingOver33, 'lt', r.longtasks.length, 'loaf', r.loaf.map((l) => `${l.t}:${l.d}${l.scripts.length ? ' ' + l.scripts.map((s) => `${s.src}:${s.fn}:${s.d}`).join(',') : ''}`).join(' | '));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
})();
