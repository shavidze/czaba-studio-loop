// C round 132: ZOOM, METRO, TEMPO, GEO-COUNT rows. node c132.cjs <1440|1280> <tag>
// Expected strings are hand-written from task §1.1 (not imported from strings.ts).
const W = +process.argv[2] || 1440;
const TAG = process.argv[3] || 'r1';
const X = require('./lib122.cjs'); const { L, sleep } = X;
const fs = require('fs'); const path = require('path');
const KA = /[Ⴀ-ჿᲐ-Ჿⴀ-⴯]/g;
const gc = (s) => ((s || '').match(KA) || []).length;
const R3_TAIL = ' ბადე დაბრუნდა წამებზე: 0.5 წმ.';
const SUB = [R3_TAIL.trim(), 'პროექტის ტემპი (BPM)', 'მეტრონომი', 'Zoom (px/წმ)'];
const subtract = (s, extra = []) => { let t = s || ''; const used = []; for (const n of [...SUB, ...extra]) if (t.includes(n)) { used.push(n); t = t.split(n).join(''); } return { net: gc(t), raw: gc(s), subtracted: used }; };
const E = {
  set90: 'Tempo 90 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
  set120: 'Tempo 120 BPM · 4/4 — bars ruler updated. Grid only: audio is not stretched.',
  invalid: 'Tempo must be 20–999 BPM (e.g. 90 or 92.5) — not changed.',
  cleared: 'Tempo cleared — the bars ruler is hidden. Audio is unchanged.',
  hint: 'Bars: set a BPM — grid only, audio is not stretched',
  r3: 'Tempo cleared — the bars ruler is hidden. Audio is unchanged. ბადე დაბრუნდა წამებზე: 0.5 წმ.',
  mNeeds: 'Metronome — set a BPM first',
  mTitle: 'Metronome — a click on every beat during playback (4/4, the first beat of each bar is louder). Master volume and Mute also apply to it. Not included in the export.',
  mOn120: 'Metronome is on — 120 BPM, 4/4: a click on every beat, louder on the first beat of each bar. Not included in the export.',
  mOff: 'Metronome is off.',
};
const ZRE = /^\d+(\.\d)? px\/s$/;
const net = []; const res = { vp: W, tag: TAG, startedUtc: new Date().toISOString(), rows: {} };
const OUTF = path.join(L.OUT, `c132-${W}-${TAG}.json`);
const save = () => fs.writeFileSync(OUTF, JSON.stringify({ ...res, net: X.netOk(net), sessions: net.map((n) => ({ label: n.label, errors: n.errors, hydration: n.hydration, forbidden: n.forbidden, authHeaders: n.authHeaders, noise: n.noise })) }, null, 1));
let P;
async function shot(name) { const f = `${name}-${W}-${TAG}.png`; await P.screenshot({ path: path.join(L.SHOTS, f) }); return `c-round-133/shots/${f}`; }
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
const ui = () => P.evaluate(() => {
  const q = (s) => document.querySelector(`[data-testid=${s}]`);
  const tin = q('arrangement-tempo-input'); const mt = q('arrangement-metronome-toggle'); const zr = q('arrangement-zoom-readout');
  const zs = document.querySelector('[aria-label="Zoom (px/წმ)"]'); const bars = q('arrangement-bars-ruler'); const div = q('arrangement-grid-division');
  const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), sw: e.scrollWidth, cw: e.clientWidth }; };
  return {
    tempoValue: tin ? tin.value : null, tempoAria: tin ? tin.getAttribute('aria-label') : null, tempoTitle: tin ? tin.getAttribute('title') : null,
    metro: mt ? { disabled: mt.disabled, pressed: mt.getAttribute('aria-pressed'), title: mt.getAttribute('title'), text: mt.textContent.trim(), aria: mt.getAttribute('aria-label') } : null,
    zoomText: zr ? zr.textContent.trim() : null, zoomValuetext: zs ? zs.getAttribute('aria-valuetext') : null, zoomAria: zs ? zs.getAttribute('aria-label') : null, zoomSliderFound: !!zs, zoomValue: zs ? zs.value ?? zs.getAttribute('aria-valuenow') : null,
    barsBpm: bars ? bars.dataset.bpm : null, barsText: bars ? bars.textContent.trim() : null, barsMarks: document.querySelectorAll('[data-testid=arrangement-bars-mark]').length,
    division: div ? div.value : null, divisionOptions: div ? [...div.options].map((o) => o.value) : [],
    boxes: { tempoRow: box(tin && tin.parentElement), bars: box(bars), zoomReadout: box(zr), zoomSlider: box(zs), metro: box(mt), status: box(q('arrangement-status')) },
    docSW: document.documentElement.scrollWidth, vw: innerWidth,
  };
});
const clips = async () => (await L.clipsDom(P)).filter((c) => c.kind !== 'video').map((c) => ({ id: c.id, lane: c.lane, start: c.start, wdur: c.wdur }));
async function commitTempo(text) {
  const t = P.locator('[data-testid=arrangement-tempo-input]');
  await t.click(); await t.fill(text); await P.keyboard.press('Enter'); await sleep(500);
  await L.blur(P); await sleep(150);
}
async function chooseDivision(v) { await P.selectOption('[data-testid=arrangement-grid-division]', v); await sleep(400); await L.blur(P); }
function geoSurfaces(u, statusText, extra) {
  return {
    status: subtract(statusText, extra), metroTitle: subtract(u.metro && u.metro.title), metroText: subtract(u.metro && u.metro.text),
    zoomText: subtract(u.zoomText), zoomValuetext: subtract(u.zoomValuetext), barsHint: subtract(u.barsText),
  };
}
async function step(row, id, expected, extra = {}) {
  const status = await L.status(P);
  const u = await ui();
  const r = { id, expected, status, exact: expected === null ? null : status === expected, ui: u, clips: await clips(), observer: await obsTake(), ...extra };
  r.geo = geoSurfaces(u, status, extra.geoExtra || []);
  res.rows[row] = res.rows[row] || []; res.rows[row].push(r); save();
  console.log(row, id, r.exact === null ? 'INFO' : r.exact ? 'OK ' : 'XX ', JSON.stringify(status), r.exact === false ? ' expected ' + JSON.stringify(expected) : '', '| obs:', JSON.stringify(r.observer.map((o) => o.text)));
  return r;
}
(async () => {
  const b = await L.launch();
  try {
    const o = await L.openStudio(b, X.VPS[W], `c132-${W}-${TAG}`, net, { extraInit: X.tapInit });
    P = o.page;
    await P.mouse.move(2, 2); await sleep(300);
    await obsInstall();
    // ZOOM
    const z0 = await step('ZOOM', 'load', null); z0.shot = await shot('zoom-load');
    await L.blur(P); await P.keyboard.press('+'); await sleep(500);
    await step('ZOOM', 'plus', null);
    await L.blur(P); await P.keyboard.press('-'); await sleep(500);
    await step('ZOOM', 'minus', null);
    // METRO (a)
    const ma = await step('METRO', 'a-no-bpm', null); ma.shot = await shot('metro-a');
    // add a clip for TEMPO
    res.add = await L.addAt(P, 'demo-hero-music', 'music', 2); await obsTake(); save();
    const c0 = await step('TEMPO', 'start', null);
    await commitTempo('90');
    const ta = await step('TEMPO', 'a-90', E.set90); ta.shot = await shot('tempo-a');
    await commitTempo('1000');
    const tb = await step('TEMPO', 'b-1000', E.invalid); tb.shot = await shot('tempo-b');
    await commitTempo('');
    const tc = await step('TEMPO', 'c-clear', E.cleared); tc.shot = await shot('tempo-c');
    await chooseDivision('0.5');
    await step('TEMPO', 'd1-div0.5', null);
    await commitTempo('90');
    await step('TEMPO', 'd2-90', E.set90);
    await chooseDivision('1/4');
    const d3 = await step('TEMPO', 'd3-div1/4', null, { geoExtra: [] });
    await commitTempo('');
    const td = await step('TEMPO', 'd4-clear', E.r3); td.shot = await shot('tempo-d');
    // METRO (b)-(e)
    await chooseDivision('1');
    await commitTempo('120');
    const mb = await step('METRO', 'b-bpm120', E.set120);
    await L.blur(P);
    await P.click('[data-testid=arrangement-metronome-toggle]'); await sleep(500); await L.blur(P);
    const mc = await step('METRO', 'c-on', E.mOn120); mc.shot = await shot('metro-c');
    await P.keyboard.press('Home'); await sleep(300);
    const pos0 = await L.posNow(P); const cbs0 = await P.evaluate(() => window.__h.cbs);
    await P.evaluate(() => window.__tapStart());
    await L.blur(P); await P.keyboard.press('Space'); await sleep(2000);
    const posMid = await L.posNow(P);
    await P.keyboard.press('Space'); await sleep(500);
    const tap = await P.evaluate(() => window.__tapStop());
    const pos1 = await L.posNow(P); const cbs1 = await P.evaluate(() => window.__h.cbs);
    const peaks = tap.map((s) => s.peak);
    res.play = { pos0, posMid, pos1, bufferSourcesCreated: cbs1 - cbs0, tapSamples: tap.length, maxPeak: Math.max(0, ...peaks), framesAbove001: peaks.filter((x) => x > 0.01).length, ctxState: await P.evaluate(() => window.__h.ctxs.map((c) => c.state)) };
    const md = await step('METRO', 'd-play-stop', null); md.shot = await shot('metro-d');
    await P.click('[data-testid=arrangement-metronome-toggle]'); await sleep(500); await L.blur(P);
    const me = await step('METRO', 'e-off', E.mOff); me.shot = await shot('metro-e');
  } catch (e) { res.error = String(e.stack || e); console.log('ERR', res.error); }
  res.endUtc = new Date().toISOString();
  save();
  console.log(JSON.stringify({ err: res.error, play: res.play, net: X.netOk(net) }));
  await b.close();
})();
