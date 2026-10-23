// A round 106 self-check (not C acceptance): held ArrowLeft on a neighbour-blocked clip, Snap off.
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-106/browser';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BLOCKED = 'ჩაჩოჩება დაბლოკილია — მეზობელი კლიპი ან დროის დასაწყისი.';
async function run(vp) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errors = []; const forbidden = []; const auth = [];
  page.on('pageerror', (e) => errors.push('pageerror ' + String(e).slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|localhost:5199|firebase/i.test(m.text())) errors.push(m.text().slice(0, 200)); });
  page.on('request', (q) => { const u = q.url(); if (/studio-token|recording-|\/api\/download|r2\./.test(u)) forbidden.push(u); if (q.headers().authorization) auth.push(u); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 }); await sleep(3000);
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Decline'); if (b) b.click(); });
  await sleep(300);
  const snap = await page.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]')?.dataset.snap);
  if (snap === 'on') { await page.click('[data-testid=arrangement-snap-toggle]'); await sleep(200); }
  const opt = page.locator('[role=option][data-source-id="demo-middle-east"]');
  await opt.waitFor({ state: 'attached', timeout: 90000 });
  await opt.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await opt.getAttribute('draggable')) !== 'true') await sleep(200);
  await opt.focus(); await page.keyboard.press('Enter'); await sleep(700); await page.keyboard.press('Enter'); await sleep(900);
  await page.getByRole('button', { name: /^Fit/ }).first().click().catch(() => {}); await sleep(500);
  const clips = await page.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { id: e.getAttribute('data-clip-id'), x: r.x, y: r.y, w: r.width, h: r.height }; }).sort((a, b) => a.x - b.x));
  const second = clips[1];
  await page.mouse.click(Math.round(second.x + Math.min(second.w / 2, 20)), Math.round(second.y + second.h - 8)); await sleep(300);
  const snapState = await page.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]')?.dataset.snap);
  const before = await page.evaluate(() => ({ undo: document.querySelector('[aria-label^="Undo"]')?.getAttribute('aria-label') ?? null, starts: [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start') ?? e.getAttribute('aria-label')) }));
  await page.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    window.__a106 = { out, added: [], records: 0, repeats: 0, samples: [] };
    new MutationObserver((b) => { for (const r of b) { window.__a106.records++; if (r.type === 'childList') for (const n of r.addedNodes) if (n.nodeType === 1) window.__a106.added.push(n.textContent); } }).observe(out, { childList: true, subtree: true, characterData: true });
    window.addEventListener('keydown', (e) => { if (e.repeat) window.__a106.repeats++; window.__a106.samples.push(document.querySelector('[data-testid=arrangement-status]') === out && out.childElementCount === 1); }, true);
  });
  for (let i = 0; i < 32; i++) { await page.keyboard.down('ArrowLeft'); await sleep(30); }
  await page.keyboard.up('ArrowLeft');
  const hold = await page.evaluate(() => ({ added: window.__a106.added.slice(), repeats: window.__a106.repeats }));
  await sleep(500);
  await page.keyboard.press('ArrowLeft'); await sleep(200);
  const after = await page.evaluate(() => ({ added: window.__a106.added.slice(), repeats: window.__a106.repeats, sameOutput: window.__a106.samples.every(Boolean), text: document.querySelector('[data-testid=arrangement-status]').textContent, undo: document.querySelector('[aria-label^="Undo"]')?.getAttribute('aria-label') ?? null, starts: [...document.querySelectorAll('[data-clip-id]')].map((e) => e.getAttribute('data-clip-start') ?? e.getAttribute('aria-label')) }));
  await page.screenshot({ path: `${DIR}/kr-selfcheck-${vp.width}.png` });
  await browser.close();
  return { vp: `${vp.width}x${vp.height}`, clipCount: clips.length, snapState, before, hold, after, holdBlockedCount: hold.added.filter((t) => t === BLOCKED).length, pressAdded: after.added.slice(hold.added.length), errors, forbidden, auth };
}
(async () => {
  const res = [];
  for (const vp of [{ width: 1280, height: 720 }, { width: 1440, height: 900 }]) res.push(await run(vp));
  fs.writeFileSync(`${DIR}/kr-selfcheck.json`, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
