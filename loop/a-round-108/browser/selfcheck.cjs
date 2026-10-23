const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const OUT = __dirname;
const URL = 'http://127.0.0.1:5173/studio-lab';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOISE = /cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|fetch failed|net::ERR|localhost:5199|firebase|Download the React DevTools/i;
async function session() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await ctx.newPage();
  const S = { errors: [], forbidden: [] };
  page.on('console', (m) => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !NOISE.test(t)) S.errors.push(t.slice(0, 200)); });
  page.on('pageerror', (e) => S.errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('request', (q) => { if (/studio-token|recording-|\/api\/download/.test(q.url())) S.forbidden.push(q.url()); });
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(300);
  const t0 = Date.now();
  while (Date.now() - t0 < 90000) { const n = await page.evaluate(() => [...document.querySelectorAll('[role=option][data-source-id]')].filter((o) => /იტვირთება…/.test(o.textContent)).length); if (n === 0) break; await sleep(250); }
  await sleep(400);
  return { browser, page, S };
}
const blur = (p) => p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
const st = (p) => p.evaluate(() => {
  const a = document.activeElement;
  const u = document.querySelector('button[title^="Undo"]'); const r = document.querySelector('button[title^="Redo"]');
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start')),
    active: a ? (a.getAttribute('data-testid') || a.getAttribute('title') || a.tagName) : null,
    undo: u ? `${u.title}${u.disabled ? ' (disabled)' : ''}` : null,
    redo: r ? `${r.title}${r.disabled ? ' (disabled)' : ''}` : null,
    status: document.querySelector('[data-testid=arrangement-status]')?.textContent ?? null,
    gain: document.querySelector('[data-testid=arrangement-detail-clip-gain-input]')?.value ?? null,
    reset: document.querySelector('[data-testid=arrangement-detail-clip-gain-reset]')?.disabled ?? null,
  };
});
async function addME(p, n) {
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]');
  await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  await o.focus(); await sleep(150);
  for (let i = 0; i < n; i++) { await p.keyboard.press('Enter'); await sleep(900); }
  await blur(p); await p.click('[data-testid=arrangement-fit]'); await sleep(600); await blur(p);
}
const clipBoxes = (p) => p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }).sort((a, b) => a.x - b.x));
const rows = {
  async undo(p, R) {
    await addME(p, 2); R.start = await st(p);
    await p.focus('button[title^="Undo"]');
    for (let i = 1; i <= 3; i++) { await p.keyboard.press('Enter'); await sleep(700); R[`enter${i}`] = await st(p); }
  },
  async del(p, R) {
    await addME(p, 1);
    const cb = (await clipBoxes(p))[0]; await p.mouse.click(Math.round(cb.x + Math.min(cb.w / 2, 20)), Math.round(cb.y + cb.h - 8)); await sleep(300); await blur(p);
    R.start = await st(p);
    await p.focus('button[aria-label^="⌫ წაშლა"]');
    for (let i = 1; i <= 2; i++) { await p.keyboard.press('Enter'); await sleep(800); R[`enter${i}`] = await st(p); }
  },
  async gain(p, R) {
    await addME(p, 1);
    const cb = (await clipBoxes(p))[0]; await p.mouse.click(Math.round(cb.x + Math.min(cb.w / 2, 20)), Math.round(cb.y + cb.h - 8)); await sleep(300); await blur(p);
    const t = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]')?.getAttribute('aria-expanded'));
    if (t === 'false') { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(400); }
    const inp = p.locator('[data-testid=arrangement-detail-clip-gain-input]');
    await inp.click(); await inp.fill('1'); await p.keyboard.press('Enter'); await sleep(400);
    R.before = await st(p);
    await p.keyboard.press('Tab'); await sleep(150); R.afterTab = await st(p);
    await p.keyboard.press('Enter'); await sleep(500); R.afterReset = await st(p);
    await p.keyboard.press('Enter'); await sleep(900); R.afterEnter2 = await st(p);
  },
};
(async () => {
  const name = process.argv[2];
  const { browser, page, S } = await session();
  const R = { row: name, vp: '1280x720' };
  try { await rows[name](page, R); await page.screenshot({ path: `${OUT}/${name}-1280x720.png` }); } catch (e) { R.exception = String(e.stack || e); }
  R.errors = S.errors; R.forbidden = S.forbidden;
  fs.writeFileSync(`${OUT}/${name}-1280x720.json`, JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
  await browser.close();
})();
