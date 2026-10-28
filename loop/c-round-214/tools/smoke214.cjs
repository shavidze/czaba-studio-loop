// C round 214 — STUDIO-SMOKE-214. Fresh context, no credentials. Add the demo clip, drag its fade-in
// handle with the real mouse, check exactly one new Undo entry, Undo, check the fade is restored.
// usage: node smoke214.cjs <vw> <vh> [base]
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const [vw, vh] = [Number(process.argv[2] || 1440), Number(process.argv[3] || 900)];
const BASE = process.argv[4] || 'http://127.0.0.1:5173';
const OUT = path.join(__dirname, '..', 'out');
const SHOTS = path.join(__dirname, '..', 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const undoState = (page) => page.evaluate(() => {
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  const r = [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.getAttribute('title') || ''));
  return { undo: u ? { title: u.getAttribute('title'), disabled: u.disabled } : null, redo: r ? { title: r.getAttribute('title'), disabled: r.disabled } : null };
});
const clipState = (page) => page.evaluate(() => {
  const c = document.querySelector('[data-clip-kind="audio"]');
  return c ? { fadeIn: c.getAttribute('data-fade-in'), start: c.getAttribute('data-clip-start'), w: +c.getBoundingClientRect().width.toFixed(2) } : null;
});

(async () => {
  const R = { vw, vh, base: BASE, utc: new Date().toISOString() };
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  const errors = [];
  const consoleErr = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 200)); });
  try {
    await page.goto(BASE + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const add = page.getByRole('button', { name: 'Add', exact: true }).first();
    await add.waitFor({ timeout: 90000 });
    await page.waitForFunction(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Add'); return b && !b.disabled; }, null, { timeout: 90000 });
    await sleep(1500);
    R.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    R.demoBadge = await page.evaluate(() => document.body.innerText.includes('Demo collection — no sign-in required'));
    R.clipsBefore = await page.locator('[data-clip-kind="audio"]').count();
    R.undoInitial = await undoState(page);
    await add.click();
    await page.waitForFunction(() => document.querySelectorAll('[data-testid=arrangement-clip-waveform]').length === 1, null, { timeout: 60000 });
    await sleep(800);
    R.clipsAfterAdd = await page.locator('[data-clip-kind="audio"]').count();
    R.before = await clipState(page);
    R.undoBefore = await undoState(page);
    const h = page.getByTestId('arrangement-clip-fade-in-handle').first();
    const bx = await h.boundingBox();
    R.handleBox = bx;
    const x0 = bx.x + bx.width / 2;
    const y0 = bx.y + bx.height / 2;
    R.hit = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? (e.getAttribute('data-testid') || e.tagName) : null; }, { x: x0, y: y0 });
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-before.png`) });
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    await page.mouse.move(x0 + 40, y0, { steps: 10 });
    R.during = await clipState(page);
    R.undoDuring = await undoState(page);
    await page.mouse.up();
    await sleep(700);
    R.after = await clipState(page);
    R.undoAfter = await undoState(page);
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-after-drag.png`) });
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    await page.keyboard.press('Control+z');
    await sleep(700);
    R.afterUndo = await clipState(page);
    R.undoAfterUndo = await undoState(page);
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-after-undo.png`) });
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  R.pageErrors = errors;
  R.consoleErrorsNonNoise = consoleErr.filter((t) => !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|5199|fetch failed/i.test(t));
  const f = (s) => (s ? Number(s.fadeIn) : NaN);
  R.verdict = {
    fadeChanged: f(R.after) > f(R.before),
    liveDuringDrag: f(R.during) > f(R.before),
    oneUndoEntry: !!(R.undoAfter?.undo && R.undoBefore?.undo && R.undoAfter.undo.title !== R.undoBefore.undo.title && R.undoAfterUndo?.undo?.title === R.undoBefore.undo.title && R.undoAfterUndo?.redo && !R.undoAfterUndo.redo.disabled),
    undoRestored: !!(R.afterUndo && R.before && R.afterUndo.fadeIn === R.before.fadeIn && R.afterUndo.start === R.before.start && R.afterUndo.w === R.before.w),
    pageErrors: errors.length,
  };
  await browser.close();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `smoke-${vw}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 1));
})();
