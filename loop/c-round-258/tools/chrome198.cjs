// C round 198 — CHROME-FOCUS-198, POINTER-198, SIDE-198 on the rich scene.
// node chrome198.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs');
const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1280); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'chrome', TAG); fs.mkdirSync(OUT, { recursive: true });
const nameSel = (t) => `[data-track-id="${t}"] [data-testid=arrangement-track-header] button[aria-label$="set as the active track"]`;
const SC = '[data-testid=arrangement-timeline-scroller]';
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
}
const S = (page) => page.evaluate((s) => { const sc = document.querySelector(s); return { st: sc.scrollTop, sl: sc.scrollLeft }; }, SC);
const setTop = async (page, v) => { await page.evaluate(([s, v]) => { const sc = document.querySelector(s); sc.scrollTop = v; }, [SC, v]); await sleep(250); return S(page); };
const toMax = (page) => setTop(page, 1e6);
const act = (page) => page.evaluate((s) => { const a = document.activeElement; const sc = document.querySelector(s); const ch = sc.firstElementChild.firstElementChild; const c = a ? getComputedStyle(a) : null; const r = a ? a.getBoundingClientRect() : null;
  return { id: a ? (a.dataset.testid || a.getAttribute('aria-label') || a.tagName) : null, inChrome: !!a && ch.contains(a), top: r ? +r.top.toFixed(2) : null, cb: +ch.getBoundingClientRect().bottom.toFixed(2), os: c ? c.outlineStyle : null, ow: c ? c.outlineWidth : null, fv: a ? a.matches(':focus-visible') : null, fs: document.documentElement.dataset.focusSource || null,
    markerMenu: !!document.querySelector('[data-testid=arrangement-marker-menu]'), gridMenu: !!document.querySelector('[data-testid=arrangement-grid-menu]'), rename: !!document.querySelector('[data-testid=arrangement-marker-row] input, [data-testid=arrangement-marker-editor] input, input[aria-label*="arker"]') }; }, SC);
