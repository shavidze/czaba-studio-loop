// B planning probe: AuthModal (useScrollLock consumer) scroll position across open/close. usage: node authmodal-scroll.cjs <port>
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage();
  await p.addInitScript(() => localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: '2026-10-27', dismissed: true, submitted: false })));
  await p.goto(`http://127.0.0.1:${process.argv[2]}/`, { waitUntil: 'networkidle' }).catch(() => {});
  await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((e) => e.textContent.trim() === 'Decline'); if (x) x.click(); });
  await sleep(1200); await p.evaluate(() => window.scrollTo(0, 1500)); await sleep(1500);
  const r = { before: await p.evaluate(() => scrollY) };
  await p.evaluate(() => { const x = [...document.querySelectorAll('header button')].find((e) => e.textContent.trim() === 'Sign In'); x.click(); }); await sleep(800);
  r.openTop = await p.evaluate(() => document.body.style.top);
  await p.keyboard.press('Escape'); await sleep(1200);
  r.after = await p.evaluate(() => scrollY); r.dialogGone = await p.evaluate(() => !document.querySelector('[role="dialog"]'));
  console.log(JSON.stringify(r)); await b.close();
})();
