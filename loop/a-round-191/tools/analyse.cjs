// per crop: thumb bbox (ivory), brass runs in the thumb-centre column and at 20% width, ring thickness, gap
// usage: node analyse.cjs <dir> ; crops are box + 8 css px horizontally, + 14 css vertically (DPR 2)
const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const dir = process.argv[2]; const out = {};
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
const IV = [236, 230, 218], BR = [201, 164, 106];
const cls = (c) => near(c, BR, 24) ? 'B' : near(c, IV, 12) ? 'I' : 'o';
const runs = (arr) => { const r = []; for (const v of arr) { if (r.length && r[r.length - 1][0] === v) r[r.length - 1][1]++; else r.push([v, 1]); } return r.map(([v, n]) => v + n).join(' '); };
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.png')).sort()) {
  const I = decode(fs.readFileSync(path.join(dir, f)));
  let iv = { x0: 1e9, x1: -1, y0: 1e9, y1: -1 };
  for (let y = 0; y < I.h; y++) for (let x = 16; x < I.w - 16; x++) { if (near(I.px(x, y), IV, 12)) { iv.x0 = Math.min(iv.x0, x); iv.x1 = Math.max(iv.x1, x); iv.y0 = Math.min(iv.y0, y); iv.y1 = Math.max(iv.y1, y); } }
  const cx = iv.x1 >= 0 ? Math.round((iv.x0 + iv.x1) / 2) : I.w >> 1; const qx = 16 + Math.round((I.w - 32) * 0.2);
  const col = (x) => runs(Array.from({ length: I.h }, (_, y) => cls(I.px(x, y))));
  const mid = I.h >> 1; const row = runs(Array.from({ length: I.w }, (_, x) => cls(I.px(x, mid))));
  out[f] = { thumbDev: iv.x1 >= 0 ? { w: iv.x1 - iv.x0 + 1, h: iv.y1 - iv.y0 + 1, cx: (iv.x0 + iv.x1) / 2, cy: (iv.y0 + iv.y1) / 2 } : null, colThumb: col(cx), col20: col(qx), midRow: row, parentAt: I.px(2, mid).slice(0, 3).join(',') };
  console.log(f.padEnd(34), JSON.stringify(out[f].thumbDev), '| col@thumb', out[f].colThumb, '| col@20%', out[f].col20);
}
fs.writeFileSync(path.join(dir, 'analyse.json'), JSON.stringify(out, null, 1));
