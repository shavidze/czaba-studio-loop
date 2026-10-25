// C round 165: MK-GESTURE (real mouse + Shift+Tab + F2), MK-ENTER-OPEN (synthetic pointer + real Enter), MK-POSITIVE (no gesture).
const X = require('./tools/lib122.cjs'); const { L, sleep } = X; const fs = require('fs');
const OUTF = process.argv[2]; const only = process.argv[3] || 'all';
const BLOCKED = 'Editing does not work while dragging — let go first.';
const flags = (p) => p.evaluate(() => [...document.querySelectorAll('[data-marker-label]')].map((s) => s.textContent));
const inputVal = (p) => p.evaluate(() => { const i = document.querySelector('[data-testid=arrangement-marker-name-input]'); return i ? i.value : null; });
const active = (p) => p.evaluate(() => { const a = document.activeElement; return a ? (a.dataset.testid || a.getAttribute('aria-label') || a.tagName).slice(0, 80) : null; });
const snap = async (p, seen) => { const s = { status: await L.status(p), undo: await X.undoTitle(p), flags: await flags(p), input: await inputVal(p), active: await active(p) }; seen.push(s.status, s.undo); return s; };
const hdrBox = (p, cid) => p.evaluate((cid) => { const c = document.querySelector(`[data-clip-id="${cid}"]`); const e = [...c.querySelectorAll('div[title]')].find((d) => /Move|Drag/i.test(d.title)) || c.firstElementChild; const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height, title: e.title.slice(0, 60) }; }, cid);
async function setup(b, W, label, net) {
  const { page: p, ctx } = await L.openStudio(b, X.VPS[W], label, net);
  await L.setSnapOff(p);
  await L.addAt(p, 'demo-middle-east', 'music', 0); await sleep(800);
  const cid = await p.evaluate(() => document.querySelector('[data-clip-kind=audio]').dataset.clipId);
  await L.seekTo(p, 5); await p.click('[data-testid=arrangement-marker-add]'); await sleep(200); await p.keyboard.press('Control+A'); await p.keyboard.type('Intro'); await p.keyboard.press('Enter'); await sleep(300); await L.blur(p);
  return { p, ctx, cid };
}
async function mkGesture(b, W, net) {
  const { p, ctx, cid } = await setup(b, W, `c165gest-${W}`, net); const seen = []; const r = { focusVia: 'real Shift+Tab while real mouse button held' };
  r.start = await snap(p, seen);
  const h = await hdrBox(p, cid); r.header = h; const cb0 = await X.clipBox(p, cid);
  const sx = h.x + 80, sy = h.y + h.h / 2;
  await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 40, sy, { steps: 5 }); await sleep(200);
  r.clipDxDuring = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  r.tabs = 0; for (let i = 0; i < 60; i++) { await p.keyboard.press('Shift+Tab'); r.tabs++; const a = await p.evaluate(() => document.activeElement && document.activeElement.dataset.testid); if (a === 'arrangement-marker') break; }
  r.duringFocus = await active(p);
  r.clipDxAfterTabs = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  await p.keyboard.press('F2'); await sleep(250);
  r.afterF2 = await snap(p, seen); r.afterF2.inputOpen = r.afterF2.input !== null;
  await p.screenshot({ path: OUTF.replace('.json', `-gesture-${W}-afterF2.png`) });
  if (r.afterF2.inputOpen) { await p.keyboard.press('Control+A'); await p.keyboard.type('Lost?'); await p.keyboard.press('Enter'); await sleep(250); r.afterEnter = await snap(p, seen); }
  await p.mouse.move(sx + 100, sy, { steps: 6 }); await sleep(150);
  r.afterMove = await snap(p, seen);
  await p.mouse.up(); await sleep(500);
  r.afterRelease = await snap(p, seen); r.afterRelease.clipDx = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  await L.blur(p);
  await p.keyboard.press('Control+z'); await sleep(300); r.afterUndo1 = await snap(p, seen);
  await p.keyboard.press('Control+z'); await sleep(300); r.afterUndo2 = await snap(p, seen);
  r.afterUndo2.clipDx = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  await p.screenshot({ path: OUTF.replace('.json', `-gesture-${W}-end.png`) });
  r.seen = seen; await ctx.close(); return r;
}
async function mkEnterOpen(b, W, net) {
  const { p, ctx, cid } = await setup(b, W, `c165enter-${W}`, net); const seen = []; const r = { harness: 'synthetic PointerEvent pointerdown/pointermove/pointerup on clip header; real keyboard Enter' };
  // remove Intro so the add count is unambiguous
  await L.seekTo(p, 12); r.start = await snap(p, seen);
  const cb0 = await X.clipBox(p, cid); const h = await hdrBox(p, cid);
  await p.click('[data-testid=arrangement-marker-add]'); await sleep(250);
  await p.keyboard.press('Control+A'); await p.keyboard.type('held');
  r.editorOpen = await snap(p, seen);
  const sx = h.x + 80, sy = h.y + h.h / 2;
  r.dispatch = await p.evaluate(({ cid, sx, sy }) => {
    const c = document.querySelector(`[data-clip-id="${cid}"]`); const e = [...c.querySelectorAll('div[title]')].find((d) => /Move|Drag/i.test(d.title)) || c.firstElementChild;
    const errs = []; window.addEventListener('error', (ev) => errs.push(String(ev.message)));
    const o = { button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, composed: true };
    e.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: sx, clientY: sy }));
    for (let i = 1; i <= 5; i++) e.dispatchEvent(new PointerEvent('pointermove', { ...o, clientX: sx + i * 8, clientY: sy }));
    window.__c165e = errs; return { target: e.title.slice(0, 50), errs };
  }, { cid, sx, sy });
  await sleep(250);
  r.clipDxBeforeEnter = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  r.beforeEnter = await snap(p, seen);
  r.gestureClaimed = r.clipDxBeforeEnter > 0;
  if (!r.gestureClaimed) { r.verdictHint = 'BLOCKED (harness): synthetic pointer claimed no gesture'; await ctx.close(); return r; }
  await p.keyboard.press('Enter'); await sleep(300);
  r.afterEnter = await snap(p, seen);
  await p.screenshot({ path: OUTF.replace('.json', `-enter-${W}-blocked.png`) });
  await p.evaluate(({ cid, sx, sy }) => {
    const c = document.querySelector(`[data-clip-id="${cid}"]`); const e = [...c.querySelectorAll('div[title]')].find((d) => /Move|Drag/i.test(d.title)) || c.firstElementChild;
    const o = { button: 0, buttons: 0, pointerId: 1, pointerType: 'mouse', isPrimary: true, bubbles: true, cancelable: true, composed: true, clientX: sx + 40, clientY: sy };
    e.dispatchEvent(new PointerEvent('pointerup', o));
  }, { cid, sx, sy });
  await sleep(400);
  r.afterUp = await snap(p, seen); r.afterUp.clipDx = +((await X.clipBox(p, cid)).x - cb0.x).toFixed(1);
  await p.keyboard.press('Enter'); await sleep(300);
  r.afterEnter2 = await snap(p, seen);
  await L.blur(p); await sleep(200); r.afterBlur = await snap(p, seen);
  await p.screenshot({ path: OUTF.replace('.json', `-enter-${W}-end.png`) });
  await ctx.close(); return r;
}
async function mkPositive(b, W, net) {
  const { p, ctx } = await setup(b, W, `c165pos-${W}`, net); const seen = []; const r = {};
  r.afterAdd = await snap(p, seen);
  const flag = p.locator('[data-testid=arrangement-marker]').first();
  await flag.focus(); await p.keyboard.press('F2'); await sleep(200); r.f2Open = await snap(p, seen);
  await p.keyboard.press('Control+A'); await p.keyboard.type('Verse'); await p.keyboard.press('Enter'); await sleep(300); r.afterRenameEnter = await snap(p, seen);
  await flag.focus(); await p.keyboard.press('F2'); await sleep(200); await p.keyboard.press('Control+A'); await p.keyboard.type('Nope'); await p.keyboard.press('Escape'); await sleep(300); r.afterEscape = await snap(p, seen);
  const fb = await flag.boundingBox(); await p.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' }); await sleep(300);
  r.menuOpen = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-menu]'));
  await p.locator('[data-testid=arrangement-marker-menu] [role=menuitem]', { hasText: 'Rename' }).first().click(); await sleep(250);
  r.menuRenameOpen = await snap(p, seen);
  await p.keyboard.press('Control+A'); await p.keyboard.type('Chorus'); await p.keyboard.press('Enter'); await sleep(300); r.afterMenuRename = await snap(p, seen);
  await L.blur(p);
  await p.keyboard.press('Control+z'); await sleep(300); r.undo1 = await snap(p, seen);
  await p.keyboard.press('Control+z'); await sleep(300); r.undo2 = await snap(p, seen);
  await p.keyboard.press('Control+Shift+z'); await sleep(300); r.redo1 = await snap(p, seen);
  await p.keyboard.press('Control+Shift+z'); await sleep(300); r.redo2 = await snap(p, seen);
  await p.screenshot({ path: OUTF.replace('.json', `-positive-${W}.png`) });
  await ctx.close(); return r;
}
(async () => {
  const b = await L.launch(); const res = { blocked: BLOCKED };
  for (const W of [1440, 1280]) {
    const net = [];
    if (only === 'all' || only === 'gesture') res[`gesture-${W}`] = await mkGesture(b, W, net);
    if (only === 'all' || only === 'enter') res[`enter-${W}`] = await mkEnterOpen(b, W, net);
    if (only === 'all' || only === 'positive') res[`positive-${W}`] = await mkPositive(b, W, net);
    res[`net-${W}`] = X.netOk(net); res[`netRaw-${W}`] = net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise }));
    fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
  }
  await b.close(); fs.writeFileSync(OUTF, JSON.stringify(res, null, 1)); console.log('done');
})();
