// C round 174 — DUX-R-5a browser rows: CC-COLOUR, NO-BRASS-CONTENT, SELECTION-BRASS, CONTRAST-DUX5A, STATE-DISTINCT.
// node c174.cjs <1440|1280> <attempt>   (DPR 2, fresh context)
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c174-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), setup: {}, cc: {}, scans: {}, contrast: {}, shots: {} };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const parse = (s) => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { rgb: v.slice(0, 3), a: v.length > 3 ? v[3] : 1 }; };
const over = (fg, bg) => fg.rgb.map((c, i) => Math.round(c * fg.a + bg[i] * (1 - fg.a)));
const brass = (c) => c[0] - c[2] >= 45;

// computed colours of every relevant element (in page)
const comp = () => {
  const cs = (e) => (e ? getComputedStyle(e) : null);
  const opaqueBg = (e) => { let n = e; const chain = []; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; chain.push(b); if (!/rgba\(.*,\s*0\)$/.test(b) && b !== 'transparent') { const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); if (!m || +m[1] === 1) return { bg: b, chain }; } n = n.parentElement; } return { bg: 'rgb(0,0,0)', chain }; };
  const clip = (e) => { const head = e.children[0]; const body = e.children[1]; const wf = e.querySelector('[data-testid=arrangement-clip-waveform]'); const path = wf && wf.querySelector('path'); const ramps = e.querySelector('[data-testid$=-fade-ramps]'); const icon = head && head.querySelector('svg'); const b = e.getBoundingClientRect(); const hb = head.getBoundingClientRect(); const bb = body ? body.getBoundingClientRect() : null;
    return { id: e.dataset.clipId, kind: e.dataset.clipKind, lane: e.closest('[data-track-id]').dataset.trackId, sel: /ring-brand/.test(e.className), rootCls: e.className, rootBg: cs(e).backgroundColor, rootBorder: cs(e).borderTopColor, rootUnder: opaqueBg(e.parentElement).bg,
      headCls: head.className, headBg: cs(head).backgroundColor, headColor: cs(head).color, icon: icon ? icon.getAttribute('class') : null,
      bodyCls: body && body.className, bodyColor: body && cs(body).color, pathFill: path && cs(path).fill, rampsCls: ramps && ramps.getAttribute('class'), rampsColor: ramps && cs(ramps).color, rampsPathStroke: ramps && ramps.querySelector('path') && cs(ramps.querySelector('path')).stroke,
      box: [b.x, b.y, b.width, b.height], head: [hb.x, hb.y, hb.width, hb.height], body: bb && [bb.x, bb.y, bb.width, bb.height],
      handles: [...e.querySelectorAll('[data-testid$=-handle]')].map((h) => { const r = h.getBoundingClientRect(); return { t: h.dataset.testid, op: cs(h).opacity, bg: cs(h).backgroundColor, box: [r.x, r.y, r.width, r.height] }; }) };
  };
  const ov = document.querySelector('[data-testid=arrangement-overview]');
  const ph = document.querySelector('[data-testid=arrangement-overview-playhead]');
  const det = document.querySelector('[data-testid=arrangement-detail-waveform]');
  const detPath = det && det.querySelector('path');
  const detPh = det && [...det.querySelectorAll('*')].find((n) => /\bw-px\b/.test(n.getAttribute('class') || '') && /bg-accent/.test(n.getAttribute('class') || ''));
  const rows = ov ? [...ov.children[1].children] : [];
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map(clip),
    overview: ov && { box: (() => { const r = ov.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })(), bg: cs(ov).backgroundColor, under: opaqueBg(ov).bg, focusVisible: ov.matches(':focus-visible'), active: document.activeElement === ov,
      rows: rows.map((r, i) => ({ i, bars: [...r.querySelectorAll(':scope > div')].map((b) => { const bb = b.getBoundingClientRect(); return { cls: b.className, bg: cs(b).backgroundColor, box: [bb.x, bb.y, bb.width, bb.height] }; }) })),
      playhead: ph && { cls: ph.className, bg: cs(ph).backgroundColor, box: (() => { const r = ph.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })() },
      frame: (() => { const f = document.querySelector('[data-testid=arrangement-overview-frame]'); if (!f) return null; const r = f.getBoundingClientRect(); return { cls: f.className, border: cs(f).borderTopColor, bg: cs(f).backgroundColor, box: [r.x, r.y, r.width, r.height] }; })() },
    detail: det && { cls: det.className, color: cs(det).color, bg: cs(det).backgroundColor, under: opaqueBg(det).bg, pathFill: detPath && cs(detPath).fill, box: (() => { const r = det.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })(), playhead: detPh ? { display: cs(detPh).display, cls: detPh.getAttribute('class'), box: (() => { const r = detPh.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; })() } : null },
    mainPlayhead: (() => { const e = document.querySelector('[data-testid=arrangement-playhead]'); if (!e) return null; const r = e.getBoundingClientRect(); return { box: [r.x, r.y, r.width, r.height], bg: getComputedStyle(e).backgroundColor }; })(),
    tracksOrder: [...document.querySelectorAll('[data-track-id]')].map((t) => t.dataset.trackId),
  };
};

