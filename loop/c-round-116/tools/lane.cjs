// C round 116 — lane Volume dB rows (TV-PRESENT, TV-LAYOUT, TV-DRAG, exact-undo extras, TV-INF, TV-KEY, TV-DBL,
// NB-TRACK-SHIFT, NB-GROUP, NB-PAN-MS). Usage: ROWS=a,b node lane.cjs <1440|1280> <run#>
// Tolerances fixed before running (current-task.md §4).
const L = require('./lib.cjs');
const path = require('path');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const VOL = (t) => `[data-track-id="${t}"] input[type=range][aria-label^="Volume"]`;
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const MINUS = '−';
const INF = `${MINUS}∞`;

const read = (p, t) => p.evaluate((t) => {
  const lane = document.querySelector(`[data-track-id="${t}"]`);
  const s = lane && lane.querySelector('input[type=range][aria-label^="Volume"]');
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  if (!s) return { missing: true, undoTitle: u && u.getAttribute('title') };
  const r = s.nextElementSibling;
  const b = s.getBoundingClientRect();
  const h = lane.querySelector('[data-testid=arrangement-track-header]');
  const hh = lane.querySelector('[data-testid=arrangement-track-height]');
  return {
    value: s.value, v: +s.value, min: s.min, max: s.max, step: s.step, text: s.getAttribute('aria-valuetext'), title: s.getAttribute('title'), label: s.getAttribute('aria-label'),
    readout: r ? r.textContent : null, readoutTitle: r ? r.getAttribute('title') : null, rsw: r ? r.scrollWidth : null, rcw: r ? r.clientWidth : null, rh: r ? +r.getBoundingClientRect().height.toFixed(1) : null,
    rVisible: r ? (() => { const q = r.getBoundingClientRect(); const hb = h.getBoundingClientRect(); return q.width > 0 && q.left >= hb.left - 0.5 && q.right <= hb.right + 0.5; })() : false,
    box: { x: b.x, y: b.y, w: b.width, h: b.height },
    headerW: h ? +h.getBoundingClientRect().width.toFixed(2) : null,
    laneH: hh ? +hh.getAttribute('aria-valuenow') : null,
    undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null,
    codes: r ? [...r.textContent].map((c) => c.charCodeAt(0).toString(16)) : null,
  };
}, t);

const undoT = async (p) => { await L.blur(p); await L.sleep(150); await p.keyboard.press('Control+z'); await L.sleep(350); };
const redoT = async (p) => { await L.blur(p); await L.sleep(150); await p.keyboard.press('Control+Shift+z'); await L.sleep(350); };

// Relative drag: press at the slider centre (no jump expected), move dx in |dx| 1px steps.
async function drag(p, t, dx, { shift = false, back = false, steps = null } = {}) {
  await p.locator(VOL(t)).scrollIntoViewIfNeeded();
  const r0 = await read(p, t);
  const x0 = r0.box.x + r0.box.w / 2, y = r0.box.y + r0.box.h / 2;
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.move(x0, y);
  await p.mouse.down();
  await L.sleep(60);
  const afterPress = await read(p, t);
  const n = steps ?? Math.abs(dx);
  for (let k = 1; k <= n; k++) await p.mouse.move(x0 + (dx * k) / n, y);
  await L.sleep(60);
  const far = await read(p, t);
  if (back) for (let k = n - 1; k >= 0; k--) await p.mouse.move(x0 + (dx * k) / n, y);
  await L.sleep(60);
  const mid = await read(p, t);
  await p.mouse.up();
  if (shift) await p.keyboard.up('Shift');
  await L.sleep(300);
  await L.blur(p);
  await L.sleep(150);
  const r1 = await read(p, t);
  return { r0, afterPress, far, mid, r1, w: r0.box.w };
}

