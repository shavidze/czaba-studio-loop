// C round 197 — MARKER-FUNC-197 + POINTER-197 (flag). node mfunc.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const fs = require('fs'); const path = require('path'); const sleep = L.sleep;
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5184' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'mfunc', TAG); fs.mkdirSync(OUT, { recursive: true });
const st = (page) => page.evaluate(() => {
  const pb = [...document.querySelectorAll('button')].find((b) => ['Play', 'Pause'].includes(b.getAttribute('aria-label')));
  const a = document.activeElement; const c = a ? getComputedStyle(a) : null;
  return { pos: +document.querySelector('[data-testid=arrangement-playhead-handle]').getAttribute('aria-valuenow'), play: pb && pb.getAttribute('aria-label'),
    markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((b) => ({ t: b.dataset.markerTime, cur: b.getAttribute('aria-current'), name: b.querySelector('[data-marker-label]').textContent, w: b.getBoundingClientRect().width })),
    menu: !!document.querySelector('[data-testid=arrangement-marker-menu]'), editor: !!document.querySelector('[data-testid=arrangement-marker-name-input]'),
    active: a ? (a.dataset.testid || a.getAttribute('aria-label') || a.tagName) : null, activeTime: a && a.dataset ? a.dataset.markerTime || null : null,
    os: c ? c.outlineStyle : null, fv: a ? a.matches(':focus-visible') : null, fs: document.documentElement.dataset.focusSource || null,
    sl: document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft, snap: document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap };
});
const flag = (page, t) => page.locator(`[data-testid=arrangement-marker][data-marker-time="${t}"]`);
const center = async (page, t, fx = 0.5) => { const b = await flag(page, t).boundingBox(); return { x: b.x + b.width * fx, y: b.y + b.height / 2 }; };
async function pause(page) { const s = await st(page); if (s.play === 'Pause') { await page.click('button[aria-label=Pause]'); await sleep(300); } }
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `mfunc-${TAG}`, net, { deviceScaleFactor: 2 });
  const R = { W, PORT, steps: [] }; const rec = async (k, extra = {}) => { const s = await st(page); R.steps.push({ k, ...s, ...extra }); return s; };
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
  await L.seekTo(page, 8); await sleep(300);
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(400); await page.keyboard.press('Enter'); await sleep(400);
  await L.seekTo(page, 4); await sleep(300); await rec('setup');
  // click jumps (near the right edge, inside pr-1 zone and in the pill)
  let c = await center(page, '0.000', 0.95); await page.mouse.click(c.x, c.y); await sleep(400); await rec('click-m1-rightEdge');
  c = await center(page, '8.000'); await page.mouse.click(c.x, c.y); await sleep(400); await rec('click-m2');
  // mouse press: no ring
  c = await center(page, '0.000'); await page.mouse.move(c.x, c.y); await page.mouse.down(); await sleep(200); await rec('press-m1-held'); await page.mouse.up(); await sleep(300); await rec('press-m1-released');
  await page.keyboard.press('ArrowRight'); await sleep(300); await rec('arrowRight-after-press');
  await page.keyboard.press('ArrowLeft'); await sleep(300); await rec('arrowLeft-back');
  // double-click jumps and plays
  await L.seekTo(page, 4); await sleep(200);
  c = await center(page, '8.000'); await page.mouse.dblclick(c.x, c.y); await sleep(700); await rec('dblclick-m2');
  await pause(page); await rec('paused');
  // drag marker 2 by ~2 s (pxPerSecond from geo)
  const g = await L.geo(page); c = await center(page, '8.000');
  await page.mouse.move(c.x, c.y); await page.mouse.down(); await page.mouse.move(c.x + 10, c.y, { steps: 3 }); await page.mouse.move(c.x + 2 * g.pps, c.y, { steps: 12 }); await sleep(200); await page.mouse.up(); await sleep(500);
  await rec('drag-m2-+2s', { pps: g.pps });
  // right-click menu
  c = await center(page, '0.000'); await page.mouse.click(c.x, c.y, { button: 'right' }); await sleep(400); await rec('rightclick-menu'); await page.keyboard.press('Escape'); await sleep(300); await rec('menu-escape');
  // keyboard: Tab to marker 1, Shift+F10 menu, rename via menu, F2, nudges, Delete
  await page.mouse.move(W - 2, H - 2); await L.blur(page);
  let n = -1; for (let i = 0; i < 160; i++) { await page.keyboard.press('Tab'); await sleep(40); const s = await st(page); if (s.activeTime === '0.000') { n = i; break; } }
  await rec('tab-to-m1', { n });
  await page.keyboard.press('Shift+F10'); await sleep(400); await rec('shiftF10-menu');
  const items = await page.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker-menu] [role=menuitem]')].map((x) => x.textContent.trim()));
  // activate Rename via keyboard: focus moves into menu; find index
  const ri = items.findIndex((t) => /^Rename/.test(t));
  const focusedItem = await page.evaluate(() => (document.activeElement.textContent || '').trim());
  await page.evaluate((ri) => document.querySelectorAll('[data-testid=arrangement-marker-menu] [role=menuitem]')[ri].click(), ri); await sleep(400);
  await rec('menu-rename', { items, focusedItem });
  if ((await st(page)).editor) { await page.keyboard.press('Control+a'); await page.keyboard.type('Intro'); await page.keyboard.press('Enter'); await sleep(400); }
  await rec('renamed');
  // F2 on the flag
  await flag(page, '0.000').focus(); await page.keyboard.press('F2'); await sleep(400); await rec('f2'); await page.keyboard.press('Escape'); await sleep(300); await rec('f2-escape');
  // ContextMenu key
  await flag(page, '0.000').focus(); await page.keyboard.press('ContextMenu'); await sleep(400); await rec('contextmenu-key'); await page.keyboard.press('Escape'); await sleep(300);
  // nudges with keyboard
  await flag(page, '0.000').focus(); await page.keyboard.press('ArrowRight'); await sleep(300); await rec('kb-nudge-right');
  const t1 = (await st(page)).activeTime; await page.keyboard.press('ArrowLeft'); await sleep(300); await rec('kb-nudge-left', { from: t1 });
  // Ctrl+→ / Ctrl+← from the body
  await L.seekTo(page, 4); await sleep(200); await L.blur(page);
  await page.keyboard.press('Control+ArrowRight'); await sleep(400); await rec('ctrl-right-from-4');
  await page.keyboard.press('Control+ArrowLeft'); await sleep(400); await rec('ctrl-left');
  await page.keyboard.press('Control+ArrowLeft'); await sleep(400); await rec('ctrl-left-2');
  // Delete via menu on the second marker, then Delete key on the first
  const m2t = (await st(page)).markers.find((m) => m.t !== '0.000').t;
  c = await center(page, m2t); await page.mouse.click(c.x, c.y, { button: 'right' }); await sleep(400);
  await page.evaluate(() => { const it = [...document.querySelectorAll('[data-testid=arrangement-marker-menu] [role=menuitem]')].find((x) => /^Delete/.test(x.textContent.trim())); it.click(); }); await sleep(400); await rec('menu-delete-m2');
  await flag(page, '0.000').focus(); await page.keyboard.press('Delete'); await sleep(400); await rec('kb-delete-m1');
  R.net = log; L.save(OUT, 'result.json', R);
  for (const s of R.steps) console.log(s.k, 'pos', s.pos, s.play, 'm', s.markers.map((m) => `${m.t}${m.cur ? '*' : ''}:${m.name}`).join(','), 'menu', s.menu, 'ed', s.editor, 'act', s.active, s.activeTime || '', 'os', s.os, 'fs', s.fs, s.n !== undefined ? `n=${s.n}` : '', s.items ? JSON.stringify(s.items) + ' f:' + s.focusedItem : '');
  console.log('errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
