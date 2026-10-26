// C round 180 — DUX-R-5b-3b browser rows: RV1 rest shot, CC-R35, CC-DRAG, NO-BRASS-DRAG, CONTRAST-DRAG, BEHAVIOUR-DRAG, FUNC-SMOKE-180, PX-NET.
// node c180.cjs <1440|1280> <attempt> [tagPrefix]   (DPR 2, fresh anonymous context, --disable-lcd-text). C_BASE env overrides the server (HEAD worktree).
// File drag = synthetic DragEvent with a DataTransfer carrying a File, dispatched in real Chromium (headless cannot do an OS file drag).
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1'; const PFX = process.argv[4] || 'c180';
const ONLY_R35 = process.env.C_ONLY_R35 === '1';
const TAG = `${PFX}-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, base: process.env.C_BASE || 'http://127.0.0.1:5173', utc: new Date().toISOString(), r35: {}, drag: {}, file: {}, beh: {}, func: {}, shots: {}, errors: [] };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { if (!a || !b) return null; const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const D = 2; let img = null;
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); img = decode(buf); res.shots[name] = path.relative(L.ROOT, f); return img; }
const inside = (cx, cy, [ex, ey, ew, eh]) => cx >= ex && cx < ex + ew && cy >= ey && cy < ey + eh;
function scan(rect, masks = []) {
  const [x, y, w, h] = rect; let n = 0, b = 0, masked = 0; const samples = [];
  for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) {
    if (Xp < 0 || Y < 0 || Xp >= img.w || Y >= img.h) continue;
    const cx = Xp / D, cy = Y / D; if (masks.some((m) => inside(cx, cy, m.r))) { masked++; continue; }
    const c = img.px(Xp, Y); n++; if (c[0] - c[2] >= 45) { b++; if (samples.length < 6) samples.push({ x: +cx.toFixed(1), y: +cy.toFixed(1), c }); }
  }
  return { rect: rect.map((v) => +v.toFixed(2)), n, masked, brass: b, samples, masks: masks.map((m) => ({ k: m.k, r: m.r.map((v) => +v.toFixed(1)) })) };
}
function modeColor(pts) { const m = new Map(); for (const [x, y] of pts) { const Xp = Math.round(x * D), Y = Math.round(y * D); if (Xp < 0 || Y < 0 || Xp >= img.w || Y >= img.h) continue; const k = img.px(Xp, Y).join(','); m.set(k, (m.get(k) || 0) + 1); } const top = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3); return top.map(([k, n]) => ({ c: k.split(',').map(Number), n })); }

// In-page reads. toRgb converts any CSS colour through a canvas; stackOf composites translucent backgrounds up to the first opaque ancestor.
const PAGE = () => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
  const toRgb = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = 'rgba(0,0,0,0)'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const opaque = (b) => { g.clearRect(0, 0, 1, 1); g.fillStyle = 'rgba(0,0,0,0)'; g.fillStyle = b; g.fillRect(0, 0, 1, 1); return g.getImageData(0, 0, 1, 1).data[3] === 255; };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); if (opaque(b)) return layers; n = n.parentElement; } layers.unshift('rgb(0,0,0)'); return layers; };
  const info = (el) => { if (!el) return null; const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const rings = [...(cs.boxShadow || '').matchAll(/(rgba?\([^)]*\)|oklch\([^)]*\)|oklab\([^)]*\)|color\([^)]*\)|#[0-9a-f]+)/gi)].map((m) => m[1]).filter((c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = 'rgba(0,0,0,0)'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); return g.getImageData(0, 0, 1, 1).data[3] > 0; }); const ring = rings.length ? [null, rings[0]] : null; return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, bgRgb: toRgb(cs.backgroundColor), border: cs.borderTopColor, borderRgb: toRgb(cs.borderTopColor), borderWidth: cs.borderTopWidth, borderStyle: cs.borderTopStyle, color: cs.color, colorRgb: toRgb(cs.color), opacity: cs.opacity, boxShadow: cs.boxShadow, ringRgb: ring ? toRgb(ring[1]) : null, cls: el.getAttribute('class'), text: (el.textContent || '').trim().slice(0, 90), disabled: !!el.disabled, hover: el.matches(':hover'), active: el.matches(':active'), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null, blocked: el.dataset ? el.dataset.blocked : undefined, ghostStart: el.dataset ? el.dataset.ghostStart : undefined, lane: el.closest('[data-track-id]') ? el.closest('[data-track-id]').dataset.trackId : null }; };
  const body = (id) => [...document.querySelectorAll(`[data-track-id="${id}"][data-grid-seconds], [data-track-id="${id}"] [data-grid-seconds]`)].find((e) => e.id) || null;
  window.__c180 = { toRgb, mix, stackOf, info, body };
};
const inf = (p, sel) => p.evaluate((s) => window.__c180.info(document.querySelector(s)), sel);
const infH = (p, h) => p.evaluate((e) => window.__c180.info(e), h);
const sig = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}:${e.dataset.clipKind}@${e.getAttribute('data-clip-start')}:${e.getBoundingClientRect().width.toFixed(1)}`).sort().join('|'));
const masksK = (p) => p.evaluate(() => {
  const out = [];
  const ph = document.querySelector('[data-testid=arrangement-playhead]'); if (ph) { const r = ph.getBoundingClientRect(); out.push({ k: 'K8 playhead line', r: [r.x - 3, -10, r.width + 6, 5000] }); }
  const hd = document.querySelector('[data-testid=arrangement-playhead-handle]'); if (hd) { const r = hd.getBoundingClientRect(); out.push({ k: 'K8 playhead handle', r: [r.x - 2, r.y - 2, r.width + 4, r.height + 4] }); }
  for (const c of document.querySelectorAll('[data-clip-id]')) { if (/ring-brand/.test(c.className)) { const r = c.getBoundingClientRect(); out.push({ k: `K7 selected clip ${c.dataset.clipId}`, r: [r.x - 3, r.y - 3, r.width + 6, r.height + 6] }); } }
  for (const h of document.querySelectorAll('[data-testid=arrangement-track-header]')) { const r = h.getBoundingClientRect(); out.push({ k: `K7 track header ${h.closest('[data-track-id]') ? h.closest('[data-track-id]').dataset.trackId : '?'}`, r: [r.x, r.y, r.width + 1, r.height] }); }
  return out;
});
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(500); }
const step = async (k, fn) => { try { res.func[k] = await fn(); } catch (e) { res.func[k] = { error: String(e && e.stack || e).slice(0, 600) }; res.errors.push(`${k}: ${String(e).slice(0, 200)}`); } save(); };
const hdrPt = async (p, id) => { const b = await p.locator(`[data-clip-id="${id}"] > div`).first().boundingBox(); return { x: b.x + Math.min(30, b.width / 2), y: b.y + b.height / 2 }; };
const laneBox = (p, id) => p.evaluate((i) => { const b = window.__c180.body(i); const r = b.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }, id);
const vw = W === 1440 ? 1440 : 1280;

