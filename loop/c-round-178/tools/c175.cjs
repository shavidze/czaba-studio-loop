// C round 175 — DUX-R-5b-1 browser rows: CC-AFFORD, NO-BRASS-AFFORD, CONTRAST-DUX5B1, HANDLE-DISTINCT, detail separator (A-R175-DETAIL-SEP-ACCENT).
// node c175.cjs <1440|1280> <attempt>   (DPR 2, fresh context). Built on c-round-174/tools/c174.cjs helpers.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c175-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), setup: {}, rows: {}, shots: {} };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const brass = (c) => c[0] - c[2] >= 45;
const dist = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
const D = 2;
let img = null;
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); img = decode(buf); res.shots[name] = path.relative(L.ROOT, f); return img; }
function scan(rect, excl = []) {
  const [x, y, w, h] = rect; let n = 0, b = 0; const hist = new Map(); const samples = [];
  for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) {
    const cx = Xp / D, cy = Y / D; if (excl.some(([ex, ey, ew, eh]) => cx >= ex && cx < ex + ew && cy >= ey && cy < ey + eh)) continue;
    if (Xp < 0 || Y < 0 || Xp >= img.w || Y >= img.h) continue;
    const c = img.px(Xp, Y); n++; const k = c.join(','); hist.set(k, (hist.get(k) || 0) + 1);
    if (brass(c)) { b++; if (samples.length < 6) samples.push({ x: +cx.toFixed(1), y: +cy.toFixed(1), c }); }
  }
  const top = [...hist.entries()].sort((a, c) => c[1] - a[1]).slice(0, 6).map(([k, v]) => [k.split(',').map(Number), v]);
  return { rect: rect.map((v) => +v.toFixed(2)), n, brass: b, brassSamples: samples, top };
}
const inset = ([x, y, w, h], d) => [x + d, y + d, w - 2 * d, h - 2 * d];
const brief = (s) => s && `brass ${s.brass}/${s.n} top ${s.top.slice(0, 3).map(([c, v]) => `${c.join(',')}:${v}`).join(' ')}`;

// in-page: element box, computed colours, composite of its own bg over the opaque ancestor chain
const info = (sel) => {
  const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); const transparent = b === 'transparent' || (m && +m[1] === 0); if (!transparent && (!m || +m[1] === 1) && !/color\(|oklab|oklch/.test(b)) break; if (!transparent && /color\(|oklab|oklch/.test(b) && !/\/\s*0?\.\d|\/\s*0\b/.test(b)) break; n = n.parentElement; } if (!n) layers.unshift('rgb(0,0,0)'); return layers; };
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, border: cs.borderTopColor, accent: cs.accentColor, colorScheme: cs.colorScheme, opacity: cs.opacity, cls: el.getAttribute('class'), hover: el.matches(':hover'), active: el.matches(':active'), focus: el.matches(':focus-visible'), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null, value: el.value, min: el.min, max: el.max };
};
const infoOf = (p, sel) => p.evaluate(info, sel);
const centre = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
const phBox = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-playhead]'); if (!e) return []; const r = e.getBoundingClientRect(); return [[r.x - 3, -10, r.width + 6, 5000]]; });
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(350); }

// thumb analysis on the centre row of a range input (rest screenshot)
function thumbTrack(box, backdrop) {
  const [x, y, w, h] = box; const rows = []; for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) rows.push(Y);
  const mid = rows[Math.floor(rows.length / 2)];
  const row = []; for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) row.push(img.px(Xp, mid));
  const fg = [236, 230, 218];
  const hist = new Map(); for (const c of row) { const k = c.join(','); hist.set(k, (hist.get(k) || 0) + 1); }
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => [k.split(',').map(Number), v]);
  const thumbish = top.filter(([c]) => dist(c, fg) <= 6);
  const unfilled = top.find(([c]) => dist(c, fg) > 30 && (!backdrop || dist(c, backdrop) > 6));
  return { midRowY: +(mid / D).toFixed(2), rowTop: top.slice(0, 6), thumbOrFilledPx: thumbish.reduce((a, [, v]) => a + v, 0), unfilled: unfilled ? unfilled[0] : null, unfilledPx: unfilled ? unfilled[1] : 0, thumbVsUnfilled: unfilled ? cr(fg, unfilled[0]) : null, thumbVsBackdrop: backdrop ? cr(fg, backdrop) : null, filledVsUnfilled: unfilled ? cr(fg, unfilled[0]) : null };
}