async function keys(p, t, key, n) {
  await p.locator(VOL(t)).focus();
  const titles = [];
  for (let k = 0; k < n; k++) { await p.keyboard.press(key); await L.sleep(120); titles.push((await read(p, t)).undoTitle); }
  await L.blur(p);
  await L.sleep(150);
  return titles;
}
// Undo count: press Ctrl+Z until the value equals target, max n.
async function undoUntil(p, t, target, n = 6) {
  const seen = [];
  for (let k = 1; k <= n; k++) { await undoT(p); const r = await read(p, t); seen.push(r.value); if (r.value === target) return { count: k, seen, r }; }
  return { count: -1, seen };
}
// Sentinel: a pan change on sfx gives a history entry that is not Volume, so a Volume entry count is unambiguous.
async function sentinel(p) {
  const s = '[data-track-id="sfx"] input[aria-label^="Pan"]';
  await p.locator(s).focus();
  await p.keyboard.press('ArrowRight');
  await L.sleep(150);
  await L.blur(p);
  await L.sleep(150);
  return (await read(p, 'music')).undoTitle;
}
const ok = (r, value, text) => r.value === value && r.text === text && r.readout === text.replace(/ dB$/, '') && r.readoutTitle === text;

async function rowPresent(p) {
  const out = {};
  let pass = true;
  for (const t of ['video', 'music', 'stems', 'sfx']) {
    const r = await read(p, t);
    out[t] = { value: r.value, min: r.min, max: r.max, step: r.step, text: r.text, readout: r.readout, readoutTitle: r.readoutTitle, title: r.title, codes: r.codes };
    pass = pass && !r.missing && r.min === '-60' && r.max === '0' && r.step === '0.1' && ok(r, '0', '+0.0 dB');
  }
  return { lanes: out, pass };
}

async function measureAll(p) {
  return p.evaluate(() => [...document.querySelectorAll('[data-track-id]')].filter((l) => l.querySelector(':scope [data-testid=arrangement-track-header]')).flatMap((lane) => {
    const s = lane.querySelector('input[type=range][aria-label^="Volume"]');
    const h = lane.querySelector('[data-testid=arrangement-track-header]');
    const hh = lane.querySelector('[data-testid=arrangement-track-height]');
    if (!h) return [];
    const r = s && s.nextElementSibling;
    const hb = h.getBoundingClientRect();
    const q = r && r.getBoundingClientRect();
    return [{ track: lane.getAttribute('data-track-id'), laneH: hh ? +hh.getAttribute('aria-valuenow') : null, hasFader: !!s, sliderW: s ? +s.getBoundingClientRect().width.toFixed(2) : null, value: s && s.value, readout: r && r.textContent, rsw: r && r.scrollWidth, rcw: r && r.clientWidth, rh: q ? +q.height.toFixed(1) : null, rInside: q ? q.left >= hb.left - 0.5 && q.right <= hb.right + 0.5 && q.width > 0 : null, headerW: +hb.width.toFixed(2), headerLeft: +hb.left.toFixed(1) }];
  }));
}
const layoutOk = (rows) => rows.filter((r) => r.hasFader).every((r) => r.rsw <= r.rcw && r.rh <= 18 && r.rInside && r.sliderW >= 24);

async function setWorst(p) {
  await p.locator(VOL('music')).focus(); await p.keyboard.press('Home'); await p.keyboard.press('ArrowRight'); await L.blur(p);
  await p.locator(VOL('stems')).focus(); await p.keyboard.press('Home'); await L.blur(p);
  await L.sleep(200);
}

