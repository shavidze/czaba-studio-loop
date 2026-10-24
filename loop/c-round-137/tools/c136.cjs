// C round 136: MARKER-HEADER, MARKER-ADD, MARKER-EDIT, MARKER-MOVE, MARKER-NAV, MARKER-MENU, GEO-COUNT, REG-135, PX-NET.
// node c136.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from task §1.1 (never imported from strings.ts). Controls found by data-testid/role/position.
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g; const GU = /[«»]/g;
const gc = (s) => ((s || '').match(KA) || []).length; const gq = (s) => ((s || '').match(GU) || []).length;
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'SFX'];
const FROZEN = [
  ['demo-ready (load-time status)', /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/],
  ['clip-added: demo source title + track name (V-0.4/V-0.5 data)', /^“[^”]+” added to the .+ track at [\d:.]+\.$/],
  ['clip-added (library, V-0.5)', /^„[^“]+“ დაემატა .+ ხაზზე [\d:.]+-ზე\.$/],
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const [n, re] of FROZEN) { if (re.test(t)) { used.push(n); t = ''; } }
  for (const n of NAMES) if (t.includes(n)) { used.push(`track name ${n}`); t = t.split(n).join(''); }
  return { raw: gc(s), rawQ: gq(s), net: gc(t), netQ: gq(t), subtracted: used, residue: gc(t) || gq(t) ? t.slice(0, 200) : '' };
}
const HINT = 'Click: jump here · Double-click: play from here · Drag or ← →: move · F2: rename · Delete: delete · Right-click or Shift+F10: menu';
const E = {
  MK1: 'Rename (F2)', MK2: 'Play from here', MK3: 'Delete (Delete)', MK4: (n) => `Marker “${n}”`, MK5: HINT,
  MK6: 'The marker is at the start of the timeline.', MK7: (n) => `A marker already exists at this time: “${n}”`,
  MK8: 'No more markers after the playhead', MK9: 'No more markers before the playhead', MK10: 'Marker not added',
  MK11: (n, t) => `Marker “${n}” added at ${t}.`, MK12: (n) => `The name is empty — “${n}” is kept`, MK13: (n) => `Marker name: “${n}”.`,
  MK14: (n) => `Marker “${n}” deleted.`, MK15: (n, t) => `Marker “${n}” moved to ${t}.`,
  MK16: 'Add a marker at the playhead or at the start of the time selection (M)', MK17: 'Jump to the previous marker (Ctrl+←)', MK18: 'Jump to the next marker (Ctrl+→)',
  MK19: 'Marker name', MK20: (n, t) => `Marker “${n}” — ${t}`, MK21: (n, t) => `“${n}” — ${t}`,
  ADD_ARIA: 'Add marker (M)', PREV_ARIA: 'Previous marker (Ctrl+←)', NEXT_ARIA: 'Next marker (Ctrl+→)',
  REG135: 'Follow: the view follows the playback position',
};
const fmt = (t) => { const m = Math.floor(t / 60); const s = t - m * 60; return `${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; };
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [], checks: {}, fails: [] };
const OUTF = path.join(L.OUT, `c136-${W}-${TAG}-${ONLY}.json`);
const validNet = () => net.filter((n) => !res.invalidRuns.some((r) => n.label === r.sessionLabel));
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(validNet()), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-137/shots/${f}`; }
async function obsInstall() {
  await P.evaluate(() => {
    const out = document.querySelector('[data-testid=arrangement-status]');
    const Wd = { recs: [], t0: performance.now(), last: out.textContent };
    window.__so = Wd;
    Wd.mo = new MutationObserver(() => { const t = out.textContent; if (t !== Wd.last) { Wd.last = t; Wd.recs.push({ t: Math.round(performance.now() - Wd.t0), text: t.trim() }); } });
    Wd.mo.observe(out, { childList: true, subtree: true, characterData: true });
  });
}
const obsTake = () => P.evaluate(() => { const r = window.__so.recs.slice(); window.__so.recs = []; return r; });
const surf = () => P.evaluate(() => {
  const q = (s) => document.querySelector(`[data-testid=${s}]`);
  const info = (e) => (e ? { aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), keys: e.getAttribute('aria-keyshortcuts'), text: e.textContent.trim() } : null);
  const flags = [...document.querySelectorAll('[data-testid=arrangement-marker]')].map((e) => ({ aria: e.getAttribute('aria-label'), title: e.getAttribute('title'), text: e.textContent.trim(), left: parseFloat(e.style.left), current: e.getAttribute('aria-current'), expanded: e.getAttribute('aria-expanded'), focused: document.activeElement === e, box: e.getBoundingClientRect().toJSON() }));
  const input = q('arrangement-marker-name-input');
  const menu = document.querySelector('[role=menu]');
  const menuInfo = menu ? { aria: menu.getAttribute('aria-label'), items: [...menu.querySelectorAll('[role=menuitem]')].map((i) => i.textContent.trim()), box: menu.getBoundingClientRect().toJSON(), itemBoxes: [...menu.querySelectorAll('[role=menuitem]')].map((i) => ({ sw: i.scrollWidth, cw: i.clientWidth, r: i.getBoundingClientRect().right })), vw: innerWidth, vh: innerHeight } : null;
  const ae = document.activeElement;
  return {
    add: info(q('arrangement-marker-add')), prev: info(q('arrangement-marker-prev')), next: info(q('arrangement-marker-next')),
    flags, input: input ? { aria: input.getAttribute('aria-label'), value: input.value, focused: ae === input } : null, menu: menuInfo,
    status: (q('arrangement-status').textContent || '').trim(), pos: Number(q('arrangement-playhead-handle').getAttribute('aria-valuenow')),
    active: ae ? { testid: ae.getAttribute('data-testid'), aria: ae.getAttribute('aria-label') } : null,
    playing: [...document.querySelectorAll('button')].some((b) => /^■|Stop|⏸|Pause/.test(b.textContent.trim())),
    playBtn: ([...document.querySelectorAll('button')].find((b) => /Play|Stop|Pause/.test(b.textContent)) || {}).textContent,
    row: (() => { const r = q('arrangement-marker-row'); return r ? { box: r.getBoundingClientRect().toJSON(), sw: r.scrollWidth, cw: r.clientWidth } : null; })(),
  };
});
function geoOf(s) {
  const texts = [s.add.aria, s.add.title, s.prev.aria, s.prev.title, s.next.aria, s.next.title, ...s.flags.flatMap((f) => [f.aria, f.title]), s.input && s.input.aria, s.menu && s.menu.aria, ...(s.menu ? s.menu.items : [])].filter(Boolean);
  const userNames = s.flags.map((f) => f.text);
  const c = (arr) => arr.reduce((a, x) => a + gc(x), 0); const cq = (arr) => arr.reduce((a, x) => a + gq(x), 0);
  const st = subtract(s.status);
  return { surfGeo: c(texts), surfQ: cq(texts), surfResidue: texts.filter((x) => gc(x) || gq(x)), status: st, net: c(texts) + cq(texts) + st.net + st.netQ, userNames };
}
function chk(row, id, got, exp) { const ok = got === exp; if (!ok) res.fails.push({ row, id, got, exp }); console.log(row, id, ok ? 'OK ' : 'XX ', JSON.stringify(got), ok ? '' : ' expected ' + JSON.stringify(exp)); return ok; }
function chkT(row, id, cond, info) { if (!cond) res.fails.push({ row, id, got: info }); console.log(row, id, cond ? 'OK ' : 'XX ', JSON.stringify(info)); return cond; }
async function step(row, id, extra = {}) {
  const s = await surf(); const ob = await obsTake();
  const r = { id, s, observer: ob, geo: geoOf(s), obsGeo: ob.map((o) => ({ text: o.text, ...subtract(o.text) })), ...extra };
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  if (r.geo.net || r.obsGeo.some((o) => o.net || o.netQ)) console.log('   GEO', row, id, r.geo.net, JSON.stringify(r.geo.surfResidue), JSON.stringify(r.geo.status), JSON.stringify(r.obsGeo.filter((o) => o.net || o.netQ)));
  return r;
}
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
const flags = async () => (await surf()).flags;
const flagLoc = (i) => P.locator('[data-testid=arrangement-marker]').nth(i);
async function flagIdxAt(t) { const f = await flags(); const g = await L.geo(P); return f.findIndex((x) => Math.abs(x.left / g.pps - t) < 0.0005); }
async function seekExact(t) {
  await L.blur(P); await P.keyboard.press('Home'); await sleep(200);
  if (t > 0) { await P.focus('[data-testid=arrangement-playhead-handle]'); for (let i = 0; i < Math.round(t * 10); i++) await P.keyboard.press('ArrowRight'); await sleep(250); }
  await L.blur(P); return L.posNow(P);
}
async function clickBtn(txt) { await P.locator('button', { hasText: txt }).first().click(); await sleep(400); await L.blur(P); }
async function addNamed(t, name) {
  await seekExact(t); await press('m'); await sleep(200);
  await P.keyboard.press('Control+a'); await P.keyboard.type(name); await P.keyboard.press('Enter'); await sleep(400); await L.blur(P);
}
let B; const getB = async () => (B = B || await L.launch());
async function open(label) {
  for (let i = 0; i < 3; i++) {
    let lbl;
    try {
      lbl = `c136-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      const O = await L.openStudio(await getB(), X.VPS[W], lbl, net);
      P = O.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
      const snap = await L.setSnapOff(P);
      res.checks[`${label}-pre`] = { snap, flags: (await flags()).length };
      return O;
    } catch (e) { res.invalidRuns.push({ label, sessionLabel: lbl, attempt: i, reason: 'ENV-FIRST-LOAD', err: String(e).slice(0, 300) }); save(); }
  }
  throw new Error('open failed 3x ' + label);
}
const clipsKey = async () => (await L.clipsDom(P)).map((c) => `${c.lane}@${c.start.toFixed(2)}`).sort().join(' ');
const detRange = () => P.evaluate(() => { const s = document.querySelector('[data-testid=arrangement-detail-start]'), e = document.querySelector('[data-testid=arrangement-detail-end]'); return { start: s && s.value, end: e && e.value }; });

async function header() {
  const R = 'MARKER-HEADER'; await open('header');
  const r = await step(R, 'fresh'); const s = r.s;
  chk(R, 'add title', s.add.title, E.MK16); chk(R, 'add aria', s.add.aria, E.ADD_ARIA); chk(R, 'add keys', s.add.keys, 'M');
  chk(R, 'prev title', s.prev.title, E.MK17); chk(R, 'prev aria', s.prev.aria, E.PREV_ARIA); chk(R, 'prev keys', s.prev.keys, 'Control+ArrowLeft');
  chk(R, 'next title', s.next.title, E.MK18); chk(R, 'next aria', s.next.aria, E.NEXT_ARIA); chk(R, 'next keys', s.next.keys, 'Control+ArrowRight');
  r.shot = await shot('hdr'); save();
  // REG-135 (1440 short; also read at 1280)
  const fol = await P.evaluate(() => document.querySelector('[data-testid=arrangement-follow]').title);
  res.checks.reg135 = fol; chk('REG-135', 'follow title', fol, E.REG135);
}

async function addRow() {
  const R = 'MARKER-ADD'; await open('add');
  const a1 = await L.addAt(P, 'demo-stem-pulse', 'stems', 0); await P.keyboard.press('Escape'); await sleep(200); await L.blur(P);
  res.checks.addSetup = a1;
  // confirm no range
  const rg0 = await detRange(); const strip0 = await P.evaluate(() => document.querySelector('[data-testid=arrangement-loop-strip]').textContent.trim());
  await step(R, 'pre', { range: rg0, strip: strip0 });
  // (a)
  const p3 = await seekExact(3); chk(R, 'a pos', p3, 3);
  await P.click('[data-testid=arrangement-marker-add]'); await sleep(400);
  let r = await step(R, 'a-field'); chk(R, 'a field aria', r.s.input && r.s.input.aria, E.MK19); chkT(R, 'a field focused', r.s.input && r.s.input.focused, r.s.input);
  r.shot = await shot('add-a-field');
  await P.keyboard.press('Control+a'); await P.keyboard.type('Intro'); await P.keyboard.press('Enter'); await sleep(450);
  r = await step(R, 'a-enter'); chk(R, 'a status', r.s.status, E.MK11('Intro', '00:03.000'));
  chk(R, 'a flags n', r.s.flags.length, 1);
  const f = r.s.flags[0] || {}; chk(R, 'a flag aria', f.aria, E.MK20('Intro', '00:03.000')); chk(R, 'a flag title', f.title, `${E.MK21('Intro', '00:03.000')}\n${E.MK5}`);
  chk(R, 'a flag text', f.text, 'Intro'); chkT(R, 'a flag at 3s', Math.abs(f.left / (await L.geo(P)).pps - 3) < 0.001, f.left);
  chkT(R, 'a obs has MK11', r.observer.some((o) => o.text === E.MK11('Intro', '00:03.000')), r.observer);
  r.shot = await shot('add-a'); save();
  // (b)
  const pb = await L.posNow(P); chk(R, 'b pos still 3', pb, 3);
  await press('m');
  r = await step(R, 'b-dup'); chk(R, 'b status', r.s.status, E.MK7('Intro')); chk(R, 'b flags n', r.s.flags.length, 1); chkT(R, 'b no field', !r.s.input, r.s.input);
  // (c)
  const p5 = await seekExact(5); chk(R, 'c pos', p5, 5);
  await press('m'); await sleep(200);
  const fc = await surf(); chkT(R, 'c field open', !!fc.input, fc.input);
  await P.keyboard.press('Escape'); await sleep(400);
  r = await step(R, 'c-esc'); chk(R, 'c status', r.s.status, E.MK10); chk(R, 'c flags n', r.s.flags.length, 1);
  // (d) range at 8 s on the stems clip
  const id = (await L.clipsDom(P)).find((c) => c.lane === 'stems').id;
  await X.rangeDrag(P, id, 8, 10); await L.blur(P);
  const rg = await detRange();
  const rs = /:/.test(rg.start || '') ? X.parseT(rg.start) : parseFloat(rg.start);
  const posD = await L.posNow(P);
  await press('m'); await sleep(200);
  const fd = await surf(); const defName = fd.input && fd.input.value;
  await P.keyboard.press('Enter'); await sleep(450);
  r = await step(R, 'd-range-add', { range: rg, posBefore: posD, defaultName: defName });
  chkT(R, 'd range start ~8', Math.abs(rs - 8) < 0.06, rg);
  const g = await L.geo(P);
  const nf = r.s.flags.find((x) => x.text !== 'Intro') || {};
  const ft = nf.left / g.pps;
  chkT(R, 'd flag at range start', Math.abs(ft - rs) < 0.0015, { ft, rs, posD });
  chkT(R, 'd default name Marker N', /^Marker \d+$/.test(nf.text || ''), nf.text);
  chk(R, 'd status', r.s.status, E.MK11(nf.text, fmt(Math.round(ft * 1000) / 1000)));
  chk(R, 'd flag aria', nf.aria, E.MK20(nf.text, fmt(Math.round(ft * 1000) / 1000)));
  r.shot = await shot('add-d'); save();
  // undo each
  const c0 = await clipsKey();
  await clickBtn('Undo'); let fl = await flags();
  chkT(R, 'undo removes d', fl.length === 1 && fl[0].text === 'Intro', fl.map((x) => x.text));
  await clickBtn('Undo'); fl = await flags();
  chkT(R, 'undo removes a', fl.length === 0, fl.map((x) => x.text));
  const c1 = await clipsKey(); chk(R, 'undo kept clips', c1, c0);
  r = await step(R, 'after-undo', { clips: c1 }); save();
}

async function editRow() {
  const R = 'MARKER-EDIT'; await open('edit');
  await addNamed(3, 'Intro'); await addNamed(6, 'Outro');
  let r = await step(R, 'setup'); chk(R, 'setup flags', r.s.flags.map((x) => x.text).join(','), 'Intro,Outro');
  const fi = () => flagLoc(0);
  await fi().focus(); await P.keyboard.press('F2'); await sleep(300);
  let s = await surf(); chkT(R, 'F2 field', !!s.input && s.input.aria === E.MK19, s.input);
  await P.keyboard.press('Control+a'); await P.keyboard.type('Drop'); await P.keyboard.press('Enter'); await sleep(450);
  r = await step(R, 'rename'); chk(R, 'rename status', r.s.status, E.MK13('Drop')); chk(R, 'rename flag', r.s.flags[0].text, 'Drop'); chk(R, 'rename aria', r.s.flags[0].aria, E.MK20('Drop', '00:03.000'));
  await clickBtn('Undo'); chk(R, 'undo rename', (await flags())[0].text, 'Intro');
  await clickBtn('Redo'); chk(R, 'redo rename', (await flags())[0].text, 'Drop'); await obsTake();
  await fi().focus(); await P.keyboard.press('F2'); await sleep(300);
  await P.keyboard.press('Control+a'); await P.keyboard.press('Backspace'); await P.keyboard.press('Enter'); await sleep(450);
  r = await step(R, 'rename-empty'); chk(R, 'empty status', r.s.status, E.MK12('Drop')); chk(R, 'empty name kept', r.s.flags[0] && r.s.flags[0].text, 'Drop');
  r.inputAfter = r.s.input; r.shot = await shot('edit-empty');
  await P.keyboard.press('Escape'); await sleep(300);
  s = await surf(); res.checks[`${W}-edit-after-empty-esc`] = { input: s.input, flags: s.flags.map((x) => x.text), status: s.status };
  await fi().focus(); await sleep(100); await P.keyboard.press('Delete'); await sleep(450);
  r = await step(R, 'delete'); chk(R, 'delete status', r.s.status, E.MK14('Drop')); chk(R, 'delete flags', r.s.flags.map((x) => x.text).join(','), 'Outro');
  chkT(R, 'delete focus to neighbour or +', (r.s.active && (r.s.active.testid === 'arrangement-marker' && r.s.active.aria === E.MK20('Outro', '00:06.000'))) || (r.s.active && r.s.active.testid === 'arrangement-marker-add'), r.s.active);
  r.shot = await shot('edit-delete');
  await clickBtn('Undo'); chk(R, 'undo delete', (await flags()).map((x) => x.text).join(','), 'Drop,Outro');
  r = await step(R, 'after-undo'); save();
}

async function moveRow() {
  const R = 'MARKER-MOVE'; await open('move');
  await addNamed(1, 'Alpha'); await addNamed(3, 'Beta');
  let r = await step(R, 'setup'); chk(R, 'setup', r.s.flags.map((x) => x.text).join(','), 'Alpha,Beta');
  await flagLoc(0).focus(); await P.keyboard.press('ArrowRight'); await sleep(450);
  r = await step(R, 'arrow-right'); chk(R, 'right status', r.s.status, E.MK15('Alpha', '00:01.100')); chk(R, 'right aria', r.s.flags[0].aria, E.MK20('Alpha', '00:01.100'));
  // (1) direct drag onto Beta (one pointer move straight to 3.0 s)
  const g = await L.geo(P); const bx = await flagLoc(0).boundingBox();
  const x0 = bx.x + 3, y = bx.y + bx.height / 2, x1 = x0 + (3 - 1.1) * g.pps;
  await P.mouse.move(x0, y); await P.mouse.down(); await P.mouse.move(x1, y, { steps: 1 }); await sleep(150); await P.mouse.up(); await sleep(500);
  r = await step(R, 'drag-direct-onto-beta', { x0, x1, pps: g.pps });
  const alpha = r.s.flags.find((x) => x.text === 'Alpha'); chk(R, 'direct drag: alpha back at 1.1', alpha && alpha.aria, E.MK20('Alpha', '00:01.100'));
  chk(R, 'flags still 2', r.s.flags.length, 2); r.dragStatus = r.s.status; r.shot = await shot('move-drag-direct'); save(); await L.blur(P);
  // (2) stepped drag across: keeps the last valid time (MV5 design)
  const bx2 = await flagLoc(0).boundingBox(); const x2 = bx2.x + 3;
  await P.mouse.move(x2, y); await P.mouse.down(); await P.mouse.move(x2 + 10, y, { steps: 2 }); await P.mouse.move(x2 + (3 - 1.1) * g.pps, y, { steps: 8 }); await sleep(150); await P.mouse.up(); await sleep(500);
  r = await step(R, 'drag-stepped-onto-beta'); r.alphaAria = (r.s.flags.find((x) => x.text === 'Alpha') || {}).aria; r.dragStatus = r.s.status;
  console.log(R, 'stepped drag ->', r.alphaAria, '|', r.s.status); save();
  await clickBtn('Undo'); r = await step(R, 'undo-stepped'); chk(R, 'undo stepped drag', (r.s.flags.find((x) => x.text === 'Alpha') || {}).aria, E.MK20('Alpha', '00:01.100'));
  // (3) arrow onto Beta -> MK7, held -> announced once
  await flagLoc(0).focus(); for (let i = 0; i < 18; i++) { await P.keyboard.press('ArrowRight'); await sleep(40); } await sleep(300);
  r = await step(R, 'to-2.9'); chk(R, 'alpha at 2.9', r.s.flags[0].aria, E.MK20('Alpha', '00:02.900'));
  await flagLoc(0).focus(); await obsTake();
  await P.keyboard.down('ArrowRight'); for (let i = 0; i < 12; i++) { await sleep(40); await P.keyboard.down('ArrowRight'); } await P.keyboard.up('ArrowRight'); await sleep(400);
  r = await step(R, 'arrow-conflict-held'); chk(R, 'conflict status', r.s.status, E.MK7('Beta')); chk(R, 'MK7 announced once', r.observer.filter((o) => o.text === E.MK7('Beta')).length, 1);
  chk(R, 'alpha stays 2.9', (r.s.flags.find((x) => x.text === 'Alpha') || {}).aria, E.MK20('Alpha', '00:02.900'));
  // (4) ArrowLeft to 0, then hold
  await flagLoc(0).focus(); for (let i = 0; i < 29; i++) { await P.keyboard.press('ArrowLeft'); await sleep(40); } await sleep(300);
  r = await step(R, 'left-to-0'); chk(R, 'at 0 aria', r.s.flags[0].aria, E.MK20('Alpha', '00:00.000')); chk(R, 'at 0 status', r.s.status, E.MK15('Alpha', '00:00.000'));
  await obsTake();
  await P.keyboard.down('ArrowLeft'); for (let i = 0; i < 15; i++) { await sleep(40); await P.keyboard.down('ArrowLeft'); } await P.keyboard.up('ArrowLeft'); await sleep(400);
  r = await step(R, 'hold-at-0');
  chk(R, 'hold status', r.s.status, E.MK6); chk(R, 'MK6 announced once (observer)', r.observer.filter((o) => o.text === E.MK6).length, 1);
  chk(R, 'still at 0', r.s.flags[0].aria, E.MK20('Alpha', '00:00.000'));
  r.shot = await shot('move-at0'); save();
}

async function navRow() {
  const R = 'MARKER-NAV'; await open('nav');
  await addNamed(3, 'N1'); await addNamed(6, 'N2'); await L.blur(P);
  await step(R, 'setup');
  await seekExact(1); await obsTake();
  await P.click('[data-testid=arrangement-marker-prev]'); await sleep(400); await L.blur(P);
  let r = await step(R, 'prev-btn-from-1s'); r.note = 'designed: previous before the first flag goes to 0 (timeline start), adjacentMarkerTarget'; chk(R, 'prev from 1 s -> 0', r.s.pos, 0);
  await obsTake(); await P.click('[data-testid=arrangement-marker-prev]'); await sleep(400); await L.blur(P);
  r = await step(R, 'prev-btn-at-0'); chk(R, 'prev btn status', r.s.status, E.MK9); chk(R, 'prev btn pos', r.s.pos, 0);
  await seekExact(1.5); await press('Control+ArrowLeft'); chk(R, 'key prev 1.5 -> 0', await L.posNow(P), 0); await obsTake(); await press('Control+ArrowLeft');
  r = await step(R, 'prev-key-at-0'); chk(R, 'prev key status', r.s.status, E.MK9); chk(R, 'prev key pos', r.s.pos, 0);
  await seekExact(8); await P.click('[data-testid=arrangement-marker-next]'); await sleep(400); await L.blur(P);
  r = await step(R, 'next-btn-after-last'); chk(R, 'next btn status', r.s.status, E.MK8); chk(R, 'next btn pos', r.s.pos, 8);
  await seekExact(8.5); await press('Control+ArrowRight');
  r = await step(R, 'next-key-after-last'); chk(R, 'next key status', r.s.status, E.MK8); chk(R, 'next key pos', r.s.pos, 8.5);
  r.shot = await shot('nav-edge');
  await seekExact(4.5); await obsTake();
  await P.click('[data-testid=arrangement-marker-prev]'); await sleep(400); await L.blur(P);
  r = await step(R, 'prev-between'); chk(R, 'between prev pos', r.s.pos, 3); chkT(R, 'between prev no edge status', !r.observer.some((o) => /No more markers/.test(o.text)), { st: r.s.status, ob: r.observer });
  await P.click('[data-testid=arrangement-marker-next]'); await sleep(400); await L.blur(P);
  r = await step(R, 'next-between'); chk(R, 'between next pos', r.s.pos, 6); chkT(R, 'between next no edge status', !r.observer.some((o) => /No more markers/.test(o.text)), { st: r.s.status, ob: r.observer });
  await press('Control+ArrowLeft');
  r = await step(R, 'key-prev-between'); chk(R, 'key between prev pos', r.s.pos, 3); chkT(R, 'key between no edge', !r.observer.some((o) => /No more markers/.test(o.text)), r.observer);
  await press('Control+ArrowRight');
  r = await step(R, 'key-next-between'); chk(R, 'key between next pos', r.s.pos, 6); chkT(R, 'key between next no edge', !r.observer.some((o) => /No more markers/.test(o.text)), r.observer);
  save();
}

async function menuRow() {
  const R = 'MARKER-MENU'; await open('menu');
  res.checks[`${W}-menu-clip`] = await L.addAt(P, 'demo-stem-pulse', 'stems', 0); await P.keyboard.press('Escape'); await sleep(200); await L.blur(P);
  await addNamed(2, 'M1'); await addNamed(4, 'M2'); await addNamed(6, 'M3'); await addNamed(8, 'M4'); await L.blur(P);
  await step(R, 'setup');
  const items = [E.MK1, E.MK2, E.MK3].join('|');
  await flagLoc(0).click({ button: 'right' }); await sleep(400);
  let r = await step(R, 'rightclick'); chk(R, 'rc menu aria', r.s.menu && r.s.menu.aria, E.MK4('M1')); chk(R, 'rc items', r.s.menu && r.s.menu.items.join('|'), items);
  r.shot = await shot('menu-rc'); res.checks[`${W}-menuBox-rc`] = r.s.menu;
  await P.keyboard.press('Escape'); await sleep(300);
  r = await step(R, 'esc'); chkT(R, 'esc closes', !r.s.menu, r.s.menu);
  await flagLoc(1).focus(); await P.keyboard.press('Shift+F10'); await sleep(400);
  r = await step(R, 'shiftf10'); chk(R, 'sf10 menu aria', r.s.menu && r.s.menu.aria, E.MK4('M2')); chk(R, 'sf10 items', r.s.menu && r.s.menu.items.join('|'), items);
  r.shot = await shot('menu-sf10'); res.checks[`${W}-menuBox-sf10`] = r.s.menu;
  // Rename on M2
  await P.getByRole('menuitem', { name: E.MK1 }).click(); await sleep(400);
  r = await step(R, 'item-rename'); chkT(R, 'rename opens field', !!r.s.input && r.s.input.aria === E.MK19 && r.s.input.value === 'M2', r.s.input);
  await P.keyboard.press('Escape'); await sleep(300); await L.blur(P);
  // Play from here on M3 (fresh flag)
  await seekExact(0);
  await flagLoc(2).click({ button: 'right' }); await sleep(400);
  await P.getByRole('menuitem', { name: E.MK2 }).click(); await sleep(150);
  const pos0 = await L.posNow(P); await sleep(900); const pos1 = await L.posNow(P);
  r = await step(R, 'item-play', { pos0, pos1 }); chkT(R, 'play starts at flag 6 s', pos0 >= 5.99 && pos0 < 6.4 && pos1 > pos0, { pos0, pos1, playBtn: r.s.playBtn });
  r.shot = await shot('menu-play');
  await L.blur(P); await P.keyboard.press('Space'); await sleep(400);
  // Delete on M4 (fresh flag)
  await flagLoc(3).click({ button: 'right' }); await sleep(400);
  await P.getByRole('menuitem', { name: E.MK3 }).click(); await sleep(450);
  r = await step(R, 'item-delete'); chk(R, 'delete status', r.s.status, E.MK14('M4')); chk(R, 'delete flags', r.s.flags.map((x) => x.text).join(','), 'M1,M2,M3');
  save();
}

(async () => {
  const rows = { header, add: addRow, edit: editRow, move: moveRow, nav: navRow, menu: menuRow };
  for (const [k, fn] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== k) continue;
    try { await fn(); } catch (e) { res.fails.push({ row: k, id: 'exception', got: String(e.stack || e).slice(0, 600) }); console.log('EXC', k, e); }
    save();
  }
  res.endUtc = new Date().toISOString(); save();
  console.log('FAILS', res.fails.length, JSON.stringify(res.fails, null, 1).slice(0, 3000));
  console.log('NET', JSON.stringify(X.netOk(validNet())));
  if (B) await B.close();
})();
