// C round 114 — Clip Gain fader UI rows. Usage: node ui.cjs <1440|1280> <run#>
// Tolerances fixed before running (task §4).
const L = require('./lib.cjs');
const path = require('path');

const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const VPN = `${VP.width}`;
const RUN = +(process.argv[3] || 1);
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const RESET = '[data-testid=arrangement-detail-clip-gain-reset]';
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

const read = (p) => p.evaluate(([F, FIELD]) => {
  const f = document.querySelector(F);
  const fi = document.querySelector(FIELD);
  const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || ''));
  const b = f && f.getBoundingClientRect();
  const desc = (el) => { const id = el && el.getAttribute('aria-describedby'); const d = id && document.getElementById(id); return d ? d.textContent.trim() : null; };
  const ae = document.activeElement;
  return {
    v: f ? +f.value : null, text: f && f.getAttribute('aria-valuetext'), disabled: f ? f.disabled : null, title: f && f.getAttribute('title'), desc: desc(f), describedby: f && f.getAttribute('aria-describedby'),
    min: f && f.min, max: f && f.max, step: f && f.step, label: f && f.getAttribute('aria-label'),
    box: b && { x: b.x, y: b.y, w: b.width, h: b.height },
    field: fi ? fi.value : null, fieldDisabled: fi ? fi.disabled : null, fieldTitle: fi && fi.getAttribute('title'), fieldDesc: desc(fi), fieldDescribedby: fi && fi.getAttribute('aria-describedby'),
    undoTitle: u && u.getAttribute('title'), undoDisabled: u ? u.disabled : null,
    status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim().slice(0, 160),
    active: ae ? (ae.dataset.testid || ae.getAttribute('aria-label') || ae.tagName) : null,
  };
}, [F, FIELD]);

const thumbX = (r) => r.box.x + ((r.v + 60) / 84) * r.box.w;

async function undo(p) { await L.blur(p); await L.sleep(200); await p.keyboard.press('Control+z'); await L.sleep(300); return read(p); }

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

// drag: segments = [{dx, shift}], each segment applied in 1 px steps, reading the value after every step
async function drag(p, segs, { shiftBeforePress = false, startX = null } = {}) {
  const r0 = await read(p);
  const x0 = startX ?? thumbX(r0);
  const y = r0.box.y + r0.box.h / 2;
  const trace = [];
  if (shiftBeforePress) await p.keyboard.down('Shift');
  await p.mouse.move(x0, y);
  await p.mouse.down();
  await L.sleep(60);
  const afterPress = await read(p);
  let x = x0;
  let shiftDown = shiftBeforePress;
  for (const s of segs) {
    if (s.shift && !shiftDown) { await p.keyboard.down('Shift'); shiftDown = true; }
    if (!s.shift && shiftDown) { await p.keyboard.up('Shift'); shiftDown = false; }
    const dir = Math.sign(s.dx);
    for (let k = 0; k < Math.abs(s.dx); k++) {
      x += dir;
      await p.mouse.move(x, y);
      trace.push({ x: +(x - x0).toFixed(1), shift: shiftDown, v: (await read(p)).v });
    }
  }
  await p.mouse.up();
  if (shiftDown) await p.keyboard.up('Shift');
  await L.sleep(250);
  const r1 = await read(p);
  return { r0, afterPress, trace, r1, delta: +(r1.v - r0.v).toFixed(4), w: r0.box.w };
}