// read a button in rest / hover / press; press = mouse down, read, move away, release (no click fires)
async function r35(p, name, loc, { press = true } = {}) {
  const r = { name };
  await rest(p);
  const h = await loc.elementHandle(); r.rest = await infH(p, h);
  await snap(p, `${name}-rest`); r.restScan = scan(r.rest.box, (await masksK(p)).filter((m) => m.k.startsWith('K8')));
  const [x, y, w, hh] = r.rest.box; const cx = x + w / 2, cy = y + hh / 2;
  await p.mouse.move(cx, cy, { steps: 3 }); await sleep(500); r.hover = await infH(p, h);
  await snap(p, `${name}-hover`); r.hoverScan = scan(r.hover.box, (await masksK(p)).filter((m) => m.k.startsWith('K8')));
  if (press && !r.rest.disabled) { await p.mouse.down(); await sleep(400); r.press = await infH(p, h); await snap(p, `${name}-press`); r.pressScan = scan(r.press.box, (await masksK(p)).filter((m) => m.k.startsWith('K8'))); await p.mouse.move(2, 2, { steps: 4 }); await p.mouse.up(); await sleep(300); }
  r.crBorderVsPanel = cr(r.rest.borderRgb, r.rest.under); r.crTextRest = cr(r.rest.colorRgb, r.rest.composite);
  r.crTextHover = cr(r.hover.colorRgb, r.hover.composite); if (r.press) r.crTextPress = cr(r.press.colorRgb, r.press.composite);
  res.r35[name] = r; save(); return r;
}

