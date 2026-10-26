// RV1: rest-state pixel diff, current tree vs HEAD 15189d5 (git archive copy on :5174) and vs c-round-179 rest shots.
const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path');
const [a, b, boxJson] = process.argv.slice(2); const A = decode(fs.readFileSync(a)), B = decode(fs.readFileSync(b));
const boxes = JSON.parse(boxJson); const D = 2;
if (A.w !== B.w || A.h !== B.h) { console.log(JSON.stringify({ sizeMismatch: [A.w, A.h, B.w, B.h] })); process.exit(0); }
let ch = 0, inBox = 0, out = 0; const bb = [1e9, 1e9, -1, -1]; const outSamples = [];
for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const p = A.px(x, y), q = B.px(x, y); if (p[0] !== q[0] || p[1] !== q[1] || p[2] !== q[2]) { ch++; const cx = x / D, cy = y / D; const ins = boxes.some(([bx, by, bw, bh]) => cx >= bx - 0.5 && cx < bx + bw + 0.5 && cy >= by - 0.5 && cy < by + bh + 0.5); if (ins) inBox++; else { out++; if (outSamples.length < 8) outSamples.push({ x: cx, y: cy, now: p, was: q }); bb[0] = Math.min(bb[0], cx); bb[1] = Math.min(bb[1], cy); bb[2] = Math.max(bb[2], cx); bb[3] = Math.max(bb[3], cy); } } }
console.log(JSON.stringify({ a: path.basename(path.dirname(a)) + '/' + path.basename(a), b: path.basename(path.dirname(b)) + '/' + path.basename(b), w: A.w, h: A.h, changed: ch, inBox, outside: out, outsideBBox: out ? bb : null, outSamples }));
