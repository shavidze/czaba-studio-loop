const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(15000);
  console.log((await p.locator('body').innerText()).slice(0, 1500));
  const btns = await p.locator('button').evaluateAll((els) => els.map((e) => (e.getAttribute('aria-label') || '') + '|' + e.textContent.trim().slice(0, 25)));
  console.log(JSON.stringify(btns.slice(0, 80)));
  await p.screenshot({ path: '../d2.png' });
  await b.close();
})();
