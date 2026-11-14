// usage: BASE=... node cart-actions.mjs <outdir> <label>
// -STUBBED action rows at 375x812 and 1280x720: (a) anonymous: Remove item opens "Remove from collection?", Cancel closes it; checkout opens the sign-in modal.
// (b) signed-in not-owned: checkout sends POST /api/cart/checkout (stubbed 500 so no navigation happens).
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3] || 'run'; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const send = (r, status, b) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(status < 300 ? { success: true, data: b } : { success: false, error: 'stub' }) });
const CART = { id: 1, items: [{ id: 11, productId: 1, productTitle: 'Stub Track 1', productHandle: 'stub-track-1', variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }], itemCount: 1, subtotal: 29, discountAmount: 0, giftCardAmount: 0, total: 29, appliedCoupon: { code: 'SAVE5', description: 'Five off', discountType: 'fixed', discountValue: 5, discountAmount: 5 }, appliedGiftCard: { code: 'GC-1', maskedCode: '****-0001', balance: 50, amountToUse: 10 } };
const browser = await chromium.launch(); const rows = [];
for (const signedIn of [false, true]) for (const [w, h] of [[375, 812], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((a) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (a) localStorage.setItem('auth_user', JSON.stringify(a)); } catch {} }, signedIn ? AUTH : null);
  const page = await ctx.newPage(); const posts = [];
  await page.route(/\/api\/auth\/profile/, (r) => send(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
  await page.route(/\/api\/cart\/checkout/, (r) => { if (r.request().method() === 'POST') posts.push('checkout'); return send(r, 500, null); });
  await page.route(/\/api\/cart(\?|$)/, (r) => send(r, 200, CART));
  await page.route(/\/api\/downloads(\?|$)/, (r) => send(r, 200, { products: [] }));
  await page.goto(BASE + '/cart', { waitUntil: 'load', timeout: 60000 });
  await page.getByText('Order Summary').first().waitFor({ timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const row = { signedIn, vp: `${w}x${h}` };
  const title = page.getByRole('link', { name: 'Stub Track 1', exact: true });
  row.titleVisible = await title.isVisible().catch(() => false);
  row.titleHit = await title.evaluate((e) => { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!t && (t === e || e.contains(t)); }).catch(() => null);
  const remove = page.getByRole('button', { name: 'Remove item' });
  try { await remove.click({ timeout: 5000 }); row.removeClicked = true; } catch (e) { row.removeClicked = false; row.removeError = String(e).split('\n')[0].slice(0, 160); }
  row.dialog = await page.getByText('Remove from collection?').isVisible().catch(() => false);
  if (row.dialog) { await page.screenshot({ path: `${out}/${label}-remove-dialog-${signedIn ? 'in' : 'anon'}-${w}.png` }); await page.getByRole('button', { name: 'Cancel', exact: true }).click(); await page.waitForTimeout(500); row.dialogClosed = !(await page.getByText('Remove from collection?').isVisible().catch(() => false)); }
  const co = page.getByRole('button', { name: /checkout/i }).last();
  row.checkoutText = await co.innerText().catch(() => null);
  try { await co.click({ timeout: 5000 }); row.checkoutClicked = true; } catch (e) { row.checkoutClicked = false; row.checkoutError = String(e).split('\n')[0].slice(0, 160); }
  await page.waitForTimeout(1500);
  row.signinModal = await page.getByRole('heading', { name: 'Sign in', exact: true }).isVisible().catch(() => false);
  row.checkoutPosts = posts.length;
  await page.screenshot({ path: `${out}/${label}-after-checkout-${signedIn ? 'in' : 'anon'}-${w}.png` });
  rows.push(row); await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}-actions.json`, JSON.stringify(rows, null, 1));
for (const r of rows) console.log(JSON.stringify(r));
