// usage: BASE=... node items-wheel.mjs <label>  -- 1280x720, 5 stubbed items: wheel over the items column; does the column scroll (scrollTop) or only the window?
import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const items = Array.from({ length: 5 }, (_, k) => ({ id: 11 + k, productId: k + 1, productTitle: `Stub Track ${k + 1}`, productHandle: `stub-track-${k + 1}`, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }));
const b = await chromium.launch(); const out = [];
for (const [w, h] of [[1280, 720], [1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
  const p = await ctx.newPage();
  await p.route(/\/api\/cart(\?|$)/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 1, items, itemCount: 5, subtotal: 145, discountAmount: 0, giftCardAmount: 0, total: 145 } }) }));
  await p.goto(BASE + '/cart'); await p.getByText('Order Summary').first().waitFor(); await p.waitForTimeout(2500);
  const col = await p.evaluate(() => { const c = document.querySelector('[class*="lg:col-span-2"]'); const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, sh: c.scrollHeight, attr: c.hasAttribute('data-lenis-prevent') || c.hasAttribute('data-lenis-prevent-wheel') }; });
  await p.mouse.move(col.x + col.w / 2, col.y + Math.min(col.h, 300) / 2);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(200); }
  await p.waitForTimeout(1400);
  const after = await p.evaluate(() => { const c = document.querySelector('[class*="lg:col-span-2"]'); const last = [...c.querySelectorAll('a')].find((a) => a.innerText.trim() === 'Stub Track 5'); const r = last.getBoundingClientRect(); const m = document.querySelector('main').getBoundingClientRect(); return { st: Math.round(c.scrollTop), win: Math.round(scrollY), lastVisible: r.bottom <= Math.min(innerHeight, m.bottom) && r.top >= Math.max(0, c.getBoundingClientRect().top) }; });
  out.push({ vp: `${w}x${h}`, col: { h: Math.round(col.h), sh: col.sh, lenisPrevent: col.attr }, ...after }); await ctx.close();
}
await b.close(); console.log(JSON.stringify(out));
