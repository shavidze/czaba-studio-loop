const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  for (const base of process.argv.slice(2)) {
    for (let i = 0; i < 2; i++) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 90)));
      await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      console.log(base, 'load', i, 'errors', errors.length, errors[0] ?? '');
      await ctx.close();
    }
  }
  await browser.close();
})();
