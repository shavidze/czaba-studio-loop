// C round 120 — WG-PLAY, WG-AUDIO, WG-VIDEO. Usage: node extra.cjs <play|audio|video> <run#>   (1440×900)
// Criteria fixed before running: PLAY = 0 createBufferSource between press and release, playhead monotonic and advancing,
// still playing, ≥2 distinct stems drawings during the drag and the final drawing ratio-correct for the stored dB.
// AUDIO = peak and RMS ratio (−6 vs 0 dB, stems only) 0.501187 ± 0.5 %, 24-bit, 0 full-scale, 0 NaN, same frames.
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const VP = { width: 1440, height: 900 };
const MODE = process.argv[2];
const RUN = +(process.argv[3] || 1);
const F = '[data-testid=arrangement-detail-clip-gain-fader]';
const FIELD = '[data-testid=arrangement-detail-clip-gain-input]';
const sha = (s) => crypto.createHash('sha256').update(s || '').digest('hex').slice(0, 16);
const num = (s) => Number(String(s).replace(/−/g, '-').replace(/[^\d.+-]/g, ''));

function parseD(d) { const re = /M(\d+) ([\d.]+)h1V([\d.]+)h-1Z/g; const c = []; let m; while ((m = re.exec(d))) c.push({ y: +m[2], ys: m[2], y2: +m[3] }); return c; }
function ratio(d0, d1, s) {
  const a = parseD(d0), b = parseD(d1); const r = { s: +s.toFixed(6), judged: 0, viol: 0 };
  if (a.length !== b.length || !a.length) return { ...r, valid: false };
  for (let i = 0; i < a.length; i++) {
    const h0 = 1 - a[i].y, h = 1 - b[i].y;
    if (h0 >= 0.021 && h0 <= 0.999 && s * h0 >= 0.021 && s * h0 <= 0.999) { r.judged++; if (Math.abs(h - s * h0) > 0.0006 * (1 + s) + 1e-12) r.viol++; }
    else if (h0 <= 0.999 && s * (h0 - 0.0005) >= 1) { if (b[i].ys !== '0.000') r.viol++; }
    else if (s * (h0 + 0.0005) < 0.02) { if (b[i].ys !== '0.980') r.viol++; }
  }
  r.valid = r.judged >= 10; r.pass = r.valid && r.viol === 0; return r;
}
const laneD = (p, id) => p.evaluate((id) => { const s = document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`); return s ? s.querySelector('path').getAttribute('d') : null; }, id);
const readG = (p) => p.evaluate(([F, FIELD]) => { const f = document.querySelector(F); const fi = document.querySelector(FIELD); const u = [...document.querySelectorAll('button')].find((x) => /^Undo/.test(x.getAttribute('title') || '')); const b = f.getBoundingClientRect(); return { v: +f.value, text: f.getAttribute('aria-valuetext'), field: fi.value, fieldDisabled: fi.disabled, faderDisabled: f.disabled, title: fi.title, box: { x: b.x, y: b.y, w: b.width, h: b.height }, undoTitle: u && u.getAttribute('title') }; }, [F, FIELD]);
async function setField(p, db) { await p.fill(FIELD, String(db)); await p.locator(FIELD).press('Enter'); await L.sleep(300); await L.blur(p); await L.sleep(250); return readG(p); }
async function ensureDetail(p) { const ex = await p.evaluate(() => document.querySelector('[data-testid=arrangement-detail-toggle]').getAttribute('aria-expanded')); if (ex !== 'true') { await p.click('[data-testid=arrangement-detail-toggle]'); await L.sleep(600); } await L.blur(p); }

function tap() {
  const W = window;
  W.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = oc.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const c = this.context; let an = W.__tap.an.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W.__tap.an.set(c, an); } oc.call(this, an); } } catch (e) { W.__tap.err = String(e); }
    return r;
  };
  W.__tapStart = (clipId) => {
    W.__tap.on = true;
    const buf = new Float32Array(2048);
    const tick = () => {
      if (!W.__tap.on) return;
      let peak = 0;
      for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const f = document.querySelector('[data-testid=arrangement-detail-clip-gain-fader]');
      const s = document.querySelector(`[data-clip-id="${clipId}"] [data-testid="arrangement-clip-waveform"] path`);
      W.__tap.S.push({ t: performance.now(), peak, pos: h ? +h.getAttribute('aria-valuenow') : NaN, cbs: W.__h.cbs, fv: f ? +f.value : null, d: s ? s.getAttribute('d') : null });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
}

async function setup(browser, net, tag, opts) {
  const o = await L.openStudio(browser, VP, tag, net, opts);
  const p = o.page;
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-middle-east', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await L.blur(p);
  return o;
}

async function play(browser, net) {
  const tag = `play-1440-${RUN}`;
  const o = await setup(browser, net, tag, { extraInit: tap });
  const p = o.page;
  for (const ln of ['music', 'sfx']) { await p.click(`[data-track-id=${ln}] button[aria-label^="Mute"]`); await L.sleep(150); }
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems');
  await L.selectClip(p, stems.id); await ensureDetail(p);
  const d0 = await laneD(p, stems.id);
  const seekPos = await L.seekTo(p, 2.05);
  await p.evaluate((id) => { window.__hStart(); window.__tapStart(id); }, stems.id);
  await p.click('button[aria-label="Play"]');
  await L.blur(p);
  await L.sleep(900);
  const fb = await p.locator(F).boundingBox();
  const v0 = +(await p.locator(F).inputValue());
  const x0 = fb.x + ((v0 + 60) / 84) * fb.width, y = fb.y + fb.height / 2;
  await p.mouse.move(x0, y);
  const tPress = await p.evaluate(() => performance.now());
  await p.mouse.down();
  for (let k = 1; k <= 20; k++) { await p.mouse.move(x0 - k, y); await L.sleep(25); }
  await L.sleep(60);
  await p.mouse.up();
  const tRel = await p.evaluate(() => performance.now());
  await L.sleep(1000);
  const tEnd = await p.evaluate(() => performance.now());
  const playingAtEnd = await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]'));
  await p.screenshot({ path: path.join(L.SHOTS, `WG-PLAY-1440-${RUN}.png`) });
  await p.evaluate(() => { window.__tap.on = false; window.__hStop(); });
  const data = await p.evaluate(() => ({ S: window.__tap.S, samples: window.__h.samples, cbsT: window.__h.cbsT, nAn: window.__tap.an.size }));
  await p.click('button[aria-label="Pause"]').catch(() => {});
  await L.sleep(200); await L.blur(p);
  const g = await readG(p);
  const dEnd = await laneD(p, stems.id);
  const S = data.S;
  const during = S.filter((s) => s.t >= tPress && s.t <= tRel + 50);
  const distinctD = new Set(during.map((s) => s.d)).size;
  const cbsDuring = data.cbsT.filter((t) => t >= tPress && t <= tRel + 30).length;
  const pos = data.samples.filter((s) => Number.isFinite(s.pos) && s.t >= tPress - 400 && s.t <= tEnd).map((s) => s.pos);
  let mono = true; for (let i = 1; i < pos.length; i++) if (pos[i] < pos[i - 1] - 1e-9) mono = false;
  const db = (x) => (x > 0 ? 20 * Math.log10(x) : -200);
  const pk = (a, b) => Math.max(0, ...S.filter((s) => s.t >= a && s.t < b).map((s) => s.peak));
  // mid-drag samples: each sample's d vs its own fader value
  const midChecks = during.filter((s, i) => i % 3 === 0 && s.d && s.fv !== null).map((s) => ratio(d0, s.d, 10 ** (s.fv / 20)));
  const midChecked = midChecks.filter((r) => r.valid);
  const res = { seekPos, v0, vEnd: g.v, text: g.text, undo: g.undoTitle, distinctD, nDuring: during.length, cbsDuring, cbsTotal: data.cbsT.length, posFirst: pos[0], posLast: pos.at(-1), monotonic: mono, playingAtEnd, preDb: +db(pk(tPress - 400, tPress - 50)).toFixed(2), postDb: +db(pk(tRel + 150, tRel + 550)).toFixed(2), endRatio: ratio(d0, dEnd, 10 ** (g.v / 20)), midValid: midChecked.length, midViolating: midChecked.filter((r) => !r.pass).length, faderTrace: [...new Set(during.map((s) => s.fv))].join(',') };
  res.pass = cbsDuring === 0 && mono && playingAtEnd && res.posLast > res.posFirst && distinctD >= 2 && res.endRatio.pass && res.midViolating === 0 && /Clip Gain/.test(g.undoTitle || '');
  return res;
}

async function doExport(p, log, name) {
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
  const overload = await p.evaluate(() => { const o = document.querySelector('[data-testid=arrangement-export-overload]'); return o ? o.textContent.trim() : null; });
  await p.screenshot({ path: path.join(L.SHOTS, `WG-AUDIO-${name}-1440.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) throw new Error('no download for ' + name);
  const dst = path.join(L.OUT, `exp-1440-${name}.wav`);
  fs.renameSync(rec.file, dst);
  const w = W.parse(fs.readFileSync(dst));
  const st = W.stats(w);
  return { name, size: fs.statSync(dst).size, overload, tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, peak: st.peak, rms: st.rms, peakDb: +(20 * Math.log10(st.peak)).toFixed(3), rmsDb: +(20 * Math.log10(st.rms)).toFixed(3) };
}

