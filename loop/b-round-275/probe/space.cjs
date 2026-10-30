const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://127.0.0.1:5173/studio-lab');
  await page.getByText('Demo collection ready').first().waitFor({ timeout: 150000 });
  await page.waitForTimeout(1500);
  const dp = () => page.evaluate(() => document.querySelector('button[data-playing]')?.getAttribute('data-playing'));
  const res = {};
  for (const target of ['Fit', 'Follow', 'Export-skip']) {
    if (target === 'Export-skip') break;
    const b = page.locator('[data-testid="arrangement-transport"] button', { hasText: target }).first();
    await b.focus();
    const st0 = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim());
    const ariaPressed0 = await b.getAttribute('aria-pressed');
    await page.keyboard.press('Space');
    await page.waitForTimeout(1200);
    res[target] = { before: 'false', after: await dp(), ariaPressed0, ariaPressed1: await b.getAttribute('aria-pressed'), active: await page.evaluate(() => document.activeElement?.textContent?.trim()), st0, st1: await page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim()) };
    if ((await dp()) === 'true') { await page.keyboard.press('Space'); await page.waitForTimeout(800); }
  }
  await page.locator('[data-testid="arrangement-transport"]').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Space'); await page.waitForTimeout(1200);
  res.bodyish = { after: await dp(), active: await page.evaluate(() => document.activeElement?.tagName) };
  console.log(JSON.stringify(res, null, 1));
  require('fs').writeFileSync(__dirname + '/space.json', JSON.stringify(res, null, 1));
  await browser.close();
})();
