// C round 173 — V-3c-5b browser rows (RADIUS / OV-CORNERS / NARROW-FRAME / BOX / FUNC-SMOKE).
// node c173.cjs <1440|1280> <normal|crops> <attempt>
// normal: DSF 1 boxes, computed styles, real-mouse/keyboard function smoke. crops: DSF 4, 4x corner crops + pixel probes.
const L = require('./lib.cjs');
const { decode } = require('./png.cjs');
const fs = require('fs');
const path = require('path');
const W = process.argv[2]; const MODE = process.argv[3] || 'normal'; const ATT = process.argv[4] || '1';
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 } };
const TAG = `c173-${W}-${MODE}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, MODE, ATT, utc: new Date().toISOString(), states: {}, func: {}, crops: {}, probes: {} };
const out = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });

const measure = (p) => p.evaluate(() => {
  const q = (s) => document.querySelector(s);
  const f2 = (v) => +v.toFixed(2);
  const st = (e) => {
    if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e);
    return { x: f2(b.x), y: f2(b.y), w: f2(b.width), h: f2(b.height), radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '),
      bw: [cs.borderTopWidth, cs.borderRightWidth, cs.borderBottomWidth, cs.borderLeftWidth].join(' '), bc: cs.borderTopColor, bs: cs.borderTopStyle, bg: cs.backgroundColor, shadow: cs.boxShadow, overflow: cs.overflow, cls: typeof e.className === 'string' ? e.className : '' };
  };
  const root = q('[data-testid=arrangement-overview]');
  const pe = q('[data-testid=arrangement-project-end]'); const readout = pe ? pe.closest('div') : null;
  const wave = q('[data-testid=arrangement-library-preview-wave]');
  return {
    root: st(root), overlay: st(root && root.firstElementChild), frame: st(q('[data-testid=arrangement-overview-frame]')), playhead: st(q('[data-testid=arrangement-overview-playhead]')),
    bars: root ? [...root.children[1].querySelectorAll(':scope > div > div')].map(st) : [],
    parent: st(root && root.parentElement),
    ov: root ? { valuenow: root.getAttribute('aria-valuenow'), valuetext: root.getAttribute('aria-valuetext'), extent: root.dataset.extent } : null,
    readout: st(readout), readoutKids: readout ? [...readout.children].map((c) => ({ ...st(c), text: c.textContent.trim() })) : [],
    position: (q('[data-testid=arrangement-position]') || {}).textContent, projectEnd: pe && pe.textContent,
    wave: st(wave), waveAria: wave ? { now: wave.getAttribute('aria-valuenow'), text: wave.getAttribute('aria-valuetext'), disabled: wave.getAttribute('aria-disabled'), role: wave.getAttribute('role'), tab: wave.tabIndex } : null,
    exit: st(q('[data-testid=arrangement-exit]')), exitTag: (q('[data-testid=arrangement-exit]') || {}).tagName,
    zoom: (q('[data-testid=arrangement-zoom-readout]') || {}).textContent,
    rulerLeft: q('[data-testid=arrangement-ruler]') ? f2(q('[data-testid=arrangement-ruler]').getBoundingClientRect().left) : null,
  };
});

const hit = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); const x = b.x + b.width / 2; const y = b.y + b.height / 2; const h = document.elementFromPoint(x, y); return { x, y, hitSelf: h === e || e.contains(h), hitTestid: h && (h.dataset.testid || h.tagName) }; }, sel);

// 4x pixel probes on a screenshot of a rect (css px). Returns diagonal colour sequences per corner + used-radius estimate.
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
async function probeRect(p, name, rect, opts = {}) {
  const pad = 4; const clip = { x: Math.max(0, rect.x - pad), y: Math.max(0, rect.y - pad), width: rect.w + 2 * pad, height: rect.h + 2 * pad };
  const f = path.join(SHD, `${name}.png`); const buf = await p.screenshot({ path: f, clip });
  const img = decode(buf); const s = img.w / clip.width; // device px per css px
  const at = (cx, cy) => { const X = Math.round((cx - clip.x) * s); const Y = Math.round((cy - clip.y) * s); if (X < 0 || Y < 0 || X >= img.w || Y >= img.h) return null; return img.px(X, Y); };
  const corners = { tl: [rect.x, rect.y, 1, 1], tr: [rect.x + rect.w, rect.y, -1, 1], br: [rect.x + rect.w, rect.y + rect.h, -1, -1], bl: [rect.x, rect.y + rect.h, 1, -1] };
  const outD = {};
  for (const [k, [cx, cy, dx, dy]] of Object.entries(corners)) {
    const seq = [];
    for (let d = -1; d <= 7; d += 0.25) { const c = at(cx + dx * (d + 0.01), cy + dy * (d + 0.01)); seq.push([d, c, c ? +lum(c).toFixed(1) : null]); }
    const outside = at(cx - dx * 2, cy - dy * 2);
    const edgeMid = at(cx + dx * 0.4, rect.y + rect.h / 2); // vertical edge border pixel at mid height
    const thr = opts.brightLum;
    let firstBright = null; if (thr != null) { const e = seq.find(([d, c, l]) => d >= 0 && l != null && l >= thr); firstBright = e ? e[0] : null; }
    outD[k] = { seq: seq.map(([d, c, l]) => `${d}:${c ? c.join(',') : '-'}`), outside, edgeMid, firstBrightDiag: firstBright, usedRadiusEst: firstBright != null ? +(firstBright / (1 - Math.SQRT1_2)).toFixed(2) : null };
  }
  // 20x20 css px corner crops (4x when DSF 4)
  const crops = {};
  for (const [k, [cx, cy, dx, dy]] of Object.entries(corners)) { const sz = 20; const x0 = dx > 0 ? cx - 4 : cx - sz + 4; const y0 = dy > 0 ? cy - 4 : cy - sz + 4; const cf = path.join(SHD, `${name}-${k}.png`); await p.screenshot({ path: cf, clip: { x: Math.max(0, x0), y: Math.max(0, y0), width: sz, height: sz } }); crops[k] = path.relative(L.ROOT, cf); }
  return { scale: s, file: path.relative(L.ROOT, f), corners: outD, crops };
}

(async () => {
  const b = await L.launch();
  const opts = MODE === 'crops' ? { deviceScaleFactor: 4 } : {};
  try {
    // W0: the preview wave before the source is ready (poll from first paint).
    {
      const o = await L.openCtx(b, VPS[W], `${TAG}-W0`, net, opts); const p = o.page; const seen = [];
      await p.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
      const t0 = Date.now(); let first = null;
      while (Date.now() - t0 < 90000) {
        const s = await p.evaluate(() => { const w = document.querySelector('[data-testid=arrangement-library-preview-wave]'); if (!w) return null; const cs = getComputedStyle(w); const b = w.getBoundingClientRect(); return { t: performance.now(), cls: w.className, r: cs.borderTopLeftRadius, radii: [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius].join(' '), dis: w.getAttribute('aria-disabled'), op: cs.opacity, cur: cs.cursor, box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)) }; }).catch(() => null);
        if (s) { const key = `${s.dis}|${s.cur}|${s.r}`; if (!seen.length || seen[seen.length - 1].key !== key) seen.push({ key, ...s }); if (!first && /not-allowed/.test(s.cur)) { first = s; await p.screenshot({ path: path.join(SHD, 'W0-wave.png'), clip: { x: s.box[0] - 4, y: s.box[1] - 4, width: s.box[2] + 8, height: s.box[3] + 8 } }).catch(() => {}); } if (/pointer/.test(s.cur) && first) break; }
        await L.sleep(40);
      }
      res.states.W0 = { first, transitions: seen };
      await o.ctx.close();
    }
    const o = await L.openStudio(b, VPS[W], `${TAG}-main`, net, opts); const p = o.page; res.fonts = o.log.fontsReady;
    res.states.O0 = await measure(p); out();
    if (MODE === 'crops') {
      res.probes.O0_root = await probeRect(p, 'O0-root', res.states.O0.root, { brightLum: 120 });
      const rd = res.states.O0.readout; res.probes.T0_readout = await probeRect(p, 'T0-readout', rd);
      const wv = res.states.O0.wave; if (wv) res.probes.W1_wave = await probeRect(p, 'W1-wave', wv);
      const ex = res.states.O0.exit; if (ex) res.probes.exit = await probeRect(p, 'exit', ex);
    } else {
      await p.screenshot({ path: path.join(SHD, 'O0-page.png') });
      // W1 seek with a real click at 1/3 of the wave
      const wh = await hit(p, '[data-testid=arrangement-library-preview-wave]'); const w = res.states.O0.wave;
      const before = (await measure(p)).waveAria; await p.mouse.click(w.x + w.w / 3, w.y + w.h / 2); await L.sleep(500); const after = (await measure(p)).waveAria;
      res.func.waveSeek = { hit: wh, before, after, wave: res.states.W1 = (await measure(p)).wave }; await L.blur(p);
    }
    out();
    // Focus rings (keyboard modality, then focus; checks :focus-visible).
    for (const [id, sel] of [['overview', '[data-testid=arrangement-overview]'], ['wave', '[data-testid=arrangement-library-preview-wave]'], ['exit', '[data-testid=arrangement-exit]']]) {
      await L.blur(p); await p.keyboard.press('Shift');
      const fr = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; e.focus(); const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return { focused: document.activeElement === e, fv: e.matches(':focus-visible'), shadow: cs.boxShadow, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, radius: cs.borderTopLeftRadius, box: [b.x, b.y, b.width, b.height].map((v) => +v.toFixed(2)) }; }, sel);
      if (fr) { const r = { x: fr.box[0], y: fr.box[1], w: fr.box[2], h: fr.box[3] }; const pr = MODE === 'crops' ? await probeRect(p, `focus-${id}`, r) : null; res.func[`focus_${id}`] = { ...fr, crops: pr && pr.crops }; }
      else res.func[`focus_${id}`] = null;
    }
    // Tab reachability (real Tab presses from the body, up to 120)
    await L.blur(p); const tabHits = {}; await p.evaluate(() => document.body.focus());
    for (let i = 0; i < 150; i++) { await p.keyboard.press('Tab'); const t = await p.evaluate(() => (document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.testid : null)); if (['arrangement-overview', 'arrangement-library-preview-wave', 'arrangement-exit'].includes(t) && tabHits[t] == null) tabHits[t] = i + 1; if (Object.keys(tabHits).length === 3) break; }
    res.func.tabReach = tabHits; await L.blur(p);
    out();
    // Clip on music at 1 s, max zoom (O1)
    const z = p.locator('[data-testid=arrangement-zoom]');
    await z.focus(); await p.keyboard.press('End'); await L.sleep(400); await p.keyboard.press('Home'); await L.sleep(400); await L.blur(p); // same sequence as probe-ov.cjs
    res.add = await L.addAt(p, 'demo-middle-east', 'music', 1);
    await z.focus(); await p.keyboard.press('End'); await L.sleep(400); await L.blur(p);
    res.states.O1 = await measure(p); out();
    if (MODE === 'crops') { res.probes.O1_root = await probeRect(p, 'O1-root', res.states.O1.root, { brightLum: 120 }); res.probes.O1_frame = await probeRect(p, 'O1-frame', res.states.O1.frame, { brightLum: 120 }); }
    else await p.screenshot({ path: path.join(SHD, 'O1-page.png') });
    if (MODE === 'normal') {
      // keys
      await p.locator('[data-testid=arrangement-overview]').focus(); const k0 = (await measure(p)).ov;
      await p.keyboard.press('ArrowRight'); await L.sleep(300); const k1 = await measure(p);
      await p.keyboard.press('ArrowLeft'); await L.sleep(300); const k2 = await measure(p);
      res.func.keys = { k0, right: { ov: k1.ov, frameX: k1.frame.x, rulerLeft: k1.rulerLeft }, left: { ov: k2.ov, frameX: k2.frame.x, rulerLeft: k2.rulerLeft }, o1FrameX: res.states.O1.frame.x, o1RulerLeft: res.states.O1.rulerLeft }; await L.blur(p);
      res.func.hitOverview = await hit(p, '[data-testid=arrangement-overview]');
    }
    // O2: click at the probe point (right end)
    const ov = await p.locator('[data-testid=arrangement-overview]').boundingBox();
    await p.mouse.click(ov.x + ov.width - 2, ov.y + ov.height / 2); await L.sleep(500);
    res.states.O2 = await measure(p); out();
    if (MODE === 'crops') { res.probes.O2_root = await probeRect(p, 'O2-root', res.states.O2.root, { brightLum: 120 }); const fr = res.states.O2.frame; res.probes.O2_frame = await probeRect(p, 'O2-frame', { ...fr, w: Math.min(fr.w, res.states.O2.root.x + res.states.O2.root.w - fr.x) }, { brightLum: 120 }); }
    else await p.screenshot({ path: path.join(SHD, 'O2-page.png') });
    // O3: drag the frame to the middle with a real mouse
    { const fr = res.states.O2.frame; const sx = fr.x + Math.min(fr.w, ov.x + ov.width - fr.x) / 2; const sy = ov.y + ov.height / 2; const tx = ov.x + ov.width / 2;
      const h = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e && (e.dataset.testid || e.tagName); }, [sx, sy]);
      await p.mouse.move(sx, sy); await p.mouse.down(); for (let i = 1; i <= 10; i++) { await p.mouse.move(sx + ((tx - sx) * i) / 10, sy); await L.sleep(30); } await p.mouse.up(); await L.sleep(500);
      res.states.O3 = await measure(p); res.func.drag = { from: sx, to: tx, hitAtStart: h, o2: { ov: res.states.O2.ov, frameX: res.states.O2.frame.x, rulerLeft: res.states.O2.rulerLeft }, o3: { ov: res.states.O3.ov, frameX: res.states.O3.frame.x, rulerLeft: res.states.O3.rulerLeft } }; }
    out();
    if (MODE === 'crops') res.probes.O3_frame = await probeRect(p, 'O3-frame', res.states.O3.frame, { brightLum: 120 });
    else {
      await p.screenshot({ path: path.join(SHD, 'O3-page.png') });
      // centre click (records the move); then double-click (onFit)
      const c0 = await measure(p); await p.mouse.click(ov.x + ov.width * 0.25, ov.y + ov.height / 2); await L.sleep(500); const c1 = await measure(p);
      res.func.click = { at: 0.25, before: { ov: c0.ov, frameX: c0.frame.x, frameW: c0.frame.w }, after: { ov: c1.ov, frameX: c1.frame.x, frameW: c1.frame.w } };
      await L.sleep(800); await p.mouse.dblclick(ov.x + ov.width * 0.6, ov.y + ov.height / 2); await L.sleep(800); const d1 = await measure(p);
      res.func.dblclick = { before: { zoom: c1.zoom, frameX: c1.frame.x, frameW: c1.frame.w, ov: c1.ov }, after: { zoom: d1.zoom, frameX: d1.frame.x, frameW: d1.frame.w, ov: d1.ov } };
      await p.screenshot({ path: path.join(SHD, 'dbl-page.png') });
      // T0 readout advances during Space playback
      await L.blur(p); const pos0 = (await measure(p)).position; await p.keyboard.press('Space'); await L.sleep(1200); const pos1 = (await measure(p)).position; await L.sleep(800); const pos2 = (await measure(p)).position; await p.keyboard.press('Space'); await L.sleep(400);
      res.func.readout = { pos0, pos1, pos2, projectEnd: (await measure(p)).projectEnd }; await p.keyboard.press('Home'); await L.sleep(300);
      res.states.T0clip = await measure(p);
    }
    res.logMain = o.log;
    await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close(); out();
  console.log(JSON.stringify({ fonts: res.fonts && res.fonts.ok, error: res.error, func: MODE === 'normal' ? res.func : undefined }, null, 1));
})();
