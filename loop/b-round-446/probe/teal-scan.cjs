// B round 446 planning probe: computed-style teal scan. usage: node teal-scan.cjs <baseUrl> <out.json>
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || 'teal-head.json';
const pages = ['/', '/store', '/products/pulse-loop-kit', '/gift-cards', '/checkout/success'];
function scanFn() {
  const re = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/g;
  const isTeal = (r, g, b, a) => {
    if (a !== undefined && a === 0) return false;
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (d === 0) return false;
    const l = (mx + mn) / 2, s = d / (1 - Math.abs(2 * l - 1));
    let h; if (mx === r) h = 60 * (((g - b) / d) % 6); else if (mx === g) h = 60 * ((b - r) / d + 2); else h = 60 * ((r - g) / d + 4);
    if (h < 0) h += 360;
    return h >= 160 && h <= 190 && s >= 0.4;
  };
  const props = ['color', 'background-color', 'background-image', 'border-top-color', 'box-shadow', 'filter', 'fill', 'stroke', 'outline-color', 'text-decoration-color'];
  const hits = [];
  const els = [...document.querySelectorAll('body *')];
  for (const el of els) {
    for (const pseudo of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, pseudo);
      for (const p of props) {
        const v = cs.getPropertyValue(p); if (!v) continue;
        let m; re.lastIndex = 0;
        while ((m = re.exec(v))) {
          if (isTeal(+m[1], +m[2], +m[3], m[4] === undefined ? undefined : +m[4])) {
            hits.push({ tag: el.tagName, cls: (el.getAttribute('class') || '').slice(0, 120), pseudo, prop: p, value: m[0] }); break;
          }
        }
      }
    }
  }
  return hits;
}
(async () => {
  const browser = await chromium.launch();
  const res = {};
  for (const path of pages) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(4000);
      const hits = await page.evaluate(scanFn);
      res[path] = { count: hits.length, hits: hits.slice(0, 40) };
    } catch (e) { res[path] = { error: String(e).slice(0, 200) }; }
    await ctx.close();
  }
  await browser.close();
  require('fs').writeFileSync(out, JSON.stringify(res, null, 1));
  for (const [k, v] of Object.entries(res)) console.log(k, v.count ?? v.error);
})();
