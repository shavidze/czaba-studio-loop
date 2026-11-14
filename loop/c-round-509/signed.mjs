import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const BASE = 'http://127.0.0.1:5173'; const ORIGIN = BASE;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: body }) });
const EMPTY = { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 };
const browser = await chromium.launch(); const res = {};
async function setup(w, h, owned, dbl) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, AUTH);
  const page = await ctx.newPage(); const errs = []; const posts = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('request', rq => { if (rq.method() === 'POST' && /\/api\//.test(rq.url())) posts.push({ p: new URL(rq.url()).pathname, body: (rq.postData() || '').slice(0, 200) }); });
  await page.route(/\/api\/auth\/profile/, r => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
  await page.route(/\/api\/downloads(\?|$)/, r => ok(r, 200, owned ? { products: [{ isAvailable: true, productId: 2, productTitle: 'Stub', handle: 'harbour-lights', category: 'music', licenseType: 'Standard', purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] } : { products: [] }));
  await page.route(/\/api\/cart(\?|$)/, r => ok(r, 200, EMPTY));
  await page.route(/\/api\/cart\/items/, r => ok(r, 200, { ...EMPTY, items: [{ id: 21, productId: 2, productTitle: 'HL', productHandle: 'harbour-lights', variantName: 'Standard', unitPrice: 0, quantity: 1, total: 0 }], itemCount: 1 }));
  await page.route(/\/api\/cart\/checkout/, async r => { if (r.request().method() === 'OPTIONS') return ok(r, 204, null); await new Promise(f => setTimeout(f, 2500)); return ok(r, 200, { id: 501, orderNumber: 'O-501', total: 0 }); });
  await page.route(/\/api\/payments\/checkout/, r => ok(r, 200, { sessionId: 'cs_stub', sessionUrl: `${ORIGIN}/__stripe-stub` }));
  await page.route(/\/__stripe-stub/, r => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>stripe stub</body></html>' }));
  await page.route(/\/products\/harbour-lights\?.*_data=/, async route => { const r = await route.fetch(); const j = await r.json(); const p = j.product; p.standardPrice = 0; p.premiumPrice = 0; p.minPrice = 0; p.variants = (p.variants || []).map(v => ({ ...v, price: 0 })); res._variants = p.variants.map(v => ({ id: v.id, name: v.name })); res._pid = p.id; await route.fulfill({ response: r, json: j }); });
  await page.goto(BASE + '/products/middle-east', { waitUntil: 'load' }); await page.waitForTimeout(3500);
  await page.evaluate(async () => { await window.__remixRouter.navigate('/products/harbour-lights'); }); await page.waitForTimeout(3000);
  return { ctx, page, errs, posts };
}
// warm-up
{ const s = await setup(1280, 720, false); await s.ctx.close(); }
for (const [w, h] of [[1440, 900], [1280, 720]]) for (const dbl of [false, true]) {
  const { ctx, page, errs, posts } = await setup(w, h, false);
  const r = { dbl };
  const btn = page.getByRole('button', { name: 'Get it free', exact: true });
  r.count = await btn.count();
  if (r.count) {
    await btn.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    const bb = await btn.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    if (dbl) await page.mouse.dblclick(cx, cy); else await page.mouse.click(cx, cy);
    await page.waitForTimeout(900);
    r.busy = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Processing/.test(x.innerText)); const hb = [...document.querySelectorAll('button')].filter(x => /Buy Now|Processing/.test(x.innerText)); return { sidebar: b ? { text: b.innerText.trim(), disabled: b.disabled, svg: !!b.querySelector('svg.animate-spin') } : null, buyNowCandidates: hb.map(x => ({ t: x.innerText.trim(), d: x.disabled || x.getAttribute('aria-disabled') })) }; });
    await page.screenshot({ path: `${out}/c6-busy-${w}${dbl ? '-dbl' : ''}.png` });
    await page.waitForURL(/__stripe-stub/, { timeout: 15000 }).catch(() => {});
    r.arrived = new URL(page.url()).pathname;
  }
  r.posts = posts; r.errs = errs.slice(0, 3); res[`signed-${w}${dbl ? '-dbl' : ''}`] = r; await ctx.close();
}
// C7 owned
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const { ctx, page, errs } = await setup(w, h, true);
  await page.waitForTimeout(2500);
  const r = { getFree: await page.getByRole('button', { name: 'Get it free', exact: true }).count(), compl: await page.getByText(/Complimentary\s+Download/).count(), headerButtons: await page.evaluate(() => [...document.querySelectorAll('main button, main a')].map(b => b.innerText.trim()).filter(t => /download|owned|buy|cart|library|premium/i.test(t)).slice(0, 8)) };
  await page.screenshot({ path: `${out}/c7-owned-${w}.png` });
  r.errs = errs.slice(0, 3); res[`owned-${w}`] = r; await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/signed.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
