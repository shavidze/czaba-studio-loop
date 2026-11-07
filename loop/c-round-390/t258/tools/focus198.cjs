// C round 198 — FOCUS-REVEAL-198 + RING-KEY-198: full Tab cycle forward and Shift+Tab back, per stop scroll/geometry/ring.
// node focus198.cjs <port> <W> <rich|default>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const K = require('./rk-lib.cjs');
const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720; const SCENE = process.argv[4] || 'rich';
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}-${SCENE}`;
const OUT = path.join(__dirname, '..', 'out', 'focus', TAG); fs.mkdirSync(OUT, { recursive: true });
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
async function libDrop(p, src, lane, xFrac) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const t0 = Date.now(); while (Date.now() - t0 < 60000 && (await o.getAttribute('draggable')) !== 'true') await sleep(200);
  const ob = await o.boundingBox();
  const lb = await p.evaluate((t) => { const l = document.querySelector(`[data-track-id="${t}"]`); const g = l.querySelector('[data-grid-seconds]') || l; const r = g.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; }, lane);
  await p.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await p.mouse.down();
  await p.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 });
  await p.mouse.move(lb.x + lb.w * xFrac, lb.y + lb.h / 2, { steps: 14 }); await sleep(300); await p.mouse.up(); await sleep(900);
}
async function richScene(page) {
  await libDrop(page, 'demo-middle-east', 'music', 0.05);
  await page.click(nameSel('stems')); await sleep(200); await page.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await page.mouse.click(5, H - 5); await sleep(150); await page.keyboard.press('Control+g'); await sleep(700);
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(500);
  const t = page.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = page.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await page.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
  return page.evaluate(() => ({ clips: document.querySelectorAll('[data-clip-id]').length, groups: document.querySelectorAll('[data-testid=arrangement-group-volume]').length, markers: document.querySelectorAll('[data-testid=arrangement-marker]').length, clipGain: !!document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]') }));
}
const geom = () => {
  const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const chrome = sc.firstElementChild.firstElementChild; const a = document.activeElement;
  const cb = chrome.getBoundingClientRect().bottom; const r = a ? a.getBoundingClientRect() : null; const inSc = !!a && sc.contains(a) && a !== sc; const inCh = !!a && chrome.contains(a);
  return { st: sc.scrollTop, sl: sc.scrollLeft, chromeBottom: +cb.toFixed(2), scBottom: +sc.getBoundingClientRect().bottom.toFixed(2), top: r ? +r.top.toFixed(2) : null, bottom: r ? +r.bottom.toFixed(2) : null, inScroller: inSc, inChrome: inCh, hidden: inSc && !inCh && r.top < cb - 0.5, belowBottom: inSc && !inCh && r.bottom > sc.getBoundingClientRect().bottom + 0.5, fs: document.documentElement.dataset.focusSource || null, chromeTestid: chrome.dataset.testid || null };
};
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `focus-${TAG}`, net, { deviceScaleFactor: 2 });
  const load = await page.evaluate(() => { const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return { st: sc.scrollTop, sl: sc.scrollLeft, chromeH: sc.firstElementChild.firstElementChild.offsetHeight, scH: sc.clientHeight, max: sc.scrollHeight - sc.clientHeight }; });
  const setup = SCENE === 'rich' ? await richScene(page) : null;
  await page.screenshot({ path: path.join(OUT, 'scene.png') });
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  const rows = []; let first = null;
  for (let i = 0; i < 220; i++) {
    await page.keyboard.press('Tab'); await sleep(120);
    const g = await page.evaluate(geom);
    const d = await K.record(page, i, OUT, W, H, true); if (!d) { rows.push({ i, id: '(body)', g }); continue; }
    d.g = g;
    const same = await page.evaluate(() => { if (!window.__c198first) { window.__c198first = document.activeElement; return false; } return window.__c198first === document.activeElement; });
    if (same && i > 3) { d.wrap = true; rows.push(d); break; }
    rows.push(d);
  }
  const back = [];
  const n = rows.length - 1;
  for (let i = 0; i < n + 2; i++) {
    await page.keyboard.press('Shift+Tab'); await sleep(120);
    const g = await page.evaluate(geom);
    const d = await K.record(page, 600 + i, OUT, W, H, g.inScroller && !g.inChrome);
    back.push(d ? { ...d, g } : { i, id: '(body)', g });
  }
  const summ = (arr) => arr.filter((x) => x.g && x.g.inScroller && !x.g.inChrome);
  const fsc = summ(rows), bsc = summ(back);
  const res = { W, PORT, SCENE, load, setup, stops: rows.length, scrollerStopsF: fsc.length, scrollerStopsB: bsc.length,
    hiddenF: fsc.filter((x) => x.g.hidden).map((x) => `${x.i}:${x.id}@${x.g.top}<${x.g.chromeBottom} st${x.g.st}`),
    hiddenB: bsc.filter((x) => x.g.hidden).map((x) => `${x.i}:${x.id}@${x.g.top}<${x.g.chromeBottom} st${x.g.st}`),
    zeroRingF: fsc.filter((x) => x.px && x.px !== 'offscreen' && x.px.changed === 0).map((x) => `${x.i}:${x.id}`),
    zeroRingB: bsc.filter((x) => x.px && x.px !== 'offscreen' && x.px.changed === 0).map((x) => `${x.i}:${x.id}`),
    offscreenF: fsc.filter((x) => x.px === 'offscreen').map((x) => `${x.i}:${x.id}`),
    slChanges: [...rows, ...back].filter((x) => x.g && x.g.sl !== 0).length,
    chromeTestid: rows.find((x) => x.g) && rows.find((x) => x.g).g.chromeTestid };
  L.save(OUT, 'result.json', { res, rows, back, net: log });
  console.log(TAG, JSON.stringify(res), 'errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
