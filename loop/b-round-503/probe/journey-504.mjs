// usage: BASE=http://127.0.0.1:5173 node journey-504.mjs <outdir> <label>
// Round 504 purchase-protection journeys on PurchaseHeader (-STUBBED, L36; client path only). Real mouse clicks at element centre.
// J1 S1P "Go to Downloads" -> /account/downloads. J2 S2 "Upgrade to Premium" -> the Case 3 card ("Unlock Premium" visible, URL unchanged).
// J3 S3 "Unlock Premium" single click: POST /api/cart/items x1, POST /api/cart/checkout x1 (held 2.5 s -> busy state measured), then
//    POST /api/payments/checkout x1 -> stub sessionUrl (same-origin /__stripe-stub). J4 S3 double-click: still 1 checkout POST.
// J5 S0 anonymous "Buy Now": 0 POST, sign-in dialog opens. Viewports 1440 and 375.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3] || 'run';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: body }) });
const EMPTY_CART = { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 };
const dl = (productId, handle, licenseType) => ({ products: [{ isAvailable: true, productId, productTitle: 'Stub', handle, category: 'music', licenseType, purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] });
const journeys = [
  { id: 'J1', path: '/products/middle-east', owned: dl(1, 'middle-east', 'Premium'), click: 'Go to Downloads' },
  { id: 'J2', path: '/products/middle-east', owned: dl(1, 'middle-east', 'Standard'), click: 'Upgrade to Premium' },
  { id: 'J3', path: '/products/middle-east?upgrade=premium', owned: dl(1, 'middle-east', 'Standard'), click: 'Unlock Premium' },
  { id: 'J4', path: '/products/middle-east?upgrade=premium', owned: dl(1, 'middle-east', 'Standard'), click: 'Unlock Premium', dbl: true },
  { id: 'J5', path: '/products/middle-east', owned: null, click: 'Buy Now' },
];
const browser = await chromium.launch();
const res = [];
for (const j of journeys) for (const [w, h] of [[1440, 900], [375, 812]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, j.owned ? AUTH : null);
  const page = await ctx.newPage();
  const errors = []; const posts = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('request', (rq) => { if (rq.method() === 'POST' && /\/api\//.test(rq.url())) posts.push(new URL(rq.url()).pathname); });
  if (j.owned) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, j.owned));
  }
  await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, EMPTY_CART));
  await page.route(/\/api\/cart\/items/, (r) => ok(r, 200, { ...EMPTY_CART, items: [{ id: 21, productId: 1, productTitle: 'Middle East', productHandle: 'middle-east', variantName: 'Premium', unitPrice: 99, quantity: 1, total: 99 }], itemCount: 1, subtotal: 99, total: 99 }));
  await page.route(/\/api\/cart\/checkout/, async (r) => { if (r.request().method() === 'OPTIONS') return ok(r, 204, null); await new Promise((f) => setTimeout(f, 2500)); return ok(r, 200, { id: 501, orderNumber: 'O-501', total: 99 }); });
  await page.route(/\/api\/payments\/checkout/, (r) => ok(r, 200, { sessionId: 'cs_stub', sessionUrl: `${ORIGIN}/__stripe-stub` }));
  await page.route(/\/__stripe-stub/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>stripe stub</body></html>' }));
  const row = { id: j.id, vp: `${w}x${h}`, click: j.click };
  try { await page.goto(BASE + j.path, { waitUntil: 'load', timeout: 60000 }); } catch { row.gotoError = true; }
  const loc = page.locator('a, button').filter({ hasText: new RegExp(`^\\s*${j.click}\\s*$`) });
  try { await loc.first().waitFor({ state: 'visible', timeout: 15000 }); } catch {}
  row.count = await loc.count();
  if (row.count === 1) {
    const el = loc.first();
    await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${label}-${j.id}-${w}-before.png` });
    const bb = await el.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    row.hit = await page.evaluate(([x, y, n]) => { const a = document.elementFromPoint(x, y); const l = a && a.closest('a,button'); return !!(l && l.innerText.trim() === n); }, [cx, cy, j.click]);
    if (j.dbl) await page.mouse.dblclick(cx, cy); else await page.mouse.click(cx, cy);
    if (j.id === 'J3' || j.id === 'J4') {
      await page.waitForTimeout(900);
      row.busy = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => /Processing/.test(x.innerText)); if (!b) return null; const cs = getComputedStyle(b); const r = b.getBoundingClientRect(); const svg = b.querySelector('svg');
        return { text: b.innerText.trim(), disabled: b.disabled, opacity: cs.opacity, pointerEvents: cs.pointerEvents, cursor: cs.cursor, bg: cs.backgroundColor, w: Math.round(r.width), h: Math.round(r.height), svgCls: svg ? svg.getAttribute('class') : null }; });
      await page.screenshot({ path: `${out}/${label}-${j.id}-${w}-busy.png` });
      await page.waitForURL(/__stripe-stub/, { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(500);
    } else {
      await page.waitForTimeout(2000);
    }
    row.arrived = new URL(page.url()).pathname + new URL(page.url()).search;
    if (j.id === 'J2') row.after = { unlock: await page.locator('button').filter({ hasText: /^\s*Unlock Premium\s*$/ }).count(), upgrade: await page.locator('button').filter({ hasText: /^\s*Upgrade to Premium\s*$/ }).count() };
    if (j.id === 'J5') row.after = { dialog: await page.locator('[role="dialog"]').count(), signIn: await page.getByText(/sign in/i).count() };
    await page.screenshot({ path: `${out}/${label}-${j.id}-${w}-after.png` });
  }
  row.posts = posts;
  row.errors = errors.filter((e) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|favicon|stripe/i.test(e)).slice(0, 4);
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}-journey.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.id, r.vp, 'count', r.count, 'hit', r.hit, 'arrived', r.arrived, 'posts', JSON.stringify(r.posts), 'busy', JSON.stringify(r.busy || null), 'after', JSON.stringify(r.after || null), 'errors', r.errors.length);
