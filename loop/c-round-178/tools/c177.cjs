// C round 177 — DUX-R-5b-2b browser rows: CC-TOGGLE, NO-BRASS-TOGGLE, CONTRAST-TOGGLE, STATE-DISTINCT-TOGGLE, LOOP-EDGE.
// node c177.cjs <1440|1280> <attempt>   (DPR 2, fresh context, --disable-lcd-text unless LCD=1). Built on c176.cjs helpers.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c177-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), setup: {}, rows: { on: {}, off: {}, extra: {} }, shots: {} };
const save = () => L.save(L.OUT, `${TAG}.json`, { ...res, net });
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const cr = (a, b) => { if (!a || !b) return null; const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const brass = (c) => c[0] - c[2] >= 45;
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
const info = (el) => {
  if (!el) return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); const transparent = b === 'transparent' || (m && +m[1] === 0); if (!transparent && (!m || +m[1] === 1) && !/color\(|oklab|oklch/.test(b)) break; if (!transparent && /color\(|oklab|oklch/.test(b) && !/\/\s*0?\.\d|\/\s*0\b/.test(b)) break; n = n.parentElement; } if (!n) layers.unshift('rgb(0,0,0)'); return layers; };
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, border: cs.borderTopColor, borderStyle: cs.borderTopStyle, borderWidth: cs.borderTopWidth, color: cs.color, cls: el.getAttribute('class'), pressed: el.getAttribute('aria-pressed'), disabled: !!el.disabled, text: (el.textContent || '').trim().slice(0, 30), value: el.value, follow: el.dataset.followMode, loopEnabled: el.dataset.loopEnabled, hover: el.matches(':hover'), active: el.matches(':active'), focus: el.matches(':focus-visible'), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null, borderRgb: (() => { g.clearRect(0, 0, 1, 1); g.fillStyle = mix(el.parentElement ? stackOf(el.parentElement) : ['#000']).length && `rgb(${mix(el.parentElement ? stackOf(el.parentElement) : ['#000']).join(',')})`; g.fillRect(0, 0, 1, 1); g.fillStyle = cs.borderTopColor; g.fillRect(0, 0, 1, 1); return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); })() };
};
// selectors: css string or a function returning a locator
const SEL = {
  delete: (p) => p.locator('button', { has: p.locator('span', { hasText: /^Delete$/ }) }).first(),
  loop: (p) => p.locator('button', { has: p.locator('span', { hasText: /^Loop$/ }) }).first(),
  follow: (p) => p.locator('[data-testid=arrangement-follow]'),
  metronome: (p) => p.locator('[data-testid=arrangement-metronome-toggle]'),
  snap: (p) => p.locator('[data-testid=arrangement-snap-toggle]'),
  env: (p) => p.locator('[data-testid=arrangement-envelope-toggle]'),
  wzoom: (p) => p.locator('[data-testid=arrangement-waveform-zoom]'),
  brace: (p) => p.locator('[data-testid=arrangement-loop-brace]'),
  braceLabel: (p) => p.locator('[data-testid=arrangement-loop-brace] > span').first(),
  startEdge: (p) => p.locator('[data-testid=arrangement-loop-start-edge]'),
  endEdge: (p) => p.locator('[data-testid=arrangement-loop-end-edge]'),
  preview: (p) => p.locator('[data-testid=arrangement-library-preview-toggle]'),
  previewing: (p) => p.locator('[data-testid=arrangement-library-option-previewing]'),
};
const infoOf = async (p, k) => { const loc = SEL[k](p); if (!(await loc.count())) return null; const h = await loc.elementHandle(); return p.evaluate(info, h); };
const centre = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
const phBox = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-playhead]'); if (!e) return []; const r = e.getBoundingClientRect(); return [[r.x - 3, -10, r.width + 6, 5000]]; });
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(450); }
const clipSig = (p) => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].map((e) => `${e.dataset.clipId}@${e.getAttribute('data-clip-start')}:${e.getBoundingClientRect().width.toFixed(1)}`).join('|'));

