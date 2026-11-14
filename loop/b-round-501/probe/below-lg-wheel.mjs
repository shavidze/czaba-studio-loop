// usage: BASE=... node below-lg-wheel.mjs <outdir> <label>  -- 3 stubbed items, 375x812 and 768x1024: wheel 3x300 over the items column, then a touch swipe; the window must scroll.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const items = Array.from({ length: 3 }, (_, k) => ({ id: 11 + k, productId: k + 1, productTitle: `Stub Track ${k + 1}`, productHandle: `stub-track-${k + 1}`, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }));
const b = await chromium.launch(); const rows = [];
for (const touch of [false, true]) for (const [w, h] of [[375, 812], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch && w < 500 });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
  const p = await ctx.newPage();
  await p.route(/\/api\/cart(\?|$)/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 1, items, itemCount: 3, subtotal: 87, discountAmount: 0, giftCardAmount: 0, total: 87 } }) }));
  await p.goto(BASE + '/cart'); await p.getByText('Order Summary').first().waitFor({ timeout: 20000 }); await p.waitForTimeout(2500);
  const box = await p.getByRole('link', { name: 'Stub Track 1', exact: true }).boundingBox();
  const colInfo = await p.evaluate(() => { const c = document.querySelector('[class*="lg:col-span-2"]'); const cs = getComputedStyle(c); return { ovY: cs.overflowY, osb: cs.overscrollBehaviorY, h: Math.round(c.getBoundingClientRect().height), sh: c.scrollHeight }; });
  const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
  if (touch) {
    const cdp = await ctx.newCDPSession(p);
    const steps = 12; const y0 = Math.min(cy + 300, h - 20);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: y0 }] });
    for (let i = 1; i <= steps; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: y0 - (i * 400) / steps }] }); await p.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await p.mouse.move(cx, cy); for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(200); }
  }
  await p.waitForTimeout(1500);
  const scrollY = await p.evaluate(() => Math.round(scrollY));
  await p.screenshot({ path: `${out}/${label}-below-lg-${touch ? 'touch' : 'wheel'}-${w}.png` });
  rows.push({ vp: `${w}x${h}`, input: touch ? 'touch' : 'wheel', col: colInfo, scrollY }); await ctx.close();
}
await b.close(); fs.writeFileSync(`${out}/${label}-below-lg.json`, JSON.stringify(rows, null, 1)); for (const r of rows) console.log(JSON.stringify(r));
