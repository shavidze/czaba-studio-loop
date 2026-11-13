// usage: BASE=http://127.0.0.1:5173 node nav-498.mjs <outdir> <tag>   (Enter on each link, final URL; then the C7 journey)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head'; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const rows = [
  ['/checkout/cancel', 'Return to Cart'], ['/checkout/cancel', 'Continue Shopping'],
  ['/checkout/success', 'Access Your Downloads'], ['/checkout/success', 'Discover More'],
  ['/faq', 'Contact Us'], ['/account/orders', 'Browse Music', true],
];
const res = { nav: [], journey: [] };
const browser = await chromium.launch();
for (const [path, name, auth] of rows) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((a) => { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); if (a) localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'buyer@example.invalid', firstName: 'Test' })); }, !!auth);
  const page = await ctx.newPage(); const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
  await page.route(/\/api\/orders\/my/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0, pageNumber: 1, pageSize: 50 }) }));
  let docLoads = 0; page.on('load', () => { docLoads++; });
  await page.goto(BASE + path, { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(3000);
  const loads0 = docLoads;
  const el = page.getByRole('link', { name, exact: true }).first();
  await el.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(3000);
  const active = await page.evaluate(() => ({ tag: document.activeElement?.tagName, text: (document.activeElement?.textContent || '').trim().slice(0, 40) }));
  res.nav.push({ from: path, name, finalPath: new URL(page.url()).pathname, fullDocumentLoad: docLoads > loads0, active, errors });
  await ctx.close();
}
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet_dismissed', '1'));
const page = await ctx.newPage(); const errors = []; page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
await page.goto(BASE + '/checkout/cancel', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/${tag}-j1-cancel.png` }); res.journey.push(new URL(page.url()).pathname);
await page.getByRole('link', { name: 'Return to Cart', exact: true }).click(); await page.waitForTimeout(2500);
await page.screenshot({ path: `${out}/${tag}-j2-cart.png` }); res.journey.push(new URL(page.url()).pathname);
await page.goBack(); await page.waitForTimeout(2500); res.journey.push(new URL(page.url()).pathname);
await page.getByRole('link', { name: 'Continue Shopping', exact: true }).click(); await page.waitForTimeout(3000);
await page.screenshot({ path: `${out}/${tag}-j3-store.png` }); res.journey.push(new URL(page.url()).pathname);
res.journeyErrors = errors;
await browser.close();
fs.writeFileSync(`${out}/${tag}-nav.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res.nav.map((r) => [r.name, r.finalPath, r.fullDocumentLoad, r.active.tag, r.errors.length])), res.journey, res.journeyErrors.length);
