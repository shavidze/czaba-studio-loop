// Copied from C round 115 multi.cjs for round-116 NB-CLIP / NB-MASTER (unchanged logic). Usage: ROWS=a,b node multi.cjs <1440|1280> <run#>
// Tolerances fixed before running (current-task.md §4).
const L = require('./lib.cjs');
const path = require('path');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const RESET = '[data-testid=arrangement-detail-clip-gain-reset]';
const RANGE = '[data-testid=arrangement-detail-clip-gain-range]';
const R1 = 'Clip Gain მხოლოდ აუდიო კლიპებზე ისმება — ამოიღე ვიდეო მონიშვნიდან';
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/\s*dB$/, ''));

const read = (p) => p.evaluate(([F, FIELD, RESET, RANGE]) => {
  const f = document.querySelector(F);
  const fi = document.querySelector(FIELD);
  const rs = document.querySelector(RESET);
  const rg = document.querySelector(RANGE);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  const b = f && f.getBoundingClientRect();
  const desc = (el) => { const id = el && el.getAttribute('aria-describedby'); if (!id) return null; return id.split(' ').map((i) => { const d = document.getElementById(i); return d ? d.textContent.trim() : `#missing:${i}`; }).join(' | '); };
  const ae = document.activeElement;
  return {
    v: f ? +f.value : null, text: f && f.getAttribute('aria-valuetext'), disabled: f ? f.disabled : null, title: f && f.getAttribute('title'), desc: desc(f), describedby: f && f.getAttribute('aria-describedby'),
    box: b && { x: b.x, y: b.y, w: b.width, h: b.height },
    field: fi ? fi.value : null, fieldDisabled: fi ? fi.disabled : null, fieldTitle: fi && fi.getAttribute('title'), fieldDesc: desc(fi), fieldDescribedby: fi && fi.getAttribute('aria-describedby'),
    fieldDescIsRange: !!(fi && rg && (fi.getAttribute('aria-describedby') || '').split(' ').includes(rg.id)),
    reset: rs ? { disabled: rs.disabled, title: rs.getAttribute('title') } : null,
    range: rg ? rg.textContent.trim() : null,
    undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null,
    status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim().slice(0, 200),
    active: ae ? (ae.dataset.testid || ae.getAttribute('aria-label') || ae.tagName) : null,
    selected: [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).map((e) => e.closest('[data-track-id]').getAttribute('data-track-id')),
  };
}, [F, FIELD, RESET, RANGE]);

const thumbX = (r) => r.box.x + ((r.v + 60) / 84) * r.box.w;
const span = (r) => {
  if (r.range) { const m = r.range.split('…'); return { min: num(m[0]), max: num(m[1]) }; }
  const v = num(r.field); return { min: v, max: v };
};

async function undo(p) { await L.blur(p); await L.sleep(200); await p.keyboard.press('Control+z'); await L.sleep(350); return read(p); }
async function redo(p) { await L.blur(p); await L.sleep(200); await p.keyboard.press('Control+Shift+z'); await L.sleep(350); return read(p); }

let SENT = 0;
async function sentinel(p) {
  const sel = '[data-track-id=music] input[aria-label^="Volume"]';
  await L.blur(p);
  await p.locator(sel).focus();
  await p.keyboard.press(SENT % 2 === 0 ? 'ArrowLeft' : 'ArrowRight');
  SENT += 1;
  await L.sleep(200);
  await L.blur(p);
  await L.sleep(150);
  const r = await read(p);
  if (r.undoTitle !== 'Undo: Volume') throw new Error('sentinel failed: ' + r.undoTitle);
  return r;
}

async function setup(browser, tag, net) {
  const o = await L.openStudio(browser, VP, tag, net);
  const p = o.page;
  o.snap = await L.setSnapOff(p);
  o.adds = [];
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) o.adds.push(await L.addAt(p, s, ln, t));
  await L.blur(p);
  await p.keyboard.press('Home');
  await L.sleep(200);
  o.clips = await L.clipsDom(p);
  o.stems = o.clips.find((c) => c.lane === 'stems');
  o.sfx = o.clips.find((c) => c.lane === 'sfx');
  o.music = o.clips.find((c) => c.lane === 'music');
  await L.selectClip(p, o.stems.id);
  o.panelExpanded0 = await p.evaluate(() => { const t = document.querySelector('[data-testid=arrangement-detail-toggle]'); return t && t.getAttribute('aria-expanded'); });
  if (o.panelExpanded0 !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  await L.blur(p);
  await L.sleep(200);
  return o;
}

