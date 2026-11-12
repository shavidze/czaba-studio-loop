import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2]; const b = await chromium.launch(); const res = {};
const lum = (s) => { const [r, g, bl] = s.match(/[\d.]+/g).slice(0, 3).map(Number); const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(bl); };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const path of ['/search', '/account/login']) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
    await p.goto(base + path, { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(1500);
    const r = await p.evaluate(() => { const el = document.querySelector('main p') ?? [...document.querySelectorAll('p')].find((x) => x.getAttribute('style')?.includes('color')); let n = el; let bg = 'rgba(0, 0, 0, 0)'; while (n) { const c = getComputedStyle(n).backgroundColor; if (!c.endsWith(', 0)') && c !== 'transparent') { bg = c; break; } n = n.parentElement; } return { text: el?.textContent?.trim().slice(0, 60), color: el ? getComputedStyle(el).color : null, bg }; });
    r.ratio = r.color ? +(((Math.max(lum(r.color), lum(r.bg)) + 0.05) / (Math.min(lum(r.color), lum(r.bg)) + 0.05)).toFixed(2)) : null;
    res[`${w}${path}`] = r; await p.close();
  }
}
console.log(JSON.stringify(res, null, 1)); await b.close();
