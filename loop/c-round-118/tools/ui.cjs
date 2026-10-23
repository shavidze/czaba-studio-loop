// C round 118 — UI rows: GV-PRESENT, GV-DRAG, GV-INF (UI), GV-DBL, SH-LANE, SH-GROUP, SH-MASTER, SH-MID, NB-PAN, NB-CLIP,
// TV-ANCHOR, TV-DRAG (neighbour), NB-GMS (group Mute/Solo), NB-U (focus rescue). Usage: ROWS=a,b node ui.cjs <1440|1280> <run#>
// Tolerances fixed before running (current-task.md §5).
const L = require('./lib.cjs');
const path = require('path');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const MINUS = '−';
const SEL = {
  lane: (t) => `[data-track-id="${t}"] input[type=range][aria-label^="Volume"]`,
  pan: (t) => `[data-track-id="${t}"] input[aria-label^="Pan"]`,
  group: '[data-testid=arrangement-group-volume]',
  master: 'input[aria-label="Master Volume"]',
  clip: '[data-testid=arrangement-detail-clip-gain-fader]',
};
const num = (s) => Number(String(s).replace(MINUS, '-'));

const read = (p, sel) => p.evaluate((sel) => {
  const s = document.querySelector(sel);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  if (!s) return { missing: true, undoTitle: u && u.getAttribute('title') };
  const b = s.getBoundingClientRect();
  return { value: s.value, v: +s.value, min: s.min, max: s.max, step: s.step, text: s.getAttribute('aria-valuetext'), title: s.getAttribute('title'), box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title'), codes: [...(s.getAttribute('aria-valuetext') || '')].map((c) => c.charCodeAt(0).toString(16)) };
}, sel);
const laneReadout = (p, t) => p.evaluate((t) => { const s = document.querySelector(`[data-track-id="${t}"] input[type=range][aria-label^="Volume"]`); return s && s.nextElementSibling ? s.nextElementSibling.textContent : null; }, t);
const selection = (p) => p.evaluate(() => ({
  lanes: [...document.querySelectorAll('[data-testid=arrangement-track-header] button[aria-label*="აქტიური ხაზის არჩევა"]')].map((b) => `${b.closest('[data-track-id]').getAttribute('data-track-id')}:${b.getAttribute('aria-pressed')}`).join(','),
  groups: [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((b) => b.getAttribute('aria-label')).join('|'),
  clipsSel: [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).length,
}));

const undoT = async (p) => { await L.blur(p); await L.sleep(150); await p.keyboard.press('Control+z'); await L.sleep(350); };

// Relative drag with per-move trace. shiftAt: index of the move at which Shift is pressed (0 = before the press).
async function drag(p, sel, dx, { shift = false, shiftAt = null, steps = null } = {}) {
  await p.locator(sel).first().scrollIntoViewIfNeeded();
  const r0 = await read(p, sel);
  const x0 = r0.box.x + r0.box.w / 2, y = r0.box.y + r0.box.h / 2;
  const sel0 = await selection(p);
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.move(x0, y);
  await p.mouse.down();
  await L.sleep(60);
  const trace = [{ k: 0, value: (await read(p, sel)).value, shift }];
  const n = steps ?? Math.abs(dx);
  let shiftNow = shift;
  for (let k = 1; k <= n; k++) {
    if (shiftAt !== null && k === shiftAt) { await p.keyboard.down('Shift'); shiftNow = true; }
    await p.mouse.move(x0 + (dx * k) / n, y);
    trace.push({ k, value: (await read(p, sel)).value, shift: shiftNow });
  }
  await L.sleep(60);
  await p.mouse.up();
  if (shift || shiftAt !== null) await p.keyboard.up('Shift');
  await L.sleep(300);
  const sel1 = await selection(p);
  await L.blur(p);
  await L.sleep(150);
  const r1 = await read(p, sel);
  return { r0, r1, trace, w: r0.box.w, sel0, sel1 };
}
// Sentinel: a Pan change on sfx is a non-Volume history entry.
async function sentinel(p) {
  await p.locator(SEL.pan('sfx')).focus();
  await p.keyboard.press('ArrowRight');
  await L.sleep(150);
  await L.blur(p);
  await L.sleep(150);
  return (await read(p, SEL.lane('music'))).undoTitle;
}
const valOf = (r, kind) => (kind === 'group' || kind === 'lane' ? r.v : r.v);

async function group(p, a, b) {
  await p.click(L.nameSel(a)); await L.sleep(150);
  await p.keyboard.down('Shift'); await p.click(L.nameSel(b)); await p.keyboard.up('Shift');
  await L.sleep(150);
  await p.keyboard.press('Control+g');
  await L.sleep(600);
  await L.blur(p);
  return p.evaluate(() => [...document.querySelectorAll('[data-testid=arrangement-group-name]')].map((g) => g.textContent.trim()));
}

async function rowPresent(p) {
  const names = await group(p, 'stems', 'sfx');
  const g = await read(p, SEL.group);
  const m = await p.evaluate(() => {
    const row = document.querySelector('[data-testid=arrangement-group-row]');
    const hdr = document.querySelector('[data-testid=arrangement-group-header]');
    const name = document.querySelector('[data-testid=arrangement-group-name]');
    const f = document.querySelector('[data-testid=arrangement-group-volume]');
    const vis = (el) => { const out = []; const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) { const t = n.textContent.trim(); if (!t) continue; const r = n.parentElement.getBoundingClientRect(); if (r.width > 0 && r.height > 0 && getComputedStyle(n.parentElement).visibility !== 'hidden') out.push(t); } return out; };
    return { rowH: +row.getBoundingClientRect().height.toFixed(2), hdrH: hdr ? +hdr.getBoundingClientRect().height.toFixed(2) : null, nameW: +name.getBoundingClientRect().width.toFixed(2), faderW: +f.getBoundingClientRect().width.toFixed(2), visibleText: vis(hdr || row), nameText: name.textContent.trim() };
  });
  await p.screenshot({ path: path.join(L.SHOTS, `GV-PRESENT-${VPN}-${RUN}.png`) });
  const hb = await p.locator('[data-testid=arrangement-group-header]').boundingBox();
  await p.screenshot({ path: path.join(L.SHOTS, `GV-PRESENT-header-${VPN}-${RUN}.png`), clip: { x: Math.max(0, hb.x - 4), y: Math.max(0, hb.y - 4), width: hb.width + 8, height: hb.height + 8 } });
  const res = { names, fader: { min: g.min, max: g.max, step: g.step, value: g.value, text: g.text, title: g.title, codes: g.codes }, ...m };
  res.pass = g.min === '-60' && g.max === '0' && g.step === '0.1' && g.value === '0' && g.text === '+0.0 dB' && g.title === 'Volume +0.0 dB' && Math.abs(m.rowH - 28) < 0.6 && Math.abs(m.faderW - 48) < 0.6 && m.nameW >= 40 && !m.visibleText.some((t) => /dB|%/.test(t));
  return res;
}

async function rowGDrag(p) {
  const before = await sentinel(p);
  const d = await drag(p, SEL.group, -20);
  const exp = -(20 / d.w) * 60, tol = 0.1 + 60 / d.w;
  const textDb = num(d.r1.text.replace(' dB', ''));
  const lanes = { stems: await laneReadout(p, 'stems'), sfx: await laneReadout(p, 'sfx') };
  await undoT(p);
  const u = await read(p, SEL.group);
  const res = { w: d.w, v0: d.r0.value, v1: d.r1.value, text1: d.r1.text, title1: d.r1.title, textDb, delta: textDb, expected: +exp.toFixed(3), tol: +tol.toFixed(3), before, after: d.r1.undoTitle, lanes, undo: { value: u.value, text: u.text, title: u.undoTitle }, selBefore: d.sel0, selAfter: d.sel1 };
  res.pass = Math.abs(textDb - exp) <= tol + 1e-9 && d.r1.title === `Volume ${d.r1.text}` && Number(d.r1.value) === textDb && d.r1.undoTitle === 'Undo: Volume' && before !== 'Undo: Volume' && u.text === '+0.0 dB' && u.value === '0' && u.undoTitle === before && lanes.stems === '+0.0' && lanes.sfx === '+0.0';
  return res;
}

async function rowGInf(p) {
  const before = await sentinel(p);
  const r0 = await read(p, SEL.group);
  const d = await drag(p, SEL.group, -Math.ceil(r0.box.w + 60), { steps: 40 });
  const res = { value: d.r1.value, text: d.r1.text, title: d.r1.title, codes: d.r1.codes, undo: d.r1.undoTitle, lanes: { stems: await laneReadout(p, 'stems'), sfx: await laneReadout(p, 'sfx') } };
  await undoT(p);
  const u = await read(p, SEL.group);
  res.undoBack = { value: u.value, text: u.text, title: u.undoTitle };
  res.pass = d.r1.value === '-60' && d.r1.text === `${MINUS}∞ dB` && d.r1.codes.join() === '2212,221e,20,64,42' && d.r1.title === `Volume ${MINUS}∞ dB` && u.value === '0' && u.undoTitle === before;
  return res;
}

async function rowGDbl(p) {
  const before = await sentinel(p);
  const d = await drag(p, SEL.group, -20);
  const b = d.r1.box;
  await p.mouse.dblclick(b.x + b.w / 2, b.y + b.h / 2); await L.sleep(350); await L.blur(p); await L.sleep(150);
  const a = await read(p, SEL.group);
  await undoT(p);
  const u1 = await read(p, SEL.group);
  await undoT(p);
  const u2 = await read(p, SEL.group);
  const res = { dragged: d.r1.text, afterDbl: { value: a.value, text: a.text, undo: a.undoTitle }, undo1: { value: u1.value, text: u1.text }, undo2: { value: u2.value, title: u2.undoTitle }, before };
  res.pass = d.r1.value !== '0' && a.value === '0' && a.text === '+0.0 dB' && a.undoTitle === 'Undo: Volume' && u1.value === d.r1.value && u2.value === '0' && u2.undoTitle === before;
  return res;
}

// Shift vs plain, the same −40 px drag; step = slider step.
async function shiftPair(p, sel, range) {
  const before = await sentinel(p);
  const plain = await drag(p, sel, -40);
  const plainTitle = plain.r1.undoTitle;
  await undoT(p);
  const back = await read(p, sel);
  const shift = await drag(p, sel, -40, { shift: true });
  const shiftTitle = shift.r1.undoTitle;
  await undoT(p);
  const back2 = await read(p, sel);
  const step = Number(plain.r0.step);
  const dPlain = plain.r1.v - plain.r0.v, dShift = shift.r1.v - shift.r0.v;
  const res = { w: plain.w, range, step, v0: plain.r0.value, plain: plain.r1.value, plainText: plain.r1.text, shift: shift.r1.value, shiftText: shift.r1.text, dPlain: +dPlain.toFixed(3), dShift: +dShift.toFixed(3), expectedShift: +(dPlain / 10).toFixed(3), theoryShift: +(-(40 / plain.w) * range / 10).toFixed(3), before, plainTitle, shiftTitle, back: back.value, back2: back2.value, back2Title: back2.undoTitle, selPlain: [plain.sel0, plain.sel1], selShift: [shift.sel0, shift.sel1], shiftTrace: shift.trace.filter((t, i) => i % 4 === 0).map((t) => t.value).join(',') };
  res.selectionUnchanged = JSON.stringify(shift.sel0) === JSON.stringify(shift.sel1) && JSON.stringify(plain.sel0) === JSON.stringify(plain.sel1);
  res.pass = dPlain < 0 && Math.abs(dShift - dPlain / 10) <= step + 1e-9 && plainTitle === shiftTitle && /^Undo: /.test(shiftTitle) && shiftTitle !== before && back.value === plain.r0.value && back2.value === plain.r0.value && back2.undoTitle === before;
  return res;
}
const rowShLane = async (p) => shiftPair(p, SEL.lane('music'), 60);
const rowShGroup = async (p) => { await group(p, 'stems', 'sfx'); return shiftPair(p, SEL.group, 60); };
const rowShMaster = async (p) => shiftPair(p, SEL.master, 66);
const rowShVideo = null;

async function rowShMid(p) {
  const before = await sentinel(p);
  const d = await drag(p, SEL.lane('music'), -40, { shiftAt: 21 });
  const tr = d.trace;
  const lastPlain = tr[20], firstShift = tr[21];
  const step = Number(d.r0.step);
  const plainD = num(lastPlain.value) - num(tr[0].value), shiftD = num(tr[40].value) - num(lastPlain.value);
  const res = { w: d.w, v0: tr[0].value, lastPlain: lastPlain.value, firstShift: firstShift.value, end: tr[40].value, plainHalf: +plainD.toFixed(3), shiftHalf: +shiftD.toFixed(3), ratio: +(shiftD / plainD).toFixed(3), undo: d.r1.undoTitle, before, trace: tr.map((t) => `${t.k}${t.shift ? 'S' : ''}:${t.value}`).join(' '), selUnchanged: JSON.stringify(d.sel0) === JSON.stringify(d.sel1) };
  const fine = (-(20 / d.w) * 60) / 10;
  res.expectedShiftHalf = +fine.toFixed(3);
  res.pass = Math.abs(num(firstShift.value) - num(lastPlain.value)) <= step + 1e-9 && Math.abs(shiftD - fine) <= step + 1e-9 && plainD < 0 && Math.abs(shiftD) < Math.abs(plainD) / 5 && d.r1.undoTitle === 'Undo: Volume' && before !== 'Undo: Volume';
  await undoT(p);
  return res;
}

async function rowNbPan(p) {
  const plain = await drag(p, SEL.pan('music'), -20);
  await undoT(p);
  const back = await read(p, SEL.pan('music'));
  const shift = await drag(p, SEL.pan('music'), -20, { shift: true });
  await undoT(p);
  const res = { w: plain.w, v0: plain.r0.value, plain: plain.r1.value, plainText: plain.r1.text, shift: shift.r1.value, shiftText: shift.r1.text, back: back.value };
  res.pass = plain.r1.value === shift.r1.value && plain.r1.value !== plain.r0.value && back.value === plain.r0.value;
  return res;
}

async function rowNbClip(p) {
  const clips = await L.clipsDom(p);
  const mc = clips.find((c) => c.lane === 'music');
  await L.selectClip(p, mc.id);
  const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  const plain = await drag(p, SEL.clip, 20);
  await undoT(p);
  const shift = await drag(p, SEL.clip, 20, { shift: true });
  await undoT(p);
  const step = Number(plain.r0.step);
  const dP = plain.r1.v - plain.r0.v, dS = shift.r1.v - shift.r0.v;
  const res = { w: plain.w, step, v0: plain.r0.value, plain: plain.r1.value, shift: shift.r1.value, dPlain: +dP.toFixed(3), dShift: +dS.toFixed(3) };
  res.pass = dP > 0 && Math.abs(dS - dP / 10) <= step + 1e-9;
  return res;
}

async function rowTvAnchor(p) {
  await p.locator(SEL.lane('music')).focus();
  for (let k = 0; k < 29; k++) { await p.keyboard.press('ArrowLeft'); await L.sleep(30); }
  await p.keyboard.press('Tab'); await L.sleep(250); await L.blur(p); await L.sleep(150);
  const a = await read(p, SEL.lane('music'));
  const aR = await laneReadout(p, 'music');
  const m = await drag(p, SEL.master, -24);
  const b = await read(p, SEL.lane('music'));
  const bR = await laneReadout(p, 'music');
  const d = await drag(p, SEL.lane('music'), -20);
  const exp = -(20 / d.w) * 60, tol = 0.1 + 60 / d.w;
  const delta = d.r1.v - num(bR);
  const res = { afterKeys: { value: a.value, readout: aR, text: a.text }, master: { from: m.r0.text, to: m.r1.text, undo: m.r1.undoTitle }, afterMaster: { value: b.value, readout: bR }, laneDrag: { pressValue: d.trace[0].value, v1: d.r1.value, text: d.r1.text, delta: +delta.toFixed(3), expected: +exp.toFixed(3), tol: +tol.toFixed(3), w: d.w } };
  res.pass = aR === `${MINUS}2.9` && bR === `${MINUS}2.9` && d.trace[0].value === '-2.9' && Math.abs(delta - exp) <= tol + 1e-9;
  return res;
}

async function rowTvDrag(p) {
  const before = await sentinel(p);
  const d = await drag(p, SEL.lane('music'), -20);
  const exp = -(20 / d.w) * 60, tol = 0.1 + 60 / d.w;
  const delta = d.r1.v - d.r0.v;
  const ro = await laneReadout(p, 'music');
  await undoT(p);
  const u = await read(p, SEL.lane('music'));
  const res = { w: d.w, v1: d.r1.value, text: d.r1.text, readout: ro, delta: +delta.toFixed(3), expected: +exp.toFixed(3), tol: +tol.toFixed(3), title: d.r1.undoTitle, undo: { value: u.value, text: u.text, title: u.undoTitle }, before };
  res.pass = d.trace[0].value === '0' && Math.abs(delta - exp) <= tol + 1e-9 && d.r1.text === `${ro} dB` && d.r1.undoTitle === 'Undo: Volume' && u.value === '0' && u.undoTitle === before;
  return res;
}

async function rowGms(p) {
  await group(p, 'stems', 'sfx');
  const pr = (s) => p.locator(s).getAttribute('aria-pressed');
  const M = '[data-testid=arrangement-group-mute]', S = '[data-testid=arrangement-group-solo]';
  const m0 = await pr(M); await p.click(M); await L.sleep(200); const m1 = await pr(M); await p.click(M); await L.sleep(200); const m2 = await pr(M);
  const s0 = await pr(S); await p.click(S); await L.sleep(200); const s1 = await pr(S); await p.click(S); await L.sleep(200); const s2 = await pr(S);
  await L.blur(p);
  // U focus rescue: group fader focused, press U → focus to group name.
  await p.locator(SEL.group).focus(); await L.sleep(100);
  await p.keyboard.press('u'); await L.sleep(400);
  const focus = await p.evaluate(() => { const a = document.activeElement; return { testid: a && a.getAttribute('data-testid'), label: a && (a.getAttribute('aria-label') || '').slice(0, 80) }; });
  const collapsed = await p.evaluate(() => !document.querySelector('[data-testid=arrangement-group-volume]') || !!document.querySelector('[data-testid=arrangement-group-fold][aria-expanded=false]'));
  const groupFaderVisible = await p.evaluate(() => { const f = document.querySelector('[data-testid=arrangement-group-volume]'); return !!f && f.getBoundingClientRect().width > 0; });
  await p.keyboard.press('u'); await L.sleep(300); await L.blur(p);
  // UM9 case: a member lane fader focused (hidden by the collapse) → U → focus rescued to the group name.
  await p.locator(SEL.lane('stems')).focus(); await L.sleep(100);
  await p.keyboard.press('u'); await L.sleep(400);
  const focus2 = await p.evaluate(() => { const a = document.activeElement; return { testid: a && a.getAttribute('data-testid'), label: a && (a.getAttribute('aria-label') || '').slice(0, 80) }; });
  const stemsHidden = await p.evaluate(() => !document.querySelector('[data-track-id="stems"] input[aria-label^="Volume"]'));
  await p.keyboard.press('u'); await L.sleep(300); await L.blur(p);
  const res = { mute: [m0, m1, m2], solo: [s0, s1, s2], groupFaderFocusedU: { focus, collapsed, groupFaderVisible }, memberFaderFocusedU: { focus: focus2, stemsHidden } };
  res.pass = m0 === 'false' && m1 === 'true' && m2 === 'false' && s0 === 'false' && s1 === 'true' && s2 === 'false' && collapsed && groupFaderVisible && focus.testid === 'arrangement-group-volume' && stemsHidden && focus2.testid === 'arrangement-group-name';
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `ui-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: undefined })); L.save(L.OUT, `${tag}.json`, out); };
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
  // [id, fn, fresh session before?]
  const rows = [
    ['TV-DRAG', rowTvDrag, false],
    ['SH-LANE', rowShLane, false],
    ['SH-MASTER', rowShMaster, false],
    ['SH-MID', rowShMid, false],
    ['NB-PAN', rowNbPan, false],
    ['NB-CLIP', rowNbClip, false],
    ['TV-ANCHOR', rowTvAnchor, true],
    ['GV-PRESENT', rowPresent, true],
    ['GV-DRAG', rowGDrag, false],
    ['GV-INF', rowGInf, false],
    ['GV-DBL', rowGDbl, false],
    ['SH-GROUP', rowShGroup, true],
    ['NB-GMS', rowGms, true],
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
      console.log(id, r.pass, JSON.stringify(r, (k, v) => (['trace', 'codes', 'visibleText'].includes(k) ? undefined : v)).slice(0, 1100));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 300));
      await o.page.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
      await o.page.mouse.up().catch(() => {});
      await o.page.keyboard.up('Shift').catch(() => {});
      await L.blur(o.page).catch(() => {});
    }
    await o.page.screenshot({ path: path.join(L.SHOTS, `${id}-${VPN}-${RUN}.png`) }).catch(() => {});
    save();
  }
  await o.ctx.close();
  save();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