// composite css colours with a real canvas (handles oklab + alpha)
const mixAll = (cc) => {
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (...layers) => { g.clearRect(0, 0, 1, 1); g.globalAlpha = 1; for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const out = { clips: {}, overview: [], detail: null };
  const U = cc.U;
  for (const c of U.clips) { const base = mix('rgb(14, 13, 12)', c.rootBg); out.clips[`${c.kind}-${c.lane}`] = { base, wave: mix('rgb(14, 13, 12)', c.rootBg, c.pathFill), head: mix('rgb(14, 13, 12)', c.rootBg, c.headBg), headText: mix('rgb(14, 13, 12)', c.headColor) }; }
  const ov = U.overview; out.overviewBase = mix('rgb(0,0,0)', ov.under, ov.bg);
  out.overview = ov.rows.map((r) => r.bars.map((b) => ({ cls: b.cls, c: mix('rgb(0,0,0)', ov.under, ov.bg, b.bg) })));
  if (cc.SA.detail) { const d = cc.SA.detail; out.detail = { base: mix('rgb(0,0,0)', d.under, d.bg), wave: mix('rgb(0,0,0)', d.under, d.bg, d.pathFill || d.color) }; }
  out.selectedHead = cc.SA.clips.filter((c) => c.sel).map((c) => ({ kind: c.kind, head: mix('rgb(14, 13, 12)', c.rootBg, c.headBg), text: mix('rgb(0,0,0)', c.headColor) }));
  return out;
};
let lastPng = null;
async function snap(p, name) { const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f }); lastPng = decode(buf); res.shots[name] = path.relative(L.ROOT, f); return lastPng; }
// scan css rect [x,y,w,h] in the last screenshot; excl = list of css rects to skip
function scan(img, rect, excl = []) {
  const D = img.w / (W === 1440 ? 1440 : 1280);
  const [x, y, w, h] = rect; let n = 0, b = 0; const hist = new Map(); const samples = [];
  for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let Xp = Math.ceil(x * D); Xp < Math.floor((x + w) * D); Xp++) {
    const cx = Xp / D, cy = Y / D; if (excl.some(([ex, ey, ew, eh]) => cx >= ex && cx < ex + ew && cy >= ey && cy < ey + eh)) continue;
    if (Xp >= img.w || Y >= img.h) continue;
    const c = img.px(Xp, Y); n++; const k = c.join(','); hist.set(k, (hist.get(k) || 0) + 1);
    if (brass(c)) { b++; if (samples.length < 8) samples.push({ x: +cx.toFixed(1), y: +cy.toFixed(1), c }); }
  }
  const top = [...hist.entries()].sort((a, c) => c[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}:${v}`);
  return { rect: rect.map((v) => +v.toFixed(2)), n, brass: b, brassSamples: samples, top };
}
const inset = ([x, y, w, h], d) => [x + d, y + d, w - 2 * d, h - 2 * d];
const phEx = (st) => (st.mainPlayhead ? [[st.mainPlayhead.box[0] - 3, -10, st.mainPlayhead.box[2] + 6, 5000]] : []);
const bodyRect = (c) => inset([c.box[0], c.head[1] + c.head[3], c.box[2], c.box[1] + c.box[3] - (c.head[1] + c.head[3])], 3);

(async () => {
  const b = await L.launch();
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.mouse.move(2, 2); res.setup.snap = await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.setup.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-stem-bass', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    await sleep(800); await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
    { const selId = await p.evaluate(() => { const e = [...document.querySelectorAll('[data-clip-id]')].find((c) => /ring-brand/.test(c.className)); return e && e.dataset.clipId; }); res.setup.selectedAfterAdd = selId; if (selId) { await L.selectClip(p, selId, ['Control']); } }
    res.setup.selectedAfterCtrlClick = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => /ring-brand/.test(c.className)).map((c) => c.dataset.clipId));
    await L.blur(p); await p.mouse.move(2, 2); await sleep(400);
    res.setup.playheadPos = await L.posNow(p);
    res.setup.envToggle = await p.evaluate(() => document.querySelector('[data-testid=arrangement-envelope-toggle]').getAttribute('aria-pressed'));
    // ---- state U: nothing selected, no fades, pointer off clips, Overview not focused
    const U = await p.evaluate(comp); res.cc.U = U; save();
    let img = await snap(p, 'U-unselected');
    res.scans.U = {};
    for (const c of U.clips) { res.scans.U[`${c.kind}-${c.lane}-body`] = scan(img, bodyRect(c), phEx(U)); res.scans.U[`${c.kind}-${c.lane}-bodyInclPlayhead`] = scan(img, bodyRect(c)); res.scans.U[`${c.kind}-${c.lane}-sel`] = c.sel; }
    for (const c of U.clips) res.scans.U[`${c.kind}-${c.lane}-header`] = scan(img, c.head, phEx(U));
    if (U.overview) { const ph = U.overview.playhead ? U.overview.playhead.box : null; const ex = ph ? [[ph[0] + ph[2] / 2 - 3, U.overview.box[1] - 5, 6, U.overview.box[3] + 10]] : []; res.scans.U.overview = scan(img, inset(U.overview.box, 1), ex); res.scans.U.overviewPlayheadColumn = ph ? scan(img, [ph[0] + ph[2] / 2 - 3, U.overview.box[1], 6, U.overview.box[3]]) : null; }
    save();
    // ---- state S-audio: music clip selected; detail box with playback stopped
    const music = U.clips.find((c) => c.lane === 'music'); const video = U.clips.find((c) => c.kind === 'video');
    await L.selectClip(p, music.id); await p.mouse.move(2, 2); await sleep(300);
    res.setup.detailWasExpanded = await X.openDetail(p); await p.mouse.move(2, 2); await sleep(500);
    const SA = await p.evaluate(comp); res.cc.SA = SA;
    img = await snap(p, 'SA-audio-selected');
    const m2 = SA.clips.find((c) => c.id === music.id);
    const hEx = m2.handles.map((h) => [h.box[0] - 1, h.box[1] - 1, h.box[2] + 2, h.box[3] + 2]);
    res.scans.SA = { header: scan(img, m2.head), bodyAway: scan(img, bodyRect(m2), [...hEx, ...phEx(SA)]), handles: m2.handles.map((h) => ({ t: h.t, op: h.op, bg: h.bg, ...scan(img, h.box) })), ringTop: scan(img, [m2.box[0] - 2, m2.box[1] - 2, m2.box[2] + 4, 3]), ringLeft: scan(img, [m2.box[0] - 2, m2.box[1], 3, m2.box[3]]) };
    if (SA.detail) { const d = SA.detail; res.scans.SA.detailNoExcl = scan(img, inset(d.box, 2)); const ex = d.playhead && d.playhead.display !== 'none' ? [[d.playhead.box[0] - 3, d.box[1], 6, d.box[3]]] : []; res.scans.SA.detail = scan(img, inset(d.box, 2), ex); }
    save();
    // ---- state SV: video clip selected
    await L.selectClip(p, video.id); await p.mouse.move(2, 2); await sleep(300);
    const SV = await p.evaluate(comp); res.cc.SV = SV;
    img = await snap(p, 'SV-video-selected');
    const v2 = SV.clips.find((c) => c.id === video.id); const vEx = v2.handles.map((h) => [h.box[0] - 1, h.box[1] - 1, h.box[2] + 2, h.box[3] + 2]);
    res.scans.SV = { header: scan(img, v2.head), bodyAway: scan(img, bodyRect(v2), [...vEx, ...phEx(SV)]), handles: v2.handles.map((h) => ({ t: h.t, op: h.op, bg: h.bg, ...scan(img, h.box) })), ringTop: scan(img, [v2.box[0] - 2, v2.box[1] - 2, v2.box[2] + 4, 3]) };
    if (SV.detail) res.scans.SV.detail = { note: 'video selected', cls: SV.detail.cls };
    save();
    // ---- set a video fade-in with the real handle (video selected)
    const hin = v2.handles.find((h) => /in-handle/.test(h.t));
    if (hin) { const sx = hin.box[0] + hin.box[2] / 2, sy = hin.box[1] + hin.box[3] / 2; await p.mouse.move(sx, sy); await p.mouse.down(); await p.mouse.move(sx + 40, sy, { steps: 8 }); await p.mouse.up(); await sleep(500); res.setup.fadeStatus = await L.status(p); }
    await p.mouse.move(2, 2); await sleep(300);
    const SF = await p.evaluate(comp); res.cc.SF = SF; img = await snap(p, 'SF-video-fade-selected');
    // unselected video with fade (active handle visible: known 5b site)
    await p.keyboard.press('Escape'); await L.blur(p); await p.mouse.move(2, 2); await sleep(400);
    const UF = await p.evaluate(comp); res.cc.UF = UF; img = await snap(p, 'UF-video-fade-unselected');
    const v3 = UF.clips.find((c) => c.id === video.id); const v3Ex = v3.handles.filter((h) => +h.op > 0).map((h) => [h.box[0] - 1, h.box[1] - 1, h.box[2] + 2, h.box[3] + 2]);
    res.scans.UF = { bodyAwayFromHandles: scan(img, bodyRect(v3), [...v3Ex, ...phEx(UF)]), bodyAll: scan(img, bodyRect(v3), phEx(UF)), handles: v3.handles.map((h) => ({ t: h.t, op: h.op, bg: h.bg })) };
    // crops for STATE-DISTINCT
    const crop = async (name, c) => { const f = path.join(SHD, `${name}.png`); await p.screenshot({ path: f, clip: { x: Math.max(0, c.box[0] - 4), y: c.box[1] - 6, width: Math.min(420, c.box[2] + 8), height: c.box[3] + 12 } }); res.shots[name] = path.relative(L.ROOT, f); };
    for (const c of UF.clips) await crop(`crop-unsel-${c.lane}`, c);
    for (const id of [music.id, video.id]) { await L.selectClip(p, id); await p.mouse.move(2, 2); await sleep(300); const c = (await p.evaluate(comp)).clips.find((x) => x.id === id); await crop(`crop-sel-${c.lane}`, c); }
    res.mix = await p.evaluate(mixAll, res.cc);
    res.logMain = o.log; await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close();
  // ---- derived colours and contrast
  try {
    const U = res.cc.U; const SA = res.cc.SA; const SF = res.cc.SF; const rgb = (s) => parse(s).rgb;
    const d = {}; const M = res.mix;
    for (const c of U.clips) { const m = M.clips[`${c.kind}-${c.lane}`]; d[`${c.kind}-${c.lane}`] = { sel: c.sel, rootBg: c.rootBg, base: m.base, pathFill: c.pathFill, waveComposite: m.wave, waveVsBody: cr(m.wave, m.base), waveRminusB: m.wave[0] - m.wave[2], headBg: c.headBg, headComposite: m.head, headText: m.headText, headTextVsHead: cr(m.headText, m.head), icon: c.icon, envLineVsWave: cr([236, 230, 218], m.wave) }; }
    const aud0 = d['audio-music'], vid0 = Object.entries(d).find(([k]) => k.startsWith('video')); if (aud0 && vid0) d.videoHeadVsAudioHead = cr(vid0[1].headComposite, aud0.headComposite);
    d.overviewMix = { base: M.overviewBase, rows: M.overview.map((r) => r.map((b) => ({ cls: b.cls, c: b.c, vsRoot: cr(b.c, M.overviewBase), RminusB: b.c[0] - b.c[2] }))), playhead: U.overview.playhead, frame: U.overview.frame, tracks: U.tracksOrder };
    if (M.detail) d.detailMix = { ...M.detail, vsBox: cr(M.detail.wave, M.detail.base), cls: SA.detail.cls, playhead: SA.detail.playhead };
    d.selectedHeadMix = M.selectedHead.map((h) => ({ ...h, textVsHead: cr(h.text, h.head) }));
    const vfr = SF.clips.find((c) => c.kind === 'video'); d.videoRamps = { cls: vfr.rampsCls, color: vfr.rampsColor, stroke: vfr.rampsPathStroke };
    d.selected = { audio: res.cc.SA.clips.filter((c) => c.sel).map((c) => ({ kind: c.kind, rootCls: c.rootCls, headCls: c.headCls, headBg: c.headBg, border: c.rootBorder })), video: res.cc.SV.clips.filter((c) => c.sel).map((c) => ({ kind: c.kind, rootCls: c.rootCls, headCls: c.headCls, headBg: c.headBg, border: c.rootBorder })) };
    res.derived = d;
  } catch (e) { res.derivedError = String(e && e.stack || e); }
  save();
  const brief = { error: res.error, derivedError: res.derivedError, fonts: res.fonts, setup: res.setup, scans: Object.fromEntries(Object.entries(res.scans).map(([k, v]) => [k, Object.fromEntries(Object.entries(v || {}).map(([k2, v2]) => [k2, Array.isArray(v2) ? v2.map((h) => `${h.t} op${h.op} brass${h.brass}/${h.n}`) : v2 && v2.n != null ? `brass ${v2.brass}/${v2.n} top ${v2.top.slice(0, 2).join(' ')}` : v2]))])), derived: res.derived, net: X.netOk(net) };
  console.log(JSON.stringify(brief, null, 1));
})();
