const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const res = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) { const ctx = await b.newContext({ viewport: { width: w, height: h } }); await ctx.addInitScript(() => { localStorage.setItem('czaba_analytics_consent', 'denied'); window.__loaf = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ dur: Math.round(e.duration), scripts: (e.scripts || []).map((s) => ({ inv: s.invoker, type: s.invokerType, dur: Math.round(s.duration), src: (s.sourceURL || '').split('/').slice(-2).join('/') })), hasField: 'scripts' in e }); } ).observe({ type: 'long-animation-frame', buffered: true }); });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:5173/studio-lab'); await p.waitForFunction(() => /Demo collection ready/.test(document.body?.innerText || ''), null, { timeout: 120000 }); await p.waitForTimeout(1500);
  const natural = await p.evaluate(() => window.__loaf.length);
  await p.evaluate(() => { window.__loaf.length = 0; requestAnimationFrame(() => { const t = performance.now(); while (performance.now() - t < 140); }); });
  await p.waitForTimeout(600);
  res.push({ vp: `${w}x${h}`, naturalEntriesBefore: natural, afterBusyRaf: await p.evaluate(() => window.__loaf) }); await ctx.close(); }
console.log(JSON.stringify(res, null, 1)); require('fs').writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/c-round-483/out/loaf.json', JSON.stringify(res, null, 1)); await b.close(); })();
