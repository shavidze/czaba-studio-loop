// C round 196 — RING-KEY rich scene: clip + group + marker + detail (Clip Gain), Tab through all; grid menu, marker menu, export dialog Tab inside.
// node rich.cjs <port> <W>
process.env.C_BASE = `http://127.0.0.1:${process.argv[2] || '5173'}`;
const L = require('./lib.cjs'); const K = require('./rk-lib.cjs');
const fs = require('fs'); const path = require('path');
const PORT = process.argv[2] || '5173'; const W = +(process.argv[3] || 1440); const H = W === 1440 ? 900 : 720;
const TAG = `${PORT === '5174' ? 'ref' : 'tree'}-${W}`;
const OUT = path.join(__dirname, '..', 'out', 'rich', TAG); fs.mkdirSync(OUT, { recursive: true });
const sleep = L.sleep;
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
(async () => {
  const browser = await L.launch(); const net = [];
  const { page, log, ctx } = await L.openStudio(browser, { width: W, height: H }, `rich-${TAG}`, net, { deviceScaleFactor: 2 });
  // setup: clip on music, group stems+sfx, a marker, detail open with the clip selected
  await libDrop(page, 'demo-middle-east', 'music', 0.05);
  await page.click(nameSel('stems')); await sleep(200); await page.click(nameSel('sfx'), { modifiers: ['Shift'] }); await sleep(200);
  await page.mouse.click(5, H - 5); await sleep(150); await page.keyboard.press('Control+g'); await sleep(700);
  await page.click('[data-testid=arrangement-marker-add]'); await sleep(500);
  const t = page.locator('[data-testid=arrangement-detail-toggle]'); if ((await t.getAttribute('aria-expanded')) === 'false') { await t.click(); await sleep(700); }
  const clip = page.locator('[data-clip-id]').first(); const cb = await clip.boundingBox(); await page.mouse.click(cb.x + 30, cb.y + cb.height * 0.65); await sleep(500);
  const setup = await page.evaluate(() => ({ clips: document.querySelectorAll('[data-clip-id]').length, groups: document.querySelectorAll('[data-testid=arrangement-group-volume]').length, markers: document.querySelectorAll('[data-testid=arrangement-marker]').length, clipGain: !!document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]') }));
  await page.screenshot({ path: path.join(OUT, 'scene.png') });
  await page.mouse.move(W - 2, 2);
  await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
  const rows = []; let first = null;
  for (let i = 0; i < 200; i++) {
    await page.keyboard.press('Tab'); await sleep(120);
    const d = await K.record(page, i, OUT, W, H, true); if (!d) { rows.push({ i, id: '(body)' }); continue; }
    const key = `${d.id}|${Math.round(d.box.x)}|${Math.round(d.box.y)}`; if (first && key === first && i > 3) break; if (!first) first = key;
    rows.push(d);
  }
  // grid menu: right-click empty lane area
  const menus = {};
  const lane = await page.evaluate(() => { const l = document.querySelector('[data-track-id="sfx"] [data-grid-seconds]') || document.querySelector('[data-track-id="sfx"]'); const r = l.getBoundingClientRect(); return { x: r.left + r.width * 0.8, y: r.top + r.height / 2 }; });
  await page.mouse.click(lane.x, lane.y, { button: 'right' }); await sleep(400);
  menus.gridOpen = await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-grid-menu]'));
  menus.grid = [];
  for (let i = 0; i < 12 && menus.gridOpen; i++) { const d = await K.recordFocusedOnly(page, 300 + i, OUT, W, H); if (d) menus.grid.push(d); await page.keyboard.press(i === 0 ? 'ArrowDown' : 'Tab'); await sleep(120); if (!(await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-grid-menu]')))) break; }
  await page.keyboard.press('Escape'); await sleep(300);
  // marker menu: right-click the marker flag
  const flag = page.locator('[data-testid=arrangement-marker]').first();
  if (await flag.count()) { const fb = await flag.boundingBox(); await page.mouse.click(fb.x + fb.width / 2, fb.y + fb.height / 2, { button: 'right' }); await sleep(400); }
  menus.markerOpen = await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-menu]'));
  menus.marker = [];
  for (let i = 0; i < 8 && menus.markerOpen; i++) { const d = await K.recordFocusedOnly(page, 400 + i, OUT, W, H); if (d) menus.marker.push(d); await page.keyboard.press(i === 0 ? 'ArrowDown' : 'Tab'); await sleep(120); if (!(await page.evaluate(() => !!document.querySelector('[data-testid=arrangement-marker-menu]')))) break; }
  await page.keyboard.press('Escape'); await sleep(300);
  // export dialog: keyboard-focus Export and press Enter
  await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'Export'); b.focus(); });
  await page.keyboard.press('Enter'); await sleep(800);
  menus.exportInitial = await page.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); return { tag: a.tagName, label: a.getAttribute('aria-label'), text: (a.textContent || '').trim().slice(0, 40), cls: a.className, ow: c.outlineWidth, os: c.outlineStyle, oc: c.outlineColor, fv: a.matches(':focus-visible'), fs: document.documentElement.dataset.focusSource }; });
  await page.screenshot({ path: path.join(OUT, 'export-open.png') });
  menus.export = [];
  for (let i = 0; i < 24; i++) { await page.keyboard.press('Tab'); await sleep(120); const d = await K.recordFocusedOnly(page, 500 + i, OUT, W, H); if (d) menus.export.push(d); }
  await page.keyboard.press('Escape'); await sleep(300);
  const back = [];
  L.save(OUT, 'result.json', { W, PORT, setup, rows, menus, net: log });
  console.log(TAG, JSON.stringify(setup), 'stops', rows.length, 'grid', menus.grid.length, 'marker', menus.marker.length, 'export', menus.export.length, 'errors', log.errors.length, 'hyd', log.hydration.length, 'forbidden', log.forbidden.length, 'auth', log.authHeaders.length);
  await ctx.close(); await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
