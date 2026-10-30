// C round 258 SA-41: toolbar height at intermediate widths (49 px or <= 87 px), centre group overlap
const L = require('./lib258.cjs'); const { fs, path } = L;
(async () => { const b = await L.chromium.launch(); const out = {};
for (const w of [1300, 1340, 1351, 1375, 1398, 1408, 1420]) { const { ctx, page } = await L.open(b, { width: w, height: 800 }, { pulse: false });
  out[w] = await page.evaluate(() => { const t = document.querySelector('[data-testid="arrangement-transport"]'); const g = (id) => document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect(); const e = g('arrangement-transport-edit'), c = g('arrangement-transport-centre'), v = g('arrangement-transport-view'); const ov = (a, b2) => a && b2 && Math.min(a.right, b2.right) - Math.max(a.left, b2.left) > 0.5 && Math.min(a.bottom, b2.bottom) - Math.max(a.top, b2.top) > 0.5; return { h: t ? Math.round(t.getBoundingClientRect().height) : null, ec: ov(e, c), cv: ov(c, v), ev: ov(e, v), scrollW: document.documentElement.scrollWidth }; });
  await ctx.close(); }
console.log(JSON.stringify(out)); fs.writeFileSync(path.join(__dirname, '..', 'out', 'iw.json'), JSON.stringify(out, null, 1)); await b.close(); })();
