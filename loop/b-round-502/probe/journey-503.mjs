// usage: BASE=http://127.0.0.1:5173 node journey-503.mjs <outdir> <label>
// Round 503 journey (L54) at 1440x900 and 375x812: home -> scroll to the Studio showcase -> mouse click "Browse the Collection" -> /store;
// /cart (stubbed owned item) -> mouse click "Upgrade" -> product page URL; /recordings/1 (stubbed Universal catalogue) -> mouse click
// "Create a scene" -> /scenes/1. Cart and recordings steps are -STUBBED (L36). Clicks are real mouse clicks at the element centre.
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
const CART = { id: 1, items: [{ id: 11, productId: 1, productTitle: 'Stub Track', productHandle: 'stub-track', variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }], itemCount: 1, subtotal: 29, discountAmount: 0, giftCardAmount: 0, total: 29 };
const DOWNLOADS = { products: [{ isAvailable: true, productId: 1, productTitle: 'Stub Track', handle: 'stub-track', category: 'music', licenseType: 'Universal', purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] };
const CATALOG = { productId: 1, productTitle: 'Stub Catalogue', licenseType: 'Universal', recordings: [{ id: 5, title: 'Door slam', durationMs: 2000, sampleRateHz: 48000, bitDepth: 24, channels: 2, position: 1 }] };
const steps = [
  { id: 'SHOWCASE-BROWSE', path: '/', name: 'Browse the Collection', section: 'Only at CZABA', expect: '/store' },
  { id: 'CART-UPGRADE', path: '/cart', name: 'Upgrade', stubbed: true, expect: '/products/stub-track?upgrade=premium' },
  { id: 'REC-SCENE', path: '/recordings/1', name: 'Create a scene', stubbed: true, expect: '/scenes/1' },
];
const browser = await chromium.launch();
const res = [];
for (const [w, h] of [[1440, 900], [375, 812]]) for (const s of steps) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, s.stubbed ? AUTH : null);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  if (s.stubbed) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, CART));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, DOWNLOADS));
    await page.route(/\/api\/products\/1\/recordings/, (r) => ok(r, 200, CATALOG));
  }
  const row = { id: s.id, vp: `${w}x${h}` };
  await page.goto(BASE + s.path, { waitUntil: 'load', timeout: 60000 });
  const scope = s.section ? page.locator('section', { hasText: s.section }) : page;
  const el = scope.getByRole('link', { name: s.name, exact: true });
  await el.first().waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});
  row.count = await el.count();
  if (row.count === 1) {
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${out}/${label}-journey-${s.id}-${w}-before.png` });
    const b = await el.boundingBox();
    row.hit = await page.evaluate(([x, y, n]) => { const a = document.elementFromPoint(x, y); const l = a && a.closest('a'); return !!(l && l.innerText.trim() === n); }, [b.x + b.width / 2, b.y + b.height / 2, s.name]);
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    await page.waitForURL((u) => (u.pathname + u.search) === s.expect, { timeout: 15000 }).catch(() => {});
    const u = new URL(page.url());
    row.arrived = u.pathname + u.search;
    row.ok = row.arrived === s.expect;
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/${label}-journey-${s.id}-${w}-after.png` });
  }
  row.errors = errors.filter((e) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|favicon|Failed to load resource|Failed to fetch/.test(e)).slice(0, 4);
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}-journey.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(JSON.stringify(r));