async function heightSweep(p, tracks, tag) {
  const out = [];
  for (const t of tracks) {
    const hs = `[data-track-id="${t}"] [data-testid=arrangement-track-height]`;
    const startH = +(await p.locator(hs).first().getAttribute('aria-valuenow'));
    let last = null;
    for (let k = 0; k < 40; k++) {
      const m = (await measureAll(p)).find((r) => r.track === t);
      if (!m) break;
      out.push({ step: k, ...m });
      if (m.laneH === last) break;
      last = m.laneH;
      await p.locator(hs).first().focus();
      await p.keyboard.press('ArrowUp');
      await L.sleep(120);
      const nowFolded = await p.evaluate((t) => /დაკეცილია/.test(document.querySelector(`[data-track-id="${t}"] [data-testid=arrangement-track-height]`).getAttribute('aria-valuetext') || ''), t);
      if (nowFolded) { out.push({ step: k + 1, track: t, folded: true }); break; }
    }
    await p.screenshot({ path: path.join(L.SHOTS, `layout-${tag}-${t}-min-${VPN}-${RUN}.png`) });
    for (let k = 0; k < 40; k++) {
      const cur = +(await p.locator(hs).first().getAttribute('aria-valuenow'));
      if (cur >= startH) break;
      await p.locator(hs).first().focus(); await p.keyboard.press('ArrowDown'); await L.sleep(80);
    }
    await L.blur(p);
  }
  return out;
}

async function group(p, a, b) {
  await p.click(L.nameSel(a)); await L.sleep(150);
  await p.keyboard.down('Shift'); await p.click(L.nameSel(b)); await p.keyboard.up('Shift');
  await L.sleep(150);
  await p.keyboard.press('Control+g');
  await L.sleep(600);
  await L.blur(p);
  return p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-volume]')].map((g) => ({ label: g.getAttribute('aria-label'), value: g.value, text: g.getAttribute('aria-valuetext'), title: g.getAttribute('title') })));
}

async function rowLayout(p) {
  const res = { default: await measureAll(p) };
  await p.screenshot({ path: path.join(L.SHOTS, `layout-default-${VPN}-${RUN}.png`) });
  await setWorst(p);
  res.worst = await measureAll(p);
  res.worstRead = { music: await read(p, 'music'), stems: await read(p, 'stems') };
  await p.screenshot({ path: path.join(L.SHOTS, `layout-worst-${VPN}-${RUN}.png`) });
  res.worstSweep = await heightSweep(p, ['music', 'stems', 'video'], 'worst');
  res.groups = await group(p, 'stems', 'sfx');
  await p.locator(VOL('sfx')).focus(); await p.keyboard.press('Home'); await p.keyboard.press('ArrowRight'); await L.blur(p); await L.sleep(200);
  res.nested = await measureAll(p);
  await p.screenshot({ path: path.join(L.SHOTS, `layout-nested-${VPN}-${RUN}.png`) });
  res.nestedSweep = await heightSweep(p, ['stems', 'sfx'], 'nested');
  const all = [...res.worst, ...res.nested, ...res.worstSweep.filter((r) => !r.folded), ...res.nestedSweep.filter((r) => !r.folded)];
  const headerWs = [...new Set(all.map((r) => r.headerW))];
  const nestedRows = res.nested.filter((r) => ['stems', 'sfx'].includes(r.track));
  res.minSlider = Math.min(...all.filter((r) => r.hasFader).map((r) => r.sliderW));
  res.headerWs = headerWs;
  res.worstValues = { music: res.worstRead.music.readout, stems: res.worstRead.stems.readout, sfxNested: (res.nested.find((r) => r.track === 'sfx') || {}).readout };
  res.densities = [...new Set(all.filter((r) => r.hasFader).map((r) => r.laneH))].sort((a, b) => a - b);
  res.pass = layoutOk(all) && res.worstValues.music === `${MINUS}59.9` && res.worstValues.stems === INF && res.worstValues.sfxNested === `${MINUS}59.9` && nestedRows.length === 2;
  res.headerNote = 'header widths observed (nested lanes are indented by design): ' + headerWs.join(',');
  // restore: ungroup by undo until no group, then reset faders by double-click is avoided; caller reloads anyway.
  return res;
}