async function single(p, o, lane) {
  await L.blur(p);
  const cur = (await read(p)).selected;
  if (cur.length > 1) {
    const pt = await p.evaluate(() => {
      for (const c of [...document.querySelectorAll('[data-clip-id]')]) {
        const b = c.getBoundingClientRect();
        for (const dx of [80, 160, 240]) {
          const x = Math.min(b.right + dx, innerWidth - 40), y = b.top + 10;
          const e = document.elementFromPoint(x, y);
          if (e && !e.closest('[data-clip-id]') && !e.closest('[data-testid=arrangement-detail-panel]') && e.closest('[data-track-id]')) return { x, y };
        }
      }
      return null;
    });
    if (pt) { await p.mouse.click(pt.x, pt.y); await L.sleep(300); }
    if ((await read(p)).selected.length > 1) { await p.keyboard.press('Escape'); await L.sleep(250); }
  }
  const other = lane === 'music' ? o.stems : o.music;
  await L.selectClip(p, other.id);
  const d1 = await read(p);
  await L.selectClip(p, o[lane].id);
  await L.blur(p);
  const r = await read(p);
  if (process.env.DBG) console.log('single', lane, 'after other', d1.selected.join(','), 'after target', r.selected.join(','), r.status.slice(0,60));
  if (r.selected.length !== 1 || r.selected[0] !== lane) { await p.screenshot({ path: path.join(L.SHOTS, `dbg-single-${Date.now()}.png`) }); throw new Error(`single select ${lane} failed: ${r.selected} status=${r.status} active=${r.active}`); }
  return r;
}

let MOD = null;
async function multi(p, o) {
  await single(p, o, 'stems');
  const tries = MOD ? [MOD] : ['Shift', 'Control'];
  for (const m of tries) {
    await L.selectClip(p, o.sfx.id, [m]);
    await L.blur(p);
    const r = await read(p);
    if (r.selected.length === 2 && r.selected.includes('stems') && r.selected.includes('sfx')) { MOD = m; return r; }
    await single(p, o, 'stems');
  }
  throw new Error('multi-select failed');
}

async function setField(p, text) {
  await p.fill(FIELD, text);
  await p.locator(FIELD).press('Enter');
  await L.sleep(250);
  await L.blur(p);
  await L.sleep(200);
  return read(p);
}

async function setPair(p, o, s, x) {
  await single(p, o, 'stems');
  const a = await setField(p, String(s));
  await single(p, o, 'sfx');
  const b = await setField(p, String(x));
  return multi(p, o).then((r) => ({ stems: num(a.field), sfx: num(b.field), multi: r }));
}

// per-clip read (selection dance); asserts the dance creates no history entry
async function members(p, o) {
  const before = (await read(p)).undoTitle;
  const s = await single(p, o, 'stems');
  const x = await single(p, o, 'sfx');
  const m = await single(p, o, 'music');
  const g = await multi(p, o);
  return { stems: num(s.field), sfx: num(x.field), music: num(m.field), danceNoEntry: g.undoTitle === before, multi: g };
}

async function drag(p, dx, { shift = false, steps = null, startX = null } = {}) {
  const r0 = await read(p);
  const x0 = startX ?? thumbX(r0);
  const y = r0.box.y + r0.box.h / 2;
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.move(x0, y);
  await p.mouse.down();
  await L.sleep(60);
  const afterPress = await read(p);
  const n = steps ?? Math.abs(dx);
  for (let k = 1; k <= n; k++) await p.mouse.move(x0 + (dx * k) / n, y);
  await L.sleep(60);
  const beforeRelease = await read(p);
  await p.mouse.up();
  if (shift) await p.keyboard.up('Shift');
  await L.sleep(300);
  const r1 = await read(p);
  return { r0, afterPress, beforeRelease, r1, w: r0.box.w };
}

async function rowPresent(p, o) {
  const a = await setPair(p, o, -6, 1);
  const r = a.multi;
  const okMixed = r.disabled === false && r.fieldDisabled === false && r.reset && r.reset.disabled === false && r.field === '' && r.range === '−6.0 … +1.0 dB' && near(r.v, 1) && r.text === '−6.0 … +1.0 dB' && r.fieldDescIsRange && r.fieldTitle === '−6.0 … +1.0 dB';
  const e = await setPair(p, o, -3, -3);
  const re = e.multi;
  const okEqual = re.field === '-3.0' && re.range === null && near(re.v, -3) && re.text === '−3.0 dB' && re.disabled === false;
  await setPair(p, o, -6, 1);
  return { modifier: MOD, mixed: r, equal: re, okMixed, okEqual, pass: okMixed && okEqual };
}

