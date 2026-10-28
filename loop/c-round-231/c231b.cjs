// C round 231 follow-up: fold, gesture control, drag onto SFX, SD flash paint check. usage: node c231b.cjs <outDir>
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const outDir = process.argv[2];
fs.mkdirSync(outDir, { recursive: true });
const R = { started: new Date().toISOString() };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const save = () => fs.writeFileSync(path.join(outDir, 'c231b.json'), JSON.stringify(R, null, 2));
const KEY = 'czaba-studio-notice-dismissed:studio-lab-demo';

async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, undefined, { timeout: 90000 });
  await sleep(1200);
  return { ctx, page, errs };
}
const hints = (page) => page.evaluate(() => [...document.querySelectorAll('[data-testid="arrangement-lane-empty-hint"]')].map((h) => { const r = h.getBoundingClientRect(); return { track: h.closest('[data-track-id]')?.getAttribute('data-track-id'), box: [r.x, r.y, r.width, r.height] }; }));
const rangeInfo = (page) => page.evaluate(() => ({ footerRange: document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? null, rangeEls: [...document.querySelectorAll('[data-range-start]')].map((e) => [e.getAttribute('data-range-start'), e.getAttribute('data-range-end')]), anyRangeTestids: [...document.querySelectorAll('[data-testid*="range"]')].map((e) => e.getAttribute('data-testid') + ':' + (e.textContent || '').trim().slice(0, 50)), playhead: document.querySelector('[data-testid="arrangement-time"]')?.textContent ?? null }));
const clips = (page) => page.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ start: c.getAttribute('data-clip-start'), track: c.closest('[data-track-id]')?.getAttribute('data-track-id') })));

async function run(browser, vp) {
  const key = `${vp.width}x${vp.height}`; const r = {}; R[key] = r;
  let { ctx, page, errs } = await open(browser, vp);
  // Fold on fresh page
  const fold = page.locator('[data-track-id="music"] [data-testid="arrangement-track-fold"]');
  r.fold = { count: await fold.count(), expandedBefore: await fold.getAttribute('aria-expanded'), hintsBefore: (await hints(page)).map((h) => h.track) };
  await fold.click(); await sleep(600);
  r.fold.expandedAfter = await fold.getAttribute('aria-expanded');
  r.fold.hintsFolded = (await hints(page)).map((h) => h.track);
  r.fold.musicHeight = await page.evaluate(() => document.querySelector('[data-track-id="music"]').getBoundingClientRect().height);
  await page.screenshot({ path: path.join(outDir, `fold-${key}.png`) });
  await fold.click(); await sleep(600);
  r.fold.expandedAgain = await fold.getAttribute('aria-expanded');
  r.fold.hintsUnfolded = (await hints(page)).map((h) => h.track);
  // Gesture over the hint vs control on SFX lane (no hint)
  const h = (await hints(page))[0];
  const y = h.box[1] + h.box[3] / 2; const x0 = h.box[0] + 30;
  r.gesture = { before: await rangeInfo(page) };
  await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move(x0 + 160, y, { steps: 15 }); await sleep(100);
  r.gesture.mid = await rangeInfo(page);
  await page.mouse.up(); await sleep(500);
  r.gesture.afterHint = await rangeInfo(page);
  r.gesture.hitAtStart = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.getAttribute('data-testid') || e.tagName) + ' in ' + e.closest('[data-track-id]')?.getAttribute('data-track-id'); }, [x0, y]);
  await page.screenshot({ path: path.join(outDir, `gesture-hint-${key}.png`) });
  await ctx.close();
  ({ ctx, page, errs } = await open(browser, vp));
  const sfx = await page.locator('[data-track-id="sfx"]').boundingBox();
  const ys = sfx.y + sfx.height / 2;
  await page.mouse.move(x0, ys); await page.mouse.down(); await page.mouse.move(x0 + 160, ys, { steps: 15 }); await page.mouse.up(); await sleep(500);
  r.gesture.controlSfx = await rangeInfo(page);
  await page.screenshot({ path: path.join(outDir, `gesture-control-${key}.png`) });
  await ctx.close();
  // Drag a library option onto SFX lane, real mouse
  ({ ctx, page, errs } = await open(browser, vp));
  const o = await page.locator('[role="option"]').first().boundingBox();
  const sb = await page.locator('[data-track-id="sfx"]').boundingBox();
  await page.mouse.move(o.x + o.width / 2, o.y + o.height / 2); await page.mouse.down();
  await page.mouse.move(o.x + o.width / 2 + 30, o.y + o.height / 2, { steps: 5 });
  await page.mouse.move(sb.x + 420, sb.y + sb.height / 2, { steps: 25 }); await sleep(200);
  r.dragSfx = { midHints: (await hints(page)).map((x) => x.track) };
  await page.mouse.up(); await sleep(1500);
  r.dragSfx.clips = await clips(page); r.dragSfx.hintsAfter = (await hints(page)).map((x) => x.track);
  await page.screenshot({ path: path.join(outDir, `drag-sfx-${key}.png`) });
  r.errors = errs;
  await ctx.close();
  // SD paint check: is the SSR notice ever painted visibly?
  const c2 = await browser.newContext({ viewport: vp });
  await c2.addInitScript((k) => {
    try { localStorage.setItem(k, '1'); } catch {}
    window.__frames = [];
    const tick = () => {
      const n = document.querySelector('[data-testid="arrangement-library-notice"]');
      if (n) {
        let op = 1; for (let e = n; e; e = e.parentElement) { const c = getComputedStyle(e); op *= Number(c.opacity); if (c.visibility === 'hidden' || c.display === 'none') op = 0; }
        const r = n.getBoundingClientRect();
        window.__frames.push({ t: +performance.now().toFixed(1), present: true, effOpacity: +op.toFixed(3), w: r.width, color: getComputedStyle(n).color, sheets: document.styleSheets.length });
      } else window.__frames.push({ t: +performance.now().toFixed(1), present: false });
      if (performance.now() < 4000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, KEY);
  const pg = await c2.newPage();
  await pg.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await sleep(4500);
  const fr = await pg.evaluate(() => window.__frames);
  const present = fr.filter((f) => f.present);
  const visible = present.filter((f) => f.effOpacity > 0.05 && f.w > 0);
  r.SDpaint = { frames: fr.length, presentFrames: present.length, visibleFrames: visible.length, firstPresent: present[0] || null, lastPresent: present[present.length - 1] || null, firstVisible: visible[0] || null, lastVisible: visible[visible.length - 1] || null, firstAbsent: fr.find((f) => !f.present && f.t > (present[0]?.t ?? 0)) || null };
  await c2.close();
  save();
}
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    try { await run(browser, vp); } catch (e) { R[`${vp.width}x${vp.height}`] = { ...(R[`${vp.width}x${vp.height}`] || {}), error: String(e).slice(0, 800) }; }
    save();
  }
  await browser.close(); R.finished = new Date().toISOString(); save(); console.log('done');
})();
