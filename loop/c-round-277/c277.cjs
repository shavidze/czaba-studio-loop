// C round 277: B-MATCH-SPLIT / LOOP / UNDO in real Chromium on /studio-lab. usage: node c277.cjs
const path = require('node:path'); const fs = require('node:fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const BASE = 'http://127.0.0.1:5173';
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-277';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const R = { startedAt: new Date().toISOString(), rows: {} };
const save = () => fs.writeFileSync(path.join(outDir, process.env.OUT || 'c277-bmatch.json'), JSON.stringify(R, null, 1));
const INIT = () => {
  window.__T = () => {
    const tr = document.querySelector('[data-testid="arrangement-transport"]'); if (!tr) return {};
    const byText = (re) => [...tr.querySelectorAll('button')].find((b) => re.test((b.textContent || '').trim()));
    return { undo: byText(/^Undo/), redo: byText(/^Redo/), split: byText(/^Split/),
      loop: [...tr.querySelectorAll('button[aria-pressed]')].find((b) => /Loop/i.test(b.textContent + (b.getAttribute('title') || ''))) };
  };
  window.__name = (el) => { if (!el) return null; if (el === document.body) return 'BODY'; const T = window.__T(); for (const [k, v] of Object.entries(T)) if (v === el) return k; return ((el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40)) + '|' + el.tagName; };
  window.__attrs = (k) => { const b = window.__T()[k]; if (!b) return null; return { ariaDisabled: b.getAttribute('aria-disabled'), hasDisabledAttr: b.hasAttribute('disabled'), disabledProp: b.disabled, title: b.getAttribute('title'), pressed: b.getAttribute('aria-pressed') }; };
  window.__state = () => ({ clips: document.querySelectorAll('[data-clip-kind="audio"]').length, ranges: document.querySelectorAll('[data-testid="arrangement-range"], [data-testid="arrangement-lane-range"]').length, braces: document.querySelectorAll('[data-testid="arrangement-loop-brace"]').length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null, active: window.__name(document.activeElement) });
};
const blur = (page) => page.evaluate(() => { if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur(); });
async function open(browser, vp) {
  const ctx = await browser.newContext({ viewport: vp }); await ctx.addInitScript(INIT);
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await sleep(2000); return { ctx, page, errors };
}
async function addPulse(page) { await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await sleep(250); await page.locator('button', { hasText: /^Add/ }).first().click(); await sleep(1000); await blur(page); }
const clipPoint = (page) => page.evaluate(() => { const c = document.querySelector('[data-clip-kind="audio"]'); const r = c.getBoundingClientRect(); const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect(); const left = Math.max(r.left, sc.left + 224 + 4); const right = Math.min(r.right, sc.right - 14); return { x: left + Math.min(40, (right - left) / 2), ty: r.top + 10 }; });
// an empty lane: a lane (data-track-id) that contains no audio clip; point in its visible middle
const emptyLanePoint = (page) => page.evaluate(() => {
  const sc = document.querySelector('[data-testid="arrangement-timeline-scroller"]').getBoundingClientRect();
  const lanes = [...document.querySelectorAll('[data-track-id]')].filter((l) => !l.querySelector('[data-clip-kind]') && l.getAttribute('data-track-id') !== 'video');
  for (const l of lanes) { const r = l.getBoundingClientRect(); if (r.height < 20 || r.top < sc.top || r.bottom > sc.bottom || r.width < 300) continue; const x0 = Math.max(r.left, sc.left + 240); return { x: x0 + 60, y: r.top + r.height / 2, track: l.getAttribute('data-track-id'), tag: l.tagName, w: r.width, h: r.height }; }
  return null; });
const A = (page, k) => page.evaluate((key) => window.__attrs(key), k);
const S = (page) => page.evaluate(() => window.__state());
async function tabTo(page, k, max = 200) { for (let i = 0; i < max; i += 1) { if (await page.evaluate((key) => document.activeElement === window.__T()[key], k)) return i; await page.keyboard.press('Tab'); await sleep(40); } return -1; }
const ringOf = (page) => page.evaluate(() => { const b = document.activeElement; const cs = getComputedStyle(b); return { fv: b.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset }; });

async function rowSplit(browser, vp, k) {
  const { ctx, page, errors } = await open(browser, vp); const r = {};
  r.emptyDemo = await S(page); r.empty = await A(page, 'split');
  await addPulse(page); r.afterAdd = await A(page, 'split'); r.afterAddState = await S(page);
  { const e = await emptyLanePoint(page); r.deselectAt = e; await page.mouse.click(e.x + 300, e.y); await sleep(600); }
  r.deselected = await A(page, 'split'); r.deselectedState = await S(page);
  await page.screenshot({ path: path.join(outDir, `bmatch-split-deselected-${k}.png`) });
  const p = await clipPoint(page); await page.mouse.click(p.x, p.ty); await sleep(500);
  r.clipSelected = await A(page, 'split'); r.clipSelState = await S(page);
  await page.screenshot({ path: path.join(outDir, `bmatch-split-selected-${k}.png`) });
  r.errors = errors;
  const NT = 'Split — select a clip or make a time selection first (Ctrl+E)';
  r.pass = r.empty.ariaDisabled === 'true' && !r.empty.hasDisabledAttr && r.empty.title === NT && r.deselected.ariaDisabled === 'true' && !r.deselected.hasDisabledAttr && r.deselected.title === NT
    && r.clipSelected.ariaDisabled === null && !r.clipSelected.hasDisabledAttr && r.clipSelected.title === 'Split at the insert marker (Ctrl+E)';
  await ctx.close(); return r;
}
async function rowLoop(browser, vp, k) {
  const { ctx, page, errors } = await open(browser, vp); const r = {};
  await addPulse(page);
  r.noRange = await A(page, 'loop'); r.noRangeState = await S(page);
  const e = await emptyLanePoint(page); r.emptyLane = e;
  await page.mouse.move(e.x, e.y); await page.mouse.down(); await page.mouse.move(e.x + 120, e.y, { steps: 10 }); await page.mouse.up(); await sleep(500);
  r.withRange = await A(page, 'loop'); r.withRangeState = await S(page);
  await page.screenshot({ path: path.join(outDir, `bmatch-loop-range-${k}.png`) });
  await blur(page); await page.keyboard.press('Control+l'); await sleep(500);
  r.afterCtrlL = await A(page, 'loop'); r.afterCtrlLState = await S(page);
  const e2 = await emptyLanePoint(page);
  await page.mouse.click(e2.x + 300, e2.y); await sleep(600);
  r.cleared = await A(page, 'loop'); r.clearedState = await S(page);
  await page.screenshot({ path: path.join(outDir, `bmatch-loop-cleared-${k}.png`) });
  r.errors = errors;
  r.pass = r.noRange.ariaDisabled === 'true' && !r.noRange.hasDisabledAttr && r.noRange.title === 'Loop: make a time selection first (Ctrl+L)'
    && r.withRangeState.ranges >= 1 && r.withRange.ariaDisabled === null && !r.withRange.hasDisabledAttr
    && r.afterCtrlL.pressed === 'true'
    && r.clearedState.ranges === 0 && r.cleared.ariaDisabled === null && !r.cleared.hasDisabledAttr && r.cleared.title === 'Loop on / off (Ctrl+L)';
  await ctx.close(); return r;
}
async function rowUndo(browser, vp, k, withLoop) {
  const { ctx, page, errors } = await open(browser, vp); const r = { withLoop };
  await addPulse(page);
  if (withLoop) { const e = await emptyLanePoint(page); await page.mouse.move(e.x, e.y); await page.mouse.down(); await page.mouse.move(e.x + 120, e.y, { steps: 10 }); await page.mouse.up(); await sleep(400); await blur(page); await page.keyboard.press('Control+l'); await sleep(500); }
  r.before = await S(page); r.undoBefore = await A(page, 'undo');
  await blur(page); r.tabs = await tabTo(page, 'undo'); r.onUndo = await S(page);
  r.presses = [];
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Enter'); await sleep(600);
    const st = await S(page); const u = await A(page, 'undo'); r.presses.push({ st, u, redo: await A(page, 'redo') });
    if (u.ariaDisabled === 'true' || st.active !== 'undo') break;
  }
  r.last = r.presses[r.presses.length - 1]; r.ring = await ringOf(page);
  await page.screenshot({ path: path.join(outDir, `bmatch-undo${withLoop ? '-loop' : ''}-${k}.png`) });
  r.errors = errors;
  r.pass = r.tabs >= 0 && r.last.u.ariaDisabled === 'true' && !r.last.u.hasDisabledAttr && r.last.st.active === 'redo' && r.ring.fv && !/^none/.test(r.ring.outline) && r.last.redo.ariaDisabled === null;
  await ctx.close(); return r;
}
(async () => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const k = `${vp.width}x${vp.height}`;
    for (const [name, fn] of [['split', rowSplit], ['loop', rowLoop], ['undo', (b, v, kk) => rowUndo(b, v, kk, false)], ['undoLoop', (b, v, kk) => rowUndo(b, v, kk, true)]]) {
      if (process.env.ONLY && !new RegExp(process.env.ONLY).test(name)) continue; const t0 = Date.now();
      try { R.rows[`${name}@${k}`] = await fn(browser, vp, k); } catch (e) { R.rows[`${name}@${k}`] = { error: String(e).slice(0, 800) }; }
      R.rows[`${name}@${k}`].ms = Date.now() - t0; save(); console.log(`${name}@${k}`, 'pass=', R.rows[`${name}@${k}`].pass, R.rows[`${name}@${k}`].error || '');
    }
  }
  await browser.close();
})();