async function rowPresent(p) {
  const r = await read(p);
  await p.locator(FIELD).focus();
  await p.keyboard.press('Tab');
  await L.sleep(100);
  const a1 = (await read(p)).active;
  await p.keyboard.press('Tab');
  await L.sleep(100);
  const a2 = (await read(p)).active;
  await L.blur(p);
  await L.sleep(150);
  const r2 = await read(p);
  const resetDisabledAt0 = await p.evaluate((s) => document.querySelector(s).disabled, RESET);
  const rs = await setViaField(p, '-6');
  await p.locator(FIELD).focus();
  await p.keyboard.press('Tab');
  await L.sleep(100);
  const b1 = (await read(p)).active;
  await p.keyboard.press('Tab');
  await L.sleep(100);
  const b2 = (await read(p)).active;
  await L.blur(p);
  await L.sleep(150);
  const rs2 = await read(p);
  const u = await undo(p);
  const pass = r.disabled === false && near(r.v, 0) && r.text === '0.0 dB' && r.min === '-60' && r.max === '24' && r.step === '0.1' && r.label === 'Clip Gain — fader' && a1 === 'arrangement-detail-clip-gain-fader' && r2.undoTitle === r.undoTitle && b1 === 'arrangement-detail-clip-gain-fader' && b2 === 'arrangement-detail-clip-gain-reset' && rs2.undoTitle === rs.undoTitle && near(u.v, 0);
  return { r, tabAfterField: a1, tabAfterFader: a2, resetDisabledAt0, undoUnchangedByTabbing: r2.undoTitle === r.undoTitle, atMinus6: { tabAfterField: b1, tabAfterFader: b2, undoUnchanged: rs2.undoTitle === rs.undoTitle, undoTo: u.v }, pass };
}

async function rowLayout(p, shot) {
  const m = await p.evaluate(([F, RESET]) => {
    const blk = document.querySelector('[data-testid=arrangement-detail-clip-gain]');
    const content = document.querySelector('[data-testid=arrangement-detail-content]');
    const panel = document.querySelector('[data-testid=arrangement-detail-panel]');
    const c = content.getBoundingClientRect();
    const pn = panel.getBoundingClientRect();
    const vis = { left: Math.max(c.left, pn.left), right: Math.min(c.right, pn.right), top: Math.max(c.top, pn.top), bottom: Math.min(c.bottom, pn.bottom) };
    const R = (s) => document.querySelector(s).getBoundingClientRect();
    const inside = (q) => q.left >= vis.left - 0.5 && q.right <= vis.right + 0.5 && q.top >= vis.top - 0.5 && q.bottom <= vis.bottom + 0.5 && q.right <= innerWidth && q.bottom <= innerHeight;
    const f = R(F); const z = R(RESET); const b = blk.getBoundingClientRect();
    const kids = [...content.children].map((k) => { const q = k.getBoundingClientRect(); return { tid: k.dataset.testid || k.tagName, w: +q.width.toFixed(1), h: +q.height.toFixed(1), scrollH: k.scrollHeight, clientH: k.clientHeight }; });
    const src = [...content.querySelectorAll('*')].find((e) => e.children.length === 0 && /წყარო უცვლელი რჩება/.test(e.textContent));
    const sq = src && src.getBoundingClientRect();
    return {
      vis, panelH: +pn.height.toFixed(1), fader: { x: f.x, y: f.y, w: f.width, h: f.height, inside: inside(f) }, reset: { x: z.x, y: z.y, w: z.width, h: z.height, inside: inside(z) },
      block: { w: b.width, scrollW: blk.scrollWidth, clientW: blk.clientWidth, scrollH: blk.scrollHeight, clientH: blk.clientHeight },
      content: { scrollW: content.scrollWidth, clientW: content.clientWidth, scrollH: content.scrollHeight, clientH: content.clientHeight }, kids,
      sourceLine: sq ? { top: sq.top, bottom: sq.bottom, visible: sq.bottom <= vis.bottom + 0.5 } : null,
      docOverflowX: document.documentElement.scrollWidth > innerWidth,
    };
  }, [F, RESET]);
  await p.screenshot({ path: path.join(L.SHOTS, shot) });
  const panel = await p.locator('[data-testid=arrangement-detail-panel]').boundingBox();
  if (panel) await p.screenshot({ path: path.join(L.SHOTS, shot.replace('.png', '-panel.png')), clip: panel });
  m.pass = m.fader.inside && m.reset.inside && m.block.scrollW <= m.block.clientW && !m.docOverflowX;
  return m;
}

