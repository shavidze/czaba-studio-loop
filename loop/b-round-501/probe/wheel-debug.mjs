import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5174';
const CORS = { 'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1366, height: 600 } });
await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
const p = await ctx.newPage();
await p.route(/\/api\/cart(\?|$)/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 1, items: [{ id: 11, productId: 1, productTitle: 'Stub Track 1', productHandle: 'stub-track-1', variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }], itemCount: 1, subtotal: 29, discountAmount: 5, giftCardAmount: 10, total: 14, appliedCoupon: { code: 'SAVE5', description: 'x', discountType: 'fixed', discountValue: 5, discountAmount: 5 }, appliedGiftCard: { code: 'GC', maskedCode: '****', balance: 50, amountToUse: 10 } } }) }));
await p.goto(BASE + '/cart'); await p.getByText('Order Summary').first().waitFor(); await p.waitForTimeout(2500);
const info = await p.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find((e) => e.textContent.trim() === 'Order Summary'); let c = h; while (c && !String(c.className).includes('lg:col-span-1')) c = c.parentElement; const r = c.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); const below = [...document.body.children].map((e) => e.tagName + '.' + String(e.className).slice(0, 30) + ' ' + Math.round(e.getBoundingClientRect().height)); return { col: [r.x, r.y, r.width, r.height], top: top.tagName + '.' + String(top.className).slice(0, 50), inCol: c.contains(top), docH: document.documentElement.scrollHeight, body: below }; });
console.log(JSON.stringify(info, null, 1));
const c = info.col; await p.mouse.move(c[0] + c[2] / 2, c[1] + c[3] / 2);
for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 200); await p.waitForTimeout(300); console.log(await p.evaluate(() => { const h = [...document.querySelectorAll('h2,h3')].find((e) => e.textContent.trim() === 'Order Summary'); let c = h; while (c && !String(c.className).includes('lg:col-span-1')) c = c.parentElement; return { st: c.scrollTop, win: scrollY }; })); }
await b.close();
