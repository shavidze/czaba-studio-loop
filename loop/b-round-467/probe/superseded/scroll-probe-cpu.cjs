const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const out = [];
  const url = process.argv[2] || 'http://127.0.0.1:5173/free-downloads';
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage(); const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.CPU||1) });
    await page.goto(url, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(4000);
    await page.evaluate(() => {
      window.__frames = []; window.__long = []; window.__shifts = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: false });
      let last = performance.now();
      const tick = (t) => { window.__frames.push({ dt: +(t - last).toFixed(1), y: Math.round(window.scrollY) }); last = t; if (window.__frames.length < 2000) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.mouse.move(vp.width / 2, vp.height / 2);
    for (let i = 0; i < 20; i++) { await page.mouse.wheel(0, 120); await page.waitForTimeout(60); }
    await page.waitForTimeout(2000);
    const r = await page.evaluate(() => {
      const f = window.__frames.slice(1);
      const dts = f.map((x) => x.dt).sort((a, b) => a - b);
      const p = (q) => dts[Math.floor(q * (dts.length - 1))];
      let jumps = 0, maxStep = 0;
      for (let i = 1; i < f.length; i++) { const s = Math.abs(f[i].y - f[i - 1].y); maxStep = Math.max(maxStep, s); }
      return { htmlClass: document.documentElement.className, bodyH: document.body.scrollHeight, frames: f.length, p50: p(0.5), p95: p(0.95), max: dts[dts.length - 1], over33: dts.filter((d) => d > 33.4).length, long: window.__long, finalY: Math.round(scrollY), maxStepPx: maxStep, dialogs: document.querySelectorAll('[role=dialog]').length, backdropBlur: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).backdropFilter !== 'none').length, fixedBg: [...document.querySelectorAll('*')].filter((e) => getComputedStyle(e).backgroundAttachment === 'fixed').length };
    });
    r.viewport = vp; out.push(r);
    await page.screenshot({ path: `${__dirname}/scroll-${process.env.TAG}-${vp.width}.png` });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${__dirname}/scroll-probe-${process.env.TAG}.json`, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
