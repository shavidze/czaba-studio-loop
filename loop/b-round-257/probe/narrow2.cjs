const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const out = [];
  for (const w of [1024, 900, 870, 864, 800, 768]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 720 } }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid=arrangement-transport-edit]'); await p.waitForTimeout(1200);
    out.push(await p.evaluate((w) => {
      const leaves = (id) => [...document.querySelectorAll(`[data-testid=${id}] button, [data-testid=${id}] input, [data-testid=${id}] select, [data-testid=${id}] label > span, [data-testid=${id}] output`)].map(e => { const r = e.getBoundingClientRect(); return { n: (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24), l: r.left, t: r.top, r: r.right, b: r.bottom }; }).filter(x => x.r > x.l);
      const E = leaves('arrangement-transport-edit'), V = leaves('arrangement-transport-view'); const ov = [];
      for (const a of E) for (const c of V) if (a.l < c.r - 0.5 && c.l < a.r - 0.5 && a.t < c.b - 0.5 && c.t < a.b - 0.5) ov.push(`${a.n} x ${c.n} (${Math.round(Math.min(a.r, c.r) - Math.max(a.l, c.l))}px)`);
      return { w, overlaps: ov };
    }, w)); await ctx.close();
  }
  require('fs').writeFileSync('narrow2.json', JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close();
})();
