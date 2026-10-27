const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const R = require('./report.cjs');
const VPS = { 1440: { width: 1440, height: 900 }, 1280: { width: 1280, height: 720 } };
const sleep = L.sleep;
function netOk(net) {
  const bad = [];
  for (const n of net) {
    if (n.forbidden.length) bad.push(`${n.label} forbidden ${n.forbidden.slice(0, 3).join(',')}`);
    if (n.authHeaders.length) bad.push(`${n.label} auth ${n.authHeaders.length}`);
    if (n.hydration.length) bad.push(`${n.label} hydration ${n.hydration[0]}`);
    if (n.errors.length) bad.push(`${n.label} errors ${n.errors.slice(0, 2).join(' | ')}`);
  }
  return { ok: bad.length === 0, bad, noise: net.reduce((a, n) => a + n.noise, 0), sessions: net.length };
}
const parseT = (s) => { const m = /(\d+):(\d+(?:\.\d+)?)/.exec(s || ''); return m ? +m[1] * 60 + +m[2] : NaN; };
async function clipInfoSel(p) {
  return p.evaluate(() => {
    const c = document.querySelector('[data-testid=arrangement-detail-content]');
    const t = c ? c.textContent.replace(/\s+/g, ' ') : '';
    return t;
  }).then((t) => ({ text: t.slice(0, 200), start: parseT((/დასაწყისი ([\d:.]+)/.exec(t) || [])[1]), len: parseT((/სიგრძე ([\d:.]+)/.exec(t) || [])[1]), offset: parseT((/წყაროდან ([\d:.]+)/.exec(t) || [])[1]) }));
}
// Full table with offsets; selects each clip (selection is not history). Restores nothing.
async function clipTable(p) {
  const cs = (await L.clipsDom(p)).filter((c) => c.kind !== 'video' || true);
  const out = [];
  for (const c of cs) {
    let off = null, len = c.wdur;
    try { await L.selectClip(p, c.id); const i = await clipInfoSel(p); off = i.offset; if (Number.isFinite(i.len)) len = i.len; } catch (e) { off = 'n/a'; }
    out.push({ lane: c.lane, kind: c.kind, start: c.start, end: +(c.start + len).toFixed(3), offset: off });
  }
  await p.keyboard.press('Escape'); await sleep(150);
  return out.sort((a, b) => (a.lane < b.lane ? -1 : a.lane > b.lane ? 1 : a.start - b.start));
}
const tblKey = (t) => JSON.stringify(t);
async function clipBox(p, id) { return p.locator(`[data-clip-id="${id}"]`).boundingBox(); }
async function bodyY(p, id, f = 0.65) { const b = await clipBox(p, id); return b.y + b.height * f; }
async function tx(p, t) { const g = await L.geo(p); return g.rl + t * g.pps; }
async function rangeDrag(p, id, t0, t1, f = 0.65) {
  const y = await bodyY(p, id, f); const x0 = await tx(p, t0), x1 = await tx(p, t1);
  await p.mouse.move(x0, y, { steps: 2 }); await sleep(60); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, y, { steps: 6 }); await p.mouse.move(x1, y, { steps: 6 }); await sleep(120); await p.mouse.up(); await sleep(350);
  return L.status(p);
}
async function key(p, k) { await L.blur(p); await p.keyboard.press(k); await sleep(350); return L.status(p); }
async function undoTitle(p) { return p.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Undo/.test(x.textContent)); return b ? (b.getAttribute('title') || '') + '|' + b.disabled : null; }); }
async function muteLanes(p, lanes) { for (const ln of lanes) { await p.click(`[data-track-id=${ln}] button[aria-label^="Mute"]`); await sleep(150); } await L.blur(p); }
// export
async function dstate(p) {
  return p.evaluate(() => { const t = document.querySelector('#arrangement-export-title'); const d = t && t.closest('[role=dialog]'); if (!d) return null; const q = (s) => d.querySelector(`[data-testid=${s}]`); const r = (e) => e && { checked: e.checked, disabled: e.disabled };
    return { project: r(q('arrangement-export-scope-project')), range: r(q('arrangement-export-scope-range')), formats: [...d.querySelectorAll('input[type=radio]')].map((i) => `${i.dataset.testid}:${i.checked}`), videoLine: (q('arrangement-export-video-fades') || {}).textContent || null, text: d.textContent.replace(/\s+/g, ' ').slice(0, 1500), footer: !!q('arrangement-export-footer'), footerBox: q('arrangement-export-footer') ? q('arrangement-export-footer').getBoundingClientRect().toJSON() : null, dlgBox: d.getBoundingClientRect().toJSON(), status: (d.querySelector('[role=status],[role=alert]') || {}).textContent || null };
  });
}
async function openDlg(p) { await L.blur(p); await p.getByRole('button', { name: 'Export', exact: true }).click(); await p.waitForSelector('#arrangement-export-title', { timeout: 10000 }); await sleep(400); return dstate(p); }
async function closeDlg(p) { await p.locator('button', { hasText: 'დახურვა' }).last().click().catch(async () => { await p.keyboard.press('Escape'); }); await sleep(400); }
async function exportWav(p, log, name, { scope = 'project', format = 'wav', keepOpen = false } = {}) {
  const st0 = await openDlg(p);
  await p.click(`[data-testid=arrangement-export-format-${format}]`);
  if (scope) await p.click(`[data-testid=arrangement-export-scope-${scope}]`);
  await sleep(200);
  const n0 = log.downloads.length;
  await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click();
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) { if (log.downloads.length > n0 && log.downloads.slice(n0).every((d) => d.file || d.err)) break; await sleep(250); }
  await sleep(800);
  const st1 = await dstate(p);
  if (!keepOpen) await closeDlg(p);
  const recs = log.downloads.slice(n0);
  const files = [];
  for (const rec of recs) { if (!rec.file) continue; const dst = path.join(L.OUT, `${name}-${rec.name}`.replace(/[^\w.\-]/g, '_')); fs.renameSync(rec.file, dst); files.push(dst); }
  return { st0, st1, files, recs: recs.map((r) => ({ name: r.name, size: r.size, err: r.err })) };
}
function wav(file) { const buf = fs.readFileSync(file); const w = W.parse(buf); const s = W.stats(w); return { w, buf, sha: crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16), fmt: w.fmt, frames: w.frames, seconds: +w.seconds.toFixed(5), peak: s.peak, rms: s.rms, nan: s.nan }; }
const nf = (w) => (w.fmt.tag === 3 ? 1 : Math.pow(2, w.fmt.bits - 1));
function winStats(w, t0, t1) { const ch = w.fmt.ch, n = nf(w), sr = w.fmt.sr; let pk = 0, ss = 0, c = 0, nz = 0; for (let f = Math.max(0, Math.floor(t0 * sr)); f < Math.min(w.frames, Math.floor(t1 * sr)); f++) for (let k = 0; k < ch; k++) { const v = w.read(f * ch + k); if (v !== 0) nz++; const a = Math.abs(v) / n; if (a > pk) pk = a; ss += a * a; c++; } return { peak: pk, rms: c ? Math.sqrt(ss / c) : 0, nz, n: c }; }
function maxLsb(a, b, fa0 = 0, fb0 = 0, nFrames = null, skip = null) { const ch = a.fmt.ch; const N = nFrames ?? Math.min(a.frames - fa0, b.frames - fb0); let m = 0, at = -1; for (let f = 0; f < N; f++) { if (skip && skip(f + fa0)) continue; for (let k = 0; k < ch; k++) { const d = Math.abs(a.read((f + fa0) * ch + k) - b.read((f + fb0) * ch + k)); if (d > m) { m = d; at = f + fa0; } } } return { max: m, at }; }
// tap of real output
function tapInit() {
  const W = window; W.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) { const r = oc.call(this, dest, ...rest); try { if (dest instanceof AudioDestinationNode && !(this.context instanceof OfflineAudioContext)) { const c = this.context; let an = W.__tap.an.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W.__tap.an.set(c, an); try { const k = c.createConstantSource(); k.offset.value = 0; oc.call(k, an); k.start(); W.__tap.keep = (W.__tap.keep || 0) + 1; } catch (e) { W.__tap.keepErr = String(e); } } oc.call(this, an); } } catch (e) { W.__tap.err = String(e); } return r; };
  W.__tapStart = () => { W.__tap.on = true; W.__tap.S = []; const buf = new Float32Array(2048); const tick = () => { if (!W.__tap.on) return; let peak = 0; for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; } } const meters = {}; for (const m of document.querySelectorAll('[data-track-id] [data-testid=arrangement-track-meter]')) { const k = m.closest('[data-track-id]').dataset.trackId; meters[k] = m.getAttribute('data-peak'); meters[k + ':lv'] = m.getAttribute('data-level-db'); } W.__tap.S.push({ t: performance.now(), peak, meters }); requestAnimationFrame(tick); }; requestAnimationFrame(tick); };
  W.__tapStop = () => { W.__tap.on = false; return W.__tap.S; };
}
async function openDetail(p) { const t = p.locator('[data-testid=arrangement-detail-toggle]'); const ex = await t.getAttribute('aria-expanded'); if (ex === 'false') { await t.click(); await sleep(700); } await L.blur(p); return ex; }
async function shot(p, name) { await p.screenshot({ path: path.join(L.SHOTS, name) }); return `c-round-199/shots/${name}`; }
module.exports = { openDetail, L, W, R, VPS, sleep, netOk, parseT, clipInfoSel, clipTable, tblKey, clipBox, bodyY, tx, rangeDrag, key, undoTitle, muteLanes, dstate, openDlg, closeDlg, exportWav, wav, winStats, maxLsb, nf, tapInit, shot };
