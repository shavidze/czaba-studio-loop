// C round 164 OV-CORNERS (SABA-B-2) crops + computed radii, and OV-FUNC. node c164-ov.cjs <1440|1280> <attempt>
// Crop geometry identical to b-round-163/notch-metric.cjs render (16x16 CSS px at deviceScaleFactor 4).
const X = require('./lib122.cjs'); const { L, sleep } = X; const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const OUTD = path.join(L.ROOT, 'out', 'ov'); fs.mkdirSync(OUTD, { recursive: true });
const SHD = path.join(L.ROOT, 'shots', 'ov'); fs.mkdirSync(SHD, { recursive: true });
const radii = () => { const o = document.querySelector('[data-testid=arrangement-overview]'); const ov = [...o.children].find((e) => /inset-0/.test(e.className) && /border-outline/.test(e.className)); const f = document.querySelector('[data-testid=arrangement-overview-frame]'); const r = (e) => e && { br: getComputedStyle(e).borderRadius, cls: e.className, box: (({ x, y, width, height }) => [x, y, width, height].map((v) => +v.toFixed(2)))(e.getBoundingClientRect()) }; return { root: r(o), overlay: r(ov), frame: r(f), frameStyle: f && [f.style.left, f.style.width] }; };
(async () => {
  const b = await L.launch(); const net = []; const res = { W, attempt: ATT, states: {} };
  const { page: q, ctx, log } = await L.openStudio(b, X.VPS[W], `c164ov-${W}-${ATT}`, net, { deviceScaleFactor: 4 });
  res.fonts = log.fontsReady && log.fontsReady.ok;
  await q.mouse.move(2, 2); await sleep(500);
  const shoot = async (state) => { const o = await q.locator('[data-testid=arrangement-overview]').boundingBox(); const files = []; for (const [n, x, y] of [['tl', o.x - 2, o.y - 2], ['tr', o.x + o.width - 14, o.y - 2], ['bl', o.x - 2, o.y + o.height - 14], ['br', o.x + o.width - 14, o.y + o.height - 14]]) { const f = path.join(SHD, `ov-${W}-${ATT}-${state}-${n}.png`); await q.screenshot({ path: f, clip: { x, y, width: 16, height: 16 } }); files.push(f); } const whole = path.join(SHD, `ov-${W}-${ATT}-${state}-whole.png`); await q.screenshot({ path: whole, clip: { x: o.x - 4, y: o.y - 4, width: o.width + 8, height: o.height + 8 } }); res.states[state] = { radii: await q.evaluate(radii), files: files.map((f) => path.relative(L.ROOT, f)), whole: path.relative(L.ROOT, whole) }; };
  await shoot('a-empty');
  await L.setSnapOff(q);
  res.add = await L.addAt(q, 'demo-middle-east', 'music', 0); await sleep(800);
  // zoom in so the view is narrower than the project, then scroll the timeline to its far right
  for (let i = 0; i < 6; i++) { await L.blur(q); await q.keyboard.press('Equal'); await sleep(150); }
  res.zoom = await q.evaluate(() => document.querySelector('[data-testid=arrangement-zoom-readout]').textContent);
  await q.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); s.scrollLeft = s.scrollWidth; }); await sleep(600); await q.mouse.move(2, 2); await sleep(300);
  res.pastEnd = await q.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); return [f.style.left, f.style.width]; });
  // bisect scrollLeft so the frame's right edge meets the overview's right edge (left + width = 100 %)
  let lo = 0, hi = await q.evaluate(() => document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollWidth); res.bisect = [];
  for (let i = 0; i < 30; i++) { const mid = Math.round((lo + hi) / 2); const r = await q.evaluate((m) => new Promise((res) => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); s.scrollLeft = m; setTimeout(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); res({ sl: s.scrollLeft, sum: parseFloat(f.style.left) + parseFloat(f.style.width) }); }, 120); }), mid); res.bisect.push(r); if (r.sum > 100) hi = mid; else lo = mid; if (hi - lo <= 1) break; }
  await q.evaluate((m) => { document.querySelector('[data-testid=arrangement-timeline-scroller]').scrollLeft = m; }, lo); await sleep(600); await q.mouse.move(2, 2); await sleep(300);
  await shoot('b-right');
  // OV-FUNC
  const fr = () => q.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); return { left: f.style.left, width: f.style.width, scrollLeft: Math.round(s.scrollLeft), zoom: document.querySelector('[data-testid=arrangement-zoom-readout]').textContent }; });
  const func = {}; const o = await q.locator('[data-testid=arrangement-overview]').boundingBox();
  func.before = await fr();
  await q.mouse.move(o.x + o.width * 0.8, o.y + o.height / 2); await q.mouse.down(); await q.mouse.move(o.x + o.width * 0.5, o.y + o.height / 2, { steps: 8 }); await q.mouse.move(o.x + o.width * 0.3, o.y + o.height / 2, { steps: 8 }); await q.mouse.up(); await sleep(400);
  func.afterDrag = await fr();
  await q.mouse.dblclick(o.x + o.width * 0.5, o.y + o.height / 2); await sleep(600);
  func.afterDblclick = await fr(); func.dblStatus = await L.status(q);
  // zoom in again, focus the overview, press arrows
  for (let i = 0; i < 6; i++) { await L.blur(q); await q.keyboard.press('Equal'); await sleep(150); }
  func.beforeKeys = await fr();
  await q.focus('[data-testid=arrangement-overview]'); await sleep(200);
  func.focusVisible = await q.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-overview]'); const cs = getComputedStyle(o); return { active: document.activeElement === o, focusVisible: o.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, shadow: cs.boxShadow, tabindex: o.getAttribute('tabindex'), role: o.getAttribute('role'), aria: o.getAttribute('aria-label') }; });
  await q.keyboard.press('ArrowRight'); await sleep(300); func.afterRight = await fr();
  await q.keyboard.press('ArrowLeft'); await sleep(300); await q.keyboard.press('ArrowLeft'); await sleep(300); func.afterLeft2 = await fr();
  const ob = await q.locator('[data-testid=arrangement-overview]').boundingBox(); await q.screenshot({ path: path.join(SHD, `ov-${W}-${ATT}-focus.png`), clip: { x: ob.x - 6, y: ob.y - 6, width: ob.width + 12, height: ob.height + 12 } });
  // keyboard Tab path for focus-visible
  await L.blur(q); await q.mouse.move(2, 2);
  res.func = func; res.net = X.netOk(net);
  await ctx.close(); await b.close();
  fs.writeFileSync(path.join(OUTD, `ov-${W}-${ATT}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ W, fonts: res.fonts, zoom: res.zoom, radii: Object.fromEntries(Object.entries(res.states).map(([k, v]) => [k, { root: v.radii.root.br, overlay: v.radii.overlay && v.radii.overlay.br, frame: v.radii.frame.br, frameStyle: v.radii.frameStyle }])), func, net: res.net }, null, 1));
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
