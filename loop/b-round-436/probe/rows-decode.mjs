// usage: node rows-decode.mjs <probe dir>  -> prints RGB per pixel row for every *-rows-*.png (1 px wide columns)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const dir = process.argv[2];
const b = await chromium.launch(); const page = await b.newPage();
const out = {};
for (const f of fs.readdirSync(dir).filter((n) => /-rows-.*\.png$/.test(n)).sort()) {
  const url = 'data:image/png;base64,' + fs.readFileSync(`${dir}/${f}`).toString('base64');
  out[f] = await page.evaluate(async (u) => {
    const img = new Image(); img.src = u; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, img.width, img.height).data; const rows = [];
    for (let y = 0; y < img.height; y += 1) rows.push(`${d[y * img.width * 4]},${d[y * img.width * 4 + 1]},${d[y * img.width * 4 + 2]}`);
    return rows;
  }, url);
}
await b.close();
for (const [f, rows] of Object.entries(out)) console.log(f, rows.join(' | '));
