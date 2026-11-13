const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, vp, runs, out] = process.argv.slice(2); const [w, h] = vp.split('x').map(Number);
(async () => {
  const b = await chromium.launch(); const all = [];
  for (let i = 0; i < Number(runs); i++) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { localStorage.setItem('czaba_analytics_consent', 'denied'); window.__loaf = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ start: Math.round(e.startTime), dur: Math.round(e.duration), blocking: Math.round(e.blockingDuration || 0), scripts: (e.scripts || []).map((s) => ({ inv: s.invoker, type: s.invokerType, fn: s.sourceFunctionName, url: (s.sourceURL || '').replace(location.origin, '').slice(0, 90), dur: Math.round(s.duration) })) }); }).observe({ type: 'long-animation-frame', buffered: true }); } catch (e) { window.__loafErr = String(e); } });
    const p = await ctx.newPage(); await p.goto(base + '/studio-lab', { waitUntil: 'load' });
    await p.waitForFunction(() => /Demo collection ready/.test(document.body.innerText), null, { timeout: 120000 });
    const readyAt = await p.evaluate(() => Math.round(performance.now())); await p.waitForTimeout(8000);
    const loaf = await p.evaluate(() => window.__loaf); all.push({ run: i, readyAt, afterReady: loaf.filter((x) => x.start >= readyAt), beforeReady: loaf.filter((x) => x.start < readyAt).length });
    await ctx.close();
  }
  require('fs').writeFileSync(out, JSON.stringify({ vp, all }, null, 1)); console.log(JSON.stringify(all.map((r) => ({ run: r.run, readyAt: r.readyAt, n: r.afterReady.length, maxScript: Math.max(0, ...r.afterReady.flatMap((x) => x.scripts.map((s) => s.dur))) }))));
  await b.close();
})();