async function layoutMeasure(p) {
  return p.evaluate(([F, RESET, FIELD, RANGE]) => {
    const blk = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
    const content = document.querySelector('[data-testid=arrangement-detail-content]');
    const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
    const c = content.getBoundingClientRect();
    const pn = panel.getBoundingClientRect();
    const vis = { left: Math.max(c.left, pn.left), right: Math.min(c.right, pn.right), top: Math.max(c.top, pn.top), bottom: Math.min(c.bottom, pn.bottom) };
    const inside = (q) => q.left >= vis.left - 0.5 && q.right <= vis.right + 0.5 && q.top >= vis.top - 0.5 && q.bottom <= vis.bottom + 0.5 && q.right <= innerWidth && q.bottom <= innerHeight;
    const R = (s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: +q.x.toFixed(1), y: +q.y.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), right: +q.right.toFixed(1), bottom: +q.bottom.toFixed(1), inside: inside(q), sw: e.scrollWidth, cw: e.clientWidth }; };
    const b = blk.getBoundingClientRect();
    return { vis, panelH: +pn.height.toFixed(1), block: { w: b.width, h: b.height, scrollW: blk.scrollWidth, clientW: blk.clientWidth, cls: blk.className }, fader: R(F), reset: R(RESET), field: R(FIELD), range: R(RANGE), docOverflowX: document.documentElement.scrollWidth > innerWidth, content: { scrollW: content.scrollWidth, clientW: content.clientWidth, scrollH: content.scrollHeight, clientH: content.clientHeight } };
  }, [F, RESET, FIELD, RANGE]);
}

async function rowLayout(p, o) {
  await single(p, o, 'stems');
  const s = await layoutMeasure(p);
  await p.locator('[data-testid=arrangement-detail-panel]').screenshot({ path: path.join(L.SHOTS, `layout-single-${VPN}-${RUN}.png`) });
  const a = await setPair(p, o, -60, 24);
  const m = await layoutMeasure(p);
  await p.screenshot({ path: path.join(L.SHOTS, `layout-multi-${VPN}-${RUN}.png`) });
  await p.locator('[data-testid=arrangement-detail-panel]').screenshot({ path: path.join(L.SHOTS, `layout-multi-${VPN}-${RUN}-panel.png`) });
  const pass = a.multi.range === '−60.0 … +24.0 dB' && m.range && m.range.inside && m.field.inside && m.fader.inside && m.reset.inside && m.block.scrollW <= m.block.clientW && Math.abs(m.block.h - s.block.h) <= 1 && !m.docOverflowX && m.range.sw <= m.range.cw + 0.5;
  await setPair(p, o, -6, 1);
  return { range: a.multi.range, single: s, multi: m, heightDiff: +(m.block.h - s.block.h).toFixed(2), pass };
}

async function rowDrag(p, o, fine) {
  await multi(p, o);
  await sentinel(p);
  const d = await drag(p, 20, { shift: fine });
  const w = d.w;
  const exp = fine ? (20 / w) * 8.4 : (20 / w) * 84;
  const tol = fine ? 0.1 + 8.4 / w : 0.1 + 84 / w;
  const sp = span(d.r1);
  const statusAfter = d.r1.status;
  const mem = await members(p, o);
  const dS = +(mem.stems - -6).toFixed(4), dX = +(mem.sfx - 1).toFixed(4);
  const u = await undo(p);
  const mu = await members(p, o);
  const res = { w, expected: +exp.toFixed(3), tol: +tol.toFixed(3), pressV: d.afterPress.v, v0: d.r0.v, range1: d.r1.range, field1: d.r1.field, text1: d.r1.text, deltaStems: dS, deltaSfx: dX, diff: +(mem.sfx - mem.stems).toFixed(4), music: mem.music, danceNoEntry: mem.danceNoEntry, statusAfter, titleBefore: d.r0.undoTitle, titleAfter: d.r1.undoTitle, afterUndo: { stems: mu.stems, sfx: mu.sfx, title: u.undoTitle }, rangeAfterUndo: u.range };
  res.pass = near(d.afterPress.v, d.r0.v) && Math.abs(dS - exp) <= tol + 1e-9 && near(dS, dX) && near(res.diff, 7) && near(sp.min, mem.stems) && near(sp.max, mem.sfx) && /Clip Gain/.test(d.r1.undoTitle || '') && d.r1.undoTitle !== d.r0.undoTitle && near(mu.stems, -6) && near(mu.sfx, 1) && u.undoTitle === d.r0.undoTitle && mem.danceNoEntry;
  if (!fine) res.statusPass = /2 კლიპი/.test(statusAfter);
  return res;
}