async function rangeRow(p, name, sel) {
  const r = { sel };
  await rest(p); const ph = await phBox(p);
  const i0 = await infoOf(p, sel); if (!i0) { r.error = 'not found'; res.rows.thumbs[name] = r; return; }
  r.rest = { accent: i0.accent, colorScheme: i0.colorScheme, focus: i0.focus, box: i0.box, under: i0.under, value: i0.value };
  await snap(p, `thumb-${name}-rest`);
  r.rest.scanInset1 = scan(inset(i0.box, 1), ph);
  r.rest.scanExpanded = scan([i0.box[0], i0.box[1] - 6, i0.box[2], i0.box[3] + 12], ph);
  r.rest.track = thumbTrack(i0.box, i0.under);
  // hold the thumb with the real mouse (at its current value position)
  const frac = (+i0.value - +i0.min) / (+i0.max - +i0.min || 1);
  const hx = i0.box[0] + 8 + frac * (i0.box[2] - 16); const hy = i0.box[1] + i0.box[3] / 2;
  await p.mouse.move(hx, hy); await sleep(150); await p.mouse.down(); await sleep(250);
  const i1 = await infoOf(p, sel);
  r.held = { accent: i1.accent, focus: i1.focus, active: i1.active, value: i1.value };
  await snap(p, `thumb-${name}-held`);
  r.held.scanInset3 = scan(inset(i1.box, 3), ph);
  r.held.scanInset1 = scan(inset(i1.box, 1), ph);
  await p.mouse.up(); await sleep(250);
  await rest(p);
  res.rows.thumbs[name] = r; save();
}

