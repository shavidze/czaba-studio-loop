// list changed pixels between two shots inside rect A but outside rect B (CSS px, DPR 2)
const { decode } = require('../../c-round-180/tools/png.cjs'); const fs = require('fs');
const [a, b, outer, inner] = process.argv.slice(2); const A = decode(fs.readFileSync(a)), B = decode(fs.readFileSync(b));
const [ox, oy, ow, oh] = JSON.parse(outer); const [ix, iy, iw, ih] = JSON.parse(inner); const D = 2;
let n = 0; const s = []; const ys = {};
for (let Y = Math.floor(oy * D); Y < Math.ceil((oy + oh) * D); Y++) for (let X = Math.floor(ox * D); X < Math.ceil((ox + ow) * D); X++) {
  const cx = X / D, cy = Y / D; if (cx >= ix && cx < ix + iw && cy >= iy && cy < iy + ih) continue;
  const p = A.px(X, Y), q = B.px(X, Y); if (p[0] !== q[0] || p[1] !== q[1] || p[2] !== q[2]) { n++; ys[cy] = (ys[cy] || 0) + 1; if (s.length < 10) s.push({ x: cx, y: cy, a: p, b: q }); }
}
console.log(JSON.stringify({ outsideInner: n, rowsY: ys, samples: s }));
