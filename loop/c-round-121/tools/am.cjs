// C round 121 — WZ-AUDIO and WZ-METER (1440×900). Usage: node am.cjs <audio|meter> <run#>
// Criteria fixed before running (current-task.md §5):
// AUDIO: stems only (music+sfx muted, no video = round-120 isolation). WAV export at 1× and 2×: same header/frames,
//        max |Δ| ≤ 1 LSB (24-bit), peak and RMS ratio 1.0000 ± 0.0001, 0 NaN.
// METER: loop 2.5–4.5 s, music+sfx muted, per-iteration peak of the real output tap: 2 iterations at 1×, zoom 2× during
//        play, 2 more; paired equality ±0.1 dB; same createBufferSource count per iteration; playhead keeps looping.
const L = require('./lib.cjs');
const W = require('./wav.cjs');
const fs = require('fs');
const path = require('path');
const VP = { width: 1440, height: 900 };
const MODE = process.argv[2];
const RUN = +(process.argv[3] || 1);
const SEL = '[data-testid=arrangement-waveform-zoom]';
const LEVELS = ['0.5', '1', '2', '4', '8'];

async function chooseZoom(p, level, keepFocus) {
  await L.blur(p);
  const cur = await p.$eval(SEL, (s) => s.value);
  const diff = LEVELS.indexOf(String(level)) - LEVELS.indexOf(cur);
  const b = await p.locator(SEL).boundingBox();
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  await L.sleep(250);
  for (let i = 0; i < Math.abs(diff); i++) { await p.keyboard.press(diff > 0 ? 'ArrowDown' : 'ArrowUp'); await L.sleep(80); }
  await p.keyboard.press('Enter');
  await L.sleep(300);
  let value = await p.$eval(SEL, (s) => s.value);
  let method = 'mouse-click-opens-popup+keyboard-pick';
  if (value !== String(level)) { await p.selectOption(SEL, String(level)); await L.sleep(300); value = await p.$eval(SEL, (s) => s.value); method = 'FALLBACK selectOption'; }
  if (!keepFocus) await L.blur(p);
  return { method, value, status: await L.status(p) };
}

