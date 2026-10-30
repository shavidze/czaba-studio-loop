// C round 258 RP-NARROW: leaf-element overlaps between arrangement-transport-edit, -view (and the centre group) at narrow widths.
const L = require('./lib258.cjs'); const { sleep, fs, path } = L;
const OUT = path.join(__dirname, '..', 'out', 'narrow'); fs.mkdirSync(OUT, { recursive: true });
(async () => { const b = await L.chromium.launch(); const out = {};
for (const [w, h] of [[1024, 768], [900, 720], [864, 720], [768, 720], [1280, 720], [1440, 900]]) {
  const { ctx, page, errors } = await L.open(b, { width: w, height: h }, { pulse: false });
  const r = await page.evaluate(() => {
    const groups = {}; for (const id of ['arrangement-transport-edit', 'arrangement-transport-centre', 'arrangement-transport-view']) { const g = document.querySelector(`[data-testid="${id}"]`); if (g) groups[id] = g; }
    const leaves = (g) => [...g.querySelectorAll('button, input, select, label > span')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((e) => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24), x: r.left, y: r.top, r: r.right, b: r.bottom }; });
    const L = Object.fromEntries(Object.entries(groups).map(([k, g]) => [k, leaves(g)]));
    const keys = Object.keys(L); const pairs = [];
    for (let i = 0; i < keys.length; i += 1) for (let j = i + 1; j < keys.length; j += 1) for (const a of L[keys[i]]) for (const c of L[keys[j]]) { const ox = Math.min(a.r, c.r) - Math.max(a.x, c.x); const oy = Math.min(a.b, c.b) - Math.max(a.y, c.y); if (ox > 0.5 && oy > 0.5) pairs.push({ a: `${keys[i].slice(22)}:${a.n}`, b: `${keys[j].slice(22)}:${c.n}`, px: +ox.toFixed(1) }); }
    return { groups: keys, pairs, maxPx: pairs.reduce((m, p) => Math.max(m, p.px), 0), docW: document.documentElement.scrollWidth };
  });
  await page.screenshot({ path: path.join(OUT, `narrow-${w}.png`) });
  out[w] = { ...r, errors: errors.length }; console.log(w, r.groups.length, 'pairs', r.pairs.length, 'max', r.maxPx, JSON.stringify(r.pairs.slice(0, 4))); await ctx.close(); }
fs.writeFileSync(path.join(OUT, 'narrow.json'), JSON.stringify(out, null, 1)); await b.close(); })();
