// C round 213 — STUDIO-SMOKE-213. Fresh context, no credentials. Add demo clip, select it, expand detail if collapsed,
// drag the Clip Gain fader with the real mouse, release, check one Undo entry, then Undo and check the value is restored.
// usage: node smoke213.cjs <vw> <vh>
const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:5173';
const OUT = path.join(__dirname, '..', 'out');
const SHOTS = path.join(__dirname, '..', 'shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const [vw, vh] = [Number(process.argv[2] || 1440), Number(process.argv[3] || 900)];

function init() {
  const W = window;
  W.__g = { writes: [] };
  const AP = AudioParam.prototype;
  for (const m of ['setValueAtTime', 'setTargetAtTime', 'linearRampToValueAtTime', 'cancelScheduledValues']) {
    const o = AP[m];
    AP[m] = function (...a) { W.__g.writes.push({ t: performance.now(), m, v: a[0] }); return o.apply(this, a); };
  }
  const d = Object.getOwnPropertyDescriptor(AP, 'value');
  Object.defineProperty(AP, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { W.__g.writes.push({ t: performance.now(), m: 'value=', v }); d.set.call(this, v); } });
}

const undoState = (page) => page.evaluate(() => {
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || x.getAttribute('aria-label') || ''));
  const r = [...document.querySelectorAll('button')].find((x) => /^Redo/.test(x.getAttribute('title') || x.getAttribute('aria-label') || ''));
  return { undo: u ? { title: u.getAttribute('title'), label: u.getAttribute('aria-label'), disabled: u.disabled } : null, redo: r ? { title: r.getAttribute('title'), disabled: r.disabled } : null };
});

async function gainState(page) {
  return page.evaluate(() => {
    const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-input]');
    const fd = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]');
    return { field: f ? f.value : null, pending: f ? f.getAttribute('data-pending') : null, fader: fd ? fd.value : null, vt: fd ? fd.getAttribute('aria-valuetext') : null, faderLabel: fd ? fd.getAttribute('aria-label') : null };
  });
}

(async () => {
  const R = { vw, vh, utc: new Date().toISOString() };
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const errors = [];
  const consoleErr = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text().slice(0, 200)); });
  try {
    await page.goto(BASE + '/studio-lab', { waitUntil: 'load', timeout: 120000 });
    const add = page.getByRole('button', { name: 'Add', exact: true }).first();
    await add.waitFor({ timeout: 90000 });
    await sleep(2500);
    R.authUser = await page.evaluate(() => localStorage.getItem('auth_user'));
    R.clipsBefore = await page.locator('[data-clip-kind="audio"]').count();
    await add.click();
    await sleep(2000);
    R.clipsAfterAdd = await page.locator('[data-clip-kind="audio"]').count();
    const p = await page.evaluate(() => {
      const clip = document.querySelector('[data-clip-kind="audio"]');
      if (!clip) return null;
      const b = clip.getBoundingClientRect();
      const y = b.top + 10;
      for (let x = Math.max(b.left, 0) + 6; x < Math.min(b.right, innerWidth) - 2; x += 4) { const h = document.elementFromPoint(x, y); if (h && clip.contains(h)) return { x, y, id: clip.getAttribute('data-clip-id') }; }
      return null;
    });
    R.clipPoint = p;
    await page.mouse.click(p.x, p.y);
    await sleep(500);
    R.selected = await page.evaluate((id) => { const c = document.querySelector(`[data-clip-id="${id}"]`); return c ? { ariaSelected: c.getAttribute('aria-selected'), dataSelected: c.getAttribute('data-selected') } : null; }, p.id);
    const tg = page.getByTestId('arrangement-detail-toggle');
    R.detailToggleInitial = (await tg.count()) ? await tg.getAttribute('aria-expanded') : 'absent';
    if (R.detailToggleInitial === 'false') { await tg.click(); await sleep(700); }
    R.detailToggleAfter = (await tg.count()) ? await tg.getAttribute('aria-expanded') : 'absent';
    const fd = page.getByTestId('arrangement-detail-clip-gain-fader');
    await fd.scrollIntoViewIfNeeded();
    R.before = await gainState(page);
    R.undoBefore = await undoState(page);
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-before.png`) });
    const bx = await fd.boundingBox();
    R.faderBox = bx;
    const y = bx.y + bx.height / 2;
    const x0 = bx.x + bx.width / 2;
    await page.evaluate(() => { window.__g.writes = []; });
    await page.mouse.move(x0, y);
    await page.mouse.down();
    await page.mouse.move(x0 + 8, y, { steps: 8 });
    R.during = await gainState(page);
    R.undoDuring = await undoState(page);
    await page.mouse.up();
    await sleep(700);
    R.after = await gainState(page);
    R.undoAfter = await undoState(page);
    R.gainParamWritesDuringDrag = await page.evaluate(() => window.__g.writes.length);
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-after-drag.png`) });
    await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); });
    const undoBtn = page.locator('button[title^="Undo"]').first();
    R.undoVia = (await undoBtn.count()) ? 'button' : 'Control+z';
    if (R.undoVia === 'button') await undoBtn.click(); else await page.keyboard.press('Control+z');
    await sleep(700);
    R.afterUndo = await gainState(page);
    R.undoAfterUndo = await undoState(page);
    await page.screenshot({ path: path.join(SHOTS, `smoke-${vw}-after-undo.png`) });
  } catch (e) { R.fatal = String((e && e.stack) || e).slice(0, 1500); }
  R.pageErrors = errors;
  R.consoleErrors = consoleErr.filter((t) => !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource|net::ERR|5199/i.test(t));
  const v = (s) => (s ? s.field : null);
  R.verdict = {
    valueChanged: !!(R.after && R.before && v(R.after) !== v(R.before)),
    oneUndoEntry: !!(R.undoAfter && R.undoAfter.undo && R.undoAfter.undo.title === 'Undo: Clip Gain' && R.undoDuring && R.undoBefore && R.undoDuring.undo.title === R.undoBefore.undo.title && R.undoAfterUndo && R.undoAfterUndo.undo.title === R.undoBefore.undo.title && R.undoAfterUndo.redo && R.undoAfterUndo.redo.title === 'Redo: Clip Gain'),
    undoRestored: !!(R.afterUndo && R.before && v(R.afterUndo) === v(R.before) && R.afterUndo.fader === R.before.fader),
    pageErrors: errors.length,
  };
  await browser.close();
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `smoke-${vw}.json`), JSON.stringify(R, null, 2));
  console.log(JSON.stringify(R, null, 1));
})();
