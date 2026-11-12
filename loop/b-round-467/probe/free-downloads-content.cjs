const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastShown: Date.now(), dismissed: true, submitted: true })));
  const p = await ctx.newPage(); await p.goto(process.argv[2] + '/free-downloads', { waitUntil: 'load' }); await p.waitForTimeout(4000);
  const r = await p.evaluate(() => ({ h1: [...document.querySelectorAll('h1,h2')].map((e) => e.textContent.trim().slice(0, 60)), imgs: document.images.length, buttons: document.querySelectorAll('main button, main a').length, mainText: (document.querySelector('main')?.innerText || '').replace(/\s+/g, ' ').slice(0, 600), scrollH: document.documentElement.scrollHeight }));
  await p.screenshot({ path: process.argv[3], fullPage: true }); console.log(JSON.stringify(r, null, 1)); await b.close();
})();
