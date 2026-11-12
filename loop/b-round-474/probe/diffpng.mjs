// B round 474: pixel diff of two PNGs in Chromium canvas. usage: node diffpng.mjs a.png b.png
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const [a, b2] = process.argv.slice(2).map((f) => readFileSync(f).toString('base64'));
const br = await chromium.launch(); const p = await br.newPage();
const r = await p.evaluate(async ([x, y]) => { const load = async (s) => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, c.width, c.height); }; const A = await load(x), B = await load(y); let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, max = 0; for (let i = 0; i < A.data.length; i += 4) { const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2])); if (d > 0) { n++; max = Math.max(max, d); const px = (i / 4) % A.width, py = Math.floor(i / 4 / A.width); x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } } return { w: A.width, h: A.height, diffPx: n, maxDelta: max, bbox: n ? [x0, y0, x1, y1] : null }; }, [a, b2]);
console.log(JSON.stringify(r)); await br.close();
