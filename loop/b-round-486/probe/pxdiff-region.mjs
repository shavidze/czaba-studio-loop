// usage: YMIN=<px> node pxdiff-region.mjs <a.png> <b.png> ... -> as pxdiff.mjs but ignores rows above YMIN (header band)
import { createRequire } from 'node:module'; import { readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const YMIN = Number(process.env.YMIN ?? 0); const args = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage();
for (let k = 0; k < args.length; k += 2) {
  const [A, B] = [args[k], args[k + 1]];
  const r = await p.evaluate(async ([a, bb, YMIN]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
    const [ia, ib] = await Promise.all([load(a), load(bb)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { sizeDiff: [ia.width, ia.height, ib.width, ib.height] };
    const g = (im) => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return x.getImageData(0, 0, im.width, im.height).data; };
    const da = g(ia), db = g(ib); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (let y = YMIN; y < ia.height; y++) for (let x = 0; x < ia.width; x++) { const i = (y * ia.width + x) * 4; if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) { n++; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }
    return { diffPx: n, bbox: n ? [x0, y0, x1, y1] : null };
  }, [readFileSync(A).toString("base64"), readFileSync(B).toString("base64"), YMIN]);
  console.log(JSON.stringify({ a: A, b: B, ...r }));
}
await b.close();
