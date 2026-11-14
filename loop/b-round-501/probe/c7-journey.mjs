// usage: BASE=... node c7-journey.mjs <outdir> <label>   (needs the loop mock API on :5199 for /store; the cart is stubbed)
// 375x812 anonymous journey: /store -> header "Cart" -> /cart (3 stubbed items, coupon + gift card applied) -> mouse wheel only (no scrollIntoView, no Playwright auto-scroll)
// until each title is the hit-test target at its centre -> mouse click at the last Remove's centre -> Cancel -> wheel to Checkout -> mouse click -> "Sign in".
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const items = Array.from({ length: 3 }, (_, k) => ({ id: 11 + k, productId: k + 1, productTitle: `Stub Track ${k + 1}`, productHandle: `stub-track-${k + 1}`, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }));
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 812 } });
await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); });
const p = await ctx.newPage(); const errors = []; const steps = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
await p.route(/\/api\/cart(\?|$)/, (r) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 1, items, itemCount: 3, subtotal: 87, discountAmount: 5, giftCardAmount: 10, total: 72, appliedCoupon: { code: 'SAVE5', description: 'Five off', discountType: 'fixed', discountValue: 5, discountAmount: 5 }, appliedGiftCard: { code: 'GC-1', maskedCode: '****-0001', balance: 50, amountToUse: 10 } } }) }));
const inView = (loc) => loc.evaluate((e) => { const r = e.getBoundingClientRect(); if (r.height === 0 || r.top < 0 || r.bottom > innerHeight) return false; const t = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !!t && (t === e || e.contains(t)); }).catch(() => false);
const clickCentre = async (loc) => { const bx = await loc.boundingBox(); await p.mouse.click(bx.x + bx.width / 2, bx.y + bx.height / 2); };
const shot = async (n) => { await p.screenshot({ path: `${out}/${label}-c7-${n}.png` }); };
const wheelUntil = async (loc, max = 12) => { for (let i = 0; i < max; i++) { if (await inView(loc)) return true; await p.mouse.move(187, 400); await p.mouse.wheel(0, 250); await p.waitForTimeout(900); } return inView(loc); };
try {
  await p.goto(BASE + '/store', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2500);
  steps.push({ step: 'store', path: new URL(p.url()).pathname, cards: await p.locator('a[href^="/products/"]').count() }); await shot('1-store');
  await p.getByRole('link', { name: 'Cart', exact: true }).first().click();
  await p.getByText('Order Summary').first().waitFor({ timeout: 20000 }); await p.waitForTimeout(1500);
  steps.push({ step: 'cart', path: new URL(p.url()).pathname }); await shot('2-cart');
  const seen = [];
  for (const n of [1, 2, 3]) { const t = p.getByRole('link', { name: `Stub Track ${n}`, exact: true }); seen.push(await wheelUntil(t)); }
  steps.push({ step: 'titles-visible-on-the-way-down', seen, scrollY: await p.evaluate(() => Math.round(scrollY)) }); await shot('3-last-item');
  const removes = p.getByRole('button', { name: 'Remove item' });
  const removeSeen = await wheelUntil(removes.nth(2));
  await clickCentre(removes.nth(2)); await p.waitForTimeout(600);
  const dlg = await p.getByText('Remove from collection?').isVisible();
  await shot('4-remove-dialog');
  if (dlg) { await p.getByRole('button', { name: 'Cancel', exact: true }).click(); await p.waitForTimeout(600); }
  steps.push({ step: 'remove-cancel', removeSeen, dialog: dlg, closed: !(await p.getByText('Remove from collection?').isVisible()), titles: await p.getByRole('link', { name: /^Stub Track \d$/ }).count() });
  const co = p.getByRole('button', { name: 'Proceed to Checkout' });
  const coSeen = await wheelUntil(co);
  await clickCentre(co); await p.waitForTimeout(1500);
  steps.push({ step: 'checkout', reachedByWheel: coSeen, signIn: await p.getByRole('heading', { name: 'Sign in', exact: true }).isVisible() }); await shot('5-sign-in');
} catch (e) { steps.push({ step: 'error', error: String(e).split('\n')[0].slice(0, 200) }); }
await b.close();
const res = { steps, errors };
fs.writeFileSync(`${out}/${label}-c7.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
