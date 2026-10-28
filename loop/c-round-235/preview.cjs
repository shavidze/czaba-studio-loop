// C235: library preview stops when a strip click starts playback. usage: node preview.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`; const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://127.0.0.1:5173/studio-lab');
    await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 }); await sleep(800);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(700);
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(300);
    const t = page.locator('[data-testid="arrangement-library-preview-toggle"]');
    const lab = () => t.evaluate((b) => ({ label: b.getAttribute('aria-label'), pressed: b.getAttribute('aria-pressed'), text: b.textContent.trim() }));
    const r = { before: await lab() };
    await t.click(); await sleep(700); r.previewing = await lab();
    const b = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    await page.mouse.click(b.x + 2 * 40, b.y + 4); await sleep(700);
    r.afterStrip = await lab();
    r.main = await page.evaluate(() => [...document.querySelectorAll('button')].map((x) => x.getAttribute('aria-label')).filter((l) => l === 'Play' || l === 'Pause'));
    r.pos = await page.getAttribute('[data-testid="arrangement-playhead-handle"]', 'aria-valuenow');
    await page.screenshot({ path: path.join(process.argv[2], `preview-stop-${key}.png`) });
    r.errors = errors; R[key] = r; await ctx.close();
  }
  await browser.close(); fs.writeFileSync(path.join(process.argv[2], 'preview.json'), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
})();
