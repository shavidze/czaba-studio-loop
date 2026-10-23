// EXPORT-REG round 94: node exp94.cjs 1280 (WAV range 4-9) | 1440 (MP3 project)
const X = require('./ext.cjs'); const { sleep } = X; const fs = require('fs');
const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const secs = (s) => { const m = /(\d+):(\d+)\.(\d+)/.exec(s); return +m[1] * 60 + +m[2] + +m[3] / 1000; };
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, `exp${W}`); const au = []; const hyd = [];
  p.on('request', (q) => { if (/\.(mp3|wav|ogg|flac|m4a)(\?|$)/.test(q.url())) au.push(q.url().replace(X.BASE, '')); });
  p.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) hyd.push(m.text().slice(0, 200)); });
  const R = { vp: `${vp.width}x${vp.height}` };
  const proj = (await X.setup(p, 0)).replace(/\s+/g, ' ').trim(); R.projLabel = proj; const END = /—\s*([\d:.]+)/.exec(proj)[1]; R.END = END;
  if (W === 1280) { await X.closeDlg(p); R.readout = await X.rangeDrag(p, 'music', 4, 9); await X.openDlg(p); R.dlg = await X.dlg(p); await X.selectFormat(p, 'wav'); R.expectName = 'czaba-studio-lab-range.wav'; R.expectMsg = X.wavMsg(X.lenR(4, 9)); R.expectSec = 5; }
  else { R.dlg = await X.dlg(p); await X.selectFormat(p, 'mp3'); R.expectName = 'czaba-studio-lab.mp3'; R.expectMsg = X.mp3Msg(END); R.expectSec = secs(END); }
  R.unpkgBeforeExport = S.unpkg.length;
  const r = await X.exportFull(p); R.exportText = r.exportText; R.msg = r.final.status; R.alert = r.final.alert; R.ms = r.ms;
  R.files = r.files.map((f) => ({ name: f.name, size: f.size, file: f.file }));
  for (const f of R.files) {
    if (/\.wav$/.test(f.name)) { const w = X.wavInfo(f.file); f.wav = { riff: w.riff, wave: w.wave, tag: w.tag, ch: w.ch, sr: w.sr, bits: w.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: w.nan, full: w.full, peak: +w.peak.toFixed(4), rms: +w.rms.toFixed(5) }; }
    if (/\.mp3$/.test(f.name)) { f.hdr = fs.readFileSync(f.file).subarray(0, 4).toString('hex'); f.mp3 = await X.mp3Decode(p, f.file); }
  }
  await p.screenshot({ path: `${X.SHOTS}/export-done-${R.vp}.png` });
  const f = R.files[0] || {};
  R.checks = { one: R.files.length === 1, name: f.name === R.expectName, msg: R.msg === R.expectMsg,
    data: W === 1280 ? (!!f.wav && f.wav.riff === 'RIFF' && f.wav.wave === 'WAVE' && f.wav.tag === 1 && f.wav.bits === 24 && f.wav.sr === 48000 && f.wav.ch === 2 && f.wav.nan === 0 && f.wav.peak > 0.001 && Math.abs(f.wav.seconds - 5) < 0.002)
      : (!!f.mp3 && f.mp3.sr === 48000 && f.mp3.ch === 2 && f.mp3.peak > 0.001 && Math.abs(f.mp3.dur - R.expectSec) < 0.1),
    unpkgOnlyAfterMp3Click: R.unpkgBeforeExport === 0 && (W === 1280 ? S.unpkg.length === 0 : true),
    net: S.forbidden.length === 0 && S.authHeaders.length === 0, hyd: hyd.length === 0, errors: S.errors.length === 0 };
  R.pass = Object.values(R.checks).every(Boolean);
  R.unpkg = S.unpkg; R.audio = au; R.errors = S.errors; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.third = [...new Set(S.thirdParty)]; R.hyd = hyd;
  X.save(`export-${R.vp}.json`, R); console.log(JSON.stringify(R, null, 1)); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
