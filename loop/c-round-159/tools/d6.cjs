// C round 125 — D6 VISUAL-A baselines. node d6.cjs <1440|1280> <run 1|2>
// run 1: bbox + contrast + pixel samples + screenshots; run 2: bbox only (determinism).
const X = require('./lib122.cjs'); const H = require('./h3.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const W = +process.argv[2] || 1440; const RUN = +process.argv[3] || 1;
const net = []; const OUTD = path.join(L.ROOT, 'out', 'd6'); fs.mkdirSync(OUTD, { recursive: true });

// In-page: collect interactive elements + panels. Keying rule documented in KEYRULE.
const KEYRULE = 'key = (data-testid | aria-label | role+text) + nearest [data-track-id]/[data-group-id]/[data-clip-id]/[data-marker-id] context + #occurrence index among identical keys (DOM order). visible = getClientRects().length>0 && w>0 && h>0 && visibility!=hidden && box intersects viewport; boxes are raw (not clamped to the viewport), rounded to 0.5 px.';
function collect(scopeSel) {
  const r5 = (v) => Math.round(v * 2) / 2;
  const root = scopeSel === 'body' ? document.body : document.querySelector(scopeSel);
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return e.getClientRects().length > 0 && b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh; };
  const INTER = 'button,input,select,textarea,a,[role=slider],[role=option],[role=tab],[role=menuitem],[role=menuitemradio],[role=menuitemcheckbox],[role=radio],[role=checkbox],[role=separator],[tabindex]';
  const PANELS = ['arrangement-library', 'arrangement-library-preview', 'arrangement-overview', 'arrangement-video-dock', 'arrangement-ruler', 'arrangement-marker-row', 'arrangement-loop-strip', 'arrangement-timeline-scroller', 'arrangement-detail-panel', 'arrangement-status', 'arrangement-shortcut-hint', 'arrangement-selected-clip', 'arrangement-selected-clip-reserve', 'arrangement-track-header', 'arrangement-tempo-row', 'arrangement-grid-control', 'arrangement-range'];
  const els = new Set();
  for (const e of root.querySelectorAll(INTER)) { if (e.matches('[tabindex]') && !e.matches('button,input,select,textarea,a,[role]') && +e.getAttribute('tabindex') < 0) continue; els.add(e); }
  const panels = new Set();
  for (const id of PANELS) for (const e of root.querySelectorAll(`[data-testid="${id}"]`)) panels.add(e);
  for (const e of root.querySelectorAll('header,footer,aside,main')) panels.add(e);
  const ctx = (e) => { const c = e.closest('[data-track-id],[data-group-id],[data-clip-id],[data-marker-id]'); if (!c || c === e) return ''; if (c.dataset.clipId) return `clip:${c.closest('[data-track-id]') ? c.closest('[data-track-id]').dataset.trackId : '?'}@${c.dataset.clipStart}`; if (c.dataset.markerId) return `marker@${c.dataset.markerTime}`; if (c.dataset.groupId) return 'group'; return `track:${c.dataset.trackId}`; };
  const base = (e) => { const tid = e.getAttribute('data-testid'); if (tid) return `tid:${tid}`; const al = e.getAttribute('aria-label'); if (al) return `al:${al.slice(0, 60)}`; const role = e.getAttribute('role') || e.tagName.toLowerCase(); return `${role}:${(e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40)}`; };
  const occ = {}; const out = [];
  const push = (e, kind) => { if (!vis(e)) return; let k = base(e); const c = ctx(e); if (c) k += `|${c}`; if (e.dataset && e.dataset.clipId && e.dataset.clipStart) k += `|clip@${e.dataset.clipStart}`; occ[k] = (occ[k] || 0) + 1; const key = `${k}#${occ[k]}`; const b = e.getBoundingClientRect(); out.push({ key, kind, tag: e.tagName.toLowerCase(), role: e.getAttribute('role') || null, type: e.type || null, disabled: !!e.disabled || e.getAttribute('aria-disabled') === 'true', x: r5(b.x), y: r5(b.y), w: r5(b.width), h: r5(b.height) }); };
  for (const e of els) push(e, 'interactive');
  for (const e of panels) push(e, 'panel');
  for (const e of root.querySelectorAll('[data-clip-id]')) push(e, 'clip');
  return out;
}
function stateHeader() {
  const sc = document.querySelector('[data-testid=arrangement-timeline-scroller]');
  const g = document.querySelector('[data-testid=arrangement-grid-control]');
  const z = document.querySelector('[data-testid=arrangement-zoom-readout]');
  const dt = document.querySelector('[data-testid=arrangement-detail-toggle]');
  return { dpr: devicePixelRatio, vw: innerWidth, vh: innerHeight, scrollLeft: sc ? sc.scrollLeft : null, scrollTop: sc ? sc.scrollTop : null, docScroll: [scrollX, scrollY], snap: g ? g.dataset.snap : null, zoom: z ? z.textContent.trim() : null, detailExpanded: dt ? dt.getAttribute('aria-expanded') : null, playhead: Number((document.querySelector('[data-testid=arrangement-playhead-handle]') || { getAttribute: () => NaN }).getAttribute('aria-valuenow')), clips: [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.closest('[data-track-id]').dataset.trackId}@${e.dataset.clipStart}`), markers: [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.dataset.markerTime), loop: (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null, groups: document.querySelectorAll('[data-testid=arrangement-group-row]').length, status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim() };
}
// Contrast: text elements (own text nodes) and icon-only controls.
function contrast(scopeSel) {
  const root = scopeSel === 'body' ? document.body : document.querySelector(scopeSel);
  const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) { const o = /oklch|oklab|color\(/.test(s); return o ? { unparsed: s } : null; } const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const cvs = document.createElement('canvas'); cvs.width = cvs.height = 1; const c2 = cvs.getContext('2d', { willReadFrequently: true });
  const toRgb = (s) => { const v = parse(s); if (v && !v.unparsed) return v; c2.clearRect(0, 0, 1, 1); c2.fillStyle = '#000'; c2.fillStyle = s; c2.fillRect(0, 0, 1, 1); const d = c2.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const over = (top, bot) => { const a = top.a + bot.a * (1 - top.a); if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }; return { r: (top.r * top.a + bot.r * bot.a * (1 - top.a)) / a, g: (top.g * top.a + bot.g * bot.a * (1 - top.a)) / a, b: (top.b * top.a + bot.b * bot.a * (1 - top.a)) / a, a }; };
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const vw = innerWidth, vh = innerHeight;
  const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return e.getClientRects().length > 0 && b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && b.right > 0 && b.bottom > 0 && b.left < vw && b.top < vh; };
  const tokenOf = (e) => { for (let n = e; n && n !== document.body; n = n.parentElement) { const m = [...n.classList].find((k) => /^text-(dim|muted|foreground|brand|accent|background|surface|danger|error|warning|success|red|amber|emerald|white|black|sky|rose|yellow|orange|green|blue|cyan|teal|zinc|gray|slate|neutral|current|outline|brand-foreground)([-/]|$)/.test(k)); if (m) return m; } return '(inherited/none)'; };
  const bgOf = (e) => { const layers = []; let opacity = 1; let complex = null; let n = e; while (n) { const cs = getComputedStyle(n); opacity *= +cs.opacity; if (cs.backgroundImage && cs.backgroundImage !== 'none') complex = complex || `bg-image on ${n.tagName}.${[...n.classList].slice(0, 3).join('.')}`; const bc = toRgb(cs.backgroundColor); if (bc.a > 0) layers.push(bc); if (bc.a >= 1) break; n = n.parentElement; } let bg = { r: 0, g: 0, b: 0, a: 0 }; if (!layers.length || layers[layers.length - 1].a < 1) bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = layers.length - 1; i >= 0; i--) bg = over(layers[i], bg); return { bg, opacity, complex }; };
  const overlay = (e) => { const b = e.getBoundingClientRect(); const cx = b.left + b.width / 2, cy = b.top + b.height / 2; if (e.closest('[data-clip-id]')) return 'inside clip (waveform canvas behind)'; const under = document.elementsFromPoint(Math.min(vw - 1, Math.max(0, cx)), Math.min(vh - 1, Math.max(0, cy))); const media = under.find((u) => /^(CANVAS|VIDEO|IMG)$/.test(u.tagName) && !e.contains(u)); return media ? `over ${media.tagName}` : null; };
  const out = [];
  const keyOf = (e) => { const tid = e.getAttribute('data-testid') || (e.closest('[data-testid]') || { getAttribute: () => '' }).getAttribute('data-testid'); return `${tid || e.tagName.toLowerCase()}:${(e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40)}`; };
  const all = root.querySelectorAll('*');
  for (const e of all) {
    if (!vis(e)) continue;
    if (/^(SCRIPT|STYLE|SVG|PATH|svg|path|g|line|rect|circle|polyline)$/.test(e.tagName)) continue;
    const own = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(e.tagName) && !/range|checkbox|radio|file|hidden/.test(e.type || '');
    const iconOnly = /^(BUTTON|A)$/.test(e.tagName) || e.getAttribute('role') === 'button' ? (!(e.textContent || '').trim() && e.querySelector('svg')) : false;
    if (!own && !isInput && !iconOnly) continue;
    const cs = getComputedStyle(e);
    let fgEl = e; if (iconOnly) fgEl = e.querySelector('svg');
    const fcs = getComputedStyle(fgEl);
    let fg = toRgb(iconOnly ? (fcs.stroke && fcs.stroke !== 'none' && !/^url/.test(fcs.stroke) ? fcs.stroke : fcs.fill !== 'none' ? fcs.fill : fcs.color) : cs.color);
    const { bg, opacity, complex } = bgOf(e);
    const fgA = { ...fg, a: fg.a * opacity };
    const fgOn = over(fgA, bg);
    const fs = parseFloat(cs.fontSize), fw = +cs.fontWeight;
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const cls = iconOnly ? 'icon>=3' : large ? 'large>=3' : 'normal>=4.5';
    const need = cls === 'normal>=4.5' ? 4.5 : 3;
    const ov = complex || overlay(e);
    const r = ratio(fgOn, bg);
    const b = e.getBoundingClientRect();
    out.push({ key: keyOf(e), tag: e.tagName.toLowerCase(), token: tokenOf(e), fg: `rgb(${Math.round(fg.r)},${Math.round(fg.g)},${Math.round(fg.b)})/${fg.a.toFixed(2)}`, opacity: +opacity.toFixed(2), bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`, ratio: ov ? '?' : +r.toFixed(2), computedRatioIgnoringBackdrop: +r.toFixed(2), backdrop: ov, fontPx: fs, weight: fw, cls, pass: ov ? '?' : r >= need, disabled: !!e.disabled || !!e.closest('[disabled],[aria-disabled=true]'), box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] });
  }
  return out;
}
// Pixel sampler on a separate blank page: modal pixel = bg; pixel with max contrast vs bg = fg.
async function pixelSample(ctx, png, boxes) {
  const pg = await ctx.newPage(); await pg.goto('about:blank');
  const res = await pg.evaluate(async ({ b64, boxes }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const lum = (r, gg, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(b); };
    return boxes.map((bx) => { const [x, y, w, h] = bx.box; if (w < 2 || h < 2 || x < 0 || y < 0 || x + w > c.width || y + h > c.height) return { ...bx, err: 'out of frame' }; const d = g.getImageData(x, y, w, h).data; const hist = new Map(); for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; hist.set(k, (hist.get(k) || 0) + 1); } let bgk = 0, bn = 0; for (const [k, n] of hist) if (n > bn) { bn = n; bgk = k; } const br = bgk >> 16, bgg = (bgk >> 8) & 255, bb = bgk & 255; const Lb = lum(br, bgg, bb); let best = 1, fk = bgk; const ratios = []; for (const [k, n] of hist) { if (n < 3) continue; const L2 = lum(k >> 16, (k >> 8) & 255, k & 255); const r = (Math.max(L2, Lb) + 0.05) / (Math.min(L2, Lb) + 0.05); ratios.push(r); if (r > best) { best = r; fk = k; } } return { ...bx, pixBg: `rgb(${br},${bgg},${bb})`, pixFg: `rgb(${fk >> 16},${(fk >> 8) & 255},${fk & 255})`, pixRatio: +best.toFixed(2), bgShare: +(bn / (w * h)).toFixed(2), colours: hist.size }; });
  }, { b64: png.toString('base64'), boxes });
  await pg.close(); return res;
}
async function buildS1(p) {
  const steps = [];
  steps.push({ step: 'setSnapOff', snap: await L.setSnapOff(p) });
  steps.push({ step: 'addAt demo-hero-music music 0', r: await L.addAt(p, 'demo-hero-music', 'music', 0) });
  steps.push({ step: 'addAt demo-stem-pulse stems 2', r: await L.addAt(p, 'demo-stem-pulse', 'stems', 2) });
  steps.push({ step: 'addAt demo-soft-impact sfx 4', r: await L.addAt(p, 'demo-soft-impact', 'sfx', 4) });
  await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
  steps.push({ step: 'video input setInputFiles beeps-6s-h264-aac.mp4', status: await L.status(p), videoClips: await p.evaluate(() => [...document.querySelectorAll('[data-clip-kind=video]')].map((e) => e.dataset.clipStart)) });
  steps.push({ step: 'seekTo 1 (ruler click)', pos: await L.seekTo(p, 1) });
  await L.blur(p); await p.keyboard.press('m'); await sleep(400);
  steps.push({ step: 'key M', status: await L.status(p), markers: await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((m) => m.dataset.markerTime)) });
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems').id;
  steps.push({ step: 'range drag on stems clip body 4→2 s (65% height; starting at 2 s would grab the clip left edge)', status: await X.rangeDrag(p, stems, 4, 2), range: await H.range(p) });
  steps.push({ step: 'key Control+l', status: await X.key(p, 'Control+l'), loop: await p.evaluate(() => (document.querySelector('[data-testid=arrangement-loop-times]') || {}).textContent || null) });
  await p.click(L.nameSel('music')); await sleep(150); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(150);
  steps.push({ step: 'click music lane name, Ctrl+click stems lane name, Control+g', status: await X.key(p, 'Control+g'), groups: await p.evaluate(() => document.querySelectorAll('[data-testid=arrangement-group-row]').length) });
  const sfx = (await L.clipsDom(p)).find((c) => c.lane === 'sfx').id;
  await L.selectClip(p, sfx);
  steps.push({ step: 'click SFX clip header (select)', detail: (await L.detailInfo(p)).text });
  if (W === 1280) { const ex = await X.openDetail(p); steps.push({ step: '1280 only: detail toggle was aria-expanded=' + ex + ' → clicked to expand (HR-1280-DETAIL-COLLAPSED)', detail: (await L.detailInfo(p)).text }); }
  await L.blur(p); await p.mouse.move(2, 2); await sleep(500);
  return steps;
}
(async () => {
  const b = await L.launch(); const res = { label: 'post-V-0 RV-1 reference (round-148 tree)', vp: W, run: RUN, keyRule: KEYRULE, states: {} };
  try {
    const { page: p, ctx } = await L.openStudio(b, X.VPS[W], `d6-${W}-r${RUN}`, net);
    await p.mouse.move(2, 2); await sleep(300);
    const cap = async (name, scope) => { const st = { header: await p.evaluate(stateHeader), elements: await p.evaluate(collect, scope) }; let png = null; if (RUN === 1) { png = await p.screenshot({ path: path.join(L.SHOTS, `D6-${name}-${W}.png`) }); st.shot = `c-round-148/shots/D6-${name}-${W}.png`; } return { st, png }; };
    const s0 = await cap('S0', '.studio-container'); res.states.S0 = s0.st;
    if (RUN === 1) { const c0 = await p.evaluate(contrast, '.studio-container'); res.contrastS0 = c0; res.pixS0 = await pixelSample(ctx, s0.png, pickSamples(c0)); }
    res.s1Steps = await buildS1(p);
    const s1 = await cap('S1', '.studio-container'); res.states.S1 = s1.st;
    if (RUN === 1) { const c1 = await p.evaluate(contrast, '.studio-container'); res.contrastS1 = c1; res.pixS1 = await pixelSample(ctx, s1.png, pickSamples(c1)); }
    await X.openDlg(p); await p.mouse.move(2, 2); await sleep(400);
    const s2 = await cap('S2', 'body'); res.states.S2 = s2.st; res.states.S2.scopeNote = 'Export dialog queried from document.body (may be portalled); includes the Studio behind it.';
  } catch (e) { res.error = String(e.stack || e); }
  res.net = X.netOk(net);
  fs.writeFileSync(path.join(OUTD, `d6-${W}-r${RUN}.json`), JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ vp: W, run: RUN, err: res.error, n: Object.fromEntries(Object.entries(res.states).map(([k, v]) => [k, v.elements.length])), net: res.net, s1: (res.s1Steps || []).map((s) => s.step + ' → ' + JSON.stringify(s.status || s.r?.status || s.markers || s.snap || s.pos || '').slice(0, 90)) }, null, 1));
  await b.close();
})();
function pickSamples(c) {
  const ok = c.filter((x) => x.box[2] >= 6 && x.box[3] >= 6);
  const pick = []; const seen = new Set();
  const add = (x) => { if (!x || seen.has(x.key)) return; seen.add(x.key); pick.push({ key: x.key, token: x.token, box: x.box, computed: x.computedRatioIgnoringBackdrop, backdrop: x.backdrop }); };
  for (const want of ['shortcut-hint', 'selected-clip', 'arrangement-status']) add(ok.find((x) => x.key.includes(want)));
  for (const t of ['text-dim', 'text-muted', 'text-foreground', 'text-brand', 'text-accent']) ok.filter((x) => x.token.startsWith(t)).slice(0, 4).forEach(add);
  ok.filter((x) => x.backdrop).slice(0, 6).forEach(add);
  ok.filter((x) => x.cls === 'icon>=3').slice(0, 3).forEach(add);
  return pick.slice(0, 30);
}