// rest / hover / press. Press: mouse down on the centre, read, move off, release (no click).
async function onState(p, name, k, { select = false } = {}) {
  const r = { k };
  await rest(p); const ph = await phBox(p);
  const i0 = await infoOf(p, k); if (!i0) { r.error = 'not found'; res.rows.on[name] = r; save(); return r; }
  const sig0 = await clipSig(p);
  r.rest = i0; await snap(p, `on-${name}-rest`);
  r.rest.scan1 = scan(inset(i0.box, 1), ph);
  const [cx, cy] = centre(i0.box);
  await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
  const i1 = await infoOf(p, k); r.hover = i1; await snap(p, `on-${name}-hover`);
  r.hover.scan1 = scan(inset(i1.box, 1), ph);
  await p.mouse.down(); await sleep(450);
  const i2 = await infoOf(p, k); r.press = i2;
  if (select) { await p.keyboard.press('Escape'); await sleep(200); r.press.scan1 = 'skipped: native select popup (press read only)'; }
  else { await snap(p, `on-${name}-press`); r.press.scan1 = scan(inset(i2.box, 1), ph); }
  await p.mouse.move(2, 2, { steps: 4 }); await sleep(100); await p.mouse.up(); await sleep(350);
  const i3 = await infoOf(p, k); r.after = { pressed: i3.pressed, value: i3.value, follow: i3.follow, cls: i3.cls };
  r.clipsUnchanged = (await clipSig(p)) === sig0;
  await rest(p);
  res.rows.on[name] = r; save(); return r;
}
async function offState(p, name, k) { await rest(p); const i = await infoOf(p, k); if (i) { await snap(p, `off-${name}`); i.scan1 = scan(inset(i.box, 1), await phBox(p)); } res.rows.off[name] = i; save(); return i; }
const clickK = async (p, k) => { const b = await SEL[k](p).boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await sleep(400); await p.mouse.move(2, 2); await sleep(200); };
async function crop(p, name, ks, pad = 8) { const bs = []; for (const k of ks) { const b = await SEL[k](p).boundingBox().catch(() => null); if (b) bs.push(b); } if (!bs.length) return; const x = Math.max(0, Math.min(...bs.map((b) => b.x)) - pad), y = Math.max(0, Math.min(...bs.map((b) => b.y)) - pad); const clip = { x, y, width: Math.max(...bs.map((b) => b.x + b.width)) - x + pad, height: Math.max(...bs.map((b) => b.y + b.height)) - y + pad }; const f = path.join(SHD, `${name}.png`); await p.screenshot({ path: f, clip }); res.shots[name] = path.relative(L.ROOT, f); }
// hover an edge (no fill when not hovered) and read its composite over the brace
async function edgeHover(p, name, k) {
  await rest(p); const ph = await phBox(p);
  const brace = await infoOf(p, 'brace'); const e0 = await infoOf(p, k);
  const [cx, cy] = centre(e0.box); await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
  const e1 = await infoOf(p, k); await snap(p, `edge-${name}-hover`);
  const r = { brace: { bg: brace.bg, comp: brace.composite, under: brace.under }, rest: { bg: e0.bg, comp: e0.composite }, hover: { bg: e1.bg, comp: e1.composite, hov: e1.hover, box: e1.box }, scan: scan(e1.box, ph), scanInset: scan(inset(e1.box, 0.5), ph), crHoverVsBrace: cr(e1.composite, brace.composite), crHoverVsStrip: cr(e1.composite, brace.under) };
  await rest(p); res.rows.extra[`edge-${name}`] = r; save(); return r;
}

