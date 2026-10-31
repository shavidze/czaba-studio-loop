const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const res = [];
  for (const vp of [{width:1440,height:900},{width:1280,height:720}]) {
    const ctx = await b.newContext({ viewport: vp });
    await ctx.addInitScript(() => {
      window.__loaf = [];
      new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__loaf.push({ d: e.duration, n: Array.isArray(e.scripts) ? e.scripts.length : null, max: Array.isArray(e.scripts) ? Math.max(0, ...e.scripts.map(s => s.duration||0)) : null }); }).observe({ type: 'long-animation-frame', buffered: true });
    });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
    await p.waitForTimeout(6000);
    const l = await p.evaluate(() => window.__loaf);
    res.push({ vp: `${vp.width}x${vp.height}`, entries: l.length, withScripts: l.filter(e => e.n > 0).length, emptyScripts: l.filter(e => e.n === 0).length, noField: l.filter(e => e.n === null).length, maxScriptMs: Math.max(0, ...l.map(e => e.max || 0)) });
    await ctx.close();
  }
  console.log(JSON.stringify(res));
  await b.close();
})();
