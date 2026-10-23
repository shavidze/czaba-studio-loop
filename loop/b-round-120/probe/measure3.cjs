const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-grid-control"]', { timeout: 30000 });
  const res = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const ref = g.querySelector('select');
    const sets = { pct: ['50%','75%','100%','150%','200%','300%','400%','600%','800%'], x: ['0.5×','0.75×','1×','1.5×','2×','3×','4×','6×','8×'], xs: ['½×','1×','2×','4×','8×'] };
    const out = {};
    for (const [k, labels] of Object.entries(sets)) {
      const s = document.createElement('select'); s.className = ref.className;
      for (const l of labels) { const o = document.createElement('option'); o.textContent = l; s.appendChild(o); }
      g.appendChild(s); out[k] = Math.round(s.getBoundingClientRect().width);
      out[k + '_right'] = Math.round(s.getBoundingClientRect().right - g.getBoundingClientRect().left); s.remove();
    }
    return out;
  });
  console.log(JSON.stringify(res));
  await browser.close();
})();
