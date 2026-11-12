import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const base = process.argv[2] || 'http://127.0.0.1:5173'; const tag = process.argv[3] || 'head';
const b = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 90000 }); await p.waitForTimeout(3000);
  const ok = await p.evaluate(() => { const e = [...document.querySelectorAll('div.absolute.top-3.left-3.rounded-full')].find((x) => x.textContent !== 'New'); if (!e) return false; const art = e.closest('article'); art.scrollIntoView({ block: 'center', behavior: 'instant' }); return true; });
  await p.waitForTimeout(1500);
  const o = { ok }; out[w] = o;
  o.badges = await p.evaluate(() => [...document.querySelectorAll('article div.absolute.top-3.left-3.rounded-full')].map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent, bg: getComputedStyle(e).backgroundColor, c: getComputedStyle(e).color, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), inView: r.x >= 0 && r.right <= innerWidth && r.y >= 0 && r.bottom <= innerHeight }; }));
  o.cardWrap = await p.evaluate(() => { const e = document.querySelector('article .bg-card'); return e ? getComputedStyle(e).backgroundColor : null; });
  const vis = o.badges.filter((x) => x.inView);
  if (vis.length) { const y0 = Math.max(0, Math.min(...vis.map((v) => v.y)) - 20); await p.screenshot({ path: `${tag}-cards-${w}.png`, clip: { x: 0, y: y0, width: w, height: Math.min(h - y0, 460) } }); }
  await p.close();
}
console.log(JSON.stringify(out, null, 1)); await b.close();
