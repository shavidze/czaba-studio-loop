const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'commit' });
await p.waitForSelector('[data-testid="entrance-loader"]', { state: 'attached', timeout: 15000 });
let best = null;
for (let i = 0; i < 14; i++) {
  await p.waitForTimeout(100);
  const box = await p.evaluate(() => { const l = document.querySelector('[data-testid="entrance-loader"] div.h-\\[1px\\]'); if (!l) return null; const r = l.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  if (box && box.w > 100) { best = box; break; }
}
if (!best) { console.log('line not wide'); await b.close(); return; }
const buf = await p.screenshot({ clip: { x: best.x, y: best.y - 2, width: best.w, height: 5 } });
await p.screenshot({ path: __dirname + '/loader-1440.png' });
const px = await p.evaluate(async (d) => { const img = new Image(); img.src = 'data:image/png;base64,' + d; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); const D = x.getImageData(0, 0, c.width, c.height).data; const rows = []; for (let y = 0; y < c.height; y++) { const i = (y * c.width + Math.floor(c.width / 2)) * 4; rows.push([D[i], D[i + 1], D[i + 2]]); } return rows; }, buf.toString('base64'));
const bg = px[0]; const line = px.reduce((m, c) => (lum(c) > lum(m) ? c : m), px[0]);
const word = await p.evaluate(() => { const s = [...document.querySelectorAll('[data-testid="entrance-loader"] span')].find((e) => e.textContent.trim() === 'CZABA'); return getComputedStyle(s).color; });
const out = { lineBox: best, columnPixels: px, bgPixel: bg, linePixel: line, lineVsBg: ratio(line, bg), wordmark: word, wordmarkVsBg: ratio([236, 230, 218], bg) };
require('fs').writeFileSync(__dirname + '/loader-contrast.json', JSON.stringify(out, null, 2)); console.log(JSON.stringify(out));
await b.close(); })();
