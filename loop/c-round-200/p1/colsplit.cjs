// split brass px (R-B>=45, DPR 2) of the saved R200-P1 scan rects into playhead column [phx-1, phx+phw+1) vs elsewhere
const { decode } = require('./png.cjs'); const fs = require('fs'); const path = require('path');
const out = {};
for (const tag of process.argv.slice(2)) {
  const r = require(path.resolve(__dirname, '..', 'out', tag + '.json')); const D = 2; const o = out[tag] = {};
  const run = (shot, rect, ph, masks = []) => { const img = decode(fs.readFileSync(path.resolve(__dirname, '..', r.shots[shot]))); const [x, y, w, h] = rect; const c0 = ph[0] - 1, c1 = ph[0] + ph[2] + 1; let inC = 0, outC = 0, n = 0, masked = 0; const xs = new Set(); const outS = [];
    for (let Y = Math.ceil(y * D); Y < Math.floor((y + h) * D); Y++) for (let X = Math.ceil(x * D); X < Math.floor((x + w) * D); X++) { if (X >= img.w || Y >= img.h) continue; const cx = X / D, cy = Y / D; if (masks.some((m) => cx >= m.r[0] && cx < m.r[0] + m.r[2] && cy >= m.r[1] && cy < m.r[1] + m.r[3])) { masked++; continue; } n++; const c = img.px(X, Y); if (c[0] - c[2] >= 45) { if (cx >= c0 && cx < c1) { inC++; xs.add(cx); } else { outC++; if (outS.length < 5) outS.push([cx, cy, c]); } } }
    return { shot, rect, n, masked, brassInPlayheadColumn: inC, columnXs: [...xs].sort((a, b) => a - b), brassElsewhere: outC, outSamples: outS }; };
  for (const [lane, v] of Object.entries(r.file)) { const ph = r.ph[`file-${lane}`].line; o[`file-${lane}`] = { ph, stripTop: run(`file-${lane}-during`, v.strip.top.rect, ph, v.strip.top.masks), stripBottom: run(`file-${lane}-during`, v.strip.bottom.rect, ph, v.strip.bottom.masks), hint: v.hintScan && run(`file-${lane}-during`, v.hintScan.rect, ph, v.hintScan.masks) }; }
}
fs.writeFileSync(path.resolve(__dirname, '..', 'out', 'p1-colsplit.json'), JSON.stringify(out, null, 1));
for (const [t, o] of Object.entries(out)) for (const [k, v] of Object.entries(o)) console.log(t, k, 'ph', v.ph, ['stripTop', 'stripBottom', 'hint'].map((s) => v[s] && `${s}: col ${v[s].brassInPlayheadColumn} xs ${v[s].columnXs} else ${v[s].brassElsewhere} n ${v[s].n} m ${v[s].masked}`).join(' | '));
