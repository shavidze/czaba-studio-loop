const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch();
  const out = [];
  for (const w of [1280, 1100, 1024, 960, 900, 800, 768]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 720 } });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-testid=arrangement-transport-edit]', { timeout: 30000 });
    await p.waitForTimeout(1500);
    const r = await p.evaluate(() => {
      const box = (id) => { const e = document.querySelector(`[data-testid=${id}]`); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; };
      const btns = [...document.querySelectorAll('[data-testid=arrangement-transport] button')].map(b => { const r = b.getBoundingClientRect(); return { n: b.getAttribute('aria-label') || b.textContent.trim(), l: r.left, t: r.top, r: r.right, b: r.bottom }; }).filter(x => x.r > x.l);
      let overlaps = [];
      for (let i = 0; i < btns.length; i++) for (let j = i + 1; j < btns.length; j++) { const a = btns[i], c = btns[j]; if (a.l < c.r - 0.5 && c.l < a.r - 0.5 && a.t < c.b - 0.5 && c.t < a.b - 0.5) overlaps.push(a.n + ' x ' + c.n); }
      const offscreen = btns.filter(x => x.r > window.innerWidth + 0.5 || x.l < -0.5).map(x => x.n);
      return { edit: box('arrangement-transport-edit'), view: box('arrangement-transport-view'), transport: box('arrangement-transport'), overlaps, offscreen, iw: window.innerWidth };
    });
    out.push({ w, ...r });
    await p.screenshot({ path: `narrow-${w}.png` });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  require('fs').writeFileSync('narrow.json', JSON.stringify(out, null, 1));
  await b.close();
})();
