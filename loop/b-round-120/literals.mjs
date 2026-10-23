const PEAK_BUCKETS_PER_SECOND = 100;
function build(peaks, sourceOffset, duration, columns, scale) {
  const from = Math.floor(sourceOffset * PEAK_BUCKETS_PER_SECOND);
  const to = Math.min(peaks.length, Math.ceil((sourceOffset + duration) * PEAK_BUCKETS_PER_SECOND));
  const span = to - from; const count = Math.max(1, Math.min(span, Math.round(columns)));
  const perColumn = span / count; const s = Number.isFinite(scale) && scale >= 0 ? scale : 1; const parts = [];
  for (let c = 0; c < count; c++) { const st = from + Math.floor(c * perColumn); const en = Math.max(st + 1, from + Math.floor((c + 1) * perColumn)); let max = 0; for (let i = st; i < en && i < to; i++) max = Math.max(max, peaks[i]); const h = Math.max(0.02, Math.min(1, max * s)); parts.push(`M${c} ${(1 - h).toFixed(3)}h1V${(1 + h).toFixed(3)}h-1Z`); }
  return parts.join('');
}
const p = new Float32Array([0.2, 0.5, 0.9, 1.0, 0.01]);
const rows = { 'zoom 0.5': 0.5, 'zoom 1': 1, 'zoom 2': 2, 'zoom 4': 4, 'zoom 8': 8, 'gain -6 x zoom 2': 10 ** (-6 / 20) * 2, 'gain -60 x zoom 8': 10 ** (-60 / 20) * 8 };
for (const [k, s] of Object.entries(rows)) console.log(k.padEnd(20), String(s).padEnd(22), build(p, 0, 0.05, 5, s));