function tap() {
  const W = window;
  W.__tap = { an: new Map(), S: [], on: false };
  const oc = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    const r = oc.call(this, dest, ...rest);
    try { if (dest instanceof AudioDestinationNode) { const c = this.context; let an = W.__tap.an.get(c); if (!an) { an = c.createAnalyser(); an.fftSize = 2048; W.__tap.an.set(c, an); } oc.call(this, an); } } catch (e) { W.__tap.err = String(e); }
    return r;
  };
  W.__tapStart = () => {
    W.__tap.on = true;
    const buf = new Float32Array(2048);
    const tick = () => {
      if (!W.__tap.on) return;
      let peak = 0;
      for (const an of W.__tap.an.values()) { an.getFloatTimeDomainData(buf); for (let i = 0; i < buf.length; i++) { const a = Math.abs(buf[i]); if (a > peak) peak = a; } }
      const h = document.querySelector('[data-testid=arrangement-playhead-handle]');
      const m = document.querySelector('[data-track-id="stems"] [data-testid=arrangement-track-meter]');
      W.__tap.S.push({ t: performance.now(), peak, pos: h ? +h.getAttribute('aria-valuenow') : NaN, meter: m ? m.getAttribute('data-peak') : null, zoom: document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom });
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
  for (const ln of ['music', 'sfx']) { await p.click(`[data-track-id=${ln}] button[aria-label^="Mute"]`); await L.sleep(150); }
  await L.blur(p);
  return o;
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
  await p.screenshot({ path: path.join(L.SHOTS, `WZ-AUDIO-${name}-1440-${RUN}.png`) });
  await p.locator('button', { hasText: 'დახურვა' }).last().click();
  await L.sleep(400);
  const rec = log.downloads[n0];
  if (!rec || !rec.file) throw new Error('no download for ' + name);
  const dst = path.join(L.OUT, `exp-1440-${RUN}-${name}.wav`);
  fs.renameSync(rec.file, dst);
  const buf = fs.readFileSync(dst);
  const w = W.parse(buf);
  const st = W.stats(w);
  return { w, buf, info: { name, size: buf.length, overload, tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, peak: st.peak, rms: st.rms } };
}

async function audio(browser, net) {
  const o = await setup(browser, net, `audio-1440-${RUN}`);
  const p = o.page;
  const a = await doExport(p, o.log, 'z1');
  const c = await chooseZoom(p, 2);
  const attr = await p.evaluate(() => document.querySelector('[data-testid=arrangement-grid-control]').dataset.waveformZoom);
  const b = await doExport(p, o.log, 'z2');
  const maxDiff = W.cmp(a.w, b.w);
  const headerSame = a.buf.subarray(0, 44).equals(b.buf.subarray(0, 44));
  const bytesSame = a.buf.equals(b.buf);
  const pr = b.info.peak / a.info.peak, rr = b.info.rms / a.info.rms;
  const res = { a: a.info, b: b.info, choose: c, attrAtSecondExport: attr, maxDiffLsb: maxDiff, headerSame, bytesSame, peakRatio: +pr.toFixed(6), rmsRatio: +rr.toFixed(6) };
  res.pass = c.value === '2' && attr === '2' && a.info.frames === b.info.frames && a.info.sr === b.info.sr && a.info.bits === b.info.bits && a.info.bits === 24 && a.info.ch === b.info.ch && maxDiff <= 1 && Math.abs(pr - 1) <= 1e-4 && Math.abs(rr - 1) <= 1e-4 && a.info.nan === 0 && b.info.nan === 0 && a.info.peak > 0.01;
  return res;
}

async function meter(browser, net) {
  const o = await setup(browser, net, `meter-1440-${RUN}`, { extraInit: tap });
  const p = o.page;
  const stems = (await L.clipsDom(p)).find((c) => c.lane === 'stems');
  // time selection on the stems waveform area 2.5→4.5 s, then Ctrl+L
  const g = await L.geo(p);
  const wb = await p.locator(`[data-clip-id="${stems.id}"] [data-testid="arrangement-clip-waveform"]`).boundingBox();
  const y = wb.y + wb.height * 0.6;
  const x0 = g.rl + 2.5 * g.pps, x1 = g.rl + 4.5 * g.pps;
  await p.mouse.move(x0, y); await p.mouse.down(); await p.mouse.move((x0 + x1) / 2, y, { steps: 6 }); await p.mouse.move(x1, y, { steps: 6 }); await L.sleep(100); await p.mouse.up(); await L.sleep(400);
  await L.blur(p); await p.keyboard.press('Control+l'); await L.sleep(500);
  const loop = await p.evaluate(() => { const lb = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === '↻ Loop'); return { times: document.querySelector('[data-testid=arrangement-loop-times]')?.textContent ?? null, pressed: lb ? lb.getAttribute('aria-pressed') : null }; });
  await L.seekTo(p, 2.5);
  await p.evaluate(() => { window.__hStart(); window.__tapStart(); });
  await p.click('button[aria-label="Play"]');
  await L.blur(p);
  const wraps = () => p.evaluate(() => { const S = window.__tap.S; let n = 0; for (let i = 1; i < S.length; i++) if (S[i].pos < S[i - 1].pos - 0.5) n++; return n; });
  const waitWraps = async (n, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if ((await wraps()) >= n) return true; await L.sleep(100); } return false; };
  const ok2 = await waitWraps(3, 15000);
  await L.sleep(300);
  const tZ0 = await p.evaluate(() => performance.now());
  const c = await chooseZoom(p, 2);
  const tZ1 = await p.evaluate(() => performance.now());
  const w0 = await wraps();
  const ok4 = await waitWraps(w0 + 3, 20000);
  const playing = await p.evaluate(() => !!document.querySelector('button[aria-label="Pause"]'));
  await p.screenshot({ path: path.join(L.SHOTS, `WZ-METER-2x-1440-${RUN}.png`) });
  await p.evaluate(() => { window.__tap.on = false; window.__hStop(); });
  const data = await p.evaluate(() => ({ S: window.__tap.S, cbsT: window.__h.cbsT, nAn: window.__tap.an.size, err: window.__tap.err || null }));
  await p.click('button[aria-label="Pause"]').catch(() => {});
  const S = data.S;
  const wrapT = [];
  for (let i = 1; i < S.length; i++) if (S[i].pos < S[i - 1].pos - 0.5) wrapT.push({ t: S[i].t, from: S[i - 1].pos, to: S[i].pos });
  const db = (x) => (x > 0 ? 20 * Math.log10(x) : -200);
  const iters = [];
  for (let k = 0; k + 1 < wrapT.length; k++) {
    const a = wrapT[k].t, b = wrapT[k + 1].t;
    const seg = S.filter((s) => s.t >= a && s.t < b);
    const meters = seg.map((s) => Number(String(s.meter || '').replace(/−/g, '-'))).filter(Number.isFinite);
    iters.push({ k, start: +a.toFixed(0), durMs: +(b - a).toFixed(0), zoom: b <= tZ0 ? '1' : a >= tZ1 ? '2' : 'mixed', peakDb: +db(Math.max(...seg.map((s) => s.peak))).toFixed(3), cbs: data.cbsT.filter((t) => t >= a && t < b).length, n: seg.length, meterMax: meters.length ? Math.max(...meters) : null, meterSample: seg.slice(0, 3).map((s) => s.meter) });
  }
  const z1 = iters.filter((i) => i.zoom === '1').slice(-2), z2 = iters.filter((i) => i.zoom === '2').slice(0, 2);
  let mono = true; let stalls = 0;
  const P = S.filter((s) => Number.isFinite(s.pos));
  for (let i = 1; i < P.length; i++) { if (P[i].pos < P[i - 1].pos - 1e-9 && !(P[i].pos < P[i - 1].pos - 0.5)) mono = false; }
  // stall: pos unchanged for > 300 ms
  let last = P[0]; for (const s of P) { if (s.pos !== last.pos) last = s; else if (s.t - last.t > 300) { stalls++; last = s; } }
  const pairs = z1.length === 2 && z2.length === 2 ? [0, 1].map((i) => +(z2[i].peakDb - z1[i].peakDb).toFixed(3)) : null;
  const res = { loop, ok2, ok4, choose: c, zoomChangeMs: +(tZ1 - tZ0).toFixed(0), playingAtEnd: playing, wraps: wrapT.map((w) => ({ from: +w.from.toFixed(3), to: +w.to.toFixed(3) })), iters, z1, z2, pairsDb: pairs, cbsSame: z1.length === 2 && z2.length === 2 && new Set([...z1, ...z2].map((i) => i.cbs)).size === 1, monotonicWithinIter: mono, stalls, nAn: data.nAn, tapErr: data.err };
  res.pass = /2\.5|02\.500/.test(loop.times || '') && loop.pressed === 'true' && c.value === '2' && !!pairs && pairs.every((d) => Math.abs(d) <= 0.1) && res.cbsSame && playing && mono && stalls === 0 && z1.every((i) => i.peakDb > -60);
  return res;
}

(async () => {
  const browser = await L.launch();
  const net = [];
  const out = { utc: new Date().toISOString(), mode: MODE, run: RUN, chromium: browser.version() };
  try { out.row = MODE === 'audio' ? await audio(browser, net) : await meter(browser, net); } catch (e) { out.error = String(e).slice(0, 600); }
  out.net = net.map((n) => ({ ...n, downloads: (n.downloads || []).map((d) => ({ name: d.name, size: d.size })) }));
  L.save(L.OUT, `${MODE}-1440-${RUN}.json`, out);
  console.log(JSON.stringify({ row: out.row, error: out.error }, null, 0).slice(0, 3500));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
