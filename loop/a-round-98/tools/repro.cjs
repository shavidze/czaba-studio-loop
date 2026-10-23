const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const A = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-98';
const tag = process.argv[2] || 'before';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  const errors = []; const forbidden = []; const auth = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  p.on('request', (q) => { const u = q.url(); if (/studio-token|recording-|\/api\/download|r2\./.test(u)) forbidden.push(u); if (q.headers().authorization) auth.push(u); });
  await p.addInitScript(() => {
    window.__ev = [];
    const t = () => (document.activeElement?.textContent || '').trim().slice(0, 30);
    document.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const r = { type: 'keydown', key: e.key, repeat: e.repeat, active: t() }; window.__ev.push(r); e.__r = r; } }, true);
    window.addEventListener('keydown', (e) => { if (e.__r) e.__r.defaultPrevented = e.defaultPrevented; });
    document.addEventListener('click', (e) => { window.__ev.push({ type: 'click', target: (e.target?.textContent || '').trim().slice(0, 30) }); }, true);
  });
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
  for (let i = 0; i < 20; i++) { const d = await p.evaluate(() => { const x = [...document.querySelectorAll('button')].find((y) => y.textContent.trim() === 'Decline'); if (x) { x.click(); return true; } return false; }); if (d) break; await sleep(250); }
  await sleep(300);
  console.log('exportCount', await p.getByRole('button', { name: 'Export', exact: true }).count(), await p.locator('button', { hasText: /^Export$/ }).count());
  const exp = p.getByRole('button', { name: 'Export', exact: true });
  await exp.click();
  await p.waitForSelector('#arrangement-export-title');
  const t0 = Date.now(); while (Date.now() - t0 < 3000 && !(await p.evaluate(() => document.activeElement?.textContent?.trim() === 'დახურვა'))) await sleep(10);
  const R = { tag, when: new Date().toISOString(), focusBefore: await p.evaluate(() => document.activeElement?.textContent?.trim()) };
  await p.evaluate(() => { window.__ev = []; });
  await p.keyboard.down('Enter');
  const t1 = Date.now(); while (Date.now() - t1 < 2000 && (await p.$('#arrangement-export-title'))) await sleep(10);
  R.closedAfterFirst = !(await p.$('#arrangement-export-title'));
  for (let i = 0; i < 2; i++) { await sleep(50); await p.keyboard.down('Enter'); }
  await p.keyboard.up('Enter'); await sleep(1000);
  R.dialogOpenAtEnd = !!(await p.$('#arrangement-export-title'));
  R.focusAtEnd = await p.evaluate(() => document.activeElement?.textContent?.trim());
  R.events = await p.evaluate(() => window.__ev.slice());
  R.errors = errors; R.forbidden = forbidden; R.auth = auth;
  await p.screenshot({ path: `${A}/shots/repro-${tag}.png` });
  fs.writeFileSync(`${A}/repro-${tag}.json`, JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1));
  await ctx.close(); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
