// C round 269: WAV analysis of exports A (no points), B (points), M (B + fade-in + clip gain).
// usage: node analyze.mjs <dir> <KEY>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [DIR, KEY] = process.argv.slice(2);
const meta = JSON.parse(readFileSync(path.join(DIR, `export-${KEY}.json`), 'utf8'));
function parseWav(buf) {
  let p = 12; let fmt = null; let data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('latin1', p, p + 4); const size = buf.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { format: buf.readUInt16LE(p + 8), ch: buf.readUInt16LE(p + 10), sr: buf.readUInt32LE(p + 12), bits: buf.readUInt16LE(p + 22) };
    if (id === 'data') { data = { off: p + 8, size: Math.min(size, buf.length - p - 8), declared: size }; break; }
    p += 8 + size + (size & 1);
  }
  const bps = fmt.bits / 8; const frames = Math.floor(data.size / (bps * fmt.ch));
  const chans = Array.from({ length: fmt.ch }, () => new Float64Array(frames));
  for (let i = 0; i < frames; i++) for (let c = 0; c < fmt.ch; c++) {
    const o = data.off + (i * fmt.ch + c) * bps; let v;
    if (fmt.format === 3) v = bps === 4 ? buf.readFloatLE(o) : buf.readDoubleLE(o);
    else if (bps === 2) v = buf.readInt16LE(o) / 32768;
    else if (bps === 3) { let x = buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16); if (x & 0x800000) x -= 0x1000000; v = x / 8388608; }
    else v = buf.readInt32LE(o) / 2147483648;
    chans[c][i] = v;
  }
  return { fmt, frames, seconds: frames / fmt.sr, chans, dataDeclared: data.declared, bytes: buf.length };
}
const A = parseWav(readFileSync(path.join(DIR, `${KEY}-A.wav`)));
const B = parseWav(readFileSync(path.join(DIR, `${KEY}-B.wav`)));
const M = parseWav(readFileSync(path.join(DIR, `${KEY}-M.wav`)));
const sr = A.fmt.sr;
const env = meta.clipB.env.split(';').map((s) => s.split(':').map(Number));
const [p1, p2, p3] = env.map((e) => e[0]);
const db = (g) => (g > 0 ? 20 * Math.log10(g) : -Infinity);
const curve = (t) => { if (t <= p1) return 1; if (t >= p2) return 0; const d = (t - p1) / (p2 - p1); return 10 ** ((-60 * d) / 20); };
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
function gAt(X, t) { const c0 = Math.round((t - 0.01) * sr); const c1 = Math.round((t + 0.01) * sr); const r = []; for (let c = 0; c < A.fmt.ch; c++) for (let i = c0; i <= c1; i++) { const a = A.chans[c][i]; if (Math.abs(a) > 0.01) r.push(X.chans[c][i] / a); } return { g: median(r), n: r.length }; }
const out = { key: KEY, fmt: A.fmt, frames: [A.frames, B.frames, M.frames], seconds: [A.seconds, B.seconds, M.seconds], points: { p1, p2, p3 }, clipM: meta.clipM, gainValue: meta.gainValue ?? null };
out.taper = [0.25, 0.5, 0.75].map((f) => { const t = p1 + f * (p2 - p1); const { g, n } = gAt(B, t); const want = -60 * f; return { f, t: +t.toFixed(4), db: +db(g).toFixed(3), want, err: +(db(g) - want).toFixed(3), n, pass: Math.abs(db(g) - want) <= 0.5 }; });
const curveRows = []; for (let t = p1 + 0.025; t <= p1 + 0.75 * (p2 - p1) + 1e-9; t += 0.05) { const { g, n } = gAt(B, t); const want = db(curve(t)); curveRows.push({ t: +t.toFixed(3), err: +(db(g) - want).toFixed(4), n }); }
out.curve = { count: curveRows.length, maxAbsErr: Math.max(...curveRows.map((r) => Math.abs(r.err))), minN: Math.min(...curveRows.map((r) => r.n)), worst: curveRows.reduce((a, b) => (Math.abs(b.err) > Math.abs(a.err) ? b : a)) };
out.curve.pass = out.curve.maxAbsErr <= 0.2;
// SILENCE: [p2, end of file] every sample of B
const s2 = Math.ceil(p2 * sr); let nonZero = 0; let firstNZ = null; let maxAbs = 0;
for (let c = 0; c < B.fmt.ch; c++) for (let i = s2; i < B.frames; i++) { const v = B.chans[c][i]; if (v !== 0) { nonZero++; if (firstNZ === null) firstNZ = i / sr; maxAbs = Math.max(maxAbs, Math.abs(v)); } }
let aNonZeroTail = 0; for (let c = 0; c < A.fmt.ch; c++) for (let i = s2; i < A.frames; i++) if (A.chans[c][i] !== 0) aNonZeroTail++;
out.silence = { fromSample: s2, fromT: s2 / sr, toT: B.frames / sr, p3, samplesChecked: (B.frames - s2) * B.fmt.ch, nonZero, firstNZ, maxAbs, aNonZeroInSameSpan: aNonZeroTail, pass: nonZero === 0 && aNonZeroTail > 0 };
// NO-CLICK: per-sample ratio over [p1, p2]
let worst = 0; let worstT = null; let nck = 0;
for (let c = 0; c < A.fmt.ch; c++) for (let i = Math.ceil(p1 * sr); i <= Math.floor(p2 * sr); i++) { const a = A.chans[c][i]; if (Math.abs(a) > 0.01) { nck++; const e = Math.abs(B.chans[c][i] / a - curve(i / sr)); if (e > worst) { worst = e; worstT = i / sr; } } }
out.noClick = { samples: nck, maxAbsErr: worst, worstT, pass: worst <= 0.002 && nck > 0 };
// UNITY before p1
let uw = 0; let un = 0; let identical = 0; let tot = 0;
for (let c = 0; c < A.fmt.ch; c++) for (let i = 0; i < Math.floor(p1 * sr); i++) { const a = A.chans[c][i]; tot++; if (a === B.chans[c][i]) identical++; if (Math.abs(a) > 0.01) { un++; uw = Math.max(uw, Math.abs(B.chans[c][i] / a - 1)); } }
out.unity = { samples: un, maxAbsErr: uw, bitIdentical: `${identical}/${tot}`, pass: uw <= 1e-4 && un > 0 };
// MULTIPLY: M/A = fade * clipGain * curve over [0, p1 + 0.75(p2-p1)]
const fadeIn = Number(meta.clipM.fadeIn); const cs = Number(meta.clipM.start); const gDb = meta.gainValue === null || meta.gainValue === undefined ? 0 : Number(meta.gainValue); const gl = 10 ** (gDb / 20);
const fade = (t) => (t <= cs ? 0 : t >= cs + fadeIn ? 1 : (t - cs) / fadeIn);
let mw = 0; let mwt = null; let mn = 0;
for (let c = 0; c < A.fmt.ch; c++) for (let i = 0; i <= Math.floor((p1 + 0.75 * (p2 - p1)) * sr); i++) { const a = A.chans[c][i]; if (Math.abs(a) > 0.01) { mn++; const e = Math.abs(M.chans[c][i] / a - fade(i / sr) * gl * curve(i / sr)); if (e > mw) { mw = e; mwt = i / sr; } } }
let mSil = 0; for (let c = 0; c < M.fmt.ch; c++) for (let i = s2; i < M.frames; i++) if (M.chans[c][i] !== 0) mSil++;
out.multiply = { fadeIn, clipStart: cs, clipGainDb: gDb, clipGainLin: gl, samples: mn, maxAbsErr: mw, worstT: mwt, nonZeroAfterP2: mSil, pass: mw <= 0.002 && mn > 0 && mSil === 0 };
// sample integrity
const peak = (X) => { let p = 0; let nan = 0; for (const ch of X.chans) for (const v of ch) { if (!Number.isFinite(v)) nan++; p = Math.max(p, Math.abs(v)); } return { peak: +p.toFixed(5), nonFinite: nan }; };
out.integrity = { A: peak(A), B: peak(B), M: peak(M), headerDataBytes: [A.dataDeclared, B.dataDeclared, M.dataDeclared], fileBytes: [A.bytes, B.bytes, M.bytes] };
writeFileSync(path.join(DIR, `analysis-${KEY}.json`), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ key: KEY, fmt: out.fmt, seconds: out.seconds, points: out.points, taper: out.taper, curve: { ...out.curve, worst: out.curve.worst }, silence: out.silence, noClick: out.noClick, unity: out.unity, multiply: out.multiply, integrity: out.integrity }, null, 1));
