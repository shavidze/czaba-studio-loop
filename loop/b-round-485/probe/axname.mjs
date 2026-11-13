// usage: node axname.mjs <base> <out.json>
import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT] = process.argv.slice(2);
const ORD = (n, ps, items) => ({ id: Number(n), orderNumber: n, userId: 7, status: 'C', paymentStatus: ps, subtotal: 49, tax: 0, total: 49, currency: 'USD', createdAt: '2026-11-01T10:00:00Z', items });
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'p@example.invalid', accessToken: 'stub-token', refreshToken: 'r' })); });
await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'p@example.invalid' } }) }));
await ctx.route('**/api/orders/my**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: [ORD('1001', 'Paid', [{ id: 501, productId: 11, productTitle: 'Middle East', licenseType: 'Standard', unitPrice: 49, quantity: 1, total: 49 }])], totalCount: 1, pageNumber: 1, pageSize: 50 } }) }));
const p = await ctx.newPage(); await p.goto(BASE + '/account/orders'); await p.getByText('Order #1001').waitFor({ timeout: 30000 }); await p.waitForTimeout(1500);
const main = p.locator('main').first();
const snap = await (await main.count() ? main : p.locator('body')).ariaSnapshot();
const btn = p.locator('button[aria-controls]').first();
const res = { snapshot: snap, buttonCount: await btn.count() };
if (res.buttonCount) {
  res.buttonCursor = await btn.evaluate((e) => getComputedStyle(e).cursor);
  const cdp = await ctx.newCDPSession(p);
  const { nodes } = await cdp.send('Accessibility.getFullAXTree');
  res.axButtons = nodes.filter((n) => n.role?.value === 'button' && /Order/.test(n.name?.value ?? '')).map((n) => ({ name: n.name.value, expanded: n.properties?.find((x) => x.name === 'expanded')?.value?.value }));
  res.axHeadings = nodes.filter((n) => n.role?.value === 'heading' && /Order/.test(n.name?.value ?? '')).map((n) => ({ name: n.name.value, level: n.properties?.find((x) => x.name === 'level')?.value?.value }));
  await btn.click(); await p.waitForTimeout(300);
  res.pressedTransform = null;
}
writeFileSync(OUT, JSON.stringify(res, null, 1)); await b.close(); console.log('ok');
