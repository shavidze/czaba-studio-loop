// usage: MOCK=on|off BASE=http://127.0.0.1:5173 node nav-499.mjs <outdir> <tag>
// Focus each control by keyboard (Tab), press Enter, record the final path and whether a full document load happened.
// MOCK=on also runs the journey: /cart (empty) -> "Discover the Collection" -> /store -> back -> /cart.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
const MOCK = process.env.MOCK || 'on';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(status < 300 ? { success: true, data: body } : { success: false, error: 'stub' }) });
const targets = [
  { id: 'STORE-TRY', mock: 'off', path: '/store', role: 'link', name: 'Try again' },
  { id: 'CART-EMPTY', mock: 'on', path: '/cart', role: 'link', name: 'Discover the Collection' },
  { id: 'REC-DENIED-PRIMARY', mock: 'on', path: '/recordings/1', auth: true, rec: 403, role: 'link', name: 'Go to Downloads' },
  { id: 'REC-DENIED-GHOST', mock: 'on', path: '/recordings/1', auth: true, rec: 403, role: 'link', name: 'Browse the store' },
  { id: 'ROOT-ERR-TRY', mock: 'on', path: '/recordings/1', auth: true, rec: 'malformed', role: 'button', name: 'Try Again' },
  { id: 'ROOT-ERR-HOME', mock: 'on', path: '/recordings/1', auth: true, rec: 'malformed', role: 'link', name: 'Go Home' },
  { id: 'ROUTE-ERR-TRY', mock: 'on', path: '/products/does-not-exist-xyz', role: 'button', name: 'Try Again' },
].filter((t) => t.mock === MOCK);
async function setup(ctx, t) {
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, t.auth ? AUTH : null);
  if (t.auth) {
    await ctx.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await ctx.route(/\/api\/downloads/, (r) => ok(r, 200, []));
  }
  if (t.rec) await ctx.route(/\/api\/products\/1\/recordings/, (r) => t.rec === 'malformed' ? ok(r, 200, { productId: 1, productTitle: 'Stub', recordings: [] }) : ok(r, t.rec, null));
}
const res = { rows: [], journey: null };
const browser = await chromium.launch();
for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await setup(ctx, t);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  try { await page.goto(BASE + t.path, { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(3000);
  const el = page.getByRole(t.role, { name: t.name, exact: true }).first();
  const row = { id: t.id, start: t.path, count: await page.getByRole(t.role, { name: t.name, exact: true }).count() };
  if (row.count) {
    await page.evaluate(() => { window.__navMarker = 1; document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
    let found = false;
    for (let i = 0; i < 80 && !found; i++) { await page.keyboard.press('Tab'); found = await el.evaluate((e) => e === document.activeElement).catch(() => false); }
    row.focused = found;
    if (found) {
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      await page.waitForLoadState('load').catch(() => {});
      row.finalPath = new URL(page.url()).pathname;
      row.fullDocumentLoad = await page.evaluate(() => window.__navMarker !== 1).catch(() => 'eval-failed');
      row.activeElement = await page.evaluate(() => document.activeElement && document.activeElement.tagName).catch(() => 'eval-failed');
      await page.screenshot({ path: `${out}/${tag}-nav-${t.id}.png` }).catch(() => {});
    }
  }
  row.errors = errors.slice(0, 6);
  res.rows.push(row);
  await ctx.close();
}
if (MOCK === 'on') {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  const paths = [];
  await page.goto(BASE + '/cart', { waitUntil: 'load', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000); paths.push(new URL(page.url()).pathname); await page.screenshot({ path: `${out}/${tag}-j1.png` });
  await page.getByRole('link', { name: 'Discover the Collection', exact: true }).click().catch(() => {});
  await page.waitForTimeout(3000); paths.push(new URL(page.url()).pathname); await page.screenshot({ path: `${out}/${tag}-j2.png` });
  await page.goBack().catch(() => {});
  await page.waitForTimeout(3000); paths.push(new URL(page.url()).pathname); await page.screenshot({ path: `${out}/${tag}-j3.png` });
  res.journey = { paths, errors: errors.slice(0, 6), discoverVisibleAfterBack: await page.getByRole('link', { name: 'Discover the Collection', exact: true }).count() };
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${tag}-nav-${MOCK}.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res.rows.map((r) => [r.id, r.finalPath, r.fullDocumentLoad, r.activeElement])), JSON.stringify(res.journey && res.journey.paths));
