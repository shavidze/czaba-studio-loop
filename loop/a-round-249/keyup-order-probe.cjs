const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [base, outFile] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    for (const order of ['shiftFirst', 'spaceFirst']) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`${base}/studio-lab`, { waitUntil: 'load' });
      await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 180000 });
      await sleep(800);
      await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
      await sleep(250);
      await page.locator('button', { hasText: /^Add/ }).first().click();
      await sleep(900);
      await page.locator('button[aria-label="Play"]').focus();
      const kb = page.keyboard;
      await kb.down('Control'); await kb.down('Shift'); await kb.down(' ');
      if (order === 'shiftFirst') { await kb.up('Shift'); await kb.up(' '); } else { await kb.up(' '); await kb.up('Shift'); }
      await kb.up('Control');
      await sleep(600);
      out[`${order}@${vp.width}`] = await page.evaluate(() => ({
        playing: !!document.querySelector('button[aria-label="Pause"]'),
        marker: document.querySelector('[data-testid="arrangement-insert-marker"]')?.getAttribute('data-insert-marker'),
        active: document.activeElement?.getAttribute('aria-label'),
        status: document.querySelector('[data-testid="arrangement-status"]').textContent,
      }));
      out[`${order}@${vp.width}`].errors = errors;
      await ctx.close();
    }
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1));
})();
