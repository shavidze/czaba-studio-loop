const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage();
const buf = require('fs').readFileSync(__dirname + '/export-mix.png').toString('base64');
const r = await p.evaluate(async (d) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, c.width, c.height).data; const m = new Map(); for (let i = 0; i < px.length; i += 4) { const k = px[i] + ',' + px[i+1] + ',' + px[i+2]; m.set(k, (m.get(k) || 0) + 1); } return [...m].sort((a, b) => b[1] - a[1]).slice(0, 3); }, buf);
const lum = (s) => { const [r, g, bl] = s.split(',').map(Number).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
const bg = r[0][0]; const brass = '201,164,106';
console.log({ top: r, bg, ratioBrassOnBg: ((lum(brass) + 0.05) / (lum(bg) + 0.05)).toFixed(2) });
await b.close(); })();
