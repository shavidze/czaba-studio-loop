// usage: node pxdiff.mjs a.png b.png  -> {"w","h","diffPx","bbox"} (decoded in Chromium canvas)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [fa, fb] = process.argv.slice(2);
const url = (f) => 'data:image/png;base64,' + readFileSync(f).toString('base64');
const br = await chromium.launch(); const p = await br.newPage();
const r = await p.evaluate(async ([ua, ub]) => {
  const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
  const [a, b] = await Promise.all([load(ua), load(ub)]);
  if (a.width !== b.width || a.height !== b.height) return { sizeDiffers: [a.width, a.height, b.width, b.height] };
  const data = (img) => { const c = new OffscreenCanvas(img.width, img.height); const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
  const da = data(a), db = data(b); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < a.height; y++) for (let x = 0; x < a.width; x++) { const i = (y * a.width + x) * 4;
    if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2] || da[i + 3] !== db[i + 3]) { n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }
  return { w: a.width, h: a.height, diffPx: n, bbox: n ? [x0, y0, x1, y1] : null };
}, [url(fa), url(fb)]);
await br.close(); console.log(JSON.stringify(r));
