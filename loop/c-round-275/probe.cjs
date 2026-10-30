const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type()==='error') errs.push('console:'+m.text().slice(0,200)); });
  const t0 = Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 }); console.log('load ms', Date.now()-t0);
  for (let i = 0; i < 12; i++) { await p.waitForTimeout(5000); const s = await p.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? 'NO-STATUS'); console.log(i*5+5,'s', s.slice(0,140)); if (/^Demo collection ready/.test(s)) break; }
  console.log('errors', JSON.stringify(errs.slice(0,8)));
  await p.screenshot({ path: '/home/runner/czaba-project/tmp/studio-real-loop/c-round-275/probe-1440.png' });
  await b.close();
})();
