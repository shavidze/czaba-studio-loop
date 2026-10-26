const fs = require('fs'); const { decode } = require('./png.cjs');
const [a, b] = process.argv.slice(2); const A = decode(fs.readFileSync(a)), B = decode(fs.readFileSync(b));
if (A.w !== B.w || A.h !== B.h) { console.log(JSON.stringify({ a, size: [A.w, A.h, B.w, B.h] })); process.exit(0); }
let n = 0, max = 0; const bb = [1e9, 1e9, -1, -1];
for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) { const p = A.px(x, y), q = B.px(x, y); const d = Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])); if (d) { n++; max = Math.max(max, d); bb[0] = Math.min(bb[0], x); bb[1] = Math.min(bb[1], y); bb[2] = Math.max(bb[2], x); bb[3] = Math.max(bb[3], y); } }
console.log(JSON.stringify({ a: a.split('/').slice(-2).join('/'), b: b.split('/').slice(-3).join('/'), w: A.w, h: A.h, changed: n, maxDelta: max, bbox: n ? bb : null }));