async function rowNoJump(p) {
  const r0 = await read(p);
  const frac = (r0.v + 60) / 84;
  const x = frac > 0.5 ? r0.box.x + 0.15 * r0.box.w : r0.box.x + 0.85 * r0.box.w;
  const y = r0.box.y + r0.box.h / 2;
  await p.mouse.move(x, y);
  await p.mouse.down();
  await L.sleep(100);
  const during = await read(p);
  await p.mouse.up();
  await L.sleep(250);
  const r1 = await read(p);
  return { x: +(x - r0.box.x).toFixed(1), v0: r0.v, during: during.v, after: r1.v, titleBefore: r0.undoTitle, titleAfter: r1.undoTitle, pass: near(during.v, r0.v) && near(r1.v, r0.v) && r1.undoTitle === r0.undoTitle && r1.undoDisabled === r0.undoDisabled };
}

async function rowDrag(p, fine) {
  const d = await drag(p, [{ dx: 20, shift: fine }], { shiftBeforePress: fine });
  const w = d.w;
  const exp = fine ? (20 / w) * 8.4 : (20 / w) * 84;
  const tol = fine ? 0.1 + 8.4 / w : 0.1 + 84 / w;
  const u = await undo(p);
  const res = { w, expected: +exp.toFixed(3), tol: +tol.toFixed(3), v0: d.r0.v, pressV: d.afterPress.v, v1: d.r1.v, delta: d.delta, field: d.r1.field, text: d.r1.text, title: d.r1.undoTitle, titleBefore: d.r0.undoTitle, afterUndo: u.v, undoTitleBack: u.undoTitle === d.r0.undoTitle && u.undoDisabled === d.r0.undoDisabled, traceLen: d.trace.length, monotonic: d.trace.every((t, i) => i === 0 || t.v >= d.trace[i - 1].v) };
  res.fieldMatches = Number((d.r1.field || '').replace('−', '-')) === d.r1.v;
  res.pass = near(d.afterPress.v, d.r0.v) && Math.abs(d.delta - exp) <= tol + 1e-9 && res.fieldMatches && /Clip Gain/.test(d.r1.undoTitle || '') && d.r1.undoTitle !== d.r0.undoTitle && near(u.v, d.r0.v) && res.undoTitleBack;
  return res;
}

async function rowToggle(p) {
  const d = await drag(p, [{ dx: 10, shift: false }, { dx: 10, shift: true }]);
  const w = d.w;
  const exp = (10 / w) * 84 + (10 / w) * 8.4;
  const tol = 0.2 + 84 / w;
  const i = d.trace.findIndex((t) => t.shift);
  const toggleStep = +(d.trace[i].v - d.trace[i - 1].v).toFixed(4);
  const u = await undo(p);
  const res = { w, expected: +exp.toFixed(3), tol: +tol.toFixed(3), v1: d.r1.v, delta: d.delta, coarsePart: d.trace[i - 1].v - d.r0.v, toggleStep, toggleLimit: +(84 / w + 0.1).toFixed(3), trace: d.trace.map((t) => `${t.x}${t.shift ? 'S' : ''}:${t.v}`).join(' '), title: d.r1.undoTitle, afterUndo: u.v, undoTitleBack: u.undoTitle === d.r0.undoTitle };
  res.pass = Math.abs(d.delta - exp) <= tol + 1e-9 && Math.abs(toggleStep) <= 84 / w + 0.1 + 1e-9 && near(u.v, d.r0.v) && res.undoTitleBack;
  return res;
}

async function rowKey(p) {
  const r0 = await read(p);
  await p.locator(F).focus();
  const vals = [];
  const titles = [];
  for (let k = 0; k < 3; k++) { await p.keyboard.press('ArrowRight'); await L.sleep(150); const r = await read(p); vals.push(r.v); titles.push(r.undoTitle); }
  await L.blur(p);
  await L.sleep(200);
  const r1 = await read(p);
  const undos = [];
  for (let k = 0; k < 4; k++) { const u = await undo(p); undos.push({ v: u.v, title: u.undoTitle, disabled: u.undoDisabled }); if (near(u.v, r0.v) && u.undoTitle === r0.undoTitle) break; }
  const entries = undos.findIndex((u) => near(u.v, r0.v)) + 1;
  return { v0: r0.v, vals, titles, v1: r1.v, undos, entries, pass: near(r1.v - r0.v, 0.3, 1e-6) && entries === 3 && undos[entries - 1].title === r0.undoTitle };
}