const blurAll = (page) => page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `chrome-${TAG}`, net, { deviceScaleFactor: 2 });
  await richScene(page);
  const R = { W, PORT, max: await toMax(page), steps: [] };
  const step = async (name, fn) => { await blurAll(page); await page.mouse.move(W - 2, 2); const before = await toMax(page); let extra = null; try { extra = await fn(); } catch (e) { extra = { err: String(e).slice(0, 200) }; } await sleep(250); const after = await S(page); const a = await act(page); R.steps.push({ name, before, after, act: a, extra }); console.log(TAG, name, before.st, '->', after.st, 'sl', after.sl, a.id, a.fs, JSON.stringify(extra)); };
  // CHROME-FOCUS-198
  await step('playhead-grab-drag', async () => { const h = await page.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-playhead-handle]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await page.mouse.move(h.x, h.y); await page.mouse.down(); await sleep(120); const d = await S(page); await page.mouse.move(h.x + 40, h.y, { steps: 5 }); const g = await S(page); await page.mouse.up(); return { down: d.st, drag: g.st }; });
  await step('tab-onto-flag', async () => { await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker-next]').focus({ preventScroll: true })); await page.keyboard.press('Tab'); await sleep(150); return (await act(page)).id; });
  await step('flag-programmatic-focus', async () => { await page.keyboard.press('Shift'); await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); return (await act(page)).fs; });
  await step('f2-rename-escape', async () => { await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); await page.keyboard.press('F2'); await sleep(400); const mid = { ...(await S(page)), a: await act(page) }; await page.keyboard.press('Escape'); await sleep(250); return mid; });
  await step('shiftF10-menu-down-escape', async () => { await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); await page.keyboard.press('Shift+F10'); await sleep(400); const open = { ...(await S(page)), a: await act(page) }; await page.keyboard.press('ArrowDown'); await sleep(200); const down = { ...(await S(page)), id: (await act(page)).id }; await page.keyboard.press('Escape'); await sleep(250); return { open, down }; });
  await step('tab-onto-snap-then-5', async () => { await page.evaluate(() => { const all = [...document.querySelectorAll('button,select,input,[tabindex]')].filter((e) => e.tabIndex >= 0 && !e.disabled && e.getClientRects().length); const i = all.indexOf(document.querySelector('[data-testid=arrangement-snap-toggle]')); all[i - 1].focus({ preventScroll: true }); }); await page.keyboard.press('Tab'); await sleep(150); const o = { snap: (await S(page)).st, id: (await act(page)).id, seq: [] }; for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await sleep(150); const a = await act(page); o.seq.push(`${a.id}:${a.inChrome ? 'C' : 'L'}:${(await S(page)).st}`); } return o; });
  await step('shiftTab-firstLane-into-chrome', async () => { await page.evaluate((s) => { document.documentElement.dataset.focusSource = 'pointer'; const sc = document.querySelector(s); const ch = sc.firstElementChild.firstElementChild; const all = [...sc.querySelectorAll('button,select,input,[tabindex]')].filter((e) => e.tabIndex >= 0 && !e.disabled && e.getClientRects().length && !ch.contains(e)); all[0].focus({ preventScroll: true }); }, SC); const pre = { ...(await S(page)), id: (await act(page)).id }; await page.keyboard.press('Shift+Tab'); await sleep(200); const a = await act(page); return { pre, id: a.id, inChrome: a.inChrome }; });
  await step('B-variant-firstVisibleLane-shiftTab4', async () => { await page.evaluate((s) => { const sc = document.querySelector(s); const c = sc.firstElementChild.firstElementChild; const f = [...sc.querySelectorAll('button')].filter((b) => !c.contains(b) && b.getBoundingClientRect().top >= c.getBoundingClientRect().bottom)[0]; f.focus(); }, SC); const seq = []; for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); await sleep(150); const a = await act(page); seq.push(`${a.id}:${a.inChrome ? 'C' : 'L'}:${(await S(page)).st}`); } return seq; });
  // POINTER-198
  await step('mouse-snap', async () => { const b = await page.locator('[data-testid=arrangement-snap-toggle]').boundingBox(); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(200); const a = await act(page); await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(200); return { os: a.os, fv: a.fv, fs: a.fs }; });
  await step('mouse-visible-mute', async () => { const t = await page.evaluate((s) => { const sc = document.querySelector(s); const c = sc.firstElementChild.firstElementChild.getBoundingClientRect(); const sr = sc.getBoundingClientRect(); const ms = [...sc.querySelectorAll('button[aria-label^="Mute — "]')].map((e) => [e.getAttribute('aria-label'), e.getBoundingClientRect()]).filter(([, r]) => r.top >= c.bottom && r.bottom <= sr.bottom); const m = ms[ms.length - 1]; return m ? { l: m[0], x: m[1].left + m[1].width / 2, y: m[1].top + m[1].height / 2 } : null; }, SC); if (!t) return 'none'; await page.mouse.click(t.x, t.y); await sleep(250); const a = await act(page); await page.mouse.click(t.x, t.y); await sleep(250); return { l: t.l, os: a.os, fv: a.fv, fs: a.fs }; });
  // partly-cut controls: Video fold, Video Mute, Video Volume slider
  const cut = async (label, sel, key) => {
    await blurAll(page); await page.mouse.move(W - 2, 2); await setTop(page, 0);
    const top0 = await page.evaluate((q) => { const e = document.querySelector(q); return e ? e.getBoundingClientRect().top : null; }, sel);
    const cb = await page.evaluate((s) => document.querySelector(s).firstElementChild.firstElementChild.getBoundingClientRect().bottom, SC);
    if (top0 === null) { console.log(TAG, 'cut', label, 'no element'); return null; }
    const target = Math.round(top0 - cb + 6); const set = await setTop(page, target);
    const g = await page.evaluate((q) => { const r = document.querySelector(q).getBoundingClientRect(); return { top: r.top, bottom: r.bottom, x: r.left + r.width / 2, w: r.width }; }, sel);
    if (g.top >= cb || g.bottom <= cb + 1) { console.log(TAG, 'cut', label, 'n/a', JSON.stringify({ set, g, cb, top0 })); R.steps.push({ name: `cut-${label}`, n_a: true, set, g, cb, top0 }); return null; }
    const y = (cb + g.bottom) / 2 + 0.5;
    const val0 = await page.evaluate((q) => document.querySelector(q).value ?? null, sel);
    await page.mouse.click(g.x, y); await sleep(250);
    const afterClick = { ...(await S(page)), a: await act(page), cutBy: +(cb - g.top).toFixed(2), val: await page.evaluate((q) => document.querySelector(q).value ?? null, sel), val0 };
    await page.keyboard.press(key); await sleep(300);
    const afterKey = { ...(await S(page)), a: await act(page), val: await page.evaluate((q) => document.querySelector(q).value ?? null, sel) };
    await page.keyboard.press('Tab'); await sleep(300);
    const afterTab = { ...(await S(page)), a: await act(page) };
    const r = { label, set, cb, afterClick, afterKey, afterTab }; R.steps.push({ name: `cut-${label}-${key}`, r }); console.log(TAG, 'cut', label, key, JSON.stringify({ set: set.st, click: afterClick.st, cutBy: afterClick.cutBy, clickOs: afterClick.a.os, key: afterKey.st, keyTop: afterKey.a.top, keyOs: afterKey.a.os, keyId: afterKey.a.id, tab: afterTab.st, tabId: afterTab.a.id, tabTop: afterTab.a.top, cb })); return r;
  };
  // SIDE-198: playback with Follow on, Tab into the Video row
  await blurAll(page); await toMax(page);
  const follow0 = await page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-follow]'); return { pressed: f.getAttribute('aria-pressed'), text: f.textContent.trim() }; });
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.getAttribute('aria-label') === 'Play'); b.click(); }); await sleep(1500);
  const playing = await page.evaluate(() => (document.querySelector('button[aria-label="Play"]')?.dataset.playing === 'true'));
  await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker-next]').focus({ preventScroll: true }));
  const side = { follow0, playing, seq: [] };
  for (let i = 0; i < 4; i++) { await page.keyboard.press('Tab'); await sleep(250); const a = await act(page); const s = await S(page); const f = await page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-follow]'); return `${f.getAttribute('aria-pressed')}/${f.textContent.trim()}`; }); side.seq.push({ id: a.id, top: a.top, cb: a.cb, st: s.st, sl: s.sl, follow: f }); }
  await sleep(1500); side.followEnd = await page.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-follow]'); return `${f.getAttribute('aria-pressed')}/${f.textContent.trim()}`; }); side.slEnd = (await S(page)).sl;
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="Stop"]'); if (b) b.click(); }); await sleep(400);
  console.log(TAG, 'side-follow', JSON.stringify(side));
  R.side = side;
  // SIDE-198: marker menu open (keyboard), then keyboard focus into a lane under the chrome
  const mm = {};
  await page.keyboard.press('Home'); await sleep(200); await blurAll(page); await toMax(page);
  await page.evaluate(() => document.querySelector('[data-testid=arrangement-marker]').focus()); await page.keyboard.press('Shift+F10'); await sleep(400);
  mm.open = { ...(await S(page)), a: await act(page) };
  mm.seq = [];
  for (const k of ['Tab', 'Tab', 'Tab']) { await page.keyboard.press(k); await sleep(250); const a = await act(page); mm.seq.push({ k, id: a.id, inChrome: a.inChrome, top: a.top, cb: a.cb, menu: a.markerMenu, ...(await S(page)) }); }
  await page.keyboard.press('Escape'); await sleep(250);
  // marker menu by mouse right-click, then Tab
  await blurAll(page); await toMax(page);
  const fb = await page.locator('[data-testid=arrangement-marker]').first().boundingBox(); await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' }); await sleep(400);
  mm.rc = { ...(await S(page)), a: await act(page) }; mm.rcSeq = [];
  for (const k of ['Tab', 'Tab']) { await page.keyboard.press(k); await sleep(250); const a = await act(page); mm.rcSeq.push({ k, id: a.id, top: a.top, menu: a.markerMenu, ...(await S(page)) }); }
  await page.keyboard.press('Escape'); await sleep(250);
  console.log(TAG, 'side-markermenu', JSON.stringify(mm)); R.markerMenu = mm;
  // grid menu: right-click a lane at max scroll, then Tab
  const gm = {}; await blurAll(page); await toMax(page);
  const ln = await page.evaluate(() => { const l = document.querySelector('[data-track-id="sfx"] [data-grid-seconds]') || document.querySelector('[data-track-id="sfx"]'); const r = l.getBoundingClientRect(); return { x: Math.min(r.left + r.width * 0.8, innerWidth - 220), y: Math.min(r.top + r.height / 2, r.bottom - 4) }; });
  await page.mouse.click(ln.x, ln.y, { button: 'right' }); await sleep(400);
  gm.open = { ...(await S(page)), a: await act(page) }; gm.seq = [];
  for (const k of ['ArrowDown', 'Tab', 'Tab', 'Tab']) { await page.keyboard.press(k); await sleep(250); const a = await act(page); gm.seq.push({ k, id: a.id, top: a.top, grid: a.gridMenu, ...(await S(page)) }); }
  await page.keyboard.press('Escape'); await sleep(250);
  console.log(TAG, 'side-gridmenu', JSON.stringify(gm)); R.gridMenu = gm;
  await cut('video-volume', 'input[aria-label="Volume — Original video sound"]', 'ArrowUp');
  await cut('video-mute', '[data-track-id=video] button[aria-label^="Mute — "]', 'ArrowUp');
  await cut('music-volume', 'input[aria-label="Volume — Music"]', 'ArrowUp');
  await cut('music-mute', 'button[aria-label="Mute — Music"]', 'ArrowUp');
  await cut('video-fold', '[data-track-id=video] [data-testid=arrangement-track-fold]', 'ArrowUp');
  R.net = log;
  L.save(OUT, 'result.json', R);
  console.log(TAG, 'errors', log.errors.length, JSON.stringify(log.errors.slice(0, 3)), 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
