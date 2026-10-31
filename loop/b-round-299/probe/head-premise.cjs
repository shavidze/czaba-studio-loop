const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch(); const base = process.argv[2];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { window.__ctx = []; window.addEventListener('contextmenu', (e) => window.__ctx.push({ id: e.target?.closest?.('[data-source-id]')?.getAttribute('data-source-id'), prevented: e.defaultPrevented })); });
  await page.locator('[role="option"][data-source-id="demo-middle-east"]').click({ button: 'right' });
  await page.locator('[role="option"][data-source-id="demo-hero-music"]').click({ button: 'right' });
  console.log(JSON.stringify({ base, ctx: await page.evaluate(() => window.__ctx), menus: await page.getByRole('menu').count(), selected: await page.locator('[role="option"][aria-selected="true"]').getAttribute('data-source-id') }));
  await browser.close();
})();
