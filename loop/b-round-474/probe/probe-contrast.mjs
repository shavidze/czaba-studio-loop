// B round 474: badge chip contrast from rendered pixels. usage: node probe-contrast.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2]; const tag = process.argv[3];
const b = await chromium.launch(); const res = {};
const lum = ([r, g, bl]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => { const e = [...document.querySelectorAll('article div.absolute.top-3.left-3.rounded-full')].find((x) => x.textContent !== 'New'); e.closest('article').scrollIntoView({ block: 'center', behavior: 'instant' }); });
  await p.waitForTimeout(2000);
  const boxes = await p.evaluate(() => [...document.querySelectorAll('article div.absolute.top-3.left-3.rounded-full')].filter((e) => e.textContent !== 'New').map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent, x: r.x, y: r.y, w: r.width, h: r.height }; }).filter((r) => r.x >= 0 && r.x + r.w <= innerWidth && r.y >= 0 && r.y + r.h <= innerHeight));
  const out = [];
  for (const bx of boxes) {
    const png = await p.screenshot({ clip: { x: bx.x + 4, y: bx.y + 3, width: bx.w - 8, height: bx.h - 6 } });
    const px = await p.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return Array.from(x.getImageData(0, 0, c.width, c.height).data); }, png.toString('base64'));
    const L = []; for (let i = 0; i < px.length; i += 4) L.push([lum([px[i], px[i + 1], px[i + 2]]), [px[i], px[i + 1], px[i + 2]]]);
    L.sort((a, b2) => a[0] - b2[0]);
    const bg = L[Math.floor(L.length * 0.5)]; const fg = L[L.length - 1 - Math.floor(L.length * 0.01)]; const bgMax = L[Math.floor(L.length * 0.6)];
    out.push({ t: bx.t, bgMedian: bg[1], text: fg[1], ratioMedian: +((fg[0] + 0.05) / (bg[0] + 0.05)).toFixed(2), ratioP60: +((fg[0] + 0.05) / (bgMax[0] + 0.05)).toFixed(2) });
  }
  res[w] = out; await p.close();
}
console.log(JSON.stringify(res, null, 1)); await b.close();
