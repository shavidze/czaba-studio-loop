const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const out = [];
  for (let i = 0; i < 2; i++) { const b = await L.launch(); const net = [];
    const { page: p } = await L.openCtx(b, X.VPS[1440], 'rg22diag', net);
    await p.route(/:5199\//, (r) => r.abort());
    const t0 = Date.now(); await p.goto(`${L.BASE}/`, { waitUntil: 'domcontentloaded' }); await sleep(5000);
    const st = await p.evaluate(() => ({ loader: !!document.querySelector('[data-testid=entrance-loader]'), popup: !!document.querySelector('div.fixed.inset-0.z-\\[9999\\]') }));
    await p.evaluate(() => { window.__clientNav = 'kept'; });
    const hl = p.locator('header a[href*="studio-lab"]').filter({ visible: true }).first(); const bb = await hl.boundingBox();
    const hit = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.closest('a') ? 'A ' + e.closest('a').getAttribute('href') : e.tagName + ' ' + e.className.slice(0, 80)); }, [bb.x + bb.width / 2, bb.y + bb.height / 2]);
    await hl.click(); await p.waitForURL(/studio-lab/); await sleep(1500);
    out.push({ st, hit, client: await p.evaluate(() => window.__clientNav === 'kept'), errors: net[0].errors.slice(0, 3), hyd: net[0].hydration });
    await b.close(); }
  console.log(JSON.stringify(out, null, 1));
})();
