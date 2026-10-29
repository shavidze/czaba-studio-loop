const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'), undefined, { timeout: 120000 });
  await sleep(600);
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250);
  await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(900);
  const info = await page.evaluate(() => {
    const a = document.activeElement;
    const clips = [...document.querySelectorAll("[data-clip-id], [data-clip-id] *")].filter((e)=>e.tabIndex>=0).map((e) => ({ tag: e.tagName, tid: e.getAttribute('data-testid'), tab: e.tabIndex, role: e.getAttribute('role'), label: e.getAttribute('aria-label') }));
    return { active: a === document.body ? 'BODY' : [a.tagName, a.getAttribute('data-testid'), a.getAttribute('aria-label'), a.textContent.slice(0,40)], clips, clipHtml: document.querySelector('[data-clip-id]').outerHTML.slice(0,600) };
  });
  console.log(JSON.stringify(info, null, 1));
  await browser.close();
})();
