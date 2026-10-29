// C round 238: edit-refusal neighbour probe (ready state). usage: node editref.cjs <base> <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const [base, outFile] = process.argv.slice(2);
const sel = '[data-testid="arrangement-status"]';
(async () => {
  const browser = await chromium.launch(); const out = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) for (const key of ['Delete', 'Control+d', 'Control+Shift+z']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`); await page.waitForFunction((q) => document.querySelector(q)?.textContent.startsWith('Demo collection ready'), sel, { timeout: 60000 });
    const item = page.locator('[data-source-id="demo-stem-pulse"]');
    for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) { await item.click(); await page.waitForTimeout(100); }
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(800);
    const clip = page.locator('[data-clip-kind="audio"]').first(); await clip.click(); await page.waitForTimeout(300);
    const before = await page.locator(sel).textContent();
    const f = page.getByRole('slider', { name: /^Volume — / }).first(); const b = await f.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.mouse.move(b.x + b.width / 2 + 4, b.y + b.height / 2, { steps: 3 });
    await page.keyboard.press(key); await page.waitForTimeout(300);
    const during = await page.locator(sel).textContent(); const clipsDuring = await page.locator('[data-clip-kind="audio"]').count();
    await page.mouse.up(); await page.waitForTimeout(800);
    const after = await page.locator(sel).textContent();
    out.push({ w, key, before, during, clipsDuring, after, clipsAfter: await page.locator('[data-clip-kind="audio"]').count(), errors });
    await ctx.close();
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); await browser.close();
})();
