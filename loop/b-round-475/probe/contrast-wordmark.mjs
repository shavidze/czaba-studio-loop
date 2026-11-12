// B round 475: wordmark vs ring of background pixels (6-14 px outside its box) from the hold screenshots. usage: node contrast-wordmark.mjs <tag>...
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { readFileSync } from 'node:fs';
const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const br = await chromium.launch(); const p = await br.newPage(); const res = {};
for (const tag of process.argv.slice(2)) {
  const d = JSON.parse(readFileSync(`probe-${tag}.json`, 'utf8'));
  for (const w of ['1440', '1280']) {
    const [x, y, bw, bh] = d[w].hold.word.box;
    const text = d[w].hold.word.color.match(/\d+/g).slice(0, 3).map(Number);
    const px = await p.evaluate(async ([b64, x, y, bw, bh]) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); const D = g.getImageData(0, 0, c.width, c.height); const at = (a, b) => { const k = (b * c.width + a) * 4; return [D.data[k], D.data[k + 1], D.data[k + 2]]; }; const o = []; for (let a = x - 14; a < x + bw + 14; a += 2) for (const b of [y - 14, y - 8, y + bh + 8, y + bh + 14]) o.push(at(a, b)); for (let b = y; b < y + bh; b += 2) for (const a of [x - 14, x - 8, x + bw + 8, x + bw + 14]) o.push(at(a, b)); return o; }, [readFileSync(`${tag}-hold-${w}.png`).toString('base64'), x, y, bw, bh]);
    px.sort((a, b) => lum(a) - lum(b)); const med = px[px.length >> 1]; const hi = px[px.length - 1];
    const cr = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((m, n) => n - m); return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2); };
    res[`${tag}-${w}`] = { text, bgMedian: med, bgLightest: hi, ratioMedian: cr(text, med), ratioLightest: cr(text, hi) };
  }
}
console.log(JSON.stringify(res, null, 1)); await br.close();
