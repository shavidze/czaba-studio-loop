const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="arrangement-grid-control"]', { timeout: 30000 });
    out[w] = await page.evaluate(() => {
      const g = document.querySelector('[data-testid="arrangement-grid-control"]');
      const r = g.getBoundingClientRect();
      const kids = [...g.children].map((c) => { const b = c.getBoundingClientRect(); return { tag: c.tagName, testid: c.dataset.testid, x: Math.round(b.left - r.left), w: Math.round(b.width), h: Math.round(b.height) }; });
      const last = g.lastElementChild.getBoundingClientRect();
      const lane = document.querySelector('[data-track-id]');
      const toolbar = document.querySelector('[data-testid="arrangement-transport"]');
      return { grid: { w: Math.round(r.width), h: Math.round(r.height) }, kids, freeRight: Math.round(r.right - last.right - 8), laneH: lane ? Math.round(lane.getBoundingClientRect().height) : null, toolbar: toolbar ? Math.round(toolbar.getBoundingClientRect().height) : null };
    });
    await page.screenshot({ path: `grid-${w}.png` });
    await ctx.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();
