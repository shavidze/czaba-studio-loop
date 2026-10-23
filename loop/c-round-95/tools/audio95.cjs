// AUDIO-REG round 95 (1440x900): add only Middle East to the music lane, export the whole project as WAV,
// parse RIFF, then cross-correlate against the browser-decoded /middle-east.mp3 to prove the clip's real audio is present.
const X = require('./ext.cjs'); const { sleep } = X; const fs = require('fs');
const W = require('./wav.cjs');
const vp = { width: 1440, height: 900 };
(async () => {
  const R = { vp: '1440x900', hyd: [], audio: {} };
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, 'audio1440');
  p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) R.hyd.push(m.text().slice(0, 200)); });
  p.on('request', (q) => { const u = q.url(); if (/\.(mp3|wav)(\?|$)/.test(u)) { const k = u.replace(X.BASE, ''); R.audio[k] = (R.audio[k] || 0) + 1; } });
  await p.goto(X.URL, { waitUntil: 'domcontentloaded' });
  await p.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 120000 });
  R.status = await X.waitStatus(p, (s) => s === X.READY);
  await X.decline(p);
  // add via keyboard: select music lane is the default active lane; select row, press Enter
  const o = p.locator('[role=option][data-source-id="demo-middle-east"]'); await o.scrollIntoViewIfNeeded(); await o.click(); await sleep(300);
  await p.keyboard.press('Enter'); await sleep(1200);
  R.clips = await p.$$eval('[data-clip-id]', (els) => els.map((e) => { const r = e.getBoundingClientRect(); return { lane: e.closest('[data-track-id]').getAttribute('data-track-id'), x: Math.round(r.x), w: Math.round(r.width), t: e.innerText.replace(/\s+/g, ' ').slice(0, 60) }; }));
  R.statusAfterAdd = await X.status(p);
  await p.screenshot({ path: `${X.SHOTS}/audio-added-1440x900.png` });
  R.projLabel = (await X.openDlg(p)).replace(/\s+/g, ' ').trim();
  await X.selectFormat(p, 'wav');
  const r = await X.exportFull(p); R.msg = r.final.status; R.alert = r.final.alert; R.ms = r.ms;
  R.files = r.files.map((f) => ({ name: f.name, size: f.size, file: f.file }));
  await p.screenshot({ path: `${X.SHOTS}/audio-export-done-1440x900.png` });
  const f = R.files[0];
  if (f && /\.wav$/.test(f.name)) {
    const buf = fs.readFileSync(f.file); const w = W.parse(buf); const st = W.stats(w);
    R.wav = { riff: w.riff, wave: buf.toString('ascii', 8, 12), tag: w.fmt.tag, ch: w.fmt.ch, sr: w.fmt.sr, bits: w.fmt.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: st.nan, full: st.full, peak: +st.peak.toFixed(4), rms: +st.rms.toFixed(5) };
    // reference: decode the real source file in-page at 48 kHz, return mono 4 s window from 10 s
    const ref = await p.evaluate(async () => { const a = await (await fetch('/middle-east.mp3')).arrayBuffer(); const ac = new OfflineAudioContext(2, 48000, 48000); const d = await ac.decodeAudioData(a); const l = d.getChannelData(0), r = d.numberOfChannels > 1 ? d.getChannelData(1) : l; const s0 = 10 * 48000, n = 4 * 48000; const out = []; for (let i = 0; i < n; i += 4) out.push((l[s0 + i] + r[s0 + i]) / 2); return { dur: d.duration, sr: d.sampleRate, ch: d.numberOfChannels, win: out }; });
    R.refDur = +ref.dur.toFixed(4);
    // export mono, decimated by 4, around 10 s with +-2 s search
    const fsc = Math.pow(2, w.fmt.bits - 1);
    const mono = (i) => (w.read(i * 2) + w.read(i * 2 + 1)) / 2 / fsc;
    const refW = ref.win; const n = refW.length;
    let best = { c: -2, lagS: null };
    for (let lag = -2 * 12000; lag <= 2 * 12000; lag += 1) {
      const start = 10 * 12000 + lag; if (start < 0 || (start + n) * 4 >= w.frames) continue;
      let sxy = 0, sxx = 0, syy = 0;
      for (let i = 0; i < n; i += 3) { const x = refW[i], y = mono((start + i) * 4); sxy += x * y; sxx += x * x; syy += y * y; }
      const c = sxy / Math.sqrt(sxx * syy + 1e-20); if (c > best.c) best = { c: +c.toFixed(4), lagS: +(lag / 12000).toFixed(4) };
    }
    R.xcorr = best;
  }
  const w = R.wav || {};
  R.checks = { status: R.status === X.READY, oneMusicClip: R.clips.length === 1 && R.clips[0].lane === 'music', oneFile: R.files.length === 1,
    riffWave: w.riff === 'RIFF' && w.wave === 'WAVE', sr48: w.sr === 48000, ch2: w.ch === 2, rms: w.rms > 0, nan0: w.nan === 0,
    realAudio: !!R.xcorr && R.xcorr.c > 0.9, durationCoversClip: !!w.seconds && w.seconds >= R.refDur - 0.01,
    noHyd: R.hyd.length === 0, noErrors: S.errors.length === 0, net: S.forbidden.length === 0 && S.authHeaders.length === 0 };
  R.pass = Object.values(R.checks).every(Boolean);
  R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.unpkg = S.unpkg;
  X.save('audio-1440x900.json', R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
