// Usage: node loaf-probe.cjs <baseUrl> <outJson> [runs]
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
(async () => {
  const base = process.argv[2]; const out = process.argv[3]; const runs = Number(process.argv[4] || 3);
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = [];
  for (let r = 0; r < runs; r++) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__lt = []; window.__loaf = []; window.__readyAt = null; window.__settledAt = null;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push({ start: e.startTime, dur: e.duration }); }).observe({ type: 'longtask', buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: e.startTime, dur: e.duration, blocking: e.blockingDuration, scripts: e.scripts.map((s) => ({ inv: s.invoker, type: s.invokerType, fn: s.sourceFunctionName, url: (s.sourceURL || '').split('/').pop(), dur: Math.round(s.duration), fwd: Math.round(s.forcedStyleAndLayoutDuration) })) }); }).observe({ type: 'long-animation-frame', buffered: true });
      const poll = () => {
        const s = document.querySelector('[data-testid="arrangement-status"]');
        const t = s ? s.textContent || '' : '';
        if (window.__settledAt === null && /collection ready|failed to load/.test(t)) window.__settledAt = performance.now();
        if (window.__settledAt === null) requestAnimationFrame(poll);
      };
      requestAnimationFrame(poll);
    });
    await page.goto(base + '/studio-lab');
    await page.waitForFunction(() => window.__settledAt !== null, null, { timeout: 120000 });
    await page.waitForTimeout(1500);
    const data = await page.evaluate(() => ({ lt: window.__lt, loaf: window.__loaf, settledAt: window.__settledAt, nav: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }));
    results.push(data);
    console.log(`run ${r}: settled ${Math.round(data.settledAt)} ms; longtasks ${data.lt.map((e) => `${Math.round(e.start)}+${Math.round(e.dur)}`).join(', ')}`);
    for (const f of data.loaf.filter((f) => f.dur > 50)) console.log(`  LoAF ${Math.round(f.start)}+${Math.round(f.dur)}: ` + f.scripts.filter((s) => s.dur > 5).map((s) => `${s.type}:${s.inv}|${s.fn}@${s.url}=${s.dur}`).join(' ; '));
    await context.close();
  }
  fs.writeFileSync(out, JSON.stringify(results, null, 1));
  await browser.close();
})();