async function rowClamp(p, o) {
  await multi(p, o);
  const r0 = await read(p);
  await sentinel(p);
  const right = await drag(p, Math.ceil(r0.box.x + r0.box.w + 120 - thumbX(r0)), { steps: 40 });
  const memR = await members(p, o);
  const uR = await undo(p);
  const mR = await members(p, o);
  const r1 = await read(p);
  await sentinel(p);
  const left = await drag(p, -Math.ceil(thumbX(r1) - r1.box.x + 120), { steps: 40 });
  const memL = await members(p, o);
  const uL = await undo(p);
  const mL = await members(p, o);
  const res = {
    right: { range: right.r1.range, stems: memR.stems, sfx: memR.sfx, diff: +(memR.sfx - memR.stems).toFixed(4), title: right.r1.undoTitle, titleBack: uR.undoTitle === right.r0.undoTitle, undoTo: [mR.stems, mR.sfx] },
    left: { range: left.r1.range, stems: memL.stems, sfx: memL.sfx, diff: +(memL.sfx - memL.stems).toFixed(4), title: left.r1.undoTitle, titleBack: uL.undoTitle === left.r0.undoTitle, undoTo: [mL.stems, mL.sfx] },
  };
  res.pass = near(memR.sfx, 24) && near(memR.stems, 17) && near(memL.stems, -60) && near(memL.sfx, -53) && res.right.titleBack && res.left.titleBack && /Clip Gain/.test(right.r1.undoTitle || '') && /Clip Gain/.test(left.r1.undoTitle || '') && near(mR.stems, -6) && near(mR.sfx, 1) && near(mL.stems, -6) && near(mL.sfx, 1);
  return res;
}

async function rowKey(p, o) {
  await multi(p, o);
  const g = await sentinel(p);
  await p.locator(F).focus();
  const titles = [];
  for (let k = 0; k < 3; k++) { await p.keyboard.press('ArrowRight'); await L.sleep(200); titles.push((await read(p)).undoTitle); }
  await L.blur(p); await L.sleep(200);
  const r1 = await read(p);
  const mem = await members(p, o);
  const undos = [];
  for (let k = 0; k < 4; k++) { const u = await undo(p); const sp = span(u); undos.push({ range: u.range, field: u.field, title: u.undoTitle, sp }); if (near(sp.min, -6) && near(sp.max, 1)) break; }
  const entries = undos.findIndex((u) => near(u.sp.min, -6) && near(u.sp.max, 1)) + 1;
  return { range1: r1.range, stems: mem.stems, sfx: mem.sfx, titles, undos, entries, titleBack: entries > 0 && undos[entries - 1].title === g.undoTitle, pass: near(mem.stems, -5.7) && near(mem.sfx, 1.3) && entries === 3 && undos[entries - 1].title === g.undoTitle };
}

async function rowDbl(p, o) {
  await multi(p, o);
  const g = await sentinel(p);
  const y = g.box.y + g.box.h / 2;
  await p.mouse.dblclick(thumbX(g), y);
  await L.sleep(350);
  await L.blur(p); await L.sleep(150);
  const r1 = await read(p);
  await p.mouse.dblclick(thumbX(r1), y);
  await L.sleep(350);
  await L.blur(p); await L.sleep(150);
  const r2 = await read(p);
  const mem = await members(p, o);
  const u = await undo(p);
  const mu = await members(p, o);
  return { r1: { field: r1.field, range: r1.range, v: r1.v, title: r1.undoTitle, status: r1.status }, r2title: r2.undoTitle, stems: mem.stems, sfx: mem.sfx, afterUndo: [mu.stems, mu.sfx], titleBack: u.undoTitle === g.undoTitle,
    pass: near(mem.stems, 0) && near(mem.sfx, 0) && r1.range === null && r1.field === '0.0' && /Clip Gain/.test(r1.undoTitle || '') && r1.undoTitle !== g.undoTitle && r2.undoTitle === r1.undoTitle && near(mu.stems, -6) && near(mu.sfx, 1) && u.undoTitle === g.undoTitle };
}

async function rowResetBtn(p, o) {
  await multi(p, o);
  const g = await sentinel(p);
  await p.locator(RESET).focus();
  await p.keyboard.press('Enter');
  await L.sleep(350);
  const r = await read(p);
  await L.blur(p); await L.sleep(150);
  const r2 = await read(p);
  const mem = await members(p, o);
  const u = await undo(p);
  const mu = await members(p, o);
  return { active: r.active, field: r.field, resetDisabled: r2.reset.disabled, status: r.status, stems: mem.stems, sfx: mem.sfx, afterUndo: [mu.stems, mu.sfx], titleBack: u.undoTitle === g.undoTitle,
    pass: near(mem.stems, 0) && near(mem.sfx, 0) && r.active === 'arrangement-detail-clip-gain-input' && r2.reset.disabled === true && near(mu.stems, -6) && near(mu.sfx, 1) && u.undoTitle === g.undoTitle };
}