async function setViaField(p, text) {
  await p.fill(FIELD, text);
  await p.locator(FIELD).press('Enter');
  await L.sleep(250);
  await L.blur(p);
  await L.sleep(200);
  return read(p);
}

async function rowDbl(p) {
  const r00 = await read(p);
  const rA = await setViaField(p, '-6');
  const x = thumbX(rA);
  const y = rA.box.y + rA.box.h / 2;
  await p.mouse.dblclick(x, y);
  await L.sleep(300);
  const r1 = await read(p);
  await L.blur(p);
  await L.sleep(150);
  const r1b = await read(p);
  const x2 = thumbX(r1b);
  await p.mouse.dblclick(x2, y);
  await L.sleep(300);
  await L.blur(p);
  await L.sleep(150);
  const r2 = await read(p);
  const u1 = await undo(p);
  const u2 = await undo(p);
  return { setVal: rA.v, setTitle: rA.undoTitle, afterDbl1: r1.v, title1: r1.undoTitle, afterDbl2: r2.v, title2: r2.undoTitle, undo1: u1.v, undo2: u2.v, undo2Title: u2.undoTitle, startTitle: r00.undoTitle,
    pass: near(rA.v, -6) && near(r1.v, 0) && near(r2.v, 0) && r2.undoTitle === r1b.undoTitle && near(u1.v, -6) && near(u2.v, 0) && u2.undoTitle === r00.undoTitle };
}

async function rowSync(p) {
  const r0 = await read(p);
  const r = await setViaField(p, '-3.5');
  const u = await undo(p);
  return { v: r.v, text: r.text, field: r.field, afterUndo: u.v, pass: near(r.v, -3.5) && r.text === '−3.5 dB' && near(u.v, r0.v) };
}

async function rowPending(p) {
  const r0 = await read(p);
  await p.fill(FIELD, '-3');
  await L.sleep(200);
  const pend = await p.evaluate(() => !!document.querySelector('[data-testid=arrangement-detail-clip-gain-pending]'));
  const rP = await read(p);
  const d = await drag(p, [{ dx: 20, shift: false }], { startX: thumbX(rP) });
  const w = d.w;
  const exp = -3 + (20 / w) * 84;
  const tol = 0.1 + 84 / w;
  const u1 = await undo(p);
  const u2 = await undo(p);
  return { w, pendingMarker: pend, fieldTyped: rP.field, faderAtPress: d.afterPress.v, v1: d.r1.v, expected: +exp.toFixed(3), tol: +tol.toFixed(3), undo1: u1.v, undo2: u2.v, undo2TitleBack: u2.undoTitle === r0.undoTitle,
    pass: Math.abs(d.r1.v - exp) <= tol + 1e-9 && near(u1.v, -3) && near(u2.v, 0) && u2.undoTitle === r0.undoTitle };
}

async function rowResetBtn(p) {
  await setViaField(p, '-6');
  await p.locator(RESET).focus();
  await p.keyboard.press('Enter');
  await L.sleep(300);
  const r = await read(p);
  const u = await undo(p);
  return { v: r.v, active: r.active, afterUndo: u.v, pass: near(r.v, 0) && r.active === 'arrangement-detail-clip-gain-input' && near(u.v, -6) };
}

