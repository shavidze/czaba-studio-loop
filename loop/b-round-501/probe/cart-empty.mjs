// usage: BASE=... node cart-empty.mjs <outdir> <label>  -- empty cart (stubbed items []) box rows at 375/1024/1280/1440
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const b = await chromium.launch(); const rows = [];
for (const [w, h] of [[375, 812], [1024, 768], [1280, 720], [1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
  const p = await ctx.newPage();
  await p.route(/\/api\/cart(\?|$)/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: null, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 } }) }));
  await p.goto(BASE + '/cart', { waitUntil: 'load', timeout: 60000 });
  await p.getByText('Your collection awaits').waitFor({ timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(2000);
  const m = await p.evaluate(() => { const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; }; const t = [...document.querySelectorAll('h1,h2,h3')].find((e) => e.textContent.trim() === 'Your collection awaits'); const a = [...document.querySelectorAll('a')].find((e) => e.innerText.trim() === 'Discover the Collection'); return { main: box(document.querySelector('main')), title: box(t), cta: box(a), docH: document.documentElement.scrollHeight }; });
  await p.screenshot({ path: `${out}/${label}-empty-${w}.png`, fullPage: true });
  rows.push({ vp: `${w}x${h}`, ...m }); await ctx.close();
}
await b.close(); fs.writeFileSync(`${out}/${label}-empty.json`, JSON.stringify(rows, null, 1));
for (const r of rows) console.log(r.vp, 'main', JSON.stringify(r.main), 'title', JSON.stringify(r.title), 'cta', JSON.stringify(r.cta), 'docH', r.docH);
