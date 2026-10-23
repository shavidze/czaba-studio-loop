const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await new Promise((r) => setTimeout(r, 3000));
  console.log(await p.evaluate(() => [...document.querySelectorAll('button')].map((x) => x.textContent.trim().slice(0, 25) + '|' + x.getAttribute('aria-label')).join('\n')));
  await b.close();
})();