async function audio(browser, net) {
  const tag = `audio-1440-${RUN}`;
  const o = await setup(browser, net, tag);
  const p = o.page;
  for (const ln of ['music', 'sfx']) { await p.click(`[data-track-id=${ln}] button[aria-label^="Mute"]`); await L.sleep(150); }
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems');
  await L.selectClip(p, stems.id); await ensureDetail(p);
  const a = await doExport(p, o.log, 'stems-0');
  const g6 = await setField(p, -6);
  const d6 = await laneD(p, stems.id);
  const b = await doExport(p, o.log, 'stems-m6');
  const pr = b.peak / a.peak, rr = b.rms / a.rms;
  const res = { a, b, fader: g6.v, field: g6.field, drawingPresent: !!d6, peakRatio: +pr.toFixed(6), rmsRatio: +rr.toFixed(6), target: 0.501187 };
  res.pass = g6.v === -6 && Math.abs(pr / 0.501187 - 1) <= 0.005 && Math.abs(rr / 0.501187 - 1) <= 0.005 && a.bits === 24 && b.bits === 24 && a.full === 0 && b.full === 0 && a.nan === 0 && b.nan === 0 && a.frames === b.frames && !a.overload && !b.overload;
  return res;
}

async function video(browser, net) {
  const tag = `video-1440-${RUN}`;
  const o = await setup(browser, net, tag);
  const p = o.page;
  await L.loadVideo(p, 'beeps-6s-vp9-opus.webm');
  const vid = (await L.clipsDom(p)).find((c) => c.kind === 'video');
  const vwave0 = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); const s = e.querySelector('[data-testid="arrangement-clip-waveform"]'); return { svg: !!s, d: s ? s.querySelector('path').getAttribute('d') : null, anySvgPath: e.querySelectorAll('svg path').length }; }, vid.id);
  await L.selectClip(p, vid.id); await ensureDetail(p);
  const g = await readG(p);
  const reason = await p.evaluate(() => { const r = document.querySelector('[data-testid=arrangement-detail-clip-gain-reason]'); return r ? r.textContent.trim() : null; });
  const detail = await p.evaluate(() => { const c = document.querySelector('[data-testid="arrangement-detail-waveform"]'); return c ? { svg: !!c.querySelector('svg'), text: c.textContent.replace(/\s+/g, ' ').slice(0, 160) } : null; });
  // attempt to type into the disabled field: must be refused; video drawing unchanged
  let typed = null;
  try { await p.locator(FIELD).fill('-6', { timeout: 1500 }); typed = 'filled'; } catch (e) { typed = 'refused'; }
  await L.blur(p);
  const vwave1 = await p.evaluate((id) => { const s = document.querySelector(`[data-clip-id="${id}"] [data-testid="arrangement-clip-waveform"]`); return s ? s.querySelector('path').getAttribute('d') : null; }, vid.id);
  const clip = await p.evaluate((id) => { const e = document.querySelector(`[data-clip-id="${id}"]`); return { gainAttr: e.getAttribute('data-clip-gain') }; }, vid.id);
  await p.locator('[data-testid=arrangement-detail-panel]').screenshot({ path: path.join(L.SHOTS, `WG-VIDEO-panel-1440-${RUN}.png`) });
  await p.screenshot({ path: path.join(L.SHOTS, `WG-VIDEO-1440-${RUN}.png`) });
  const res = { vid, lane: { svg: vwave0.svg, dHash: sha(vwave0.d), anySvgPath: vwave0.anySvgPath, unchangedAfterAttempt: vwave1 === vwave0.d }, gain: { fieldDisabled: g.fieldDisabled, faderDisabled: g.faderDisabled, field: g.field, title: g.title, text: g.text }, reason, detail, typed, clip };
  res.pass = g.fieldDisabled && g.faderDisabled && typed === 'refused' && /ვიდეო კლიპს Clip Gain არ აქვს/.test(reason || g.title || '') && res.lane.unchangedAfterAttempt;
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const out = { utc: new Date().toISOString(), mode: MODE, run: RUN, chromium: browser.version() };
  try {
    out.row = MODE === 'play' ? await play(browser, net) : MODE === 'audio' ? await audio(browser, net) : await video(browser, net);
  } catch (e) { out.error = String(e).slice(0, 600); }
  out.net = net.map((n) => ({ ...n, downloads: (n.downloads || []).map((d) => ({ name: d.name, size: d.size })) }));
  L.save(L.OUT, `${MODE}-1440-${RUN}.json`, out);
  console.log(JSON.stringify({ row: out.row, error: out.error }, null, 0).slice(0, 2500));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
