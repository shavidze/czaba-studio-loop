const X = require('./lib122.cjs'); const { L, sleep } = X;
const [ROW, vp] = process.argv.slice(2); const id = `${ROW}-${vp}`;
async function iso(p) {
  await L.setSnapOff(p);
  for (const [s, ln, t] of [['demo-synth-mix', 'music', 0], ['demo-stem-pulse', 'stems', 2], ['demo-soft-impact', 'sfx', 4]]) await L.addAt(p, s, ln, t);
  await X.muteLanes(p, ['music', 'sfx']);
  return (await L.clipsDom(p)).find((c) => c.lane === 'stems');
}
const ratio = (a, b) => ({ peak: +(b.peak / a.peak).toFixed(6), rms: +(b.rms / a.rms).toFixed(6), dbRms: +(20 * Math.log10(b.rms / a.rms)).toFixed(4) });
const info = (w) => ({ sha: w.sha, sr: w.fmt.sr, bits: w.fmt.bits, ch: w.fmt.ch, frames: w.frames, seconds: w.seconds, peak: +w.peak.toFixed(6), rms: +w.rms.toFixed(6), nan: w.nan });
const rows = {
  async 'RG-13'(p, res, log) {
    const st = await iso(p);
    const e0 = await X.exportWav(p, log, `${res.id}-0dB`); const w0 = X.wav(e0.files[0]);
    await L.selectClip(p, st.id); res.detailWas = await X.openDetail(p);
    const inp = p.locator('[data-testid=arrangement-detail-clip-gain-input]'); await inp.click(); await inp.fill('+6'); await p.keyboard.press('Enter'); await sleep(400);
    res.gain = { value: await inp.inputValue(), status: await L.status(p), fader: await p.locator('[data-testid=arrangement-detail-clip-gain-fader]').getAttribute('aria-valuetext') };
    await L.blur(p);
    const e6 = await X.exportWav(p, log, `${res.id}-6dB`); const w6 = X.wav(e6.files[0]);
    res.e0 = info(w0); res.e6 = info(w6); res.ratio = ratio(w0, w6); res.full6 = X.W.stats(w6.w).full;
    // master mute while playing
    await L.seekTo(p, 2.5); await p.evaluate(() => window.__tapStart()); await L.blur(p); await p.keyboard.press('Space'); await sleep(1200);
    const tm = await p.evaluate(() => performance.now()); await p.click('button[aria-label="Master Mute"]'); await sleep(3000);
    await L.blur(p); await p.keyboard.press('Space'); await sleep(200);
    const T = await p.evaluate(() => window.__tapStop());
    const pre = T.filter((s) => s.t < tm && s.t > tm - 800), post = T.filter((s) => s.t >= tm + 150);
    res.mm = { pressed: await p.locator('button[aria-label="Master Mute"]').getAttribute('aria-pressed'), prePeak: +Math.max(...pre.map((s) => s.peak)).toFixed(4), postPeak: Math.max(...post.map((s) => s.peak)), nPost: post.length, method: 'output tap exactly 0 from 150 ms after the click', series: T.filter((s) => s.t >= tm - 100).map((s) => [Math.round(s.t - tm), +s.peak.toExponential(3), s.meters.stems]).filter((x, i) => i % 3 === 0), firstZeroMs: (T.find((s) => s.t >= tm && s.peak === 0) || {}).t - tm, nonZeroAfter500: T.filter((s) => s.t >= tm + 500 && s.peak > 0).length, keep: await p.evaluate(() => window.__tap.keep || window.__tap.keepErr || 0), masterMeter: await p.evaluate(() => { const m = document.querySelector('[data-testid=arrangement-master-meter]'); return m ? Object.fromEntries([...m.attributes].filter((a) => a.name.startsWith('data-')).map((a) => [a.name, a.value])) : null; }) };
    await p.click('button[aria-label="Master Mute"]'); await sleep(200);
    // pan
    const pan = p.locator('[data-track-id=stems] [data-testid=arrangement-track-pan]'); await pan.focus();
    const pv = () => pan.evaluate((e) => ({ now: e.getAttribute('aria-valuenow') ?? e.value, text: e.getAttribute('aria-valuetext'), min: e.getAttribute('aria-valuemin') ?? e.min }));
    res.pan = [await pv()]; for (let i = 0; i < 5; i++) { await p.keyboard.press('ArrowLeft'); await sleep(150); res.pan.push(await pv()); }
    const pn = res.pan.map((x) => +x.now);
    res.checks = { gainSet: /6/.test(res.gain.value), sameFmt: w0.frames === w6.frames && w0.fmt.bits === 24 && w0.fmt.sr === 48000 && w0.fmt.ch === 2, ratio: Math.abs(res.ratio.peak / 1.9953 - 1) <= 0.005 && Math.abs(res.ratio.rms / 1.9953 - 1) <= 0.005, noClip: res.full6 === 0, mmSilent: res.mm.pressed === 'true' && res.mm.prePeak > 0.01 && res.mm.postPeak === 0 && res.mm.nPost > 30, panLeft: pn.every((v, i) => i === 0 || v < pn[i - 1]) && res.pan.every((x) => x.text && x.text.length > 0) && new Set(res.pan.map((x) => x.text)).size === 6 };
    X.R; for (const f of [...e0.files, ...e6.files]) res.files = (res.files || []).concat(f.replace(/.*c-round-122\//, 'c-round-122/'));
  },
};
(async () => {
  const b = await L.launch(); const net = []; const res = { id };
  try { const { page: p, log } = await L.openStudio(b, X.VPS[vp], id, net, { extraInit: X.tapInit }); res.geo = await L.geo(p); await rows[ROW](p, res, log); await p.context().close(); } catch (e) { res.error = String(e).slice(0, 600); }
  res.net = X.netOk(net); await b.close(); L.save(L.OUT, `${id}.json`, res);
  res.pass = !res.error && res.checks && Object.values(res.checks).every(Boolean) && res.net.ok;
  console.log(JSON.stringify(res, null, 0).slice(0, 5000)); console.log('PASS?', res.pass);
})();
