const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await p.waitForTimeout(8000);
  const info = await p.evaluate(() => ({
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent, title: document.title, body: document.body.innerText.slice(0,400),
    buttons: Array.from(document.querySelectorAll('header button, [data-testid*="transport"] button')).map(b => (b.getAttribute('aria-label')||b.textContent).trim()).slice(0,30),
    testids: Array.from(new Set(Array.from(document.querySelectorAll('[data-testid]')).map(e=>e.getAttribute('data-testid')))).filter(t=>/clock|time|transport|play|preview|clip|search/i.test(t)),
    options: Array.from(document.querySelectorAll('[role=option][data-source-id]')).map(o=>o.getAttribute('data-source-id')),
  }));
  console.log(JSON.stringify(info, null, 1)); await b.close();
})();