async function rowField(p, o) {
  await multi(p, o);
  const g = await sentinel(p);
  const r = await setField(p, '-3');
  const mem = await members(p, o);
  const u = await undo(p);
  const mu = await members(p, o);
  await multi(p, o);
  const g2 = await sentinel(p);
  await p.fill(FIELD, '-3');
  await L.sleep(150);
  const typed = await read(p);
  await p.locator(FIELD).press('Escape');
  await L.sleep(200);
  const esc = await read(p);
  await L.blur(p); await L.sleep(200);
  const after = await read(p);
  const m2 = await members(p, o);
  return { set: { field: r.field, range: r.range, status: r.status, stems: mem.stems, sfx: mem.sfx, title: r.undoTitle }, afterUndo: [mu.stems, mu.sfx], titleBack: u.undoTitle === g.undoTitle,
    escape: { typed: typed.field, pendingAttr: typed.fieldDescribedby, escField: esc.field, escRange: esc.range, titleUnchanged: after.undoTitle === g2.undoTitle, members: [m2.stems, m2.sfx] },
    pass: near(mem.stems, -3) && near(mem.sfx, -3) && r.undoTitle !== g.undoTitle && u.undoTitle === g.undoTitle && near(mu.stems, -6) && near(mu.sfx, 1) && esc.field === '' && esc.range === '−6.0 … +1.0 dB' && after.undoTitle === g2.undoTitle && near(m2.stems, -6) && near(m2.sfx, 1) };
}

async function rowPending(p, o) {
  await multi(p, o);
  const g = await sentinel(p);
  await p.fill(FIELD, '-3');
  await L.sleep(200);
  const typed = await read(p);
  const pend = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]'));
  const d = await drag(p, 20, { startX: thumbX(typed) });
  const w = d.w;
  const exp = -3 + (20 / w) * 84;
  const tol = 0.1 + 84 / w;
  const mem = await members(p, o);
  const u1 = await undo(p);
  const m1 = await members(p, o);
  const u2 = await undo(p);
  const m2 = await members(p, o);
  return { w, typed: typed.field, pendingMarker: pend, pressV: d.afterPress.v, statusAfterPress: d.afterPress.status, r1: { range: d.r1.range, field: d.r1.field, status: d.r1.status, title: d.r1.undoTitle }, stems: mem.stems, sfx: mem.sfx, expected: +exp.toFixed(3), tol: +tol.toFixed(3), undo1: [m1.stems, m1.sfx], undo1Title: u1.undoTitle, undo2: [m2.stems, m2.sfx], undo2TitleBack: u2.undoTitle === g.undoTitle,
    pass: Math.abs(mem.stems - exp) <= tol + 1e-9 && near(mem.stems, mem.sfx) && near(m1.stems, -3) && near(m1.sfx, -3) && near(m2.stems, -6) && near(m2.sfx, 1) && u2.undoTitle === g.undoTitle };
}

async function rowNbSingle(p, o) {
  await single(p, o, 'stems');
  const s = await sentinel(p);
  const d = await drag(p, 20);
  const w = d.w;
  const exp = (20 / w) * 84, tol = 0.1 + 84 / w;
  const delta = +(d.r1.v - d.r0.v).toFixed(4);
  const singleText = d.r1.text; const singleStatus = d.r1.status; const rangeNode = d.r1.range;
  const u = await undo(p);
  const r0 = await read(p);
  const y = r0.box.y + r0.box.h / 2;
  await p.mouse.dblclick(thumbX(r0), y); await L.sleep(350); await L.blur(p); await L.sleep(150);
  const rd = await read(p);
  const u2 = await undo(p);
  return { w, v0: d.r0.v, v1: d.r1.v, delta, expected: +exp.toFixed(3), tol: +tol.toFixed(3), text: singleText, status: singleStatus, rangeNode, undoTo: u.v, dbl: rd.v, dblTitle: rd.undoTitle, dblUndoTo: u2.v,
    pass: near(d.afterPress.v, d.r0.v) && Math.abs(delta - exp) <= tol + 1e-9 && rangeNode === null && /Clip Gain/.test(d.r1.undoTitle || '') && near(u.v, d.r0.v) && u.undoTitle === s.undoTitle && near(rd.v, 0) && near(u2.v, d.r0.v) && u2.undoTitle === s.undoTitle };
}

