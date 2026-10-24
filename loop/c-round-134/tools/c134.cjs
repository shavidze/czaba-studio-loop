// C round 134: GRID-SEC, GRID-MUSICAL, GRID-TRIPLET, GRID-HIDDEN, SNAP, MENU, GEO-COUNT, REG-133.
// node c134.cjs <1440|1280> <tag> [row]
// Expected strings are hand-written from task §1.1/§5 (never imported from strings.ts).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const ONLY = process.argv[4] || 'all';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const H = require('./h3.cjs');
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const NAMES = ['მუსიკა', 'სტემები', 'ვიდეო', 'SFX'];
const FROZEN = [
  /^დემო კოლექცია მზადაა\. აირჩიე ხაზი და დაამატე ხმა \(Enter ან ＋ დამატება\)\.$/,
  /^(კლიპის გადატანა|გადატანა \(\d+\)): start \d\d:\d\d\.\d{3}, length \d\d:\d\d\.\d{3}, source offset \d\d:\d\d\.\d{3}\.$/,
  /^(Undo: |Redo: )?(კლიპის გადატანა|გადატანა \(\d+\))(: (ცვლილება არ მოხდა — ისტორია არ შეიცვალა\.|\d+ კლიპი გადავიდა [\d:.]+-ით (მარჯვნივ|მარცხნივ)\.))?$/,
];
function subtract(s) {
  let t = s || ''; const used = [];
  for (const re of FROZEN) { const m = t.match(re); if (m) { used.push(m[0]); t = t.replace(re, ''); } }
  for (const n of NAMES) if (t.includes(n)) { used.push(n); t = t.split(n).join(''); }
  return { raw: gc(s), net: gc(t), subtracted: used };
}
const KEYS = ' · 1 — narrower, 2 — wider';
const HIDDEN = ' — lines are hidden at this zoom; Snap still works. Zoom in.';
const E = {
  secOptions: ['10 s', '5 s', '2 s', '1 s', '0.5 s', '0.25 s', '0.1 s'],
  aria: 'Grid division',
  title1: `Grid 1 s${KEYS}`,
  st: (l, on = true) => `Grid: ${l} (Snap ${on ? 'on' : 'off'})`,
  stM: (l, step, bpm, on = true) => `Grid: ${l} · ${step} s at ${bpm} BPM (Snap ${on ? 'on' : 'off'})`,
  narrowest: (l) => `The grid is already at its narrowest — ${l} (1)`,
  widest: (l) => `The grid is already at its widest — ${l} (2)`,
  bars: (b) => `Bars · ${b} BPM`, trips: (b) => `Triplets · ${b} BPM`,
  straight: ['1 bar', '1/2', '1/4', '1/8', '1/16', '1/32'],
  cleared: (l) => `Tempo cleared — the bars ruler is hidden. Audio is unchanged. Grid back to seconds: ${l}.`,
  needTempo: 'Triplets need a tempo — enter a BPM first (3)',
  notOnBar: '1 bar has no triplets — choose 1/2 or narrower (3)',
  barsOnly: 'Triplets work only on the bars grid — choose 1/2 … 1/32 (3)',
  tVis: (l) => `Grid ${l}${KEYS}`, tHid: (l) => `Grid ${l}${HIDDEN}${KEYS}`,
  snapOff: 'Snap off — free movement (G)', snapOnSt: (l) => `Snap on — grid ${l} (G)`, snapOnTitle: 'Snap on — clips land on the grid (G)',
  tripItem: 'Triplets (3)', snapItem: 'Snap (G)',
  reg133: 'To group tracks, select them first — Ctrl+click or Shift+click a track name.',
};
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {}, invalidRuns: [] };
const OUTF = path.join(L.OUT, `c134-${W}-${TAG}-${ONLY}.json`);
const validNet = () => net.filter((n) => !res.invalidRuns.some((r) => n.label === r.sessionLabel));
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(validNet()), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-134/shots/${f}`; }
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
const grid = () => P.evaluate(() => {
  const g = document.querySelector('[data-testid=arrangement-grid-control]');
  const s = document.querySelector('[data-testid=arrangement-grid-division]');
  const sn = document.querySelector('[data-testid=arrangement-snap-toggle]');
  const pps = +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1];
  const lanes = [...document.querySelectorAll('[data-track-id] [data-grid-seconds]')].map((e) => { const m = /transparent 1px ([\d.]+)px/.exec(e.getAttribute('style') || ''); return { lines: e.dataset.gridLines, sec: e.dataset.gridSeconds, px: m ? +m[1] : null }; });
  const menu = document.querySelector('[data-testid=arrangement-grid-menu]');
  return {
    ds: { ...g.dataset }, pps,
    select: { value: s.value, aria: s.getAttribute('aria-label'), title: s.title, w: +s.getBoundingClientRect().width.toFixed(1), options: [...s.options].map((o) => `${o.value}=${o.textContent.trim()}`), groups: [...s.querySelectorAll('optgroup')].map((o) => o.label), selectedText: s.options[s.selectedIndex] ? s.options[s.selectedIndex].textContent.trim() : null },
    snap: { title: sn.title, pressed: sn.getAttribute('aria-pressed'), text: sn.textContent.trim() },
    header: { sw: g.scrollWidth, cw: g.clientWidth },
    lanes,
    menu: menu ? { aria: menu.getAttribute('aria-label'), items: [...menu.querySelectorAll('[role^=menuitem]')].map((i) => ({ t: [...i.childNodes].filter((n) => !(n.nodeType === 1 && n.getAttribute('aria-hidden') === 'true')).map((n) => n.textContent).join('').trim(), glyph: (i.querySelector('[aria-hidden=true]') || {}).textContent || '', role: i.getAttribute('role'), checked: i.getAttribute('aria-checked') })), groups: [...menu.querySelectorAll('[role=group],[role=separator]')].map((x) => x.getAttribute('aria-label') || x.getAttribute('role')) } : null,
    focus: document.activeElement ? `${document.activeElement.tagName}:${(document.activeElement.dataset || {}).testid || ''}:${(document.activeElement.textContent || '').trim().slice(0, 30)}` : null,
    status: ((document.querySelector('[data-testid=arrangement-status]') || {}).textContent || '').trim(),
  };
});
function geoOf(g) {
  const places = { status: subtract(g.status), aria: gc(g.select.aria), title: gc(g.select.title), options: g.select.options.reduce((a, o) => a + gc(o), 0), groups: g.select.groups.reduce((a, o) => a + gc(o), 0), snapTitle: gc(g.snap.title), menu: g.menu ? gc(g.menu.aria) + g.menu.items.reduce((a, i) => a + gc(i.t), 0) : 0 };
  places.net = places.status.net + places.aria + places.title + places.options + places.groups + places.snapTitle + places.menu;
  return places;
}
const linesOk = (g) => g.lanes.filter((l) => l.lines === 'visible' && l.px !== null).every((l) => Math.abs(l.px - g.pps * +l.sec) < 0.02);
async function step(row, id, expected, extra = {}) {
  const g = await grid(); const ob = await obsTake();
  const r = { id, expected, status: g.status, exact: expected === null ? null : g.status === expected, grid: g, observer: ob, geo: geoOf(g), obsGeo: ob.map((o) => ({ text: o.text, ...subtract(o.text) })), linesOk: linesOk(g), ...extra };
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  console.log(row, id, r.exact === null ? 'INFO' : r.exact ? 'OK ' : 'XX ', JSON.stringify(g.status), r.exact === false ? ' expected ' + JSON.stringify(expected) : '', '| div', g.ds.gridDivision, g.ds.gridSeconds, g.ds.gridLines, '| geoNet', r.geo.net, '| lines', r.linesOk);
  return r;
}
const press = async (k) => { await L.blur(P); await P.keyboard.press(k); await sleep(400); };
const choose = async (v) => { await P.selectOption('[data-testid=arrangement-grid-division]', v); await sleep(350); await L.blur(P); };
async function bpm(v) { const t = P.locator('[data-testid=arrangement-tempo-input]'); await t.click(); await t.fill(v); await P.keyboard.press('Enter'); await sleep(500); await L.blur(P); }
const clips = async () => (await L.clipsDom(P)).filter((c) => c.kind !== 'video').map((c) => `${c.lane}@${c.start}+${c.wdur}`).sort().join(' ');
async function laneRight() {
  const loc = P.locator('[data-track-id=music]').first(); await loc.scrollIntoViewIfNeeded(); const lb = await loc.boundingBox();
  const vw = P.viewportSize().width; const x = Math.min(lb.x + lb.width * 0.7, vw - 120); const y = lb.y + lb.height * 0.5;
  await P.mouse.click(x, y, { button: 'right' }); await sleep(400);
  const open = await P.evaluate(() => !!document.querySelector('[data-testid=arrangement-grid-menu]'));
  if (!open) throw new Error(`grid menu did not open at ${x},${y}`);
  return { x, y };
}
let B; const getB = async () => (B = B || await L.launch());
async function open(label) {
  for (let i = 0; i < 3; i++) {
    try {
      var lbl = `c134-${W}-${TAG}-${label}${i ? '-retry' + i : ''}`;
      const o = await L.openStudio(await getB(), X.VPS[W], lbl, net);
      P = o.page; await P.mouse.move(2, 2); await sleep(300); await obsInstall(); await obsTake();
      return o;
    } catch (e) { res.invalidRuns.push({ label, sessionLabel: lbl, attempt: i, reason: 'ENV-FIRST-LOAD', err: String(e).slice(0, 300) }); save(); }
  }
  throw new Error('open failed 3x ' + label);
}
async function gridSec() {
  const o = await open('sec');
  const s0 = await step('GRID-SEC', 'start', null); s0.shot = await shot('sec-start');
  s0.checks = { options: JSON.stringify(s0.grid.select.options.map((x) => x.split('=')[1])) === JSON.stringify(E.secOptions), values: s0.grid.select.options.map((x) => x.split('=')[0]).join(','), aria: s0.grid.select.aria === E.aria, title: s0.grid.select.title === E.title1 || s0.grid.select.title === E.tHid('1 s'), titleExact1: s0.grid.select.title === E.title1, noGroups: s0.grid.select.groups.length === 0 };
  console.log('sec start checks', JSON.stringify(s0.checks), s0.grid.select.title);
  const on = () => P.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.snap === 'on');
  res.snapDefault = await on();
  const seq = [['0.5', '0.5 s'], ['0.25', '0.25 s'], ['0.1', '0.1 s']];
  for (const [id, l] of seq) { await press('1'); const r = await step('GRID-SEC', `n-${id}`, E.st(l, await on())); r.divOk = r.grid.ds.gridDivision === id && +r.grid.ds.gridSeconds === +id; }
  await press('1'); const rn = await step('GRID-SEC', 'n-end', E.narrowest('0.1 s')); rn.divOk = rn.grid.ds.gridDivision === '0.1';
  rn.shot = await shot('sec-narrowest');
  for (const [id, l] of [['0.25', '0.25 s'], ['0.5', '0.5 s'], ['1', '1 s'], ['2', '2 s'], ['5', '5 s'], ['10', '10 s']]) { await press('2'); const r = await step('GRID-SEC', `w-${id}`, E.st(l, await on())); r.divOk = r.grid.ds.gridDivision === id && +r.grid.ds.gridSeconds === +id; }
  await press('2'); const rw = await step('GRID-SEC', 'w-end', E.widest('10 s')); rw.divOk = rw.grid.ds.gridDivision === '10'; rw.shot = await shot('sec-widest');
  await choose('0.25'); const rs = await step('GRID-SEC', 'select-0.25', E.st('0.25 s', await on())); rs.divOk = rs.grid.ds.gridDivision === '0.25' && rs.grid.ds.gridSeconds === '0.25';
  rs.shot = await shot('sec-select-025');
  await press('g'); await step('GRID-SEC', 'g-snap-on', E.snapOnSt('0.25 s'));
  await press('1'); const on1 = await step('GRID-SEC', 'on-n-0.1', E.st('0.1 s', true)); on1.divOk = on1.grid.ds.gridDivision === '0.1';
  await press('2'); await press('2'); const on2 = await step('GRID-SEC', 'on-w-0.5', E.st('0.5 s', true)); on2.divOk = on2.grid.ds.gridDivision === '0.5';
  await choose('2'); const on3 = await step('GRID-SEC', 'on-select-2', E.st('2 s', true)); on3.divOk = on3.grid.ds.gridDivision === '2';
  await o.ctx.close();
}
async function gridMusical() {
  const o = await open('musical');
  await L.setSnapOff(P); await obsTake();
  res.addsM = [await L.addAt(P, 'demo-synth-mix', 'music', 1.3)];
  await press('g'); // Snap on (default is off) so the musical statuses read (Snap on)
  await choose('0.5'); await obsTake();
  const c0 = await clips();
  await bpm('120'); const b = await step('GRID-MUSICAL', 'bpm120', null, { clips: await clips() });
  b.checks = { groups: JSON.stringify(b.grid.select.groups), barsGroup: b.grid.select.groups.includes(E.bars('120')), straight: E.straight.every((l) => b.grid.select.options.some((x) => x.endsWith('=' + l))) };
  b.shot = await shot('mus-bpm120'); console.log('bpm checks', JSON.stringify(b.checks), JSON.stringify(b.grid.select.options));
  await choose('1/4'); const q = await step('GRID-MUSICAL', 'choose-1/4', E.stM('1/4', '0.5', '120'), { clips: await clips() }); q.divOk = q.grid.ds.gridDivision === '1/4' && Math.abs(+q.grid.ds.gridSeconds - 0.5) < 1e-9;
  q.shot = await shot('mus-14');
  const nar = [['1/8', '0.25'], ['1/16', '0.125'], ['1/32', '0.063']];
  for (const [id, st] of nar) { await press('1'); const r = await step('GRID-MUSICAL', `n-${id}`, E.stM(id, st, '120'), { clips: await clips() }); r.divOk = r.grid.ds.gridDivision === id && Math.abs(+r.grid.ds.gridSeconds - 0.5 * { '1/8': 0.5, '1/16': 0.25, '1/32': 0.125 }[id]) < 1e-9; }
  await press('1'); const rn = await step('GRID-MUSICAL', 'n-end', E.narrowest('1/32'), { clips: await clips() }); rn.shot = await shot('mus-narrowest');
  for (const [id, st] of [['1/16', '0.125'], ['1/8', '0.25'], ['1/4', '0.5'], ['1/2', '1'], ['bar', '2']]) { await press('2'); const r = await step('GRID-MUSICAL', `w-${id}`, E.stM(id === 'bar' ? '1 bar' : id, st, '120'), { clips: await clips() }); r.divOk = r.grid.ds.gridDivision === id && Math.abs(+r.grid.ds.gridSeconds - +st) < 1e-9; }
  await press('2'); const rw = await step('GRID-MUSICAL', 'w-end', E.widest('1 bar'), { clips: await clips() }); rw.shot = await shot('mus-widest');
  await bpm(''); const cl = await step('GRID-MUSICAL', 'clear', E.cleared('0.5 s'), { clips: await clips() }); cl.divOk = cl.grid.ds.gridDivision === '0.5'; cl.shot = await shot('mus-cleared');
  res.clipsM = { before: c0, all: (res.rows['GRID-MUSICAL'] || []).map((r) => r.clips) };
  res.clipsM.same = res.clipsM.all.every((c) => c === c0);
  console.log('clips same through steps', res.clipsM.same, c0);
  await o.ctx.close();
}
async function gridTriplet() {
  const o = await open('triplet');
  const a0 = (await grid()).ds.gridDivision;
  await press('3'); const a = await step('GRID-TRIPLET', 'a-no-bpm', E.needTempo); a.divKept = a.grid.ds.gridDivision === a0; a.shot = await shot('trip-a');
  await bpm('90'); await choose('bar'); await obsTake();
  await press('3'); const b = await step('GRID-TRIPLET', 'b-bar', E.notOnBar); b.divKept = b.grid.ds.gridDivision === 'bar';
  await choose('0.5'); await obsTake();
  await press('3'); const c = await step('GRID-TRIPLET', 'c-seconds', E.barsOnly); c.divKept = c.grid.ds.gridDivision === '0.5'; c.shot = await shot('trip-c');
  await choose('1/4'); await obsTake();
  await press('3'); const d = await step('GRID-TRIPLET', 'd-1/4T', E.stM('1/4T', '0.444', '90', (await grid()).ds.snap === 'on'));
  d.checks = { div: d.grid.ds.gridDivision === '1/4T', sec: Math.abs(+d.grid.ds.gridSeconds - 60 / 90 * 2 / 3) < 1e-6, groups: d.grid.select.groups, tripGroup: d.grid.select.groups.includes(E.trips('90')), title: d.grid.select.title, titleOk: d.grid.select.title === E.tVis('1/4T') || d.grid.select.title === E.tHid('1/4T'), titleVisExact: d.grid.select.title === E.tVis('1/4T') };
  d.shot = await shot('trip-d'); console.log('d checks', JSON.stringify(d.checks));
  const pt = await laneRight();
  const m = await step('GRID-TRIPLET', 'd-menu', null); m.shot = await shot('trip-menu');
  const ti = m.grid.menu && m.grid.menu.items.find((i) => i.t === E.tripItem); m.tripGlyph = ti ? ti.glyph : null;
  m.checks = { menu: !!m.grid.menu, tripItem: !!ti, tripChecked: ti ? ti.checked : null, items: m.grid.menu && m.grid.menu.items.map((i) => `${i.t}|${i.checked}`) };
  console.log('menu checks', JSON.stringify(m.checks));
  await P.keyboard.press('Escape'); await sleep(300);
  await o.ctx.close();
}
async function gridHidden() {
  const o = await open('hidden');
  await choose('0.1'); const h0 = await step('GRID-HIDDEN', 'choose-0.1', E.st('0.1 s', (await grid()).ds.snap === 'on'));
  const states = [{ k: 'start', lines: h0.grid.ds.gridLines, title: h0.grid.select.title, pps: h0.grid.pps, laneLines: h0.grid.lanes.map((l) => l.lines + ':' + l.px) }];
  const want = h0.grid.ds.gridLines === 'hidden' ? 'visible' : 'hidden'; const key = want === 'visible' ? '+' : '-';
  for (let i = 0; i < 12; i++) {
    await press(key); const g = await grid();
    states.push({ k: `${key}${i + 1}`, lines: g.ds.gridLines, title: g.select.title, pps: g.pps, laneLines: g.lanes.map((l) => l.lines + ':' + l.px), status: g.status });
    if (g.ds.gridLines === want) break;
  }
  const flipShot = await shot(`hidden-${want}`);
  // go back one step to flip again
  const back = want === 'visible' ? '-' : '+';
  for (let i = 0; i < 6; i++) { await press(back); const g = await grid(); states.push({ k: `${back}${i + 1}`, lines: g.ds.gridLines, title: g.select.title, pps: g.pps, laneLines: g.lanes.map((l) => l.lines + ':' + l.px) }); if (g.ds.gridLines !== want) break; }
  const backShot = await shot('hidden-back');
  const ok = states.every((s) => (s.lines === 'hidden' ? s.title === E.tHid('0.1 s') : s.title === E.tVis('0.1 s')) && s.laneLines.every((l) => l.startsWith(s.lines)));
  const r = await step('GRID-HIDDEN', 'states', null, { states, want, flips: states.filter((s, i) => i && s.lines !== states[i - 1].lines).length, consistent: ok, shots: [flipShot, backShot] });
  console.log('hidden states', JSON.stringify(states.map((s) => `${s.k}:${s.pps}:${s.lines}`)), 'consistent', ok);
  await o.ctx.close();
}
async function snap() {
  const o = await open('snap');
  const s0 = await step('SNAP', 'start', null);
  s0.titleOk = s0.grid.ds.snap === 'off' ? s0.grid.snap.title === E.snapOff : s0.grid.snap.title === E.snapOnTitle;
  for (let i = 1; i <= 2; i++) { const was = (await grid()).ds.snap; await press('g'); const nowOn = was === 'off'; const r = await step('SNAP', `g${i}-${nowOn ? 'on' : 'off'}`, nowOn ? E.snapOnSt('1 s') : E.snapOff); r.titleOk = r.grid.snap.title === (nowOn ? E.snapOnTitle : E.snapOff); r.stateOk = r.grid.ds.snap === (nowOn ? 'on' : 'off') && r.grid.snap.pressed === String(nowOn); r.shot = await shot(`snap-g${i}`); console.log('title', r.titleOk, r.stateOk, r.grid.snap.title); }
  // drag with snap on at 1 s: add with snap off at 1.0 (exact), then snap on
  await L.setSnapOff(P); await L.addAt(P, 'demo-synth-mix', 'music', 2); await press('g'); await obsTake();
  const g1 = await grid(); const before = (await L.clipsDom(P)).find((c) => c.lane === 'music');
  await H.dragHeader(P, before.id, 0.4); const after = (await L.clipsDom(P)).find((c) => c.id === before.id);
  const d = await step('SNAP', 'drag+0.4', null, { snapState: g1.ds.snap, gridSec: g1.ds.gridSeconds, before: before.start, after: after.start, width: [before.wdur, after.wdur] });
  d.landsWhole = Number.isInteger(after.start) || Math.abs(after.start - Math.round(after.start)) < 1e-6;
  d.shot = await shot('snap-drag'); console.log('drag', before.start, '->', after.start, 'whole', d.landsWhole);
  await obsTake(); const b7 = (await L.clipsDom(P)).find((c) => c.id === before.id);
  await H.dragHeader(P, before.id, 0.7); const a7 = (await L.clipsDom(P)).find((c) => c.id === before.id);
  const d7 = await step('SNAP', 'drag+0.7', null, { before: b7.start, after: a7.start, width: [b7.wdur, a7.wdur] }); d7.landsWhole = Math.abs(a7.start - Math.round(a7.start)) < 1e-6 && a7.start === b7.start + 1;
  console.log('drag 0.7', b7.start, '->', a7.start, d7.landsWhole);
  // free move check with snap off
  await press('g'); await obsTake(); const b2 = (await L.clipsDom(P)).find((c) => c.id === before.id);
  await H.dragHeader(P, before.id, 0.4); const a2 = (await L.clipsDom(P)).find((c) => c.id === before.id);
  const f = await step('SNAP', 'free-drag+0.4', null, { before: b2.start, after: a2.start }); f.free = !Number.isInteger(a2.start);
  console.log('free drag', b2.start, '->', a2.start);
  await o.ctx.close();
}
async function menu() {
  const o = await open('menu');
  const pt = await laneRight();
  const m = await step('MENU', 'open', null, { pt }); m.shot = await shot('menu-open');
  m.checks = { aria: m.grid.menu && m.grid.menu.aria === E.aria, items: m.grid.menu && m.grid.menu.items.map((i) => i.t), english: m.grid.menu && JSON.stringify(m.grid.menu.items.map((i) => i.t)) === JSON.stringify([...E.secOptions, E.snapItem]), checked: m.grid.menu && m.grid.menu.items.filter((i) => i.checked === 'true').map((i) => i.t), focus: m.grid.focus };
  console.log('menu', JSON.stringify(m.checks));
  // keyboard: arrow from the focused (checked 1 s) item to 0.5 s
  const nav = [];
  for (let i = 0; i < 8; i++) { const f = await P.evaluate(() => (document.activeElement.textContent || '').replace('✓', '').trim()); nav.push(f); if (f === '0.5 s') break; await P.keyboard.press('ArrowDown'); await sleep(120); }
  await P.keyboard.press('Enter'); await sleep(400);
  const c = await step('MENU', 'enter-0.5', E.st('0.5 s', (await grid()).ds.snap === 'on'), { nav }); c.closed = !c.grid.menu; c.divOk = c.grid.ds.gridDivision === '0.5'; c.shot = await shot('menu-chosen');
  console.log('nav', JSON.stringify(nav), 'closed', c.closed, 'focus', c.grid.focus);
  await P.focus('[data-testid=arrangement-snap-toggle]'); await sleep(150);
  await laneRight();
  const m2 = await step('MENU', 'reopen', null); m2.checked = m2.grid.menu && m2.grid.menu.items.filter((i) => i.checked === 'true').map((i) => i.t);
  await P.keyboard.press('Escape'); await sleep(300); const e = await step('MENU', 'escape', null); e.closed = !e.grid.menu; e.focusAfter = e.grid.focus;
  console.log('reopen checked', JSON.stringify(m2.checked), 'esc closed', e.closed, e.focusAfter);
  if (W === 1440) { await L.blur(P); await obsTake(); await press('Control+g'); const r = await step('REG-133', 'ctrlG', E.reg133); r.shot = await shot('reg133'); }
  await o.ctx.close();
}
async function layout() {
  const o = await open('layout');
  const hdr = async (k) => { const g = await grid(); const gb = await P.locator('[data-testid=arrangement-grid-control]').boundingBox(); const f = `layout-hdr-${k}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f), clip: { x: Math.max(0, gb.x - 4), y: Math.max(0, gb.y - 4), width: gb.width + 60, height: gb.height + 8 } });
    const controls = await P.evaluate(() => { const g = document.querySelector('[data-testid=arrangement-grid-control]'); const gb = g.getBoundingClientRect(); return [...g.querySelectorAll('button, select, input')].map((c) => { const r = c.getBoundingClientRect(); return { t: c.dataset.testid || c.tagName, l: +r.left.toFixed(1), r: +r.right.toFixed(1), w: +r.width.toFixed(1), inside: r.left >= gb.left - 0.5 && r.right <= gb.right + 0.5 }; }); });
    return { k, header: g.header, selectW: g.select.w, selected: g.select.selectedText, controls, gridBox: gb, shot: `c-round-134/shots/${f}` }; };
  const out = [await hdr('nobpm')];
  await bpm('120'); out.push(await hdr('bpm120'));
  await choose('1/4'); await press('3'); out.push(await hdr('triplet'));
  res.rows.LAYOUT_HEADER = out; save();
  console.log('layout', JSON.stringify(out.map((x) => [x.k, x.header, x.selectW, x.selected])));
  await o.ctx.close();
}
(async () => {
  const rows = { sec: gridSec, musical: gridMusical, triplet: gridTriplet, hidden: gridHidden, snap, menu, layout };
  for (const [k, f] of Object.entries(rows)) {
    if (ONLY !== 'all' && ONLY !== k) continue;
    try { await f(); } catch (e) { res.rows[`error-${k}`] = String(e.stack || e); console.log('ERR', k, e.stack || e); try { await shot(`err-${k}`); } catch (_) {} }
  }
  res.endUtc = new Date().toISOString(); save();
  console.log(JSON.stringify({ net: X.netOk(validNet()), invalid: res.invalidRuns.length }));
  if (B) await B.close();
})();
