// C round 118 — G-GROUP-T3, G-GROUP-INF, control pair. Usage: node gexport.cjs <1440|1280> <run>
// Fixed before running (task §5): members ratio (−6 vs 0) = 10^(−6/20) = 0.501187 ±0.5 % (peak and RMS), 0 clipped;
// control (music alone, group muted) ratio 1.000 ±0.5 %; G-GROUP-INF every sample 0 (≤ −120 dBFS residual = observation; above = FAIL).
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const RUN = process.argv[3] || '1';
const MINUS = '−';
const G = '[data-testid=arrangement-group-volume]';
const GM = '[data-testid=arrangement-group-mute]';
const MS = 'input[aria-label="Master Volume"]';

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
  const dialog = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-export-overload]'); return { overload: o ? o.textContent.trim() : null }; });
  await p.screenshot({ path: path.join(L.SHOTS, `gexport-${tag}-${name}.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) return { name, error: 'no download' };
  const dst = path.join(L.OUT, `${tag}-${name}.wav`);
  fs.renameSync(rec.file, dst);
  return { name, file: path.basename(dst), size: fs.statSync(dst).size, overload: dialog.overload, ms: Date.now() - t0 };
}
function analyse(file) {
  const w = W.parse(fs.readFileSync(file));
  const st = W.stats(w);
  let nz = 0, maxAbs = 0, first = -1;
  for (let i = 0; i < w.n; i++) { const v = w.read(i); if (v !== 0) { nz++; if (first < 0) first = i; } const a = Math.abs(v); if (a > maxAbs) maxAbs = a; }
  return { w, info: { riff: w.riff, tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, nonzero: nz, maxAbs, firstNZs: first < 0 ? null : +(Math.floor(first / w.fmt.ch) / w.fmt.sr).toFixed(4), peak: st.peak, peakDb: st.peak > 0 ? +(20 * Math.log10(st.peak)).toFixed(3) : null, rms: st.rms, rmsDb: st.rms > 0 ? +(20 * Math.log10(st.rms)).toFixed(3) : null } };
}
function sampleCmp(b, m, t) {
  const n = Math.min(b.n, m.n);
  let maxE = 0;
  for (let i = 0; i < n; i++) { const e = Math.abs(m.read(i) - t * b.read(i)); if (e > maxE) maxE = e; }
  return +maxE.toFixed(2);
}
const ratioRow = (bA, mA, g) => {
  const b = bA.info, m = mA.info, t = Math.pow(10, g / 20);
  const pr = m.peak / b.peak, rr = m.rms / b.rms;
  return { target: +t.toFixed(6), peakRatio: +pr.toFixed(6), rmsRatio: +rr.toFixed(6), peakErrPct: +((pr / t - 1) * 100).toFixed(3), rmsErrPct: +((rr / t - 1) * 100).toFixed(3), maxErrLsb: sampleCmp(bA.w, mA.w, t), full: m.full, nan: m.nan, sameFrames: m.frames === b.frames, ok: Math.abs(pr / t - 1) <= 0.005 && Math.abs(rr / t - 1) <= 0.005 && m.full === 0 && m.nan === 0 && m.frames === b.frames };
};
const gText = (p) => p.locator(G).getAttribute('aria-valuetext');
async function setMute(p, sel, on) {
  const cur = await p.locator(sel).first().getAttribute('aria-pressed');
  if ((cur === 'true') !== on) { await p.locator(sel).first().click(); await L.sleep(250); }
  await L.blur(p);
  return p.locator(sel).first().getAttribute('aria-pressed');
}
async function groupMinus6(p) {
  await p.locator(G).focus();
  for (let k = 0; k < 60; k++) await p.keyboard.press('ArrowLeft');
  await L.blur(p); await L.sleep(300);
  const t = await gText(p);
  if (t !== `${MINUS}6.0 dB`) throw new Error(`group at ${t}`);
  return t;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `gexp-${VP.width}-${RUN}`;
  const o = await L.openStudio(browser, VP, tag, net);
  const p = o.page;
  const out = { utc: new Date().toISOString(), vp: VP, steps: [], exports: {}, rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: n.downloads.map((d) => ({ name: d.name, size: d.size })) })); L.save(L.OUT, `${tag}.json`, out); };
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) out.steps.push(await L.addAt(p, s, ln, t));
  await L.blur(p);
  await p.click(L.nameSel('stems')); await L.sleep(150);
  await p.keyboard.down('Shift'); await p.click(L.nameSel('sfx')); await p.keyboard.up('Shift');
  await p.keyboard.press('Control+g'); await L.sleep(600); await L.blur(p);
  out.steps.push({ group: await gText(p) });
  await p.locator(MS).focus();
  for (let k = 0; k < 400; k++) { const v = +(await p.inputValue(MS)); if (v <= -12 + 1e-9) break; await p.keyboard.press('ArrowLeft'); }
  await L.blur(p); await L.sleep(300);
  out.master = { value: +(await p.inputValue(MS)), text: await p.locator(MS).getAttribute('aria-valuetext') };
  const A = {};
  const exp = async (name) => { const e = await doExport(p, o.log, tag, name); out.exports[name] = e; if (e.error) { save(); throw new Error(name + ' ' + e.error); } const a = analyse(path.join(L.OUT, e.file)); A[name] = a; out.exports[name].info = a.info; console.log(name, JSON.stringify(a.info), 'overload:', e.overload); save(); return a; };
  const MM = '[data-track-id="music"] button[aria-label^="Mute"]';
  out.steps.push({ musicMute: await setMute(p, MM, true) });
  const base = await exp('members-g0');
  out.steps.push({ set: await groupMinus6(p) });
  const m6 = await exp('members-gm6');
  out.rows['G-GROUP-T3'] = { ...ratioRow(base, m6, -6), baseValid: base.info.nonzero > 0 && base.info.full === 0 && !out.exports['members-g0'].overload, baseFirstNZs: base.info.firstNZs };
  out.rows['G-GROUP-T3'].pass = out.rows['G-GROUP-T3'].ok && out.rows['G-GROUP-T3'].baseValid;
  save();
  // far left drag
  const b = await p.locator(G).boundingBox();
  await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down();
  for (let k = 1; k <= 30; k++) await p.mouse.move(b.x + b.width / 2 - k * 5, b.y + b.height / 2);
  await p.mouse.up(); await L.sleep(300); await L.blur(p);
  out.steps.push({ inf: await gText(p) });
  const inf = await exp('members-ginf');
  const fsc = Math.pow(2, inf.info.bits - 1);
  out.rows['G-GROUP-INF'] = { text: out.steps.at(-1).inf, nonzero: inf.info.nonzero, maxAbsLsb: inf.info.maxAbs, residualDbfs: inf.info.maxAbs > 0 ? +(20 * Math.log10(inf.info.maxAbs / fsc)).toFixed(2) : null, sameFrames: inf.info.frames === base.info.frames, nan: inf.info.nan };
  out.rows['G-GROUP-INF'].pass = inf.info.nonzero === 0 && inf.info.nan === 0 && out.rows['G-GROUP-INF'].text === `${MINUS}∞ dB` && out.rows['G-GROUP-INF'].sameFrames;
  save();
  // control pair: music on, group muted
  const gb = await p.locator(G).boundingBox();
  await p.mouse.dblclick(gb.x + gb.width / 2, gb.y + gb.height / 2); await L.sleep(300); await L.blur(p);
  out.steps.push({ reset: await gText(p), musicMute: await setMute(p, MM, false), groupMute: await setMute(p, GM, true) });
  const c0 = await exp('control-g0');
  out.steps.push({ set: await groupMinus6(p) });
  const c6 = await exp('control-gm6');
  out.rows.control = { ...ratioRow(c0, c6, 0), c0NonZero: c0.info.nonzero, c0FirstNZs: c0.info.firstNZs };
  out.rows.control.pass = out.rows.control.ok && c0.info.nonzero > 0;
  save();
  console.log(JSON.stringify(out.rows, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
