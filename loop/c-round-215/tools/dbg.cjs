const L = require('./glib.cjs');
(async () => {
  const t0 = Date.now(); const lg = (m) => console.log(((Date.now() - t0) / 1000).toFixed(1), m);
  const b = await L.launch(); lg('launched');
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => lg('pageerror ' + e));
  await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded', timeout: 60000 }); lg('dcl');
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); lg('grid');
  lg(JSON.stringify(await p.evaluate(() => ({ len: document.body.innerText.length, badge: document.body.innerText.includes('Demo collection — no sign-in required') }))));
  const f = await L.fontsWait(p); lg('fonts ' + JSON.stringify(f).slice(0, 300));
  await b.close();
})().catch((e) => { console.log('ERR', e); process.exit(1); });
