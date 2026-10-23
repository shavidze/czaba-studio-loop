const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-library-collapse]', { timeout: 90000 });
  await new Promise((r) => setTimeout(r, 4000));
  console.log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[role=option]')].map((o) => [o.getAttribute('data-source-id'), o.textContent.slice(0, 40)]))));
  console.log(JSON.stringify(errors));
  await browser.close();
})();
