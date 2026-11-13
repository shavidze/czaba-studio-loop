const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => { const b = await chromium.launch(); const out = [];
for (let i = 0; i < 8; i++) { const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied')); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120))); p.on('console', (m) => { if (m.type() === 'error' || m.type()==='warning') errs.push('c:' + m.text().slice(0, 100)); });
  await p.goto('http://127.0.0.1:5189/studio/middle-east', { waitUntil: 'load' }); await p.waitForTimeout(3500);
  out.push({ i, text: (await p.evaluate(() => document.body?.innerText || '')).replace(/\s+/g, ' ').slice(0, 140), audioSrc: await p.locator('audio[src]').count(), errs: errs.filter((e) => !/ERR_CONNECTION|Failed to load|cart/i.test(e)).slice(0, 4) }); await ctx.close(); }
console.log(JSON.stringify(out, null, 1)); await b.close(); })();
