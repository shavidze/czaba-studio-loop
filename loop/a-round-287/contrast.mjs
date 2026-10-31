import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const measure = () => page.$$eval('span', (spans) => {
  const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  return spans.filter((s) => s.textContent.trim() === 'Price unavailable' && s.className.includes('text-muted')).map((s) => {
    let el = s.parentElement; let bg = getComputedStyle(el).backgroundColor;
    while (el && (bg === 'rgba(0, 0, 0, 0)' || parse(bg)[3] === 0)) { el = el.parentElement; bg = el ? getComputedStyle(el).backgroundColor : 'rgb(0,0,0)'; }
    const fg = parse(getComputedStyle(s).color); const b = parse(bg);
    const L1 = lum(fg), L2 = lum(b);
    return { cls: s.className, color: getComputedStyle(s).color, bg, bgAlpha: b[3] ?? 1, ratio: +( (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05) ).toFixed(2), h: s.getBoundingClientRect().height };
  });
});
await page.goto('http://127.0.0.1:5173/store', { waitUntil: 'networkidle' });
const store = await measure();
await page.goto('http://127.0.0.1:5173/products/priceless-track', { waitUntil: 'networkidle' });
const version = await measure();
console.log(JSON.stringify({ store, version }, null, 1));
await browser.close();
