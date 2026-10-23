const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-grid-control"]', { timeout: 30000 });
  const res = await page.evaluate(() => {
    const g = document.querySelector('[data-testid="arrangement-grid-control"]');
    const chrome = g.parentElement.parentElement;
    return [...chrome.children].map((row) => {
      const head = row.querySelector('.sticky') || row.firstElementChild;
      const hr = head.getBoundingClientRect();
      const items = [...head.querySelectorAll('button,input,select,span,label')].map((e) => { const b = e.getBoundingClientRect(); return { tag: e.tagName, tid: e.dataset.testid || '', text: (e.textContent || '').trim().slice(0, 20), x: Math.round(b.left - hr.left), w: Math.round(b.width) }; });
      return { rowH: Math.round(row.getBoundingClientRect().height), headW: Math.round(hr.width), headText: head.textContent.trim().slice(0, 60), items };
    });
  });
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
