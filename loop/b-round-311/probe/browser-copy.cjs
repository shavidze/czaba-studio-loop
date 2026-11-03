const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const r = await p.evaluate(() => {
    const sr = 48000, n = sr * 300; const ctx = new OfflineAudioContext(2, 128, sr); const buf = ctx.createBuffer(2, n, sr);
    for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) d[i] = Math.sin(i * (0.01 + c * 0.003)) * 0.5; }
    const out = {};
    function computePeaks(channels, sampleRate, bps) { const length = channels[0].length; const spb = sampleRate / bps; const count = Math.ceil(length / spb); const p = new Float32Array(count); for (let b = 0; b < count; b++) { const from = Math.floor(b * spb), to = Math.min(length, Math.floor((b + 1) * spb)); let max = 0; for (const c of channels) for (let i = from; i < to; i++) { const v = Math.abs(c[i]); if (v > max) max = v; } p[b] = max; } return p; }
    const chans = [buf.getChannelData(0), buf.getChannelData(1)];
    out.peaks = []; for (let k = 0; k < 3; k++) { const t = performance.now(); computePeaks(chans, sr, 100); out.peaks.push(+(performance.now() - t).toFixed(1)); }
    out.reuse = {}; for (const s of [30, 5, 2, 1]) { const len = sr * s; const reps = 300 / s; const d = new Float32Array(len); const per = []; const t0 = performance.now(); for (let k = 0; k < reps; k++) { const t = performance.now(); for (let c = 0; c < 2; c++) buf.copyFromChannel(d, c, k * len); per.push(performance.now() - t); } out.reuse["s" + s] = { total: +(performance.now() - t0).toFixed(1), maxSlice: +Math.max(...per).toFixed(2) }; }
    out.sliced = {}; for (const s of [5, 2]) { const spb = 480; const bPer = s * 100; const per = []; const t0 = performance.now(); const count = Math.ceil(n / spb); const pk = new Float32Array(count); for (let b0 = 0; b0 < count; b0 += bPer) { const t = performance.now(); const b1 = Math.min(count, b0 + bPer); for (let b = b0; b < b1; b++) { const from = b * spb, to = Math.min(n, (b + 1) * spb); let max = 0; for (const c of chans) for (let i = from; i < to; i++) { const v = Math.abs(c[i]); if (v > max) max = v; } pk[b] = max; } per.push(performance.now() - t); } out.sliced["s" + s] = { total: +(performance.now() - t0).toFixed(1), maxSlice: +Math.max(...per).toFixed(2) }; }
    for (const s of [300, 30, 10, 5, 2]) { const len = sr * s; const reps = 300 / s; const per = []; const t0 = performance.now(); for (let k = 0; k < reps; k++) { const t = performance.now(); for (let c = 0; c < 2; c++) { const d = new Float32Array(len); buf.copyFromChannel(d, c, k * len); } per.push(performance.now() - t); } out['copy' + s] = { total: +(performance.now() - t0).toFixed(1), maxSlice: +Math.max(...per).toFixed(2) }; }
    return out;
  });
  console.log(JSON.stringify(r)); await b.close();
})();
