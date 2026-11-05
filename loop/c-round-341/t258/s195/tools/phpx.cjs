// C round 194 — placeholder / typed pixel ratio from the popup input crops, inner region only (excludes the rounded corners that show the dark modal).
const fs = require('fs'); const path = require('path'); const { decode } = require('./png.cjs');
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return +((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const SH = path.join(__dirname, '..', 'shots', 'popup'); const out = {};
for (const f of fs.readdirSync(SH).filter((x) => /-input(-typed)?\.png$/.test(x)).sort()) {
  const im = decode(fs.readFileSync(path.join(SH, f))); const hist = new Map();
  for (let y = Math.floor(im.h * 0.2); y < im.h * 0.8; y++) for (let x = Math.floor(im.w * 0.04); x < im.w * 0.96; x++) { const k = im.px(x, y).join(','); hist.set(k, (hist.get(k) || 0) + 1); }
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]); const bg = top[0][0].split(',').map(Number); let ext = null, best = 0, n = 0;
  for (const [k, c] of top) { if (c < 4) continue; const col = k.split(',').map(Number); const r = ratio(col, bg); if (r > best) { best = r; ext = col; n = c; } }
  out[f] = { bg, darkest: ext, count: n, ratio: best }; console.log(f, JSON.stringify(out[f]));
}
fs.writeFileSync(path.join(__dirname, '..', 'out', 'popup-phpx.json'), JSON.stringify(out, null, 1));
