// C235: Follow state after an unmoved bars-ruler click (strip / lower) and seconds-ruler click during playback. usage: node follow.cjs <outDir> [base]
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const base = process.argv[3] || 'http://127.0.0.1:5173';
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = { base };
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`; R[key] = {};
    for (const zone of ['strip', 'lower', 'seconds']) {
      const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
      const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`${base}/studio-lab`);
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 }); await sleep(800);
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
      await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(700); await page.mouse.click(5, 5);
      const follow = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Follow'); return b ? b.getAttribute('aria-pressed') : null; });
      await page.keyboard.press('Space'); await sleep(500);
      const before = await follow();
      const sel = zone === 'seconds' ? '[data-testid="arrangement-ruler"]' : '[data-testid="arrangement-bars-ruler"]';
      const b = await page.locator(sel).boundingBox();
      const y = zone === 'strip' ? b.y + 4 : zone === 'lower' ? b.y + 15 : b.y + 14;
      await page.mouse.click(b.x + 5 * 40, y); await sleep(400);
      R[key][zone] = { before, after: await follow(), status: await page.textContent('[data-testid="arrangement-status"]'), errors };
      await ctx.close();
    }
  }
  await browser.close(); fs.writeFileSync(path.join(process.argv[2], `follow-${base.endsWith('5174') ? 'head' : 'work'}.json`), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
})();
