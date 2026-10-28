const path = require('node:path');
const { chromium } = require(path.join('/home/runner/czaba-project/store/node_modules/playwright'));
(async () => {
  const b = await chromium.launch(); const out = [];
  for (let i = 0; i < 2; i += 1) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
    const r = await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' }); await p.waitForTimeout(4000);
    out.push({ i, status: r.status(), errs, demo: await p.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required')), auth: await p.evaluate(() => localStorage.getItem('auth_user')), ws: await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-ruler]')) });
    if (i === 0) await p.screenshot({ path: 'lab-1440-recheck-225.png' });
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(out));
})();
