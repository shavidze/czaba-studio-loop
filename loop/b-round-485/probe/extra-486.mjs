// usage: node extra-486.mjs <base> <out.json> <shotdir> <tag>
// 375x812 layout (flex-col), text selection of the order number, pressed transform. Signed-in stub, 2 orders, LeadMagnet dismissed.
import { createRequire } from 'node:module'; import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, OUT, SHOTS, TAG] = process.argv.slice(2); mkdirSync(SHOTS, { recursive: true });
const it = (id, t, lic, p) => ({ id, productId: id, productTitle: t, licenseType: lic, unitPrice: p, quantity: 1, total: p });
const ORDERS = [
  { id: 101, orderNumber: '1001', userId: 7, status: 'C', paymentStatus: 'Paid', subtotal: 49, tax: 0, total: 49, currency: 'USD', createdAt: '2026-11-01T10:00:00Z', items: [{ ...it(501, 'Middle East', 'Standard', 49), variantName: 'Full mix + 4 stems' }] },
  { id: 102, orderNumber: '1002', userId: 7, status: 'C', paymentStatus: 'Pending', subtotal: 98, tax: 0, total: 98, currency: 'USD', createdAt: '2026-11-05T10:00:00Z', items: [it(502, 'Night Drive', 'Extended', 59), it(503, 'Dust Storm', 'Standard', 39)] },
];
const out = { base: BASE, tag: TAG, rows: {} }; const b = await chromium.launch();
const boxes = (p) => p.evaluate(() => { const r = (e) => { const x = e.getBoundingClientRect(); return [x.x, x.y, x.width, x.height].map((v) => Math.round(v * 10) / 10); };
  const ts = [...document.querySelectorAll('*')].filter((e) => e.childElementCount === 0 && /^Order #100[12]$/.test(e.textContent?.trim() ?? ''));
  return ts.map((t) => { let c = t; while (c && !(c.className?.includes?.('overflow-hidden') && c.className.includes('border'))) c = c.parentElement; return { title: r(t), card: r(c), header: r(c.firstElementChild) }; }); });
for (const [w, h] of [[375, 812], [1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const rows = {};
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'p@example.invalid', accessToken: 'stub-token', refreshToken: 'r' })); });
  await ctx.route('**/api/auth/profile', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 7, email: 'p@example.invalid' } }) }));
  await ctx.route('**/api/orders/my**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { items: ORDERS, totalCount: 2, pageNumber: 1, pageSize: 50 } }) }));
  const p = await ctx.newPage(); await p.goto(BASE + '/account/orders'); await p.getByText('Order #1001').waitFor({ timeout: 30000 }); await p.waitForTimeout(2000);
  rows.collapsedBoxes = await boxes(p);
  await p.screenshot({ path: `${SHOTS}/${TAG}-x-collapsed-${vp}.png`, fullPage: true });
  const title = p.getByText('Order #1001', { exact: true }); const tb = await title.boundingBox();
  // pressed transform
  await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.mouse.down(); await p.waitForTimeout(150);
  rows.pressedTransform = await p.evaluate(() => { const t = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent?.trim() === 'Order #1001'); const el = t.closest('button') ?? t.closest('.overflow-hidden').firstElementChild; return { tag: el.tagName, transform: getComputedStyle(el).transform }; });
  await p.mouse.up(); await p.waitForTimeout(400);
  rows.afterPressClickExpanded = await p.evaluate(() => [...document.querySelectorAll('h4')].some((h) => h.textContent === 'Middle East' && h.offsetParent !== null) ? 'items-visible' : 'items-hidden');
  rows.expandedBoxes = await boxes(p);
  await p.screenshot({ path: `${SHOTS}/${TAG}-x-expanded-${vp}.png`, fullPage: true });
  // collapse again by click
  await title.click(); await p.waitForTimeout(400);
  // double-click selection
  await p.evaluate(() => getSelection().removeAllRanges());
  await title.dblclick(); await p.waitForTimeout(300);
  rows.dblclickSelection = await p.evaluate(() => getSelection().toString());
  rows.afterDblclickExpandedState = await p.evaluate(() => [...document.querySelectorAll('h4')].some((h) => h.textContent === 'Middle East' && h.offsetParent !== null) ? 'items-visible' : 'items-hidden');
  // drag selection across the title
  await p.reload(); await p.getByText('Order #1001').waitFor({ timeout: 30000 }); await p.waitForTimeout(1500);
  const tb2 = await p.getByText('Order #1001', { exact: true }).boundingBox();
  await p.evaluate(() => getSelection().removeAllRanges());
  await p.mouse.move(tb2.x + 1, tb2.y + tb2.height / 2); await p.mouse.down(); await p.mouse.move(tb2.x + tb2.width - 1, tb2.y + tb2.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(300);
  rows.dragSelection = await p.evaluate(() => getSelection().toString());
  rows.afterDragExpandedState = await p.evaluate(() => [...document.querySelectorAll('h4')].some((h) => h.textContent === 'Middle East' && h.offsetParent !== null) ? 'items-visible' : 'items-hidden');
  rows.titleUserSelect = await p.evaluate(() => { const t = [...document.querySelectorAll('*')].find((e) => e.childElementCount === 0 && e.textContent?.trim() === 'Order #1001'); return getComputedStyle(t).userSelect; });
  out.rows[vp] = rows; await ctx.close();
}
await b.close(); writeFileSync(OUT, JSON.stringify(out, null, 1)); console.log('ok');