async function hoverRow(p, name, sel, opts = {}) {
  const r = { sel };
  await rest(p); const ph = await phBox(p);
  const i0 = await infoOf(p, sel); if (!i0) { r.error = 'not found'; res.rows.hover[name] = r; save(); return r; }
  r.restBg = i0.bg; r.restComposite = i0.composite; r.under = i0.under; r.box = i0.box;
  const [cx, cy] = opts.at ? opts.at(i0.box) : centre(i0.box);
  await p.mouse.move(cx, cy, { steps: 3 }); await sleep(350);
  const i1 = await infoOf(p, sel);
  r.hover = { matches: i1.hover, bg: i1.bg, composite: i1.composite, focus: i1.focus };
  await snap(p, `hover-${name}`);
  const region = opts.region ? opts.region(i1.box) : inset(i1.box, 0.5);
  r.scan = scan(region, [...ph, ...(opts.excl ? await opts.excl() : [])]);
  r.contrastVsUnder = cr(i1.composite, i1.under);
  r.contrastVsRest = cr(i1.composite, i0.composite);
  if (opts.vs) { r.vs = await opts.vs(); r.contrastVsSurface = cr(i1.composite, r.vs); }
  if (opts.drag) {
    await p.mouse.down(); await sleep(100); await p.mouse.move(cx + (opts.drag[0] || 0), cy + (opts.drag[1] || 0), { steps: 4 }); await sleep(300);
    const i2 = await infoOf(p, sel);
    r.drag = { bg: i2.bg, composite: i2.composite, focus: i2.focus, hover: i2.hover };
    await snap(p, `drag-${name}`);
    const rg = opts.region ? opts.region(i2.box) : inset(i2.box, 0.5); r.drag.scanCentreRow = scan([rg[0], i2.box[1] + i2.box[3] / 2 - 0.25, rg[2], 0.75], ph);
    r.drag.scanFull = scan(rg, ph);
    await p.mouse.up(); await sleep(300);
    const i3 = await infoOf(p, sel); r.afterUp = { bg: i3.bg, hover: i3.hover };
  }
  await rest(p);
  res.rows.hover[name] = r; save();
  return r;
}

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'], ignoreDefaultArgs: ['--hide-scrollbars'] }); res.scrollbarsShown = true;
  res.rows = { thumbs: {}, hover: {}, fade: {}, group: {}, scrollbar: {}, handleDistinct: {} };
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.mouse.move(2, 2); res.setup.snap = await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.setup.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-stem-bass', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    await sleep(800); await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
    const clips = await L.clipsDom(p); res.setup.clips = clips;
    const music = clips.find((c) => c.lane === 'music'); const sfx = clips.find((c) => c.lane === 'sfx'); const video = clips.find((c) => c.kind === 'video'); const stems = clips.find((c) => c.lane === 'stems');
    const selNow = () => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => /ring-brand/.test(c.className)).map((c) => c.dataset.clipId));
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    res.setup.selectedAfterDeselect = await selNow();
    await rest(p); res.setup.playhead = await L.posNow(p);

    // ---- thumbs (5 without a group; Clip Gain needs a selected clip)
    await rangeRow(p, 'music-pan', '[data-track-id=music] [data-testid=arrangement-track-pan]');
    await rangeRow(p, 'music-volume', '[data-track-id=music] input[type=range][aria-label^="Volume — "]');
    await rangeRow(p, 'master-volume', 'input[type=range][aria-label="Master Volume"]');
    await rangeRow(p, 'zoom', '[data-testid=arrangement-zoom]');
    await L.selectClip(p, music.id); res.setup.detailWasExpanded = await X.openDetail(p); await rest(p);
    await rangeRow(p, 'clip-gain', '[data-testid=arrangement-detail-clip-gain-fader]');
    if (res.setup.detailWasExpanded === 'false') { await p.click('[data-testid=arrangement-detail-toggle]'); await sleep(700); await rest(p); res.setup.detailRecollapsed = await p.getAttribute('[data-testid=arrangement-detail-toggle]', 'aria-expanded'); }

    // ---- detail separator (B's finding, A-R175-DETAIL-SEP-ACCENT)
    await hoverRow(p, 'detail-separator', '[data-testid=arrangement-detail-separator]');

    // ---- fade handles: selected music clip (handles at opacity 100)
    await rest(p);
    const handles = (id) => p.evaluate((id) => [...document.querySelectorAll(`[data-clip-id="${id}"] [data-testid$=-fade-in-handle], [data-clip-id="${id}"] [data-testid$=-fade-out-handle]`)].map((h) => { const cs = getComputedStyle(h); const r = h.getBoundingClientRect(); return { t: h.dataset.testid, bg: cs.backgroundColor, border: cs.borderTopColor, op: cs.opacity, box: [r.x, r.y, r.width, r.height], cls: h.getAttribute('class') }; }), id);
    const bodyComp = (id) => p.evaluate(({ id, info }) => { const fn = new Function(`return (${info})`)(); const c = document.querySelector(`[data-clip-id="${id}"]`); return { root: fn(c), body: fn(c.children[1]), head: fn(c.children[0]) }; }, { id, info: info.toString() });
    let ph = await phBox(p);
    res.rows.fade.selectedMusic = { handles: await handles(music.id), body: await bodyComp(music.id) };
    await snap(p, 'fade-selected-music');
    res.rows.fade.selectedMusic.scans = res.rows.fade.selectedMusic.handles.map((h) => ({ t: h.t, ...scan(inset(h.box, 1), ph) }));
    // selected video clip
    await L.selectClip(p, video.id); await rest(p); ph = await phBox(p);
    res.rows.fade.selectedVideo = { handles: await handles(video.id), body: await bodyComp(video.id) };
    await snap(p, 'fade-selected-video');
    res.rows.fade.selectedVideo.scans = res.rows.fade.selectedVideo.handles.map((h) => ({ t: h.t, ...scan(inset(h.box, 1), ph) }));
    // unselected hovered sfx clip (deselect all first)
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    await rest(p);
    const sb = await X.clipBox(p, sfx.id);
    await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height * 0.75); await sleep(400); ph = await phBox(p);
    res.rows.fade.hoveredUnselectedSfx = { selected: await selNow(), handles: await handles(sfx.id), body: await bodyComp(sfx.id) };
    await snap(p, 'fade-hovered-unselected-sfx');
    res.rows.fade.hoveredUnselectedSfx.scans = res.rows.fade.hoveredUnselectedSfx.handles.map((h) => ({ t: h.t, ...scan(inset(h.box, 1), ph) }));
    save();

    // ---- trim edges on the unselected sfx clip (body rows only); the selected music clip as info
    const trimSel = (id, side) => `[data-clip-id="${id}"] [title="Trim — ${side} edge"]`;
    const bodyRows = (id) => async () => [];
    for (const side of ['left', 'right']) {
      const bc = await bodyComp(sfx.id); const hb = bc.head.box;
      const handlesNow = await handles(sfx.id);
      await hoverRow(p, `trim-${side}-unselected`, trimSel(sfx.id, side), {
        region: (bx) => [bx[0] + 0.5, hb[1] + hb[3] + 0.5, bx[2] - 1, bx[1] + bx[3] - (hb[1] + hb[3]) - 1],
        excl: async () => handlesNow.map((h) => [h.box[0] - 1, h.box[1] - 1, h.box[2] + 2, h.box[3] + 2]),
        vs: async () => (await bodyComp(sfx.id)).body.composite,
      });
    }
    await L.selectClip(p, music.id); await rest(p);
    await hoverRow(p, 'trim-left-selected-info', trimSel(music.id, 'left'), { vs: async () => (await bodyComp(music.id)).body.composite });
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    await rest(p);

    // ---- track height handle (sfx lane; unfolded) hover + drag (+0 px hold then +6 px)
    await hoverRow(p, 'track-height-sfx', '[data-track-id=sfx] [data-testid=arrangement-track-height]', { at: (bx) => [bx[0] + 150, bx[1] + bx[3] / 2], region: (bx) => [bx[0] + 100, bx[1] + 0.25, 200, bx[3] - 0.5], drag: [0, 6], vs: async () => (await infoOf(p, '[data-track-id=sfx]')).composite });
    // ---- Library resize handle
    await hoverRow(p, 'library-separator', '[data-testid=arrangement-library-separator]', { vs: async () => (await infoOf(p, '[data-testid=arrangement-library-separator]')).under });

    // ---- loop: range on music 2..4 s, Ctrl+L (enabled), then Ctrl+L (disabled)
    res.setup.range = await X.rangeDrag(p, music.id, 2, 4);
    res.setup.loopOn = await X.key(p, 'Control+l');
    const braceState = () => p.evaluate(() => { const b = document.querySelector('[data-testid=arrangement-loop-brace]'); return b ? { cls: b.getAttribute('class'), aria: b.getAttribute('aria-pressed') || b.getAttribute('data-enabled'), text: b.textContent.trim().slice(0, 40), loopToggle: (document.querySelector('[aria-label^="Loop"]') || {}).getAttribute ? document.querySelector('[aria-label^="Loop"]').getAttribute('aria-pressed') : null } : null; });
    res.setup.braceOn = await braceState();
    for (const e of ['start', 'end']) await hoverRow(p, `loop-${e}-enabled-info`, `[data-testid=arrangement-loop-${e}-edge]`, { vs: async () => (await infoOf(p, '[data-testid=arrangement-loop-brace]')).composite });
    res.setup.loopOff = await X.key(p, 'Control+l');
    res.setup.braceOff = await braceState();
    for (const e of ['start', 'end']) await hoverRow(p, `loop-${e}-disabled`, `[data-testid=arrangement-loop-${e}-edge]`, { vs: async () => (await infoOf(p, '[data-testid=arrangement-loop-brace]')).composite });

    // ---- timeline scrollbar thumb (horizontal)
    const sc = () => p.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-timeline-scroller]'); const r = s.getBoundingClientRect(); return { box: [r.x, r.y, r.width, r.height], sw: s.scrollWidth, cw: s.clientWidth, sl: s.scrollLeft, ch: s.clientHeight, oh: s.offsetHeight, ow: s.offsetWidth }; });
    let s0 = await sc(); res.rows.scrollbar.initial = s0;
    let zoomTries = 0;
    while (s0.sw <= s0.cw + 50 && zoomTries < 6) { const z = await infoOf(p, '[data-testid=arrangement-zoom]'); await p.mouse.click(z.box[0] + z.box[2] - 3, z.box[1] + z.box[3] / 2); await sleep(400); s0 = await sc(); zoomTries++; }
    await rest(p); s0 = await sc(); res.rows.scrollbar.afterZoom = { ...s0, zoomTries };
    const hbH = s0.oh - s0.ch; const thumbW = s0.cw * s0.cw / s0.sw; const thumbX = s0.box[0] + s0.cw * s0.sl / s0.sw;
    const tb = [thumbX, s0.box[1] + s0.box[3] - hbH, thumbW, hbH]; res.rows.scrollbar.thumbBoxCalc = tb;
    await snap(p, 'scrollbar-rest'); res.rows.scrollbar.rest = scan(inset(tb, 2.5));
    res.rows.scrollbar.trackSample = scan([tb[0] + tb[2] + 20, tb[1] + 1, 40, Math.max(1, tb[3] - 2)]);
    const tcx = tb[0] + Math.min(60, tb[2] / 2), tcy = tb[1] + tb[3] / 2;
    await p.mouse.move(tcx, tcy, { steps: 3 }); await sleep(400);
    await snap(p, 'scrollbar-hover'); res.rows.scrollbar.hover = scan(inset(tb, 2.5));
    await p.mouse.down(); await sleep(300);
    await snap(p, 'scrollbar-pressed'); res.rows.scrollbar.pressed = scan(inset(tb, 2.5));
    await p.mouse.move(tcx + 80, tcy, { steps: 6 }); await sleep(300); await p.mouse.up(); await sleep(300);
    res.rows.scrollbar.afterDrag = await sc();
    { const s1 = res.rows.scrollbar.afterDrag; const x1 = s1.box[0] + s1.cw * s1.sl / s1.sw + 20; await p.mouse.move(x1, tcy); await p.mouse.down(); await p.mouse.move(x1 - 400, tcy, { steps: 6 }); await p.mouse.up(); await sleep(300); res.rows.scrollbar.afterDragBack = await sc(); }
    await rest(p); save();

    // ---- group: music + stems, Ctrl+G; group volume thumb; collapse; blocks
    await p.click(L.nameSel('music')); await sleep(250); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(300);
    res.setup.group = await X.key(p, 'Control+g');
    await rangeRow(p, 'group-volume', '[data-testid=arrangement-group-volume]');
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    await rest(p);
    await p.click('[data-testid=arrangement-group-fold]'); await sleep(500); await rest(p);
    const blocks = () => p.evaluate(({ info }) => { const fn = new Function(`return (${info})`)(); return [...document.querySelectorAll('[data-overview-clip-id]')].map((e) => ({ id: e.dataset.overviewClipId, selected: e.dataset.overviewSelected || null, ...fn(e) })); }, { info: info.toString() });
    res.rows.group.unselected = await blocks();
    await snap(p, 'group-collapsed-unselected'); ph = await phBox(p);
    const vis = await p.evaluate(() => { const h = document.querySelector('[data-testid=arrangement-group-header]').getBoundingClientRect(); const s = document.querySelector('[data-testid=arrangement-timeline-scroller]').getBoundingClientRect(); return [h.right, s.right - 12]; });
    const clipVis = (bx) => { const x0 = Math.max(bx[0], vis[0] + 1), x1 = Math.min(bx[0] + bx[2], vis[1]); return [x0 + 1, bx[1] + 1, Math.max(0, x1 - x0 - 2), bx[3] - 2]; };
    res.rows.group.visible = vis;
    res.rows.group.unselectedScans = res.rows.group.unselected.map((bk) => ({ id: bk.id, ...scan(clipVis(bk.box), ph) }));
    // try to reach a selected collapsed block through the UI: Ctrl+A
    await L.blur(p); await p.keyboard.press('Control+a'); await sleep(400); await rest(p);
    res.rows.group.afterCtrlA = await blocks(); res.rows.group.afterCtrlASelection = await selNow();
    await snap(p, 'group-collapsed-ctrlA');
    res.rows.group.afterCtrlAScans = res.rows.group.afterCtrlA.map((bk) => ({ id: bk.id, selected: bk.selected, ...scan(clipVis(bk.box), ph) }));
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']).catch(() => {});
    await L.blur(p); await p.keyboard.press('Escape'); await rest(p);
    await p.click('[data-testid=arrangement-group-fold]'); await sleep(500); await rest(p);
    save();

    // ---- HANDLE-DISTINCT: selected sfx with fade handles, then Env mode with an envelope point
    await L.selectClip(p, sfx.id); await rest(p);
    const crop = async (name, id) => { const c = await X.clipBox(p, id); const f = path.join(SHD, `${name}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, c.x - 4), y: c.y - 6, width: Math.min(420, c.width + 8), height: c.height + 12 } }); res.shots[name] = path.relative(L.ROOT, f); };
    res.rows.handleDistinct.fadeHandles = await handles(sfx.id); await crop('distinct-fade-handles-selected', sfx.id);
    await L.blur(p); await p.keyboard.press('a'); await sleep(400);
    let cb = await X.clipBox(p, sfx.id); await p.mouse.dblclick(cb.x + Math.min(60, cb.width / 2), cb.y + cb.height * 0.6); await sleep(500);
    await L.selectClip(p, sfx.id); await rest(p);
    res.rows.handleDistinct.envOn = await p.evaluate(() => document.querySelector('[data-testid=arrangement-envelope-toggle]').getAttribute('aria-pressed'));
    res.rows.handleDistinct.envPoints = await p.evaluate((id) => [...document.querySelectorAll(`[data-clip-id="${id}"] [data-testid=arrangement-clip-envelope-point]`)].map((e) => { const cs = getComputedStyle(e); return { bg: cs.backgroundColor, border: cs.borderTopColor, cls: e.className }; }), sfx.id);
    res.rows.handleDistinct.fadeHandlesInEnv = await p.evaluate(() => document.querySelectorAll('[data-testid$=-fade-in-handle],[data-testid$=-fade-out-handle]').length);
    await crop('distinct-envelope-point-selected', sfx.id);
    await L.blur(p); await p.keyboard.press('a'); await sleep(300);
    res.logMain = o.log; await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close();
  save();
  const out = { error: res.error, fonts: res.fonts, setup: { snap: res.setup.snap, sel: res.setup.selectedAfterDeselect, ph: res.setup.playhead, range: res.setup.range, loopOn: res.setup.loopOn, loopOff: res.setup.loopOff, braceOn: res.setup.braceOn, braceOff: res.setup.braceOff, group: res.setup.group, detail: res.setup.detailWasExpanded }, net: X.netOk(net) };
  out.thumbs = Object.fromEntries(Object.entries(res.rows.thumbs).map(([k, v]) => [k, v.error || { accent: v.rest.accent, cs: v.rest.colorScheme, rest1: brief(v.rest.scanInset1), restExp: brief(v.rest.scanExpanded), held3: brief(v.held.scanInset3), held1: brief(v.held.scanInset1), heldFocus: v.held.focus, track: { unfilled: v.rest.track.unfilled, px: v.rest.track.unfilledPx, tVsU: v.rest.track.thumbVsUnfilled, tVsB: v.rest.track.thumbVsBackdrop, under: v.rest.under, rowTop: v.rest.track.rowTop.slice(0, 4).map(([c, n]) => `${c}:${n}`) } }]));
  out.hover = Object.fromEntries(Object.entries(res.rows.hover).map(([k, v]) => [k, v.error || { matches: v.hover.matches, bg: v.hover.bg, comp: v.hover.composite, under: v.under, scan: brief(v.scan), crUnder: v.contrastVsUnder, crRest: v.contrastVsRest, crSurf: v.contrastVsSurface, vs: v.vs, drag: v.drag && { bg: v.drag.bg, comp: v.drag.composite, row: brief(v.drag.scanCentreRow), full: brief(v.drag.scanFull), focus: v.drag.focus }, afterUp: v.afterUp }]));
  out.fade = Object.fromEntries(Object.entries(res.rows.fade).map(([k, v]) => [k, { handles: v.handles.map((h) => `${h.t} bg ${h.bg} bd ${h.border} op ${h.op}`), scans: (v.scans || []).map((s) => `${s.t} ${brief(s)}`), body: v.body && v.body.body.composite, sel: v.selected }]));
  out.scrollbar = { initial: res.rows.scrollbar.initial, afterZoom: res.rows.scrollbar.afterZoom, rest: brief(res.rows.scrollbar.rest), track: brief(res.rows.scrollbar.trackSample), hover: brief(res.rows.scrollbar.hover), pressed: brief(res.rows.scrollbar.pressed), afterDrag: res.rows.scrollbar.afterDrag };
  out.group = { unselected: (res.rows.group.unselected || []).map((bk) => `${bk.id} sel ${bk.selected} bg ${bk.bg} bd ${bk.border} comp ${bk.composite} under ${bk.under}`), scans: (res.rows.group.unselectedScans || []).map((s) => `${s.id} ${brief(s)}`), ctrlA: (res.rows.group.afterCtrlA || []).map((bk) => `${bk.id} sel ${bk.selected} bg ${bk.bg} comp ${bk.composite}`), ctrlASel: res.rows.group.afterCtrlASelection };
  out.handleDistinct = res.rows.handleDistinct;
  console.log(JSON.stringify(out, null, 1));
})();