async function rowDrag(p) {
  const before = await sentinel(p);
  const d = await drag(p, 'music', -20);
  const w = d.w;
  const exp = -(20 / w) * 60, tol = 0.1 + 60 / w;
  const delta = d.r1.v - d.r0.v;
  const entries = d.r1.undoTitle;
  const u = await undoT(p).then(() => read(p, 'music'));
  const res = { w, v0: d.r0.value, pressValue: d.afterPress.value, v1: d.r1.value, text1: d.r1.text, readout1: d.r1.readout, delta: +delta.toFixed(3), expected: +exp.toFixed(3), tol: +tol.toFixed(3), titleBefore: before, titleAfter: entries, afterUndo: { value: u.value, readout: u.readout, text: u.text, title: u.undoTitle } };
  res.agree = d.r1.text === `${d.r1.readout} dB` && Number(d.r1.readout.replace(MINUS, '-')) === d.r1.v;
  res.pass = d.afterPress.value === d.r0.value && Math.abs(delta - exp) <= tol + 1e-9 && res.agree && entries === 'Undo: Volume' && before !== 'Undo: Volume' && ok(u, '0', '+0.0 dB') && u.undoTitle === before;
  return res;
}

async function rowExactUndo(p) {
  const before = await sentinel(p);
  // zero-move press
  const r0 = await read(p, 'music');
  const x = r0.box.x + r0.box.w / 2, y = r0.box.y + r0.box.h / 2;
  await p.mouse.move(x, y); await p.mouse.down(); await L.sleep(120); await p.mouse.up(); await L.sleep(300); await L.blur(p); await L.sleep(150);
  const a = await read(p, 'music');
  // there-and-back in one gesture
  const d = await drag(p, 'music', -20, { back: true });
  // from a non-grid linear value: set via drag, then there-and-back press must not change stored, Undo restores exact
  return { press: { value: a.value, title: a.undoTitle }, back: { far: d.far.value, mid: d.mid.value, value: d.r1.value, title: d.r1.undoTitle }, before,
    pass: a.value === '0' && a.undoTitle === before && d.far.value !== '0' && d.mid.value === '0' && d.r1.value === '0' && d.r1.undoTitle === before };
}

async function rowInf(p) {
  const before = await sentinel(p);
  const r0 = await read(p, 'music');
  const d = await drag(p, 'music', -Math.ceil(r0.box.w + 60), { steps: 40 });
  const a = d.r1;
  const kr = await keys(p, 'music', 'ArrowRight', 1);
  const b = await read(p, 'music');
  const kl = await keys(p, 'music', 'ArrowLeft', 1);
  const c = await read(p, 'music');
  const res = { inf: { value: a.value, text: a.text, readout: a.readout, title: a.readoutTitle, codes: a.codes, undo: a.undoTitle }, right: { value: b.value, text: b.text, readout: b.readout, undo: kr }, left: { value: c.value, text: c.text, readout: c.readout, undo: kl } };
  const u = await undoUntil(p, 'music', '0', 5);
  res.undoBack = u;
  res.pass = ok(a, '-60', `${INF} dB`) && a.codes.join() === '2212,221e' && ok(b, '-59.9', `${MINUS}59.9 dB`) && ok(c, '-60', `${INF} dB`) && u.count === 3 && before !== 'Undo: Volume';
  return res;
}

async function rowKey(p) {
  const before = await sentinel(p);
  const r0 = await read(p, 'music');
  const titles = await keys(p, 'music', 'ArrowLeft', 3);
  const r1 = await read(p, 'music');
  const u = await undoUntil(p, 'music', '0', 5);
  const after = await read(p, 'music');
  return { v0: r0.value, v1: r1.value, text: r1.text, readout: r1.readout, titles, undoCount: u.count, seen: u.seen, titleBack: after.undoTitle === before,
    pass: r0.value === '0' && ok(r1, '-0.3', `${MINUS}0.3 dB`) && u.count === 3 && after.undoTitle === before };
}