const readIn = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); const b = e.getBoundingClientRect(); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return { v: +e.value, min: +e.min, max: +e.max, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; }, sel);
async function mcDrag(p, sel, shift) {
  await p.locator(sel).scrollIntoViewIfNeeded();
  const r0 = await readIn(p, sel);
  const frac = (r0.v - r0.min) / (r0.max - r0.min);
  const far = frac > 0.5 ? r0.box.x + 0.15 * r0.box.w : r0.box.x + 0.85 * r0.box.w;
  const y = r0.box.y + r0.box.h / 2;
  if (shift) await p.keyboard.down('Shift');
  await p.mouse.move(far, y); await p.mouse.down(); await L.sleep(100);
  for (let k = 1; k <= 5; k++) { await p.mouse.move(far - 4 * k, y); await L.sleep(40); }
  await p.mouse.up();
  if (shift) await p.keyboard.up('Shift');
  await L.sleep(250);
  const r1 = await readIn(p, sel);
  await L.blur(p); await L.sleep(200);
  await p.keyboard.press('Control+z'); await L.sleep(300);
  const u = await readIn(p, sel);
  return { w: r0.box.w, v0: r0.v, v1: r1.v, delta: +(r1.v - r0.v).toFixed(4), title: r1.undoTitle, undo: u.v, undoTitleBack: u.undoTitle === r0.undoTitle };
}
async function rowNbTrack(p) {
  const sel = '[data-track-id=music] input[aria-label^="Volume"]';
  const plain = await mcDrag(p, sel, false);
  const shift = await mcDrag(p, sel, true);
  return { plain, shift, pass: near(plain.delta, shift.delta) && Math.abs(shift.delta - -0.19) <= 0.01 + 1e-9 && shift.undoTitleBack };
}
async function rowNbMaster(p) {
  const sel = 'input[aria-label="Master Volume"]';
  const plain = await mcDrag(p, sel, false);
  const shift = await mcDrag(p, sel, true);
  return { plain, shift, pass: Math.abs(plain.delta - -13.5) <= 0.5 + 1e-9 && near(plain.undo, plain.v0) && plain.undoTitleBack && /Master/.test(plain.title || '') && near(plain.delta, shift.delta) };
}

// single stems: press, +10, Ctrl+A while held, +10, release
async function rowSelectMidDrag(p, o) {
  const s = await single(p, o, 'stems');
  const before = await members(p, o);
  await single(p, o, 'stems');
  await sentinel(p);
  const r0 = await read(p);
  const x0 = thumbX(r0), y = r0.box.y + r0.box.h / 2;
  const statuses = [];
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 10; k++) { await p.mouse.move(x0 + k, y); statuses.push((await read(p)).status); }
  const mid1 = await read(p);
  await p.keyboard.press('Control+a'); await L.sleep(300);
  const afterA = await read(p);
  for (let k = 11; k <= 20; k++) { await p.mouse.move(x0 + k, y); statuses.push((await read(p)).status); }
  const mid2 = await read(p);
  await p.mouse.up(); await L.sleep(300);
  const r1 = await read(p);
  const selectionChanged = afterA.selected.length !== 1;
  const after = await members(p, o);
  const u = await undo(p);
  const mu = await members(p, o);
  const refusalCount = statuses.filter((t) => /ჟესტ|gesture|დაბლოკ/i.test(t)).length;
  const res = { selectedBeforeA: mid1.selected, selectedAfterA: afterA.selected, faderAfterA: { disabled: afterA.disabled, v: afterA.v, range: afterA.range }, activeAfterA: afterA.active, selectionChanged, before: [before.stems, before.sfx, before.music], after: [after.stems, after.sfx, after.music], midV: [mid1.v, mid2.v], titleBefore: r0.undoTitle, titleAfter: r1.undoTitle, statusAfter: r1.status, distinctStatuses: [...new Set(statuses)], refusalCount, undoTo: [mu.stems, mu.sfx, mu.music], titleBack: u.undoTitle === r0.undoTitle };
  const ok = after.stems > before.stems + 1 && near(after.sfx, before.sfx) && near(after.music, before.music) && u.undoTitle === r0.undoTitle && near(mu.stems, before.stems) && /Clip Gain/.test(r1.undoTitle || '') && refusalCount === 0;
  res.verdict = selectionChanged ? (ok ? 'PASS' : 'FAIL') : 'INCONCLUSIVE';
  res.pass = selectionChanged && ok;
  return res;
}


