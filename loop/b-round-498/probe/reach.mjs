// usage: BASE=http://127.0.0.1:5173 node reach.mjs <outdir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const cases = [
  { id: 'STORE-ERROR', path: '/store', name: 'Try again', note: 'needs mock OFF' },
  { id: 'CART-EMPTY', path: '/cart', name: 'Discover the Collection' },
  { id: 'REC-NOTFOUND-PARAM', path: '/recordings/abc', name: 'Go to Downloads', auth: true },
  { id: 'REC-DENIED', path: '/recordings/1', name: 'Go to Downloads', name2: 'Browse the store', auth: true, stub: 403 },
  { id: 'REC-NOTFOUND-404', path: '/recordings/1', name: 'Go to Downloads', auth: true, stub: 404 },
  { id: 'REC-EMPTY', path: '/recordings/1', name: 'Go to Downloads', auth: true, stub: 200 },
  { id: 'ROOT-ERR-RENDER', path: '/recordings/1', name: 'Go Home', name2: 'Try Again', auth: true, stub: 200, malformed: true },
  { id: 'ROOT-ERR-STUDIO-404', path: '/studio/999999', name: 'Go Home', name2: 'Try Again' },
  { id: 'ROOT-ERR-STUDIO-400', path: '/studio/abc', name: 'Go Home', name2: 'Try Again' },
  { id: 'ROUTE-ERR-PRODUCT', path: '/products/does-not-exist-xyz', name: 'Go Home', name2: 'Try Again' },
  { id: 'DOWNLOADS-EMPTY', path: '/account/downloads', name: 'Browse Music', auth: true, stubDownloads: true },
];
const CORS = { 'access-control-allow-origin': 'http://127.0.0.1:5173', 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(status < 300 ? { success: true, data: body } : { success: false, error: 'stub' }) });
const browser = await chromium.launch();
const res = [];
for (const c of cases) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, c.auth ? AUTH : null);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 140)); });
  if (c.auth) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
  }
  if (c.stub) {
    await page.route(/\/api\/products\/1\/recordings/, (r) => c.stub === 200 ? ok(r, 200, (c.malformed ? { productId: 1, productTitle: 'Stub', recordings: [] } : { productId: 1, productTitle: 'Stub', licenseType: 'standard', recordings: [] })) : ok(r, c.stub, { error: 'stub' }));
  }
  if (c.auth || c.stubDownloads) {
    await page.route(/\/api\/(downloads|orders|library|account)/, (r) => ok(r, 200, []));
  }
  let status = null;
  try { const resp = await page.goto(BASE + c.path, { waitUntil: 'load', timeout: 45000 }); status = resp && resp.status(); } catch (e) { status = 'goto-error'; }
  await page.waitForTimeout(2500);
  const row = { id: c.id, path: c.path, status, errors: errors.slice(0, 4) };
  for (const key of ['name', 'name2']) {
    if (!c[key]) continue;
    const link = page.getByRole('link', { name: c[key], exact: true });
    const btn = page.getByRole('button', { name: c[key], exact: true });
    const nl = await link.count(); const nb = await btn.count();
    row[key] = { label: c[key], links: nl, buttons: nb };
    const el = nl ? link.first() : nb ? btn.first() : null;
    if (el) row[key].cls = await el.evaluate((e) => ({ tag: e.tagName, cls: e.className, h: Math.round(e.getBoundingClientRect().height), bg: getComputedStyle(e).backgroundColor, color: getComputedStyle(e).color, radius: getComputedStyle(e).borderTopLeftRadius }));
  }
  row.h1 = await page.locator('h1,h2').first().textContent().catch(() => null);
  row.stylesheets = await page.evaluate(() => document.styleSheets.length);
  await page.screenshot({ path: `${out}/${c.id}.png` });
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/reach.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
