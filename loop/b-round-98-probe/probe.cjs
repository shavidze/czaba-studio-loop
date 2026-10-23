const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const OUT = __dirname + '/probe-result.json';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const res = {};
  for (const c of ['row', 'statusClick', 'jsBlur']) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => {
      window.__ev = [];
      window.addEventListener('keydown', (e) => window.__ev.push({ k: e.key, r: e.repeat, a: (document.activeElement?.getAttribute('data-source-id') || document.activeElement?.tagName) }), true);
    });
    const p = await ctx.newPage();
    const R = { errors: [] };
    p.on('pageerror', (e) => R.errors.push(String(e).slice(0, 200)));
    await p.goto('http://127.0.0.1:5173/studio-lab');
    await sleep(1500);
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
    const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
    await o.scrollIntoViewIfNeeded();
    const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
    const clips = () => p.$$eval('[data-clip-id]', (e) => e.length);
    R.before = await clips();
    await o.click(); await sleep(300);
    if (c === 'statusClick') { await p.locator('[data-testid=arrangement-status]').click({ force: true }); await sleep(300); }
    if (c === 'jsBlur') { await p.evaluate(() => document.activeElement && document.activeElement.blur()); await sleep(200); }
    R.activeBeforeHold = await p.evaluate(() => document.activeElement?.tagName + ' ' + (document.activeElement?.getAttribute('data-source-id') || document.activeElement?.getAttribute('data-testid') || ''));
    await p.evaluate(() => { window.__ev = []; });
    await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await sleep(50); await p.keyboard.down('Enter'); await p.keyboard.up('Enter');
    await sleep(1200);
    R.after = await clips();
    R.events = await p.evaluate(() => window.__ev);
    R.status = await p.evaluate(() => document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null);
    res[c] = R;
    await ctx.close();
  }
  fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
