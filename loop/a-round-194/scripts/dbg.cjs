const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('@playwright/test');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 99, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: false })));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/free-downloads', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  console.log('FD inputs', await p.$$eval('input', (e) => e.map((x) => `${x.type}|${x.name}|${x.placeholder}|${x.className.slice(0, 60)}`)));
  console.log('FD text', (await p.innerText('main').catch(() => p.innerText('body'))).slice(0, 600).replace(/\n+/g, ' | '));
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  const btn = p.locator('header button', { hasText: 'Sign In' }).first();
  console.log('btn', await btn.count(), await btn.isVisible());
  await btn.click(); await p.waitForTimeout(1200);
  console.log('dialogs', await p.$$eval('[role=dialog], [aria-modal]', (e) => e.map((x) => x.tagName + ' ' + x.getAttribute('role'))));
  console.log('inputs', await p.$$eval('input', (e) => e.map((x) => `${x.type}|${x.id}|${x.className.slice(0, 50)}`)));
  await b.close();
})();
