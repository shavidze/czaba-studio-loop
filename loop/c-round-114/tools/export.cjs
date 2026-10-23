// C round 114 — G-T1, G-T2, G-T8, G-T9, G-NONDESTRUCT. Usage: node export.cjs <1440|1280>
// Tolerances fixed before running (task §4): ratio 0.5012 ±0.5 %, +3 dB ratio 1.4125 ±0.5 %, music region ≤ 1 LSB (24-bit int),
// last 10 ms of the faded clip ≤ −60 dBFS RMS, NONDESTRUCT ≤ 1 LSB vs G-T1.
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const VP = process.argv[2] === '1280' ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';

const readF = (p) => p.evaluate(([F, FIELD]) => { const f = document.querySelector(F); const fi = document.querySelector(FIELD); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); const b = f.getBoundingClientRect(); return { v: +f.value, text: f.getAttribute('aria-valuetext'), field: fi.value, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; }, [F, FIELD]);

async function doExport(p, log, name) {
  await L.blur(p);
  const n0 = log.downloads.length;
  await p.getByRole('button', { name: 'Export', exact: true }).click();
  await p.waitForSelector('#arrangement-export-title');
  await L.sleep(400);
  await p.click('[data-testid=arrangement-export-format-wav]');
  await p.click('[data-testid=arrangement-export-scope-project]');
  await L.sleep(200);
  const dlg = await p.evaluate(() => { const d = document.querySelector('#arrangement-export-title').closest('[role=dialog]'); return d.innerText.replace(/\s+/g, ' ').slice(0, 600); });
  const btn = p.locator('[data-testid=arrangement-export-footer] button').filter({ hasText: /ექსპორტი$/ });
  await btn.click();
  const t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    if (log.downloads.length > n0 && log.downloads[n0].file) break;
    await L.sleep(200);
  }
  await L.sleep(800);
  const overload = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-export-overload]'); return o ? o.textContent.trim() : null; });
  const footer = await p.evaluate(() => (document.querySelector('[data-testid=arrangement-export-footer]') || {}).innerText || '');
  await p.screenshot({ path: path.join(L.SHOTS, `export-${name}-${VP.width}.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) throw new Error('no download for ' + name);
  const dst = path.join(L.OUT, `exp-${VP.width}-${name}.wav`);
  fs.renameSync(rec.file, dst);
  return { name, file: dst, size: fs.statSync(dst).size, overload, footer: footer.replace(/\s+/g, ' ').slice(0, 300), dialog: dlg, ms: Date.now() - t0 };
}

function analyse(file) {
  const w = W.parse(fs.readFileSync(file));
  const st = W.stats(w);
  const fsMax = Math.pow(2, w.fmt.bits - 1);
  let first = -1, last = -1;
  for (let i = 0; i < w.n; i++) { if (w.read(i) !== 0) { if (first < 0) first = i; last = i; } }
  return { w, info: { tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, peak: st.peak, peakDb: +(20 * Math.log10(st.peak)).toFixed(3), rms: st.rms, rmsDb: +(20 * Math.log10(st.rms)).toFixed(3), firstNZs: first < 0 ? null : +(Math.floor(first / w.fmt.ch) / w.fmt.sr).toFixed(4), lastNZs: last < 0 ? null : +(Math.floor(last / w.fmt.ch) / w.fmt.sr).toFixed(4), fsMax } };
}

// max |a-b| in integer LSB over frame ranges; ranges = [[f0,f1),...]
function maxDiff(a, b, ranges) {
  let m = 0, at = -1;
  const ch = a.fmt.ch;
  for (const [f0, f1] of ranges) for (let f = f0; f < f1; f++) for (let c = 0; c < ch; c++) { const i = f * ch + c; if (i >= a.n || i >= b.n) continue; const d = Math.abs(a.read(i) - b.read(i)); if (d > m) { m = d; at = f; } }
  return { maxLsb: m, atFrame: at };
}

function windowRms(w, s0, s1) {
  const ch = w.fmt.ch, sr = w.fmt.sr, fsMax = Math.pow(2, w.fmt.bits - 1);
  let sum = 0, n = 0, peak = 0;
  for (let f = Math.max(0, Math.round(s0 * sr)); f < Math.min(w.frames, Math.round(s1 * sr)); f++) for (let c = 0; c < ch; c++) { const v = w.read(f * ch + c) / fsMax; sum += v * v; n++; if (Math.abs(v) > peak) peak = Math.abs(v); }
  const rms = Math.sqrt(sum / Math.max(1, n));
  return { n, rms, rmsDb: +(20 * Math.log10(rms || 1e-12)).toFixed(2), peakDb: +(20 * Math.log10(peak || 1e-12)).toFixed(2) };
}

async function keySteps(p, key, n) {
  await p.locator(F).focus();
  for (let k = 0; k < n; k++) { await p.keyboard.press(key); await L.sleep(15); }
  await L.blur(p);
  await L.sleep(300);
  return readF(p);
}

async function dblReset(p) {
  const r = await readF(p);
  await p.mouse.dblclick(r.box.x + ((r.v + 60) / 84) * r.box.w, r.box.y + r.box.h / 2);
  await L.sleep(300);
  await L.blur(p);
  await L.sleep(200);
  return readF(p);
}

async function setMute(p, lane, on) {
  const cur = await p.evaluate((lane) => document.querySelector(`[data-track-id=${lane}] button[aria-label^="Mute"]`).getAttribute('aria-pressed'), lane);
  if ((cur === 'true') !== on) { await p.click(`[data-track-id=${lane}] button[aria-label^="Mute"]`); await L.sleep(200); }
  await L.blur(p);
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const tag = `exp-${VP.width}`;
  const o = await L.openStudio(browser, VP, tag, net);
  const p = o.page;
  const out = { utc: new Date().toISOString(), vp: VP, steps: [], exports: {}, rows: {} };
  const save = () => { out.net = net.map((n) => ({ ...n, downloads: n.downloads.map((d) => ({ name: d.name, size: d.size })) })); L.save(L.OUT, `${tag}.json`, out); };
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) out.steps.push(await L.addAt(p, s, ln, t));
  await L.blur(p);
  const clips = await L.clipsDom(p);
  const stems = clips.find((c) => c.lane === 'stems');
  const music = clips.find((c) => c.lane === 'music');
  out.clips = clips;
  await L.selectClip(p, stems.id);
  const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded'));
  if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); }
  await L.blur(p);
  out.detail = await L.detailInfo(p);
  const ex1 = log => log;
  const log = o.log;
  const A = {};
  const run = async (name, fn) => { const r = await fn(); out.exports[name] = { ...r.e, info: undefined }; out.exports[name].info = r.info; save(); return r; };
  const exp = async (name) => { const e = await doExport(p, log, name); const a = analyse(e.file); A[name] = a.w; out.exports[name] = { ...e, info: a.info, fader: await readF(p) }; console.log(name, JSON.stringify(a.info), 'overload:', e.overload); save(); return a.info; };

  // G-T1 baseline: stems only at 0.0
  await setMute(p, 'music', true); await setMute(p, 'sfx', true);
  const b = await exp('T1-stems-0');
  let baseName = 'T1-stems-0';
  let baseLane = 'stems';
  let baseValid = b.full === 0 && !out.exports['T1-stems-0'].overload;
  out.rows['G-T1'] = { valid: baseValid, peakDb: b.peakDb, rmsDb: b.rmsDb, full: b.full, overload: out.exports['T1-stems-0'].overload, stemsSpanS: [b.firstNZs, b.lastNZs], frames: b.frames, sr: b.sr, bits: b.bits, ch: b.ch, pass: baseValid && b.nan === 0 && b.bits === 24 };
  save();

  // G-T2: −6.0 via keyboard (60 × ArrowLeft)
  const r6 = await keySteps(p, 'ArrowLeft', 60);
  out.steps.push({ set: 'minus6', fader: r6 });
  const m6 = await exp('T2-stems-m6');
  const pr = m6.peak / b.peak, rr = m6.rms / b.rms;
  out.rows['G-T2'] = { faderValue: r6.v, peakRatio: +pr.toFixed(5), rmsRatio: +rr.toFixed(5), target: 0.50119, full: m6.full, pass: Math.abs(r6.v + 6) < 1e-9 && Math.abs(pr / 0.501187 - 1) <= 0.005 && Math.abs(rr / 0.501187 - 1) <= 0.005 && baseValid };
  if (b.peakDb <= -4) {
    const r3 = await keySteps(p, 'ArrowRight', 90);
    out.steps.push({ set: 'plus3', fader: r3 });
    const p3 = await exp('T2-stems-p3');
    const pr3 = p3.peak / b.peak, rr3 = p3.rms / b.rms;
    out.rows['G-T2'].plus3 = { faderValue: r3.v, peakRatio: +pr3.toFixed(5), rmsRatio: +rr3.toFixed(5), target: 1.41254, full: p3.full, overload: out.exports['T2-stems-p3'].overload, pass: Math.abs(r3.v - 3) < 1e-9 && Math.abs(pr3 / 1.412538 - 1) <= 0.005 && Math.abs(rr3 / 1.412538 - 1) <= 0.005 && p3.full === 0 };
    out.rows['G-T2'].pass = out.rows['G-T2'].pass && out.rows['G-T2'].plus3.pass;
  } else out.rows['G-T2'].plus3 = 'not run: source peak > −4 dBFS';
  save();

  // G-T8: music + stems; baseline stems 0, then stems −6
  const r0 = await dblReset(p);
  out.steps.push({ set: 'reset0', fader: r0 });
  await setMute(p, 'music', false);
  const t8a = await exp('T8-music-stems0');
  const r6b = await keySteps(p, 'ArrowLeft', 60);
  const t8b = await exp('T8-music-stemsm6');
  const sr = b.sr;
  const s0 = Math.floor(stems.start * sr), s1 = Math.ceil((b.lastNZs + 0.001) * sr);
  const outside = [[0, s0], [s1, Math.min(A['T8-music-stems0'].frames, A['T8-music-stemsm6'].frames)]];
  const d8 = maxDiff(A['T8-music-stems0'], A['T8-music-stemsm6'], outside);
  const d8in = maxDiff(A['T8-music-stems0'], A['T8-music-stemsm6'], [[s0, s1]]);
  const musicRegion = windowRms(A['T8-music-stems0'], 0, stems.start);
  out.rows['G-T8'] = { faderValue: r6b.v, outsideFrames: outside, ...d8, insideMaxLsb: d8in.maxLsb, musicRegionRmsDb: musicRegion.rmsDb, musicFull: t8a.full, pass: d8.maxLsb <= 1 && musicRegion.rms > 1e-4 && Math.abs(r6b.v + 6) < 1e-9 && d8in.maxLsb > 1 };
  save();

  // G-NONDESTRUCT: stems only, −8.0 via field, reset by double-click, export, compare to G-T1
  await setMute(p, 'music', true);
  await p.fill(FIELD, '-8'); await p.locator(FIELD).press('Enter'); await L.sleep(300); await L.blur(p);
  const r8 = await readF(p);
  const rr0 = await dblReset(p);
  const nd = await exp('ND-reset');
  const dnd = maxDiff(A['T1-stems-0'], A['ND-reset'], [[0, Math.max(A['T1-stems-0'].frames, A['ND-reset'].frames)]]);
  out.rows['G-NONDESTRUCT'] = { setTo: r8.v, afterReset: rr0.v, sameFrames: A['T1-stems-0'].frames === A['ND-reset'].frames, ...dnd, pass: Math.abs(r8.v + 8) < 1e-9 && Math.abs(rr0.v) < 1e-9 && dnd.maxLsb <= 1 && A['T1-stems-0'].frames === A['ND-reset'].frames };
  save();

  // G-T9: fade-out 2 s on the stems clip, gain 0.0
  const z = await p.evaluate(() => +/([\d.]+)/.exec(document.querySelector('[data-testid=arrangement-zoom-readout]').textContent)[1]);
  const cl = p.locator(`[data-clip-id="${stems.id}"]`);
  const cb = await cl.boundingBox();
  await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height * 0.6, { steps: 3 }); await L.sleep(300);
  const hb = await p.locator(`[data-clip-id="${stems.id}"] [data-testid=arrangement-clip-fade-out-handle]`).boundingBox();
  const hx = hb.x + hb.width / 2, hy = hb.y + hb.height / 2;
  await p.mouse.move(hx, hy, { steps: 2 }); await L.sleep(100);
  await p.mouse.down();
  await p.mouse.move(hx - z, hy, { steps: 6 }); await p.mouse.move(hx - 2 * z, hy, { steps: 6 });
  await L.sleep(150); await p.mouse.up(); await L.sleep(400);
  const fo = await p.evaluate((id) => document.querySelector(`[data-clip-id="${id}"]`).dataset.fadeOut, stems.id);
  await L.blur(p);
  const r9 = await readF(p);
  const t9 = await exp('T9-fadeout');
  const end = b.lastNZs;
  const clipEnd = stems.start + (b.lastNZs - stems.start);
  const last10 = windowRms(A['T9-fadeout'], clipEnd - 0.010, clipEnd + 1 / sr);
  const last10base = windowRms(A['T1-stems-0'], clipEnd - 0.010, clipEnd + 1 / sr);
  const r9b = await readF(p);
  out.rows['G-T9'] = { pps: z, fadeOut: fo, clipEndS: +clipEnd.toFixed(4), last10: last10, last10Baseline: last10base, lastNZ: t9.lastNZs, faderBefore: r9.v, faderAfter: r9b.v, field: r9b.field, text: r9b.text, pass: Math.abs(+fo - 2) <= 0.05 && last10.rmsDb <= -60 && Math.abs(r9b.v) < 1e-9 && /^0(\.0)?$/.test(r9b.field) };
  save();
  await p.screenshot({ path: path.join(L.SHOTS, `export-final-${VP.width}.png`) });
  console.log(JSON.stringify(out.rows, null, 1));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
