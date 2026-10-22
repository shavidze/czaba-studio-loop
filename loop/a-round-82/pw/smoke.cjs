const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const clips = await page.locator('[data-clip-id]').count();
  const handles = await page.locator('[data-testid^="arrangement-clip-fade-"]').count();
  const lib = await page.locator('[data-testid*="library"]').count();
  console.log(JSON.stringify({ clips, handles, lib, errors: errors.slice(0, 8) }));
  await context.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
  await browser.close();
})();
