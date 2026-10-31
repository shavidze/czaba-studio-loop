// C291 B-SCREEN: in-browser canvas pixel diff of HEAD (B ax-before) vs A (C ax-after) full-window PNGs, whole window and listbox clip.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const L = '/home/runner/czaba-project/tmp/studio-real-loop';
const before = JSON.parse(fs.readFileSync(`${L}/b-round-290/probe/ax-before.json`));
const browser = await chromium.launch(); const page = await browser.newPage(); const out = {};
for (const k of ['1440x900', '1280x720']) {
  const a = fs.readFileSync(`${L}/b-round-290/probe/ax-before-${k}.png`).toString('base64');
  const b = fs.readFileSync(`${L}/c-round-291/probe/ax-after-${k}.png`).toString('base64');
  out[k] = await page.evaluate(async ({ a, b, bb }) => {
    const load = (s) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = `data:image/png;base64,${s}`; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, img.width, img.height).data; };
    const da = px(ia), db = px(ib); const w = ia.width;
    let diff = 0, inList = 0; let minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
    for (let i = 0; i < da.length; i += 4) {
      if (da[i] !== db[i] || da[i + 1] !== db[i + 1] || da[i + 2] !== db[i + 2]) {
        diff++; const p = i / 4, x = p % w, y = Math.floor(p / w);
        minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
        if (x >= bb.x && x < bb.x + bb.width && y >= bb.y && y < bb.y + bb.height) inList++;
      }
    }
    return { size: [ia.width, ia.height, ib.width, ib.height], diffPixels: diff, diffInListbox: inList, diffBox: diff ? [minX, minY, maxX, maxY] : null };
  }, { a, b, bb: before[k].bbox });
}
fs.writeFileSync(`${L}/c-round-291/probe/screen-diff.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await browser.close();
