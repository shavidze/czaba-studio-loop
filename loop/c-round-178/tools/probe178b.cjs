const X = require('./lib122.cjs'); const { L, sleep } = X;
(async () => { const b = await L.chromium.launch({ headless: true }); const net = [];
  const o = await L.openStudio(b, X.VPS[1440], 'probe178b', net, {}); const p = o.page; const r = {};
  const menu = () => p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-grid-menu]'); return m ? [...m.querySelectorAll('[role^=menuitem]')].map((i) => `${i.getAttribute('role')}|${i.textContent.trim().slice(0, 30)}|${i.getAttribute('aria-checked')}`) : null; });
  const lb = await p.locator('[data-track-id=music]').last().boundingBox(); const g = await L.geo(p); r.lb = lb; r.g = g;
  await L.blur(p); await p.mouse.click(g.rl + 20 * g.pps, lb.y + lb.height / 2, { button: 'right' }); await sleep(500); r.m1 = await menu();
  r.el = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.getAttribute('data-testid') || e.tagName) + '|' + (e.closest('[data-track-id]') || {}).outerHTML?.slice(0, 200); }, [g.rl + 20 * g.pps, lb.y + lb.height / 2]);
  console.log(JSON.stringify(r, null, 1)); await b.close(); })();
