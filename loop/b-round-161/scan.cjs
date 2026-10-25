const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({
    folds: [...document.querySelectorAll('[data-testid="arrangement-track-fold"]')].map(e => [e.textContent, e.getAttribute('aria-label')]),
    groupFolds: document.querySelectorAll('[data-testid="arrangement-group-fold"]').length,
    clips: [...document.querySelectorAll('[data-testid="arrangement-clip"], [data-clip-id]')].length,
    videoBtns: [...document.querySelectorAll('button')].filter(e => e.textContent.includes('＋')).map(e => [e.textContent, e.getAttribute('aria-label'), e.getBoundingClientRect().width]),
    headers: [...document.querySelectorAll('[data-testid="arrangement-track-header"]')].map(e => e.textContent.slice(0, 40)),
  }));
  console.log(JSON.stringify(r, null, 1)); await b.close();
})();