// extra observation: group→group selection change mid-drag (R8 captured ids, same content key)
async function rowSelectMidDragGroup(p, o) {
  await multi(p, o);
  const before = await members(p, o);
  const r0 = await sentinel(p);
  const x0 = thumbX(r0), y = r0.box.y + r0.box.h / 2;
  const statuses = [];
  await p.mouse.move(x0, y); await p.mouse.down(); await L.sleep(60);
  for (let k = 1; k <= 10; k++) { await p.mouse.move(x0 + k, y); statuses.push((await read(p)).status); }
  const mid1 = await read(p);
  await p.keyboard.press('Control+a'); await L.sleep(300);
  const afterA = await read(p);
  for (let k = 11; k <= 20; k++) { await p.mouse.move(x0 + k, y); statuses.push((await read(p)).status); }
  const mid2 = await read(p);
  await p.mouse.up(); await L.sleep(300);
  const r1 = await read(p);
  const after = await members(p, o);
  const u = await undo(p);
  const mu = await members(p, o);
  const w = r0.box.w, exp = (20 / w) * 84, tol = 0.1 + 84 / w;
  const refusalCount = statuses.filter((t) => /ჟესტ|gesture|დაბლოკ/i.test(t)).length;
  const dS = after.stems - before.stems, dX = after.sfx - before.sfx;
  const res = { selectedAfterA: afterA.selected, rangeMid1: mid1.range, rangeAfterA: afterA.range, rangeMid2: mid2.range, before: [before.stems, before.sfx, before.music], after: [after.stems, after.sfx, after.music], deltaStems: +dS.toFixed(3), deltaSfx: +dX.toFixed(3), expectedFull: +exp.toFixed(3), tol: +tol.toFixed(3), titleAfter: r1.undoTitle, statusAfter: r1.status, distinctStatuses: [...new Set(statuses)], refusalCount, undoTo: [mu.stems, mu.sfx, mu.music], titleBack: u.undoTitle === r0.undoTitle };
  res.continued = Math.abs(dS - exp) <= tol + 1e-9;
  res.pass = afterA.selected.length === 3 && near(dS, dX) && near(after.music, before.music) && refusalCount === 0 && res.titleBack && near(mu.stems, before.stems) && near(mu.sfx, before.sfx);
  return res;
}

async function rowVideoMix(p, o) {
  await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  const vid = (await L.clipsDom(p)).find((c) => c.kind === 'video');
  o.video = vid;
  await single(p, o, 'stems');
  const s0 = await setField(p, '-6');
  let r = null;
  for (const m of [MOD || 'Shift', 'Control', 'Shift']) {
    await single(p, o, 'stems');
    await L.selectClip(p, vid.id, [m]);
    await L.blur(p);
    r = await read(p);
    r.mod = m;
    if (r.selected.length === 2) break;
  }
  const sel = await p.evaluate(() => [...document.querySelectorAll('[data-clip-id]')].filter((e) => /ring-brand/.test(e.className)).map((e) => e.dataset.clipKind));
  const sv = await sentinel(p);
  r.selectedAfterSentinel = sv.selected;
  const before = sv.undoTitle;
  const y = r.box.y + r.box.h / 2;
  await p.mouse.move(r.box.x + r.box.w / 2, y); await p.mouse.down(); await p.mouse.move(r.box.x + r.box.w / 2 + 20, y, { steps: 5 }); await p.mouse.up(); await L.sleep(250);
  await p.mouse.dblclick(r.box.x + r.box.w / 2, y); await L.sleep(300);
  await L.blur(p);
  const r2 = await read(p);
  await p.locator('[data-testid=arrangement-detail-panel]').screenshot({ path: path.join(L.SHOTS, `video-mix-${VPN}-${RUN}-panel.png`) });
  const stemsAfter = (await single(p, o, 'stems')).field;
  const res = { mod: r.mod, selectedLanes: r.selected, selectedKinds: sel, disabled: r.disabled, fieldDisabled: r.fieldDisabled, resetDisabled: r.reset && r.reset.disabled, title: r.title, fieldTitle: r.fieldTitle, desc: r.desc, fieldDesc: r.fieldDesc, sameDesc: r.describedby === r.fieldDescribedby, displayed: { field: r.field, v: r.v, text: r.text, range: r.range }, noEntry: r2.undoTitle === before, stemsAfter, stemsSet: s0.field };
  res.reachable = sel.includes('video') && sel.includes('audio');
  res.pass = res.reachable && r.disabled === true && r.fieldDisabled === true && res.resetDisabled === true && r.title === R1 && r.fieldTitle === R1 && r.desc === R1 && r.fieldDesc === R1 && res.sameDesc && res.noEntry && num(stemsAfter) === -6;
  return res;
}

