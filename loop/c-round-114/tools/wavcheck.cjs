const W = require('./wav.cjs'); const fs = require('fs');
const P = (n) => W.parse(fs.readFileSync(`../out/exp-1440-${n}.wav`));
const a = P('T8-music-stems0'), b = P('T8-music-stemsm6'), t1 = P('T1-stems-0'), t9 = P('T9-fadeout');
const fsMax = 2 ** 23; const sr = 48000;
const clipped = (w) => { const f = []; for (let i = 0; i < w.n; i++) { if (Math.abs(w.read(i)) / fsMax >= 0.9999) f.push(+(Math.floor(i / 2) / sr).toFixed(4)); } return f; };
const ca = clipped(a), cb = clipped(b);
console.log('T8 base clipped', ca.length, 'range s', ca[0], ca.at(-1), '| T8 m6 clipped', cb.length, cb[0], cb.at(-1));
const win = (w, s0, s1) => { let s = 0, n = 0; for (let f = Math.round(s0 * sr); f < Math.round(s1 * sr); f++) for (let c = 0; c < 2; c++) { const v = w.read(f * 2 + c) / fsMax; s += v * v; n++; } return Math.sqrt(s / n); };
for (const [s0, s1] of [[16.95, 17.05], [17.45, 17.55], [15.0, 15.9]]) { const r = win(t9, s0, s1) / win(t1, s0, s1); console.log('fade window', s0, s1, 'ratio', r.toFixed(4), 'dB', (20 * Math.log10(r)).toFixed(2)); }
// music-only region in T8 baseline: does it contain clipped samples?
console.log('clipped in [0,2) or after 18s:', ca.filter((t) => t < 2 || t >= 18).length);
