// C round 176 — DUX-R-5b-2a browser rows: CC-ONSTATE, NO-BRASS-ONSTATE, CONTRAST-ONSTATE, STATE-DISTINCT-ONSTATE, SEP-HOVER.
// node c176.cjs <1440|1280> <attempt>   (DPR 2, fresh context). Built on c-round-175/tools/c175.cjs helpers.
const X = require('./lib122.cjs'); const { L, sleep } = X;
const { decode } = require('./png.cjs');
const fs = require('fs'); const path = require('path');
const W = +process.argv[2]; const ATT = process.argv[3] || '1';
const TAG = `c176-${W}-${ATT}`;
const SHD = path.join(L.SHOTS, TAG); fs.mkdirSync(SHD, { recursive: true });
const net = []; const res = { W, ATT, utc: new Date().toISOString(), setup: {}, rows: {}, shots: {} };
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
const brief = (s) => s && `brass ${s.brass}/${s.n} top ${s.top.slice(0, 3).map(([c, v]) => `${c.join(',')}:${v}`).join(' ')}`;
const info = (sel) => {
  const el = typeof sel === 'string' ? document.querySelector(sel) : sel; if (!el) return null;
  const cv = document.createElement('canvas'); cv.width = 1; cv.height = 1; const g = cv.getContext('2d');
  const mix = (layers) => { g.clearRect(0, 0, 1, 1); for (const l of layers) { g.fillStyle = '#000'; g.fillStyle = l; g.fillRect(0, 0, 1, 1); } return [...g.getImageData(0, 0, 1, 1).data].slice(0, 3); };
  const stackOf = (e) => { const layers = []; let n = e; while (n && n.nodeType === 1) { const b = getComputedStyle(n).backgroundColor; layers.unshift(b); const m = /rgba\([^)]*,\s*([\d.]+)\)$/.exec(b); const transparent = b === 'transparent' || (m && +m[1] === 0); if (!transparent && (!m || +m[1] === 1) && !/color\(|oklab|oklch/.test(b)) break; if (!transparent && /color\(|oklab|oklch/.test(b) && !/\/\s*0?\.\d|\/\s*0\b/.test(b)) break; n = n.parentElement; } if (!n) layers.unshift('rgb(0,0,0)'); return layers; };
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return { box: [r.x, r.y, r.width, r.height], bg: cs.backgroundColor, bgImage: cs.backgroundImage, border: cs.borderTopColor, color: cs.color, outline: cs.outlineStyle, shadow: cs.boxShadow, cls: el.getAttribute('class'), pressed: el.getAttribute('aria-pressed'), hover: el.matches(':hover'), active: el.matches(':active'), focus: el.matches(':focus-visible'), composite: mix(stackOf(el)), under: el.parentElement ? mix(stackOf(el.parentElement)) : null, transition: cs.transitionDuration };
};
const infoOf = (p, sel) => p.evaluate(info, sel);
const parseRgb = (s) => { const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(s || ''); return m ? [+m[1], +m[2], +m[3]].map(Math.round) : null; };
const centre = (b) => [b[0] + b[2] / 2, b[1] + b[3] / 2];
const phBox = (p) => p.evaluate(() => { const e = document.querySelector('[data-testid=arrangement-playhead]'); if (!e) return []; const r = e.getBoundingClientRect(); return [[r.x - 3, -10, r.width + 6, 5000]]; });
async function rest(p) { await L.blur(p); await p.mouse.move(2, 2); await sleep(400); }
// the modal colour of a sub-rect (the button fill) and the letter colour (most distant from fill)
function regionColours(rect) { const s = scan(rect); return s.top; }

// rest / hover / press of an on-state button. Press: mouse down on the centre, read, move off, release (no click).
async function onState(p, name, sel, kind) {
  const r = { sel, kind };
  await rest(p); const ph = await phBox(p);
  const i0 = await infoOf(p, sel); if (!i0) { r.error = 'not found'; res.rows.on[name] = r; save(); return r; }
  r.rest = i0; await snap(p, `on-${name}-rest`);
  r.rest.scan1 = scan(inset(i0.box, 1), ph); r.rest.scan3 = scan(inset(i0.box, 3), ph);
  if (kind === 'mixed') { const [x, y, w, h] = i0.box; r.rest.leftHalf = scan([x + 2, y + 2, w / 2 - 3, h - 4], ph); r.rest.rightHalf = scan([x + w / 2 + 1, y + 2, w / 2 - 3, h - 4], ph); }
  const [cx, cy] = centre(i0.box);
  await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
  const i1 = await infoOf(p, sel); r.hover = i1; await snap(p, `on-${name}-hover`);
  r.hover.scan1 = scan(inset(i1.box, 1), ph); r.hover.scan3 = scan(inset(i1.box, 3), ph);
  if (kind === 'mixed') { const [x, y, w, h] = i1.box; r.hover.leftHalf = scan([x + 2, y + 2, w / 2 - 3, h - 4], ph); }
  await p.mouse.down(); await sleep(450);
  const i2 = await infoOf(p, sel); r.press = i2; await snap(p, `on-${name}-press`);
  r.press.scan1 = scan(inset(i2.box, 1), ph); r.press.scan3 = scan(inset(i2.box, 3), ph);
  if (kind === 'mixed') { const [x, y, w, h] = i2.box; r.press.leftHalf = scan([x + 3, y + 3, w / 2 - 4, h - 6], ph); }
  await p.mouse.move(cx, cy - 200, { steps: 4 }); await sleep(100); await p.mouse.up(); await sleep(300);
  const i3 = await infoOf(p, sel); r.afterPressedState = i3.pressed;
  await rest(p);
  res.rows.on[name] = r; save(); return r;
}
async function offState(p, name, sel) { await rest(p); const i = await infoOf(p, sel); res.rows.off[name] = i; save(); return i; }
const click = async (p, sel, mods) => { const b = await p.locator(sel).first().boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2, { modifiers: mods }); await sleep(350); };
async function cropPair(p, name, sels) { const bs = []; for (const s of sels) { const b = await p.locator(s).first().boundingBox(); if (b) bs.push(b); } if (!bs.length) return; const x = Math.min(...bs.map((b) => b.x)) - 8, y = Math.min(...bs.map((b) => b.y)) - 8; const clip = { x, y, width: Math.max(...bs.map((b) => b.x + b.width)) - x + 8, height: Math.max(...bs.map((b) => b.y + b.height)) - y + 8 }; const f = path.join(SHD, `${name}.png`); await p.screenshot({ path: f, clip }); res.shots[name] = path.relative(L.ROOT, f); }