async function libStart(p, src, lane, t) {
  const o = p.locator(`[role=option][data-source-id="${src}"]`); await o.scrollIntoViewIfNeeded();
  const ob = await o.boundingBox(); const lb = await laneBox(p, lane); const g = await L.geo(p);
  const ox = ob.x + ob.width / 2, oy = ob.y + ob.height / 2;
  await p.mouse.move(ox, oy); await p.mouse.down(); await p.mouse.move(ox + 12, oy, { steps: 3 });
  await p.mouse.move(g.rl + t * g.pps, lb[1] + lb[3] / 2, { steps: 14 }); await sleep(450);
  return { ox, oy, x: g.rl + t * g.pps, y: lb[1] + lb[3] / 2 };
}
async function readGhost(p, sel, name) {
  const hs = await p.$$(sel); const out = [];
  await snap(p, name); const masks = await masksK(p);
  for (const h of hs) {
    const i = await infH(p, h); const lab = await h.$('span'); const li = lab ? await infH(p, lab) : null;
    const laneUnder = await p.evaluate((e) => { const b = e.closest('[data-grid-seconds]'); return b ? window.__c180.mix(window.__c180.stackOf(b)) : null; }, h);
    const [x, y, w, hh] = i.box; const vis = [Math.max(x, 0), y, Math.min(x + w, vw) - Math.max(x, 0), hh];
    const edge = modeColor([...Array(12)].map((_, k) => [vis[0] + 6 + k * Math.max(1, (vis[2] - 12) / 12), y + hh - 0.75]));
    out.push({ read: i, label: li && { colorRgb: li.colorRgb, composite: li.composite, text: li.text, bg: li.bg }, laneUnder, edgePx: edge, crBorderVsLane: cr(i.borderRgb, laneUnder), crLabel: li ? cr(li.colorRgb, li.composite) : null, crBorderVsFill: cr(i.borderRgb, i.composite), scan: scan(vis, masks) });
  }
  return out;
}

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', '--disable-lcd-text'] });
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2, extraInit: X.tapInit }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.evaluate(PAGE);
    res.anon = await p.evaluate(() => ({ auth: localStorage.getItem('auth_user'), cookie: document.cookie, path: location.pathname, ls: Object.keys(localStorage) }));
    res.anonCookies = (await o.ctx.cookies()).length;
    // RV1 rest shot: same sequence as c179 badge-full.png
    await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
    await snap(p, 'rest-full');
    res.sig0 = await sig(p);
    // CC-R35
    await step('r35', async () => {
      const imp = p.getByRole('button', { name: 'Your own video' });
      const n = await imp.count(); const t0 = n ? (await imp.first().textContent()).trim() : null;
      res.r35.restVariant = n ? (t0 ? 'full' : 'compact') : 'absent';
      if (n) await r35(p, `import-${res.r35.restVariant}-default`, imp.first());
      // fold the video track -> compact
      const fold = await p.evaluate(() => { const f = [...document.querySelectorAll('[data-testid=arrangement-track-fold]')].find((e) => e.closest('[data-track-id]') && e.closest('[data-track-id]').dataset.trackId === 'video'); if (!f) return null; const r = f.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, exp: f.getAttribute('aria-expanded'), label: f.getAttribute('aria-label') }; });
      res.r35.fold = fold;
      if (fold) { await p.mouse.click(fold.x, fold.y); await sleep(600); const t1 = (await imp.first().textContent()).trim(); res.r35.afterFoldVariant = t1 ? 'full' : 'compact'; await r35(p, 'import-after-fold', imp.first()); await p.mouse.click(fold.x, fold.y); await sleep(600); res.r35.afterUnfoldVariant = (await imp.first().textContent()).trim() ? 'full' : 'compact'; }
      // Preview Add (select a Library item by mouse)
      const opt = p.locator('[role=option][data-source-id="demo-soft-impact"]'); await opt.scrollIntoViewIfNeeded(); const ob = await opt.boundingBox(); await p.mouse.click(ob.x + 20, ob.y + ob.height / 2); await sleep(600);
      const add = p.getByRole('region', { name: 'Preview', exact: true }).getByRole('button', { name: 'Add', exact: true });
      res.r35.addCount = await add.count();
      res.r35.activeTrack = await p.evaluate(() => { const b = [...document.querySelectorAll('button[aria-label*="— set as the active track"]')].find((x) => /Active/.test(x.textContent)); return b ? b.closest('[data-track-id]').dataset.trackId : null; });
      if (res.r35.addCount) {
        await r35(p, 'add-enabled', add.first());
        await p.click(L.nameSel('video')); await sleep(400);
        await r35(p, 'add-disabled-video-active', add.first(), { press: false });
        await p.click(L.nameSel('music')); await sleep(400); await L.blur(p);
      }
      return { variant: res.r35.restVariant, addCount: res.r35.addCount };
    });
    if (ONLY_R35) { res.net = X.netOk(net); save(); await b.close(); console.log(JSON.stringify({ TAG, r35: Object.fromEntries(Object.entries(res.r35).filter(([, v]) => v && v.rest).map(([k, v]) => [k, v.rest.box])) })); return; }
    res.snap0 = await L.setSnapOff(p);
    await p.keyboard.press('Home'); await sleep(300);
    const sA = await sig(p); res.beh.sigStart = sA;
    // CC-DRAG / BEHAVIOUR: Library ghost valid (empty Music lane, t=2) -> release adds at ghost start
    await step('libValid', async () => {
      const s = await libStart(p, 'demo-soft-impact', 'music', 2);
      const gh = await readGhost(p, '[data-testid=arrangement-drop-ghost]', 'lib-ghost-valid');
      res.drag.libValid = gh;
      await p.mouse.up(); await sleep(800);
      const clips = await L.clipsDom(p); const m = clips.filter((c) => c.lane === 'music');
      const ghostT = gh[0] ? L.secs(gh[0].read.text) : NaN;
      return { n: gh.length, blocked: gh.map((g) => g.read.blocked), ghostText: gh.map((g) => g.read.text), ghostT, added: m, landedAtGhost: m.length === 1 && Math.abs(m[0].start - ghostT) < 0.002, status: await L.status(p), ghostsAfter: await p.locator('[data-testid=arrangement-drop-ghost]').count() };
    });
    const sB = await sig(p);
    // Library ghost refused on the Video lane
    await step('libRefused', async () => {
      await libStart(p, 'demo-soft-impact', 'video', 3);
      const gh = await readGhost(p, '[data-testid=arrangement-drop-ghost]', 'lib-ghost-refused'); res.drag.libRefused = gh;
      await p.mouse.up(); await sleep(800);
      return { n: gh.length, blocked: gh.map((g) => g.read.blocked), text: gh.map((g) => g.read.text), unchanged: (await sig(p)) === sB, status: await L.status(p), ghostsAfter: await p.locator('[data-testid=arrangement-drop-ghost]').count() };
    });
    // Library ghost blocked by no room (over the Music clip just added)
    await step('libNoRoom', async () => {
      const m = (await L.clipsDom(p)).find((c) => c.lane === 'music');
      await libStart(p, 'demo-soft-impact', 'music', m.start + Math.min(0.5, m.wdur / 3));
      const gh = await readGhost(p, '[data-testid=arrangement-drop-ghost]', 'lib-ghost-noroom'); res.drag.libNoRoom = gh;
      await p.mouse.up(); await sleep(800);
      return { n: gh.length, blocked: gh.map((g) => g.read.blocked), text: gh.map((g) => g.read.text), unchanged: (await sig(p)) === sB, status: await L.status(p) };
    });
    // Lane move: Music clip -> SFX lane (valid), release lands; Ctrl+Z back
    await step('moveValid', async () => {
      await L.blur(p); const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); const a = await hdrPt(p, m.id);
      const lb = await laneBox(p, 'sfx'); const y = lb[1] + lb[3] * 0.5;
      await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x, (a.y + y) / 2, { steps: 8 }); await p.mouse.move(a.x, y, { steps: 10 }); await sleep(450);
      const gh = await readGhost(p, '[data-testid=arrangement-lane-move-ghost]', 'move-ghost-valid'); res.drag.moveValid = gh;
      await p.mouse.up(); await sleep(700);
      const after = (await L.clipsDom(p)).filter((c) => c.kind !== 'video'); const moved = after.find((c) => c.id === m.id);
      const undo = await X.key(p, 'Control+z'); const back = (await L.clipsDom(p)).find((c) => c.id === m.id);
      return { from: { lane: m.lane, start: m.start }, ghosts: gh.map((g) => ({ lane: g.read.lane, blocked: g.read.blocked, gs: g.read.ghostStart })), landed: moved && { lane: moved.lane, start: moved.start }, landedOnSfx: !!moved && moved.lane === 'sfx' && Math.abs(moved.start - m.start) < 0.002, undoStatus: undo, afterUndo: back && { lane: back.lane, start: back.start }, undoRestored: (await sig(p)) === sB };
    });
    // Lane move blocked: Music clip -> Video lane (purely vertical), release leaves signature unchanged
    await step('moveBlocked', async () => {
      await L.blur(p); const m = (await L.clipsDom(p)).find((c) => c.lane === 'music'); const a = await hdrPt(p, m.id);
      const lb = await laneBox(p, 'video'); const y = lb[1] + lb[3] * 0.45;
      await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(a.x, (a.y + y) / 2, { steps: 8 }); await p.mouse.move(a.x, y, { steps: 10 }); await sleep(450);
      const gh = await readGhost(p, '[data-testid=arrangement-lane-move-ghost]', 'move-ghost-blocked'); res.drag.moveBlocked = gh;
      await p.mouse.up(); await sleep(700);
      return { ghosts: gh.map((g) => ({ lane: g.read.lane, blocked: g.read.blocked, gs: g.read.ghostStart })), unchanged: (await sig(p)) === sB, status: await L.status(p) };
    });
    // File drag (synthetic DragEvent with a File) over the Video lane body and over the Music lane body
    for (const lane of ['video', 'music']) {
      await step(`file-${lane}`, async () => {
        await rest(p);
        const before = await p.evaluate((id) => window.__c180.info(window.__c180.body(id)), lane);
        const lb = before.box; const cx = Math.min(lb[0] + lb[2] - 20, vw - 300), cy = lb[1] + lb[3] / 2;
        await p.evaluate(({ id, cx, cy }) => { const el = window.__c180.body(id); const dt = new DataTransfer(); dt.items.add(new File([new Uint8Array(64)], 'c180-synthetic.mp4', { type: 'video/mp4' })); window.__dt = dt; for (const ty of ['dragenter', 'dragover']) el.dispatchEvent(new DragEvent(ty, { bubbles: true, cancelable: true, dataTransfer: dt, clientX: cx, clientY: cy })); }, { id: lane, cx, cy });
        await sleep(400);
        const during = await p.evaluate((id) => window.__c180.info(window.__c180.body(id)), lane);
        const hint = await p.evaluate((id) => { const b = window.__c180.body(id); const h = [...b.querySelectorAll('p')].find((x) => /Drop the video here|Video is not added here/.test(x.textContent)); return h ? window.__c180.info(h) : null; }, lane);
        const hintTestid = await p.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-video-drop-hint]'); return h ? h.textContent.trim() : null; });
        await snap(p, `file-${lane}-during`);
        const masks = await masksK(p);
        const [x, y, w, h] = during.box; const vx0 = Math.max(x, 0), vx1 = Math.min(x + w, vw);
        const header = masks.filter((m) => m.k.startsWith('K7 track header')).map((m) => m.r[0] + m.r[2]); const hx = Math.max(vx0, ...header.filter((v) => v < vx1));
        const ptsTop = [], ptsBot = [], ptsL = []; for (let k = 0; k < 24; k++) { const xx = hx + 8 + k * ((vx1 - hx - 16) / 24); ptsTop.push([xx, y + 0.5]); ptsTop.push([xx, y + 1.5]); ptsBot.push([xx, y + h - 0.75]); }
        const ringPx = { top: modeColor(ptsTop), bottom: modeColor(ptsBot) };
        const strip = { top: scan([hx, y, vx1 - hx, 2], masks.filter((m) => !m.k.startsWith('K7 track header'))), bottom: scan([hx, y + h - 2, vx1 - hx, 2], masks.filter((m) => !m.k.startsWith('K7 track header'))) };
        const hintScan = hint ? scan(hint.box, masks.filter((m) => !m.k.startsWith('K7 track header'))) : null;
        await p.evaluate((id) => { const el = window.__c180.body(id); el.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true, dataTransfer: window.__dt, relatedTarget: null })); }, lane);
        await sleep(400);
        const after = await p.evaluate((id) => window.__c180.info(window.__c180.body(id)), lane);
        const hintAfter = await p.evaluate((id) => { const b = window.__c180.body(id); return [...b.querySelectorAll('p')].filter((x) => /Drop the video here|Video is not added here/.test(x.textContent)).length; }, lane);
        const r = { lane, before: { cls: before.cls, boxShadow: before.boxShadow, composite: before.composite }, during: { cls: during.cls, boxShadow: during.boxShadow, ringRgb: during.ringRgb, composite: during.composite, box: during.box }, ringPx, hint: hint && { text: hint.text, colorRgb: hint.colorRgb, composite: hint.composite, testidHintText: hintTestid, cls: hint.cls }, crRingVsLane: cr(during.ringRgb, before.composite), crRingPxVsLane: cr(ringPx.top[0] && ringPx.top[0].c, before.composite), crHint: hint ? cr(hint.colorRgb, hint.composite) : null, strip, hintScan, after: { cls: after.cls, boxShadow: after.boxShadow }, hintAfter, ringCleared: !/ring-/.test(after.cls || '') && after.boxShadow === before.boxShadow, sigUnchanged: (await sig(p)) === sB };
        res.file[lane] = r; return { ringRgb: during.ringRgb, hint: r.hint && r.hint.text, cleared: r.ringCleared, hintAfter };
      });
    }
    // Ctrl+Z undoes the Library add
    await step('undoAdd', async () => { const st = await X.key(p, 'Control+z'); return { status: st, restored: (await sig(p)) === sA }; });
    // FUNC-SMOKE-180: add a Library sound (keyboard), play 1 s with the output tap, stop, (1440: export WAV), Undo
    await step('smoke', async () => {
      const s0 = await sig(p);
      const add = await L.addAt(p, 'demo-middle-east', 'music', 0);
      const s1 = await sig(p);
      await L.blur(p); await p.keyboard.press('Home'); await sleep(250);
      const pos0 = await L.posNow(p);
      await p.evaluate(() => window.__tapStart()); await p.keyboard.press('Space'); await sleep(1000); await p.keyboard.press('Space'); await sleep(150);
      const S = await p.evaluate(() => window.__tapStop());
      const pos1 = await L.posNow(p); await sleep(600); const pos2 = await L.posNow(p);
      const playPeak = +Math.max(0, ...S.map((q) => q.peak)).toFixed(4);
      let exp = null;
      if (W === 1440) {
        const e = await X.exportWav(p, o.log, `${TAG}-proj`, { scope: 'project', format: 'wav' });
        exp = { recs: e.recs, status: e.st1 && e.st1.status, files: e.files.map((f2) => path.relative(L.ROOT, f2)) };
        if (e.files[0]) { const wv = X.wav(e.files[0]); exp.wav = { fmt: wv.fmt, frames: wv.frames, seconds: wv.seconds, peak: wv.peak, rms: wv.rms, nan: wv.nan, sha: wv.sha, first1s: X.winStats(wv.w, 0, 1), tail: X.winStats(wv.w, Math.max(0, wv.seconds - 0.5), wv.seconds) }; }
      }
      const undo = await X.key(p, 'Control+z'); const s2 = await sig(p);
      return { add, added: s1 !== s0, pos0, posAtStop: pos1, posAfterStop: pos2, advanced: +(pos1 - pos0).toFixed(3), stoppedStill: Math.abs(pos2 - pos1) < 1e-6, playPeak, tapSamples: S.length, export: exp, undoStatus: undo, undoRestored: s2 === s0 };
    });
    await rest(p); await snap(p, 'final');
    await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close(); res.net = X.netOk(net); save();
  const pick = (g) => (g || []).map((x) => ({ lane: x.read.lane, bl: x.read.blocked, txt: x.read.text, border: x.read.borderRgb, color: x.read.colorRgb, bg: x.read.bg, edge: x.edgePx[0], crB: x.crBorderVsLane, crL: x.crLabel, scan: `${x.scan.brass}/${x.scan.n} m${x.scan.masked}` }));
  const pr = (r) => r && ['rest', 'hover', 'press'].filter((k) => r[k]).map((k) => `${k}: bd ${r[k].borderRgb} tx ${r[k].colorRgb} bg ${r[k].bg} comp ${r[k].composite} op ${r[k].opacity} box ${r[k].box.map((v) => +v.toFixed(2))} scan ${r[`${k}Scan`] && `${r[`${k}Scan`].brass}/${r[`${k}Scan`].n}`}`).concat([`crB ${r.crBorderVsPanel} crT ${r.crTextRest}`]);
  console.log(JSON.stringify({ TAG, error: res.error, errors: res.errors, fonts: res.fonts, anon: res.anon, anonCookies: res.anonCookies, net: res.net, r35: { variant: res.r35.restVariant, fold: res.r35.afterFoldVariant, unfold: res.r35.afterUnfoldVariant, active: res.r35.activeTrack, ...Object.fromEntries(Object.entries(res.r35).filter(([, v]) => v && v.rest).map(([k, v]) => [k, pr(v)])) }, drag: Object.fromEntries(Object.entries(res.drag).map(([k, v]) => [k, pick(v)])), file: Object.fromEntries(Object.entries(res.file).map(([k, v]) => [k, { ring: v.during.ringRgb, px: v.ringPx.top[0], hint: v.hint, crRing: v.crRingVsLane, crRingPx: v.crRingPxVsLane, tid: v.hint && v.hint.testidHintText, crHint: v.crHint, strip: `${v.strip.top.brass}/${v.strip.top.n} ${v.strip.bottom.brass}/${v.strip.bottom.n}`, hintScan: v.hintScan && `${v.hintScan.brass}/${v.hintScan.n}`, cleared: v.ringCleared, hintAfter: v.hintAfter }])), func: res.func }, null, 1));
})();
