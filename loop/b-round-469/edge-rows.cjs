// B: rows 0..5 and last 3 of (variant - hidden) luminance for a section shot: per row mean, max and argmax x
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [a, h] = process.argv.slice(2);
(async () => { const b = await chromium.launch(); const p = await b.newPage();
 const r = await p.evaluate(async ([a, h]) => { const load = (s) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.src = 'data:image/png;base64,' + s; });
  const px = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, h: im.height, d: x.getImageData(0, 0, im.width, im.height).data }; };
  const A = px(await load(a)), H = px(await load(h)); const L = (P, x, y) => { const i = (y * P.w + x) * 4; return (P.d[i] + P.d[i + 1] + P.d[i + 2]) / 3; };
  const rows = [0, 1, 2, 3, 4, 5, 20, 60, A.h - 3, A.h - 2, A.h - 1]; return rows.map((y) => { let s = 0, m = -1e9, mx = 0; for (let x = 0; x < A.w; x++) { const d = L(A, x, y) - L(H, x, y); s += d; if (d > m) { m = d; mx = x; } } return [y, +(s / A.w).toFixed(2), +m.toFixed(2), mx]; }); }, [fs.readFileSync(a).toString('base64'), fs.readFileSync(h).toString('base64')]);
 console.log(JSON.stringify(r)); await b.close(); })();