async function rowDisabled(p, o) {
  const states = {};
  const chk = (r) => ({ disabled: r.disabled, fieldDisabled: r.fieldDisabled, title: r.title, fieldTitle: r.fieldTitle, desc: r.desc, fieldDesc: r.fieldDesc, sameId: r.describedby === r.fieldDescribedby, ok: r.disabled === true && r.fieldDisabled === true && !!r.title && r.title === r.fieldTitle && r.desc === r.fieldDesc && r.describedby === r.fieldDescribedby && !!r.describedby });
  await L.selectClip(p, o.stems.id);
  await L.selectClip(p, o.sfx.id, ['Control']);
  const rm = await read(p);
  states.multi = { ...chk(rm), selected: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane) };
  // try a press + drag on the disabled fader: must not change anything
  const before = rm.undoTitle;
  await p.mouse.move(rm.box.x + rm.box.w / 2, rm.box.y + rm.box.h / 2); await p.mouse.down(); await p.mouse.move(rm.box.x + rm.box.w / 2 + 20, rm.box.y + rm.box.h / 2, { steps: 5 }); await p.mouse.up(); await L.sleep(250);
  const rm2 = await read(p);
  states.multi.dragNoop = rm2.undoTitle === before;
  await L.blur(p);
  await p.keyboard.press('Escape');
  await L.sleep(300);
  let rn = await read(p);
  if ((await L.clipsDom(p)).some((c) => c.sel)) {
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
    const cb = null;
    const cx = pt.x, cy = pt.y;
    states.noneClick = { cx, cy, cb, target: await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.outerHTML.slice(0, 160) : null; }, [cx, cy]) };
    await p.mouse.click(cx, cy);
    await L.sleep(300);
    rn = await read(p);
  }
  states.none = { ...chk(rn), selected: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.lane) };
  await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  const vid = (await L.clipsDom(p)).find((c) => c.kind === 'video');
  await L.selectClip(p, vid.id);
  const rv = await read(p);
  states.video = { ...chk(rv), selected: (await L.clipsDom(p)).filter((c) => c.sel).map((c) => c.kind) };
  states.none.ok = states.none.ok && states.none.selected.length === 0 && states.none.title !== states.multi.title;
  states.pass = states.multi.ok && states.multi.dragNoop && states.none.ok && states.video.ok;
  return states;
}

const readIn = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); const b = e.getBoundingClientRect(); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); return { v: +e.value, min: +e.min, max: +e.max, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; }, sel);

// round-113 MC-DRAG recipe: press at 15 % from the far end, 5 moves of -4 px
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

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `ui-${VPN}-${RUN}`;
  const out = { utc: new Date().toISOString(), vp: VP, run: RUN, chromium: browser.version(), rows: {} };
  const save = () => { out.net = net; L.save(L.OUT, `${tag}.json`, out); };
  const o = await setup(browser, tag, net);
  const p = o.page;
  out.setup = { snap: o.snap, adds: o.adds, clips: o.clips, panelExpanded0: o.panelExpanded0 };
  const rows = [
    ['CG-PRESENT', () => rowPresent(p)],
    ['CG-LAYOUT', () => rowLayout(p, `layout-${VPN}-${RUN}.png`)],
    ['CG-NOJUMP', () => rowNoJump(p)],
    ['CG-DRAG', () => rowDrag(p, false)],
    ['CG-FINE', () => rowDrag(p, true)],
    ['CG-FINE-TOGGLE', () => rowToggle(p)],
    ['CG-KEY', () => rowKey(p)],
    ['CG-DBL', () => rowDbl(p)],
    ['CG-SYNC', () => rowSync(p)],
    ['CG-PENDING-DRAG', () => rowPending(p)],
    ['NB-RESET-BTN', () => rowResetBtn(p)],
    ['NB-TRACK-SHIFT', () => rowNbTrack(p)],
    ['NB-MASTER', () => rowNbMaster(p)],
    ['CG-DISABLED', () => rowDisabled(p, o)],
  ];
  const ONLY = process.env.ROWS ? process.env.ROWS.split(',') : null;
  for (const [id, fn] of rows) {
    if (ONLY && !ONLY.includes(id)) continue;
    try {
      const r = await fn();
      out.rows[id] = r;
      console.log(id, r.pass, JSON.stringify(r, (k, v) => (['trace', 'kids', 'vis', 'r'].includes(k) ? undefined : v)).slice(0, 600));
    } catch (e) {
      out.rows[id] = { error: String(e).slice(0, 500) };
      console.log(id, 'ERROR', String(e).slice(0, 300));
      await p.screenshot({ path: path.join(L.SHOTS, `err-${id}-${VPN}-${RUN}.png`) }).catch(() => {});
      await L.blur(p).catch(() => {});
    }
    if (id === 'CG-PENDING-DRAG' || id === 'CG-DRAG') await p.screenshot({ path: path.join(L.SHOTS, `${id}-${VPN}-${RUN}.png`) }).catch(() => {});
    save();
  }
  out.final = await read(p);
  await p.screenshot({ path: path.join(L.SHOTS, `ui-final-${VPN}-${RUN}.png`) });
  save();
  await o.ctx.close();
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
