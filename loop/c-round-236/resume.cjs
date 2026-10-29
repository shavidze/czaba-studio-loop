// C236: while playing, a bars drag pauses Follow; does a strip / lower click resume it? usage: node resume.cjs <outDir>
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const R = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const key = `${vp.width}x${vp.height}`; R[key] = {};
    for (const zone of ['strip', 'lower']) {
      const ctx = await browser.newContext({ viewport: vp }); const page = await ctx.newPage();
      const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto('http://127.0.0.1:5173/studio-lab');
      await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => /^Add/.test(x.textContent.trim())); return b && !b.disabled; }, undefined, { timeout: 120000 }); await sleep(800);
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
      await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(700); await page.mouse.click(5, 5);
      const follow = () => page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /follow/i.test(x.textContent + " " + x.title)); return b ? `${b.getAttribute("aria-pressed")}|${b.textContent.trim()}` : null; });
      await page.keyboard.press('Space'); await sleep(500);
      const b = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
      const x0 = b.x + 600; const y0 = b.y + 15;
      await page.mouse.move(x0, y0); await page.mouse.down(); for (let i = 1; i <= 10; i += 1) await page.mouse.move(x0 - i * 10, y0); await page.mouse.up(); await sleep(400);
      const afterDrag = await follow();
      const b2 = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
      await page.mouse.click(b2.x + 200 + 3 * 40, zone === 'strip' ? b2.y + 4 : b2.y + 15); await sleep(400);
      R[key][zone] = { afterDrag, afterClick: await follow(), label: await page.evaluate(() => [...document.querySelectorAll('button')].map((x) => x.getAttribute('aria-label')).find((l) => l === 'Play' || l === 'Pause')), status: await page.textContent('[data-testid="arrangement-status"]'), errors };
      await ctx.close();
    }
  }
  await browser.close(); fs.writeFileSync(path.join(process.argv[2], 'follow-resume.json'), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R));
})();
