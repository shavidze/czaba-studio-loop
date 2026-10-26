// C round 197 — context only: does an injected scroll-padding-top (what R89 did) reveal Video-row focus, and does it jump the view on sticky-chrome focus? Tree, 1280, rich scene. No source change.
process.env.C_BASE = 'http://127.0.0.1:5173';
const L = require('./lib.cjs'); const sleep = L.sleep; const W = 1280, H = 720; const fs = require('fs'); const path = require('path');
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
async function scene(page) {
  const o = page.locator('[role=option][data-source-id="demo-middle-east"]'); const ob = await o.boundingBox();
  const lb = await page.evaluate(() => { const l = document.querySelector('[data-track-id="music"] [data-grid-seconds]') || document.querySelector('[data-track-id="music"]'); const r = l.getBoundingClientRect(); return { x: r.left + r.width * 0.05, y: r.top + r.height / 2 }; });
  await page.mouse.move(ob.x + ob.width / 2, ob.y + ob.height / 2); await page.mouse.down(); await page.mouse.move(ob.x + ob.width / 2 + 12, ob.y + ob.height / 2, { steps: 3 }); await page.mouse.move(lb.x, lb.y, { steps: 14 }); await sleep(300); await page.mouse.up(); await sleep(900);
  await page.click(nameSel('stems')); await sleep(200); await page.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200); await page.mouse.click(5, H - 5); await sleep(150); await page.keyboard.press('Control+g'); await sleep(700);
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
  const t = page.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = page.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await page.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
}
const sc = (page) => page.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop);
(async () => {
  const browser = await L.launch(); const net = []; const R = {};
  for (const inject of [false, true]) {
    const { page, ctx } = await L.openStudio(browser, { width: W, height: H }, `r89-${inject}`, net, { deviceScaleFactor: 2 });
    await scene(page);
    const chromeH = await page.evaluate((inject) => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const c = s.querySelector('.sticky.top-0'); if (inject) s.style.scrollPaddingTop = `${c.offsetHeight}px`; return c.offsetHeight; }, inject);
    const r = { chromeH };
    // chrome focus while scrolled
    await page.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop = 46; }); await sleep(200); r.st0 = await sc(page);
    await page.mouse.move(W - 2, H - 2); await L.blur(page);
    await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); await sleep(300); r.afterFlagFocus = await sc(page);
    // Tab from the flag into the Video row: tops vs chrome bottom
    await page.evaluate(() => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollTop = 0; }); await sleep(200);
    await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus({ preventScroll: true })); r.tabs = [];
    for (let i = 0; i < 7; i++) { await page.keyboard.press('Tab'); await sleep(200); r.tabs.push(await page.evaluate(() => { const a = document.activeElement; const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const c = s.querySelector('.sticky.top-0'); return { id: a.dataset.testid || a.getAttribute('aria-label'), top: +a.getBoundingClientRect().top.toFixed(1), chromeBottom: +c.getBoundingClientRect().bottom.toFixed(1), st: s.scrollTop }; })); }
    R[inject ? 'injected' : 'none'] = r; await ctx.close();
  }
  await browser.close(); L.save(path.join(__dirname, '..', 'out'), 'r89-repro.json', R); console.log(JSON.stringify(R, null, 0));
})().catch((e) => { console.error(e); process.exit(1); });
