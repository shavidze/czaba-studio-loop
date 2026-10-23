const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  try { await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); } catch (e) { console.log('no grid control'); }
  await new Promise((r) => setTimeout(r, 4000));
  const info = await page.evaluate(() => ({
    title: document.title,
    options: [...document.querySelectorAll('[role=option]')].map((o) => o.getAttribute('data-source-id')).slice(0, 10),
    library: !!document.querySelector('[data-testid=arrangement-library]'),
    body: document.body.innerText.slice(0, 300),
  }));
  console.log(JSON.stringify(info, null, 1), errs.slice(0, 8));
  await browser.close();
})();
