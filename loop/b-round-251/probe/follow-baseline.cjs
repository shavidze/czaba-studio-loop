const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const OUT = __dirname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function state(page) {
  return page.evaluate(() => {
    const f = document.querySelector('[data-testid="arrangement-follow"]');
    const s = document.querySelector('[data-testid="arrangement-status"]');
    const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]');
    const b = document.querySelector('[data-testid="arrangement-bars-ruler"]');
    const im = document.querySelector('[data-insert-marker]');
    return { follow: f?.dataset.followMode, followText: f?.textContent, status: s?.textContent, scrollLeft: sc?.scrollLeft, bpm: b?.dataset.bpm ?? null, insertMarker: im?.getAttribute('data-insert-marker') ?? null };
  });
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const results = {};
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const r = { steps: [] };
    try {
      await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
      await page.waitForFunction(() => { const s = document.querySelector('[data-testid="arrangement-status"]'); return s && s.textContent.startsWith('Demo collection ready'); }, undefined, { timeout: 150000 });
      r.steps.push(['loaded', await state(page)]);
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
      await sleep(250);
      await page.locator('button', { hasText: /^Add/ }).first().click();
      await sleep(1200);
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      for (let i = 0; i < 4; i++) { await page.keyboard.press('Equal'); await sleep(150); }
      await sleep(400);
      r.zoom = await page.evaluate(() => document.querySelector('[data-testid="arrangement-zoom-readout"]')?.textContent);
      r.steps.push(['added', await state(page)]);
      const bars = page.getByTestId('arrangement-bars-ruler');
      r.barsCount = await bars.count();
      await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
      await page.keyboard.press('Space');
      await sleep(600);
      r.steps.push(['playing', await state(page)]);
      if (r.barsCount > 0) {
        const bb = await bars.boundingBox();
        await page.mouse.click(bb.x + 120, bb.y + bb.height - 3);
        await sleep(300);
        r.steps.push(['bars-lower-click-playing', await state(page)]);
        const sec = await page.getByTestId('arrangement-ruler').boundingBox();
        await page.mouse.click(sec.x + 160, sec.y + sec.height - 4);
        await sleep(300);
        r.steps.push(['seconds-ruler-click-playing', await state(page)]);
        await page.evaluate(() => { const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]'); sc.scrollLeft = sc.scrollLeft + 200; });
        await sleep(300);
        r.steps.push(['manual-scroll-playing', await state(page)]);
        await page.mouse.click(bb.x + 60, bb.y + 2);
        await sleep(400);
        r.steps.push(['strip-click-playing', await state(page)]);
      }
      await page.keyboard.press('Space');
      await sleep(300);
      r.steps.push(['stopped', await state(page)]);
      await page.screenshot({ path: path.join(OUT, `baseline-${w}x${h}.png`) });
    } catch (e) { r.error = String(e); }
    results[`${w}x${h}`] = r;
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'follow-baseline.json'), JSON.stringify(results, null, 1));
  console.log(JSON.stringify(results, null, 1));
})();
