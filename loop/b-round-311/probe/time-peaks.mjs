// node time-peaks.mjs : timing of computePeaks logic (copied algorithm) and of Float32Array copies, 5-min 48 kHz stereo
const sr = 48000, secs = 300, n = sr * secs;
const ch = [new Float32Array(n), new Float32Array(n)];
for (let i = 0; i < n; i++) { ch[0][i] = Math.sin(i * 0.01) * 0.5; ch[1][i] = Math.cos(i * 0.013) * 0.4; }
function computePeaks(channels, sampleRate, bps) { const length = channels[0].length; const spb = sampleRate / bps; const count = Math.ceil(length / spb); const p = new Float32Array(count); for (let b = 0; b < count; b++) { const from = Math.floor(b * spb), to = Math.min(length, Math.floor((b + 1) * spb)); let max = 0; for (const c of channels) for (let i = from; i < to; i++) { const v = Math.abs(c[i]); if (v > max) max = v; } p[b] = max; } return p; }
for (let r = 0; r < 4; r++) { const t = performance.now(); computePeaks(ch, sr, 100); console.log('computePeaks 5min stereo ms', (performance.now() - t).toFixed(1)); }
for (const secsChunk of [300, 30, 10, 5]) { const len = sr * secsChunk; const t = performance.now(); const reps = Math.round(secs / secsChunk); for (let k = 0; k < reps; k++) { for (const c of ch) { const d = new Float32Array(len); d.set(c.subarray(k * len, (k + 1) * len)); } } const total = performance.now() - t; console.log(`copy ${secsChunk}s chunks: total ${total.toFixed(1)} ms, per chunk ${(total / reps).toFixed(2)} ms`); }