async function rowDbl(p) {
  const before = await sentinel(p);
  const d = await drag(p, 'music', -20);
  const r0 = d.r1;
  const y = r0.box.y + r0.box.h / 2;
  await p.mouse.dblclick(r0.box.x + r0.box.w / 2, y); await L.sleep(350); await L.blur(p); await L.sleep(150);
  const a = await read(p, 'music');
  await p.mouse.dblclick(r0.box.x + r0.box.w / 2, y); await L.sleep(350); await L.blur(p); await L.sleep(150);
  const b = await read(p, 'music');
  const u1 = await undoT(p).then(() => read(p, 'music'));
  const u2 = await undoT(p).then(() => read(p, 'music'));
  return { dragged: r0.value, first: { value: a.value, readout: a.readout, title: a.undoTitle }, second: { value: b.value, title: b.undoTitle }, undo1: u1.value, undo2: { value: u2.value, title: u2.undoTitle },
    pass: r0.value !== '0' && ok(a, '0', '+0.0 dB') && b.value === '0' && u1.value === r0.value && u2.value === '0' && u2.undoTitle === before };
}

async function rowTrackShift(p) {
  const plain = await drag(p, 'music', -20);
  await undoT(p);
  const p0 = await read(p, 'music');
  const shift = await drag(p, 'music', -20, { shift: true });
  await undoT(p);
  const s0 = await read(p, 'music');
  return { w: plain.w, plain: plain.r1.value, shift: shift.r1.value, undoPlain: p0.value, undoShift: s0.value, pass: plain.r1.value === shift.r1.value && plain.r1.value !== '0' && p0.value === '0' && s0.value === '0' };
}

const readGroup = (p) => p.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-group-volume]'); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); if (!g) return null; const b = g.getBoundingClientRect(); return { value: g.value, min: g.min, max: g.max, step: g.step, text: g.getAttribute('aria-valuetext'), title: g.getAttribute('title'), box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; });

async function rowGroup(p) {
  const g0list = await group(p, 'stems', 'sfx');
  const g0 = await readGroup(p);
  const lanes0 = { stems: await read(p, 'stems'), sfx: await read(p, 'sfx') };
  const x0 = g0.box.x + g0.box.w / 2, y = g0.box.y + g0.box.h / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 20; k++) await p.mouse.move(x0 - k, y);
  await p.mouse.up(); await L.sleep(300); await L.blur(p); await L.sleep(150);
  const g1 = await readGroup(p);
  const lanes1 = { stems: await read(p, 'stems'), sfx: await read(p, 'sfx') };
  await undoT(p);
  const g2 = await readGroup(p);
  const pctRe = /^\d+%$/;
  const res = { groups: g0list, w: g0.box.w, g0: { value: g0.value, text: g0.text, title: g0.title, min: g0.min, max: g0.max }, g1: { value: g1.value, text: g1.text, title: g1.title, undo: g1.undoTitle }, g2: { value: g2.value, text: g2.text, undo: g2.undoTitle },
    expectedDelta: +(-(20 / g0.box.w) * (Number(g0.max) - Number(g0.min))).toFixed(3), delta: +(Number(g1.value) - Number(g0.value)).toFixed(3),
    lanes: { stems0: lanes0.stems.readout, sfx0: lanes0.sfx.readout, stems1: lanes1.stems.readout, sfx1: lanes1.sfx.readout, stemsText1: lanes1.stems.text } };
  res.pass = pctRe.test(g0.text) && pctRe.test(g1.text) && g1.title === `Volume ${g1.text}` && g1.value !== g0.value && g2.value === g0.value && g2.undoTitle === g0.undoTitle && g1.undoTitle !== g0.undoTitle && lanes1.stems.readout === '+0.0' && lanes1.sfx.readout === '+0.0' && lanes1.stems.text === '+0.0 dB' && Math.abs(res.delta - res.expectedDelta) <= 0.01 + (Number(g0.max) - Number(g0.min)) / g0.box.w + 1e-9;
  return res;
}

