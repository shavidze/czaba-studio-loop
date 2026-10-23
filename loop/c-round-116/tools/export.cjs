// C round 116 — G-T3 / G-T4 / G-INF (MODE=audio) and G-VIDEO export part (MODE=video). Usage: MODE=audio|video node export.cjs <1440|1280> <run>
// Fixed before running (task §4): Master −12 dB harness; ratio vs own baseline: G-T3 10^(−6/20)=0.501187 ±0.5 %, G-T4 10^(3/20)=1.41254 ±0.5 %, 0 clipped;
// G-INF: every sample 0 (residual ≤ −120 dBFS = observation, above = FAIL); G-VIDEO 0.501187 ±0.5 %.
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const RUN = process.argv[3] || '1';
const MODE = process.env.MODE || 'audio';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const VOL = (t) => `[data-track-id="${t}"] input[type=range][aria-label^="Volume"]`;
const MINUS = '−';

async function doExport(p, log, tag, name) {
  await L.blur(p);
  const n0 = log.downloads.length;
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title');
  await L.sleep(400);
  await p.click('[data-testid=arrangement-export-format-wav]');
  await p.click('[data-testid=arrangement-export-scope-project]');
  await L.sleep(200);
  await p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ }).click();
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) { if (log.downloads.length > n0 && log.downloads[n0].file) break; await L.sleep(200); }
  await L.sleep(800);
  const dialog = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-export-overload]'); const d = document.querySelector('[role=dialog]'); return { overload: o ? o.textContent.trim() : null, text: d ? d.textContent.replace(/\s+/g, ' ').slice(0, 300) : null }; });
  await p.screenshot({ path: path.join(L.SHOTS, `export-${tag}-${name}.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) return { name, error: 'no download', dialog };
  const dst = path.join(L.OUT, `${tag}-${name}.wav`);
  fs.renameSync(rec.file, dst);
  return { name, file: path.basename(dst), size: fs.statSync(dst).size, overload: dialog.overload, ms: Date.now() - t0 };
}

function analyse(file) {
  const w = W.parse(fs.readFileSync(file));
  const st = W.stats(w);
  let first = -1, last = -1, nz = 0;
  for (let i = 0; i < w.n; i++) { if (w.read(i) !== 0) { nz++; if (first < 0) first = i; last = i; } }
  return { w, info: { riff: w.riff, tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, nonzero: nz, peak: st.peak, peakDb: st.peak > 0 ? +(20 * Math.log10(st.peak)).toFixed(3) : null, rms: st.rms, rmsDb: st.rms > 0 ? +(20 * Math.log10(st.rms)).toFixed(3) : null, firstNZs: first < 0 ? null : +(Math.floor(first / w.fmt.ch) / w.fmt.sr).toFixed(4), lastNZs: last < 0 ? null : +(Math.floor(last / w.fmt.ch) / w.fmt.sr).toFixed(4) } };
}
// Per-sample: max |m − t·b| in LSB, and the sample offset of the best alignment (should be 0).
function sampleCmp(b, m, t) {
  const n = Math.min(b.n, m.n);
  let maxE = 0, at = -1;
  for (let i = 0; i < n; i++) { const e = Math.abs(m.read(i) - t * b.read(i)); if (e > maxE) { maxE = e; at = i; } }
  return { maxErrLsb: +maxE.toFixed(2), atS: at < 0 ? null : +(Math.floor(at / b.fmt.ch) / b.fmt.sr).toFixed(4) };
}
const ratioRow = (bA, mA, g) => {
  const b = bA.info, m = mA.info, t = Math.pow(10, g / 20);
  const pr = m.peak / b.peak, rr = m.rms / b.rms;
  return { g, target: +t.toFixed(6), peakRatio: +pr.toFixed(6), rmsRatio: +rr.toFixed(6), peakErrPct: +((pr / t - 1) * 100).toFixed(3), rmsErrPct: +((rr / t - 1) * 100).toFixed(3), full: m.full, nan: m.nan, sameFrames: m.frames === b.frames, seconds: m.seconds, ...sampleCmp(bA.w, mA.w, t), ok: Math.abs(pr / t - 1) <= 0.005 && Math.abs(rr / t - 1) <= 0.005 && m.full === 0 && m.nan === 0 && m.frames === b.frames };
};

async function setMute(p, lane, on) {
  const s = `[data-track-id="${lane}"] button[aria-label^="Mute"]`;
  if (!(await p.locator(s).count())) return null;
  const cur = await p.locator(s).first().getAttribute('aria-pressed');
  if ((cur === 'true') !== on) { await p.locator(s).first().click(); await L.sleep(200); }
  await L.blur(p);
  return on;
}
const laneText = (p, t) => p.locator(VOL(t)).first().getAttribute('aria-valuetext');
async function setLaneDb(p, t, target) {
  const want = target === 0 ? '+0.0 dB' : `${target < 0 ? MINUS : '+'}${Math.abs(target).toFixed(1)} dB`;
  await p.locator(VOL(t)).first().focus();
  for (let k = 0; k < 700; k++) {
    const v = Number(await p.locator(VOL(t)).first().inputValue());
    if (Math.abs(v - target) < 1e-9) break;
    await p.keyboard.press(v > target ? 'ArrowLeft' : 'ArrowRight');
  }
  await L.blur(p); await L.sleep(250);
  const txt = await laneText(p, t);
  if (txt !== want) throw new Error(`lane ${t} at ${txt}, want ${want}`);
  return txt;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `exp-${MODE}-${VP.width}-${RUN}`;
  const o = await L.openStudio(browser, VP, tag, net);
  const p = o.page;
  const out = { utc: new Date().toISOString(), vp: VP, mode: MODE, steps: [], exports: {}, rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: n.downloads.map((d) => ({ name: d.name, size: d.size })) })); L.save(L.OUT, `${tag}.json`, out); };
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) out.steps.push(await L.addAt(p, s, ln, t));
  await L.blur(p);
  if (MODE === 'video') { await L.loadVideo(p, 'beeps-6s-vp9-opus.webm'); out.steps.push({ video: 'beeps-6s-vp9-opus.webm', lanes: await p.evaluate(() => [...new Set([...document.querySelectorAll('[data-track-id]')].map((e) => e.getAttribute('data-track-id')))]) }); }
  const MS = 'input[aria-label="Master Volume"]';
  await p.locator(MS).focus();
  for (let k = 0; k < 400; k++) { const v = +(await p.inputValue(MS)); if (v <= -12 + 1e-9) break; await p.keyboard.press('ArrowLeft'); }
  await L.blur(p); await L.sleep(300);
  out.master = { value: +(await p.inputValue(MS)), text: await p.locator(MS).getAttribute('aria-valuetext') };
  if (Math.abs(out.master.value + 12) > 1e-9) throw new Error('master not at −12');
  const A = {};
  const exp = async (name) => { const e = await doExport(p, o.log, tag, name); out.exports[name] = e; if (e.error) { save(); throw new Error(name + ' ' + e.error); } const a = analyse(path.join(L.OUT, e.file)); A[name] = a; out.exports[name].info = a.info; console.log(name, JSON.stringify(a.info), 'overload:', e.overload); save(); return a; };
  const lane = MODE === 'video' ? 'video' : 'music';
  for (const ln of ['video', 'music', 'stems', 'sfx']) out.steps.push({ mute: ln, on: await setMute(p, ln, ln !== lane) });
  out.steps.push({ laneStart: await laneText(p, lane) });
  const base = await exp('base');
  const bValid = base.info.full === 0 && !out.exports.base.overload && base.info.nonzero > 0;
  out.rows.baseline = { valid: bValid, peakDb: base.info.peakDb, headroomOkForT4: base.info.peakDb + 3 <= -1 };
  save();
  out.steps.push({ set: await setLaneDb(p, lane, -6) });
  const m6 = await exp('lane-m6');
  out.rows[MODE === 'video' ? 'G-VIDEO-EXPORT' : 'G-T3'] = { ...ratioRow(base, m6, -6), baselineValid: bValid };
  out.rows[MODE === 'video' ? 'G-VIDEO-EXPORT' : 'G-T3'].pass = out.rows[MODE === 'video' ? 'G-VIDEO-EXPORT' : 'G-T3'].ok && bValid;
  save();
  if (MODE === 'audio') {
    out.steps.push({ set: await setLaneDb(p, lane, -3) });
    const clips = await L.clipsDom(p);
    const mc = clips.find((c) => c.lane === 'music');
    await L.selectClip(p, mc.id);
    const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
    if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
    await p.fill(FIELD, '6'); await p.locator(FIELD).press('Enter'); await L.sleep(300); await L.blur(p);
    out.steps.push({ clipGainField: await p.inputValue(FIELD), lane: await laneText(p, lane) });
    const t4 = await exp('clip-p6-lane-m3');
    out.rows['G-T4'] = { ...ratioRow(base, t4, 3), baselineValid: bValid, headroomOk: out.rows.baseline.headroomOkForT4 };
    out.rows['G-T4'].pass = out.rows['G-T4'].ok && bValid && out.rows.baseline.headroomOkForT4 && !out.exports['clip-p6-lane-m3'].overload;
    save();
    await p.locator(VOL(lane)).first().focus(); await p.keyboard.press('Home'); await L.blur(p); await L.sleep(250);
    out.steps.push({ inf: await laneText(p, lane) });
    const inf = await exp('lane-inf');
    let maxAbs = 0; for (let i = 0; i < inf.w.n; i++) { const a = Math.abs(inf.w.read(i)); if (a > maxAbs) maxAbs = a; }
    const fsc = Math.pow(2, inf.info.bits - 1);
    out.rows['G-INF'] = { laneText: out.steps.at(-1).inf, nonzero: inf.info.nonzero, maxAbsLsb: maxAbs, residualDbfs: maxAbs > 0 ? +(20 * Math.log10(maxAbs / fsc)).toFixed(2) : null, frames: inf.info.frames, sameFrames: inf.info.frames === base.info.frames, nan: inf.info.nan, overload: out.exports['lane-inf'].overload };
    out.rows['G-INF'].pass = inf.info.nonzero === 0 && inf.info.nan === 0 && out.rows['G-INF'].laneText === `${MINUS}∞ dB` && out.rows['G-INF'].sameFrames;
    save();
  }
  console.log(JSON.stringify(out.rows, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