// GATE114-S3 observation
async function rowBlurDisabled(p, o) {
  await single(p, o, 'stems');
  const s0 = await sentinel(p);
  if (s0.selected.join() !== 'stems') throw new Error('sentinel changed selection');
  await p.locator(F).focus();
  const trace = [];
  const t0 = Date.now();
  await p.keyboard.down('ArrowRight');
  while (Date.now() - t0 < 500) { await L.sleep(33); await p.keyboard.down('ArrowRight'); }
  const held = await read(p);
  trace.push({ k: 'held', v: held.v, title: held.undoTitle, active: held.active });
  await p.keyboard.down('Control'); await p.keyboard.press('a'); await p.keyboard.up('Control');
  await L.sleep(300);
  const afterA = await read(p);
  trace.push({ k: 'afterCtrlA', v: afterA.v, disabled: afterA.disabled, title: afterA.undoTitle, active: afterA.active, selected: afterA.selected });
  await p.keyboard.up('ArrowRight');
  await L.sleep(300);
  const afterUp = await read(p);
  trace.push({ k: 'afterKeyup', v: afterUp.v, disabled: afterUp.disabled, title: afterUp.undoTitle, active: afterUp.active, selected: afterUp.selected });
  const selectionChanged = afterA.selected.length > 1;
  const stemsNow = num((await single(p, o, 'stems')).field);
  const t1 = (await read(p)).undoTitle;
  // unrelated edit: music clip gain −1 via field
  let me;
  if (process.env.UNRELATED === 'volume') { me = await sentinel(p); } else { await single(p, o, 'music'); me = await setField(p, '-1'); }
  const u1 = await undo(p);
  const m1 = await members(p, o);
  const u2 = await undo(p);
  const m2 = await members(p, o);
  const res = { stemsBefore: num(s0.field), heldV: held.v, selectionChanged, trace, stemsAfterRelease: stemsNow, titleAfterRelease: t1, unrelated: me.undoTitle, undo1: [m1.stems, m1.music], undo1Title: u1.undoTitle, undo2: [m2.stems, m2.music], undo2Title: u2.undoTitle, startTitle: s0.undoTitle };
  const previewed = held.v;
  const ok = near(stemsNow, previewed) && near(m1.stems, previewed) && near(m1.music, 0) && near(m2.stems, num(s0.field)) && u2.undoTitle === s0.undoTitle;
  res.verdict = !selectionChanged ? 'INCONCLUSIVE' : ok ? 'PASS' : 'FAIL';
  res.pass = selectionChanged && ok;
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `multi-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {} };
  const save = () => { out.net = net; out.modifier = MOD; L.save(L.OUT, `${tag}.json`, out); };
  const o = await setup(browser, tag, net);
  const p = o.page;
  out.setup = { snap: o.snap, adds: o.adds, clips: o.clips, panelExpanded0: o.panelExpanded0 };
  const rows = [
    ['MC-PRESENT', () => rowPresent(p, o)],
    ['MC-LAYOUT', () => rowLayout(p, o)],
    ['MC-DRAG', () => rowDrag(p, o, false)],
    ['MC-FINE', () => rowDrag(p, o, true)],
    ['MC-CLAMP', () => rowClamp(p, o)],
    ['MC-KEY', () => rowKey(p, o)],
    ['MC-DBL', () => rowDbl(p, o)],
    ['MC-RESET-BTN', () => rowResetBtn(p, o)],
    ['MC-FIELD', () => rowField(p, o)],
    ['MC-PENDING-DRAG', () => rowPending(p, o)],
    ['NB-SINGLE', () => rowNbSingle(p, o)],
    ['NB-TRACK-SHIFT', () => rowNbTrack(p)],
    ['NB-MASTER', () => rowNbMaster(p)],
    ['MC-SELECT-MIDDRAG', () => rowSelectMidDrag(p, o)],
    ['MC-SELECT-MIDDRAG-GROUP', () => rowSelectMidDragGroup(p, o)],
    ['MC-VIDEO-MIX', () => rowVideoMix(p, o)],
    ['MC-BLUR-DISABLED', () => rowBlurDisabled(p, o)],
  ];
  const ONLY = process.env.ROWS ? process.env.ROWS.split(',') : null;
  for (const [id, fn] of rows) {
    if (ONLY && !ONLY.includes(id) && !(id === 'MC-PRESENT')) continue;
    try {
      const r = await fn();
      out.rows[id] = r;
      console.log(id, r.verdict || r.pass, JSON.stringify(r, (k, v) => (['multi', 'single', 'vis', 'mixed', 'equal'].includes(k) ? undefined : v)).slice(0, 700));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 300));
      await p.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
      await p.mouse.up().catch(() => {});
      await L.blur(p).catch(() => {});
    }
    if (['MC-DRAG', 'MC-PENDING-DRAG', 'MC-CLAMP'].includes(id)) await p.screenshot({ path: path.join(L.SHOTS, `${id}-${VPN}-${RUN}.png`) }).catch(() => {});
    save();
  }
  out.final = await read(p);
  await p.screenshot({ path: path.join(L.SHOTS, `multi-final-${VPN}-${RUN}.png`) });
  save();
  await o.ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