(async () => {
  const LCD = !!process.env.LCD;
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', ...(LCD ? [] : ['--disable-lcd-text'])] }); res.noLcd = !LCD;
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    // load state: before any click
    await p.mouse.move(2, 2); await sleep(300);
    res.setup.load = { follow: await infoOf(p, 'follow'), snap: await infoOf(p, 'snap'), env: await infoOf(p, 'env'), wzoom: await infoOf(p, 'wzoom'), metronome: await infoOf(p, 'metronome'), loop: await infoOf(p, 'loop'), delete: await infoOf(p, 'delete') };
    await snap(p, 'load-state'); await crop(p, 'load-follow', ['follow']);
    res.setup.snapWas = res.setup.load.snap && res.setup.load.snap.pressed;
    res.setup.snap = await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.setup.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    await sleep(800); await L.blur(p);
    // tempo
    const ti = p.locator('[data-testid=arrangement-tempo-input]'); await ti.click(); await ti.fill('120'); await p.keyboard.press('Enter'); await sleep(400); await L.blur(p);
    res.setup.tempo = await ti.inputValue();
    await p.keyboard.press('Home'); await sleep(300);
    const clips = await L.clipsDom(p); res.setup.clips = clips;
    const music = clips.find((c) => c.lane === 'music');
    // off reads
    await offState(p, 'metronome', 'metronome'); await offState(p, 'snap', 'snap'); await offState(p, 'env', 'env'); await offState(p, 'wzoom', 'wzoom');
    await crop(p, 'pair-off-snap-env-zoom', ['snap', 'env', 'wzoom']); await crop(p, 'pair-off-metronome', ['metronome']);
    // Delete without a range, a clip selected
    await L.selectClip(p, music.id); res.setup.selectedForDelete = (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.id);
    await offState(p, 'delete-norange', 'delete'); await crop(p, 'pair-off-delete', ['delete']);
    // range on music 2..4
    res.setup.range = await X.rangeDrag(p, music.id, 2, 4); await p.keyboard.press('Home'); await sleep(300);
    await offState(p, 'loop-range', 'loop'); await crop(p, 'pair-off-loop', ['loop']);
    await onState(p, 'delete-range', 'delete'); await crop(p, 'pair-on-delete', ['delete']);
    // Loop on
    await clickK(p, 'loop'); res.setup.loopOn = await SEL.loop(p).getAttribute('aria-pressed');
    await p.keyboard.press('Home'); await sleep(300);
    await onState(p, 'loop', 'loop'); await crop(p, 'pair-on-loop', ['loop']);
    // brace enabled
    await rest(p); { const ph = await phBox(p); const bi = await infoOf(p, 'brace'); const li = await infoOf(p, 'braceLabel'); await snap(p, 'brace-enabled'); bi.scan1 = scan(inset(bi.box, 1), ph); bi.scanAll = scan(bi.box, ph); res.rows.on['brace'] = { rest: bi, label: li }; save(); await crop(p, 'brace-enabled-crop', ['brace'], 12); }
    await edgeHover(p, 'start', 'startEdge'); await edgeHover(p, 'end', 'endEdge');
    // Metronome / Snap / Env on
    await clickK(p, 'metronome'); await onState(p, 'metronome', 'metronome'); await crop(p, 'pair-on-metronome', ['metronome']);
    await clickK(p, 'snap'); await onState(p, 'snap', 'snap');
    await clickK(p, 'env'); await onState(p, 'env', 'env');
    // Waveform Zoom 200 %
    await SEL.wzoom(p).selectOption('2'); await sleep(400); await L.blur(p);
    await onState(p, 'wzoom', 'wzoom', { select: true });
    await crop(p, 'pair-on-snap-env-zoom', ['snap', 'env', 'wzoom']);
    await SEL.wzoom(p).selectOption('1'); await sleep(300); await L.blur(p); await offState(p, 'wzoom-back', 'wzoom');
    await clickK(p, 'snap'); await offState(p, 'snap-back', 'snap'); await clickK(p, 'env'); await offState(p, 'env-back', 'env'); await clickK(p, 'metronome'); await offState(p, 'metronome-back', 'metronome');
    // Follow on (as loaded), off, on
    await onState(p, 'follow-on', 'follow'); await crop(p, 'follow-on', ['follow']);
    await clickK(p, 'follow'); await offState(p, 'follow-off', 'follow'); await crop(p, 'follow-off', ['follow']);
    await clickK(p, 'follow'); res.setup.followBack = await SEL.follow(p).getAttribute('data-follow-mode');
    // Follow paused: zoom in until scrollable, play, manual scroll
    {
      const sc = '[data-testid=arrangement-timeline-scroller]';
      const sl = p.locator('[aria-label="' + (await p.evaluate(() => { const i = document.querySelector('input[type=range][aria-label*="oom"]'); return i ? i.getAttribute('aria-label') : ''; })) + '"]').first();
      for (let i = 0; i < 40; i++) { const s = await p.evaluate((sc) => { const e = document.querySelector(sc); return e.scrollWidth - e.clientWidth; }, sc); if (s > 400) break; await sl.focus(); await p.keyboard.press('ArrowRight'); await sleep(60); }
      res.setup.scrollable = await p.evaluate((sc) => { const e = document.querySelector(sc); return { sw: e.scrollWidth, cw: e.clientWidth }; }, sc);
      await L.blur(p); await p.keyboard.press('Home'); await sleep(200); await p.keyboard.press('Space'); await sleep(700);
      const sb = await p.locator(sc).boundingBox(); await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.wheel(300, 0); await sleep(500);
      res.setup.pausedWhilePlaying = await SEL.follow(p).getAttribute('data-follow-mode');
      await L.blur(p); await p.keyboard.press('Space'); await sleep(500);
      res.setup.pausedAfterStop = await SEL.follow(p).getAttribute('data-follow-mode');
      if (res.setup.pausedAfterStop === 'paused') { await onState(p, 'follow-paused', 'follow'); await crop(p, 'follow-paused', ['follow']); }
      else { await p.keyboard.press('Space'); await sleep(500); await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.wheel(300, 0); await sleep(400); res.setup.pausedDuringPlay2 = await SEL.follow(p).getAttribute('data-follow-mode'); await onState(p, 'follow-paused', 'follow'); await crop(p, 'follow-paused', ['follow']); await L.blur(p); await p.keyboard.press('Space'); await sleep(400); }
      await clickK(p, 'follow'); res.setup.followResumed = await SEL.follow(p).getAttribute('data-follow-mode');
      // zoom back to a fit view
      await L.blur(p);
    }
    // brace disabled
    await clickK(p, 'loop'); res.setup.loopOff = await SEL.loop(p).getAttribute('aria-pressed');
    await p.keyboard.press('Home'); await sleep(300);
    await rest(p); { const bi = await infoOf(p, 'brace'); const li = await infoOf(p, 'braceLabel'); res.rows.off['brace'] = { rest: bi, label: li }; save(); await crop(p, 'brace-disabled-crop', ['brace'], 12); }
    await offState(p, 'loop-after', 'loop');
    // Library preview
    const opt = p.locator('[role=option][data-source-id="demo-middle-east"]'); await opt.scrollIntoViewIfNeeded(); await opt.click(); await sleep(600); await L.blur(p);
    await offState(p, 'preview-idle', 'preview'); await crop(p, 'preview-idle', ['preview']);
    await clickK(p, 'preview'); await sleep(500);
    res.setup.previewText = await SEL.preview(p).textContent();
    await onState(p, 'preview', 'preview'); await crop(p, 'preview-previewing', ['preview']);
    await rest(p); { const ph = await phBox(p); const li = await infoOf(p, 'previewing'); if (li) { await snap(p, 'option-previewing'); li.scan1 = scan(li.box, ph); } res.rows.on['previewing-label'] = { rest: li }; await crop(p, 'option-previewing-crop', ['previewing'], 10); save(); }
    res.setup.previewStillOn = await SEL.preview(p).textContent();
    if (/Stop/.test(res.setup.previewStillOn || '')) await clickK(p, 'preview');
    res.setup.previewAfterStop = await SEL.preview(p).textContent();
    await rest(p); await snap(p, 'final');
    res.logMain = o.log; await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close();
  save();
  const sum = { error: res.error, fonts: res.fonts, noLcd: res.noLcd, setup: { ...res.setup, load: undefined, clips: undefined }, net: X.netOk(net), on: {}, off: {} };
  const f = (s) => s && ({ bg: s.bg, bd: s.border, bs: s.borderStyle, col: s.color, comp: s.composite, under: s.under, pr: s.pressed, fm: s.follow, hov: s.hover, act: s.active, fv: s.focus, s1: s.scan1 && (typeof s.scan1 === 'string' ? s.scan1 : `brass ${s.scan1.brass}/${s.scan1.n}`) });
  for (const [k, v] of Object.entries(res.rows.on)) { if (!v || v.error) { sum.on[k] = v && v.error; continue; } sum.on[k] = { rest: f(v.rest), hover: f(v.hover), press: f(v.press), label: f(v.label), after: v.after && { pr: v.after.pressed, val: v.after.value, fm: v.after.follow }, clipsUnchanged: v.clipsUnchanged }; }
  for (const [k, v] of Object.entries(res.rows.off)) sum.off[k] = v && (v.rest ? { rest: f(v.rest), label: f(v.label) } : f(v));
  sum.edges = Object.fromEntries(Object.entries(res.rows.extra).map(([k, v]) => [k, { braceComp: v.brace.comp, strip: v.brace.under, hoverBg: v.hover.bg, hoverComp: v.hover.comp, hov: v.hover.hov, scan: `brass ${v.scan.brass}/${v.scan.n}`, crB: v.crHoverVsBrace, crS: v.crHoverVsStrip }]));
  sum.loadFollow = f(res.setup.load && res.setup.load.follow);
  console.log(JSON.stringify(sum, null, 1));
})();
