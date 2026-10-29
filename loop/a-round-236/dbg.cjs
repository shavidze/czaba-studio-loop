const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => console.log('PAGEERR', String(e)));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  for (let i = 0; i < 6; i++) {
    console.log(i, JSON.stringify(await page.evaluate(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? 'NO STATUS')));
    await page.waitForTimeout(3000);
  }
  await browser.close();
})();
