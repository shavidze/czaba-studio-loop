// C round 212 — load long tasks (> 50 ms before the Add button is ready), alternating baseline/current, 1440×900. Written by C.
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const L = require('./c212lib.cjs');
(async () => {
  const br = await chromium.launch(); const R = { base: [], cur: [] };
  for (let i = 0; i < 8; i++) for (const [t, u] of [['base', 'http://127.0.0.1:5191'], ['cur', 'http://127.0.0.1:5190']]) {
    const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push(Math.round(e.duration)); }).observe({ type: 'longtask', buffered: true }); try { localStorage.setItem('czaba_analytics_consent', 'denied'); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto(u + '/studio-lab', { waitUntil: 'load' });
    await p.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 90000 });
    const lt = await p.evaluate(() => window.__lt.slice()); R[t].push(lt.filter((d) => d > 50).length + ':' + lt.join('/')); await ctx.close(); }
  await br.close(); L.save('load-longtasks.json', R); console.log(JSON.stringify(R));
})();