const T = (id) => ({ mute: `[data-track-id=${id}] button[aria-label^="Mute — "]`, solo: `[data-track-id=${id}] button[aria-label^="Solo — "]` });
const G = (name) => ({ mute: `[data-testid=arrangement-group-mute][aria-label^="Mute — ${name} "]`, solo: `[data-testid=arrangement-group-solo][aria-label^="Solo — ${name} "]`, name: `[data-testid=arrangement-group-name][aria-label*="${name}"]` });
const MM = 'button[aria-label="Master Mute"]';

(async () => {
  const b = await L.chromium.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required', ...(process.env.NOLCD ? ['--disable-lcd-text'] : [])] }); res.noLcd = !!process.env.NOLCD;
  res.rows = { on: {}, off: {}, sep: {} };
  try {
    const o = await L.openStudio(b, X.VPS[W], TAG, net, { deviceScaleFactor: 2 }); const p = o.page; res.fonts = o.log.fontsReady && o.log.fontsReady.ok;
    await p.mouse.move(2, 2); res.setup.snap = await L.setSnapOff(p);
    await L.loadVideo(p, 'beeps-6s-h264-aac.mp4');
    res.setup.adds = [await L.addAt(p, 'demo-middle-east', 'music', 1), await L.addAt(p, 'demo-stem-bass', 'stems', 2), await L.addAt(p, 'demo-soft-impact', 'sfx', 3)];
    await sleep(800); await L.blur(p); await p.keyboard.press('Home'); await sleep(300);
    const selNow = () => p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((c) => /ring-brand/.test(c.className)).map((c) => c.dataset.clipId));
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    res.setup.selected = await selNow();

    // off states (baseline)
    await offState(p, 'track-mute-music', T('music').mute); await offState(p, 'track-solo-music', T('music').solo); await offState(p, 'master-mute', MM);
    // track Mute on (music) and Solo on (sfx): both on at the same time, so they can be compared
    await click(p, T('music').mute); await click(p, T('sfx').solo);
    res.setup.trackOn = { mute: await p.getAttribute(T('music').mute, 'aria-pressed'), solo: await p.getAttribute(T('sfx').solo, 'aria-pressed') };
    await onState(p, 'track-mute', T('music').mute, 'mute');
    await onState(p, 'track-solo', T('sfx').solo, 'solo');
    await rest(p); await cropPair(p, 'distinct-track-mute-vs-solo', [`[data-track-id=music] [data-testid=arrangement-track-header]`, `[data-track-id=sfx] [data-testid=arrangement-track-header]`]);
    // on vs off neighbours, same header
    await offState(p, 'track-solo-music-while-mute-on', T('music').solo); await offState(p, 'track-mute-sfx-while-solo-on', T('sfx').mute);
    await click(p, T('music').mute); await click(p, T('sfx').solo);
    res.setup.trackOff = { mute: await p.getAttribute(T('music').mute, 'aria-pressed'), solo: await p.getAttribute(T('sfx').solo, 'aria-pressed') };
    await offState(p, 'track-mute-music-after', T('music').mute);
    // Master
    await click(p, MM); res.setup.masterOn = await p.getAttribute(MM, 'aria-pressed');
    await onState(p, 'master-mute', MM, 'mute');
    await rest(p); await cropPair(p, 'master-mute-on', ['[data-testid=arrangement-master]']);
    await click(p, MM); res.setup.masterOff = await p.getAttribute(MM, 'aria-pressed');

    // separator hover (expand detail at 1280)
    res.setup.detailWas = await X.openDetail(p); await rest(p);
    {
      const sel = '[data-testid=arrangement-detail-separator]'; const r = res.rows.sep;
      const panelSel = '[data-testid=arrangement-detail-separator]';
      const i0 = await infoOf(p, sel); r.rest = i0; const ph = await phBox(p);
      const [cx, cy] = centre(i0.box); await p.mouse.move(cx, cy, { steps: 3 }); await sleep(450);
      const i1 = await infoOf(p, sel); r.hover = i1; await snap(p, 'hover-detail-separator');
      r.scan = scan(inset(i1.box, 0.5), ph); r.crVsUnder = cr(i1.composite, i1.under); r.crVsRest = cr(i1.composite, i0.composite);
      const h0 = await p.getAttribute(panelSel, 'aria-valuenow');
      await p.mouse.down(); await sleep(100); await p.mouse.move(cx, cy - 40, { steps: 6 }); await sleep(300); await p.mouse.up(); await sleep(400);
      r.drag = { h0, h1: await p.getAttribute(panelSel, 'aria-valuenow') }; r.drag.changed = r.drag.h0 !== r.drag.h1;
      await rest(p); save();
    }

    // group: music + stems -> Group 1
    await p.click(L.nameSel('music')); await sleep(200); await p.click(L.nameSel('stems'), { modifiers: ['Shift'] }); await sleep(250);
    res.setup.group1 = await X.key(p, 'Control+g');
    res.setup.groupsAfter1 = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((e) => e.textContent.trim()));
    if (res.setup.groupsAfter1.length === 0) { await p.click(L.nameSel('music')); await sleep(200); await p.click(L.nameSel('stems'), { modifiers: ['Control'] }); await sleep(250); res.setup.group1ctrl = await X.key(p, 'Control+g'); res.setup.groupsAfter1 = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((e) => e.textContent.trim())); }
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    const g1 = G('Group 1');
    await offState(p, 'group-mute', g1.mute); await offState(p, 'group-solo', g1.solo);
    await click(p, g1.mute); await click(p, g1.solo);
    res.setup.groupOn = { mute: await p.getAttribute(g1.mute, 'aria-pressed'), solo: await p.getAttribute(g1.solo, 'aria-pressed') };
    await rest(p);
    await onState(p, 'group-mute', g1.mute, 'mute');
    await onState(p, 'group-solo', g1.solo, 'solo');
    await rest(p); await cropPair(p, 'distinct-group-on', ['[data-testid=arrangement-group-header]']);
    await click(p, g1.mute); await click(p, g1.solo);
    res.setup.groupOff = { mute: await p.getAttribute(g1.mute, 'aria-pressed'), solo: await p.getAttribute(g1.solo, 'aria-pressed') };
    // nest: sfx + Group 1 -> Group 2; solo Group 1 -> Group 2 mixed
    await p.click(L.nameSel('sfx')); await sleep(200); await p.click(g1.name, { modifiers: ['Shift'] }); await sleep(250);
    res.setup.group2 = await X.key(p, 'Control+g');
    res.setup.groupsAfter2 = await p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((e) => e.textContent.trim()));
    for (const id of await selNow()) await L.selectClip(p, id, ['Control']);
    await click(p, g1.solo);
    const g2 = G('Group 2');
    res.setup.mixed = { g1: await p.getAttribute(g1.solo, 'aria-pressed'), g2: await p.getAttribute(g2.solo, 'aria-pressed').catch(() => null), g2data: await p.getAttribute(g2.solo, 'data-solo').catch(() => null) };
    if (res.setup.mixed.g2 === 'mixed') {
      await onState(p, 'group-solo-mixed', g2.solo, 'mixed');
      await rest(p); await cropPair(p, 'distinct-mixed-vs-on', [g2.solo, g1.solo]);
      // off group solo next to it: un-solo Group 1 -> both off
      await click(p, g1.solo); await rest(p); await cropPair(p, 'distinct-mixed-off', [g2.solo, g1.solo]);
      await offState(p, 'group2-solo-off', g2.solo);
    }
    await rest(p); await snap(p, 'final');
    res.logMain = o.log; await o.ctx.close();
  } catch (e) { res.error = String(e && e.stack || e).slice(0, 1500); }
  await b.close();
  save();
  const sum = { error: res.error, fonts: res.fonts, setup: res.setup, net: X.netOk(net), on: {}, off: {}, sep: null };
  for (const [k, v] of Object.entries(res.rows.on)) {
    if (v.error) { sum.on[k] = v.error; continue; }
    const f = (s) => ({ bg: s.bg, img: s.bgImage === 'none' ? 'none' : s.bgImage.slice(0, 120), bd: s.border, col: s.color, comp: s.composite, under: s.under, pr: s.pressed, hov: s.hover, act: s.active, fv: s.focus, s1: brief(s.scan1), s3: brief(s.scan3), lh: s.leftHalf && brief(s.leftHalf), rh: s.rightHalf && brief(s.rightHalf) });
    sum.on[k] = { rest: f(v.rest), hover: f(v.hover), press: f(v.press), after: v.afterPressedState };
  }
  for (const [k, v] of Object.entries(res.rows.off)) sum.off[k] = v && { bg: v.bg, bd: v.border, col: v.color, comp: v.composite, under: v.under, pr: v.pressed, cls: v.cls && v.cls.split(' ').filter((t) => /^(bg-|border-|text-)/.test(t)).join(' ') };
  const s = res.rows.sep; if (s.hover) sum.sep = { restBg: s.rest.bg, hoverBg: s.hover.bg, hov: s.hover.hover, comp: s.hover.composite, under: s.hover.under, scan: brief(s.scan), crUnder: s.crVsUnder, crRest: s.crVsRest, drag: s.drag };
  console.log(JSON.stringify(sum, null, 1));
})();
