// measure thumb bbox (ivory pixels) and track rows in a crop (DPR2). usage: node measure.cjs file.png
const fs = require('fs'); const { decode } = require('./png.cjs');
const img = decode(fs.readFileSync(process.argv[2]));
const near = (c, t, d) => Math.abs(c[0] - t[0]) <= d && Math.abs(c[1] - t[1]) <= d && Math.abs(c[2] - t[2]) <= d;
const IV = [236, 230, 218], BR = [201, 164, 106];
const cols = {}; let iv = { x0: 1e9, x1: -1, y0: 1e9, y1: -1 }; let br = 0;
for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { const c = img.px(x, y); if (near(c, IV, 16)) { iv.x0 = Math.min(iv.x0, x); iv.x1 = Math.max(iv.x1, x); iv.y0 = Math.min(iv.y0, y); iv.y1 = Math.max(iv.y1, y); } if (near(c, BR, 24)) br++; }
// column profile at the far left area (x=20 device px): print colours down the column
const x = Number(process.argv[3] || 24); const prof = []; for (let y = 0; y < img.h; y++) prof.push(img.px(x, y).slice(0, 3).join(','));
console.log(JSON.stringify({ w: img.w, h: img.h, ivoryBBox: iv, ivoryW: iv.x1 - iv.x0 + 1, ivoryH: iv.y1 - iv.y0 + 1, brassPx: br }));
console.log('col', x, prof.map((p, i) => i + ':' + p).join(' '));
