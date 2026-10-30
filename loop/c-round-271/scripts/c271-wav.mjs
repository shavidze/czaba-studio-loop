import { readFileSync, writeFileSync } from 'node:fs';
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-271';
function parseWav(buf) {
  const riff = buf.toString('latin1', 0, 4); const wave = buf.toString('latin1', 8, 12); const riffSize = buf.readUInt32LE(4);
  let p = 12; let fmt = null; let data = null;
  while (p + 8 <= buf.length) { const id = buf.toString('latin1', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') { data = { off: p + 8, size }; break; } p += 8 + size + (size & 1); }
  const bps = fmt.bits / 8; const frames = Math.floor(data.size / (bps * fmt.ch));
  const ch = Array.from({ length: fmt.ch }, () => new Float64Array(frames)); let bad = 0;
  for (let i = 0; i < frames; i++) for (let c = 0; c < fmt.ch; c++) { const o = data.off + (i * fmt.ch + c) * bps; let v;
    if (fmt.format === 3) v = buf.readFloatLE(o); else if (bps === 2) v = buf.readInt16LE(o) / 32768; else if (bps === 3) { let x = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (x & 0x800000) x -= 0x1000000; v = x / 8388608; } else v = buf.readInt32LE(o) / 2147483648;
    if (!Number.isFinite(v)) bad++; ch[c][i] = v; }
  return { header: { riff, wave, riffSizeOk: riffSize === buf.length - 8, dataSizeOk: data.off + data.size === buf.length }, fmt, frames, seconds: frames / fmt.sr, ch, bad };
}
const res = {};
for (const vp of ['1440x900', '1280x720']) {
  const A = parseWav(readFileSync(`${DIR}/new-${vp}-start10.wav`)); const B = parseWav(readFileSync(`${DIR}/new-${vp}-start12.3.wav`));
  const sr = A.fmt.sr; const first = (X) => { let f = Infinity; for (const c of X.ch) { const i = c.findIndex((v) => v !== 0); if (i >= 0) f = Math.min(f, i); } return f; };
  const fa = first(A); const fb = first(B); const shift = Math.round(2.3 * sr);
  let eq = 0; let tot = 0; let maxDiff = 0;
  for (let c = 0; c < A.fmt.ch; c++) for (let i = 0; i < A.frames && i + shift < B.frames; i++) { tot++; const d = Math.abs(B.ch[c][i + shift] - A.ch[c][i]); if (d === 0) eq++; maxDiff = Math.max(maxDiff, d); }
  let preNZ = 0; for (const c of B.ch) for (let i = 0; i < Math.round(12.3 * sr); i++) if (c[i] !== 0) preNZ++;
  res[vp] = { fmt: A.fmt, headerA: A.header, headerB: B.header, badSamples: [A.bad, B.bad], secondsA: A.seconds, secondsB: B.seconds, durDiff: +(B.seconds - A.seconds).toFixed(6),
    firstNonZeroA: fa / sr, firstNonZeroB: fb / sr, onsetShiftSamples: fb - fa, expectedShift: shift, nonZeroBefore12_3: preNZ, shiftedCompare: { equalSamples: eq, total: tot, maxAbsDiff: maxDiff } };
}
writeFileSync(`${DIR}/wav-analysis.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