async function rowPanMs(p) {
  const PAN = '[data-track-id="music"] input[aria-label^="Pan"]';
  const rp = () => p.evaluate((s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); return { value: e.value, min: e.min, max: e.max, text: e.getAttribute('aria-valuetext'), box: { x: b.x, y: b.y, w: b.width, h: b.height } }; }, PAN);
  const v0 = await read(p, 'music');
  const p0 = await rp();
  const x0 = p0.box.x + p0.box.w / 2, y = p0.box.y + p0.box.h / 2;
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 20; k++) await p.mouse.move(x0 + k, y);
  await p.mouse.up(); await L.sleep(300); await L.blur(p);
  const p1 = await rp();
  const v1 = await read(p, 'music');
  await p.mouse.dblclick(x0, y); await L.sleep(300); await L.blur(p);
  const p2 = await rp();
  const mute = '[data-track-id="music"] button[aria-label^="Mute"]', solo = '[data-track-id="music"] button[aria-label^="Solo"]';
  const pr = (s) => p.evaluate((s) => document.querySelector(s).getAttribute('aria-pressed'), s);
  await p.click(mute); await L.sleep(200); const m1 = await pr(mute); const vm = await read(p, 'music');
  await p.click(mute); await L.sleep(200); const m2 = await pr(mute);
  await p.click(solo); await L.sleep(200); const s1 = await pr(solo); const vs = await read(p, 'music'); const vsStems = await read(p, 'stems');
  await p.click(solo); await L.sleep(200); const s2 = await pr(solo);
  await L.blur(p);
  return { pan0: p0.value, pan1: p1.value, pan1text: p1.text, pan2: p2.value, pan2text: p2.text, mute: [m1, m2], solo: [s1, s2], volReadouts: [v0.readout, v1.readout, vm.readout, vs.readout, vsStems.readout],
    pass: p1.value !== p0.value && p2.value === p0.value && m1 === 'true' && m2 === 'false' && s1 === 'true' && s2 === 'false' && [v0, v1, vm, vs, vsStems].every((r) => r.readout === '+0.0' && r.value === '0') };
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `lane-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {} };
  const save = () => { out.net = net; L.save(L.OUT, `${tag}.json`, out); };
  const fresh = async () => {
    const o = await L.openStudio(browser, VP, `${tag}-s${net.length + 1}`, net);
    const p = o.page;
    o.snap = await L.setSnapOff(p);
    o.adds = [];
    for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) o.adds.push(await L.addAt(p, s, ln, t));
    await L.blur(p);
    await p.keyboard.press('Home');
    await L.sleep(200);
    return o;
  };
  const rows = [
    ['TV-PRESENT', rowPresent, false],
    ['TV-DRAG', rowDrag, false],
    ['TV-EXACT-UNDO', rowExactUndo, false],
    ['TV-INF', rowInf, false],
    ['TV-KEY', rowKey, false],
    ['TV-DBL', rowDbl, false],
    ['NB-TRACK-SHIFT', rowTrackShift, false],
    ['NB-PAN-MS', rowPanMs, false],
    ['NB-GROUP', rowGroup, true],
    ['TV-LAYOUT', rowLayout, true],
  ];
  const ONLY = process.env.ROWS ? process.env.ROWS.split(',') : null;
  let o = await fresh();
  out.setup = { snap: o.snap, adds: o.adds };
  for (const [id, fn, needsFresh] of rows) {
    if (ONLY && !ONLY.includes(id)) continue;
    if (needsFresh) { await o.ctx.close(); o = await fresh(); }
    try {
      const r = await fn(o.page);
      out.rows[id] = r;
      console.log(id, r.pass, JSON.stringify(r, (k, v) => (['default', 'worst', 'nested', 'worstSweep', 'nestedSweep', 'worstRead', 'lanes', 'codes'].includes(k) ? undefined : v)).slice(0, 900));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 300));
      await o.page.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
      await o.page.mouse.up().catch(() => {});
      await L.blur(o.page).catch(() => {});
    }
    await o.page.screenshot({ path: path.join(L.SHOTS, `${id}-${VPN}-${RUN}.png`) }).catch(() => {});
    save();
  }
  await o.ctx.close();
  save();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
