import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
import { readFileSync } from 'node:fs';
const D = '/home/runner/czaba-project/tmp/studio-real-loop/b-round-491/probe/shots';
const browser = await chromium.launch(); const page = await browser.newPage();
for (const vp of ['1440x900', '1280x720', '375x812']) {
  const a = readFileSync(`${D}/headprod-open-${vp}.png`).toString('base64'); const b = readFileSync(`${D}/sketchprod-open-${vp}.png`).toString('base64');
  const r = await page.evaluate(async ([a, b]) => { const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + s; });
    const [ia, ib] = await Promise.all([load(a), load(b)]); const w = ia.width, h = ia.height; const c = new OffscreenCanvas(w, h); const x = c.getContext('2d');
    x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, w, h).data; x.clearRect(0, 0, w, h); x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, w, h).data;
    let mx = 0, n = 0, x0 = w, y0 = h, x1 = -1, y1 = -1; for (let i = 0; i < da.length; i += 4) { const m = Math.max(Math.abs(da[i] - db[i]), Math.abs(da[i + 1] - db[i + 1]), Math.abs(da[i + 2] - db[i + 2])); if (m > 0) { n++; if (m > mx) mx = m; const p = i / 4, px = p % w, py = (p - px) / w; x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); } }
    return { n, max: mx, bbox: n ? [x0, y0, x1, y1] : null, size: [w, h] }; }, [a, b]);
  console.log(vp, JSON.stringify(r));
}
await browser.close();
