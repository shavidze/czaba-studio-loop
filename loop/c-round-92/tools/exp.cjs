// EXPORT-NAMES: node exp.cjs 1280 | 1440
const X = require('./ext.cjs'); const { sleep, blur } = X; const fs = require('fs');
const W = +process.argv[2]; const vp = W === 1280 ? { width: 1280, height: 720 } : { width: 1440, height: 900 };
const audio = (p, arr) => p.on('request', (q) => { if (/\.(mp3|wav|ogg|flac|m4a)(\?|$)/.test(q.url())) arr.push(q.url().replace(X.BASE, '')); });
(async () => {
  const b = await X.launch(); const { ctx, page: p, S } = await X.newCtx(b, vp, `exp${W}`); const au = []; audio(p, au); const R = { vp: `${vp.width}x${vp.height}`, steps: [] };
  const projLabel = await X.setup(p, 0); R.projLabel = projLabel.replace(/\s+/g, ' ').trim();
  const END = /—\s*([\d:.]+)/.exec(R.projLabel)[1]; R.END = END;
  let firstMp3Click = null;
  async function run(name, format, scope, expectNames, expectMsg) {
    await X.selectFormat(p, format); if (scope) { await p.click(`[data-testid=arrangement-export-scope-${scope}]`); await sleep(200); }
    const d = await X.dlg(p);
    if (format !== 'wav' && firstMp3Click === null) firstMp3Click = Date.now();
    const r = await X.exportFull(p);
    const files = r.files.map((f) => { const o = { name: f.name, size: f.size }; if (/\.wav$/.test(f.name)) { const w = X.wavInfo(f.file); o.wav = { riff: w.riff, wave: w.wave, tag: w.tag, ch: w.ch, sr: w.sr, bits: w.bits, frames: w.frames, seconds: +w.seconds.toFixed(4), nan: w.nan, peak: +w.peak.toFixed(4), rms: +w.rms.toFixed(5) }; } return o; });
    for (const f of r.files.filter((f) => /\.mp3$/.test(f.name))) { const o = files.find((x) => x.name === f.name); o.hdr = fs.readFileSync(f.file).subarray(0, 4).toString('hex'); o.mp3 = await X.mp3Decode(p, f.file); }
    const names = files.map((f) => f.name);
    const wavOk = files.filter((f) => f.wav).every((f) => f.wav.riff === 'RIFF' && f.wav.wave === 'WAVE' && f.wav.tag === 1 && f.wav.bits === 24 && f.wav.sr === 48000 && f.wav.ch === 2 && f.wav.nan === 0 && f.wav.peak > 0.001);
    const mp3Ok = files.filter((f) => /\.mp3$/.test(f.name)).every((f) => f.mp3 && f.mp3.sr === 48000 && f.mp3.ch === 2 && f.mp3.peak > 0.001);
    const rec = { name, format, scopeChecked: d, names, expectNames, msg: r.final.status, expectMsg, files, ms: r.ms, pass: JSON.stringify(names) === JSON.stringify(expectNames) && r.final.status === expectMsg && wavOk && mp3Ok };
    R.steps.push(rec); console.log(JSON.stringify(rec)); return rec;
  }
  if (W === 1280) {
    await run('WAV-project', 'wav', 'project', ['czaba-studio-lab.wav'], X.wavMsg(END));
    await X.closeDlg(p); R.readout = await X.rangeDrag(p, 'music', 4, 9); await X.openDlg(p);
    await run('WAV-range', 'wav', null, ['czaba-studio-lab-range.wav'], X.wavMsg(X.lenR(4, 9)));
  } else {
    await run('MP3-project', 'mp3', 'project', ['czaba-studio-lab.mp3'], X.mp3Msg(END));
    await X.closeDlg(p); R.readout = await X.rangeDrag(p, 'music', 4, 9); await X.openDlg(p);
    await run('BOTH-range', 'both', null, ['czaba-studio-lab-range.wav', 'czaba-studio-lab-range.mp3'], X.bothMsg(X.lenR(4, 9)));
  }
  await p.screenshot({ path: `${X.SHOTS}/export-done-${R.vp}.png` });
  R.firstMp3Click = firstMp3Click; R.unpkg = S.unpkg; R.unpkgBeforeMp3 = S.unpkg.filter((u) => firstMp3Click === null || u.t < firstMp3Click).length;
  R.audio = [...new Set(au)]; R.errors = S.errors; R.noise = S.noise; R.forbidden = S.forbidden; R.auth = S.authHeaders; R.third = [...new Set(S.thirdParty)];
  R.pass = R.steps.every((s) => s.pass) && /00:04\.000 — 00:09\.000/.test(R.readout || '');
  X.save(`export-${R.vp}.json`, R); console.log(JSON.stringify({ pass: R.pass, readout: R.readout, unpkgBeforeMp3: R.unpkgBeforeMp3, audio: R.audio, errors: R.errors, forbidden: R.forbidden, auth: R.auth, third: R.third })); await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
