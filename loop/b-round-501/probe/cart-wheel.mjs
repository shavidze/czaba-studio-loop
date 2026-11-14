// usage: BASE=... node cart-wheel.mjs <outdir> <label>
// -STUBBED lg rows: tall summary (coupon + gift card; ownership warning) on short screens. The user path only: mouse wheel over the summary
// (no scrollIntoView), then is the checkout button inside the viewport and inside main, and is it the hit-test target? Also Tab from the gift card field.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, b) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: b }) });
const item = (i) => ({ id: 10 + i, productId: i, productTitle: `Stub Track ${i}`, productHandle: `stub-track-${i}`, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 });
const extras = { discountAmount: 5, giftCardAmount: 10, appliedCoupon: { code: 'SAVE5', description: 'Five off', discountType: 'fixed', discountValue: 5, discountAmount: 5 }, appliedGiftCard: { code: 'GC-1', maskedCode: '****-0001', balance: 50, amountToUse: 10 } };
const states = [
  { id: 'EXTRAS', auth: false, n: 1, extras: true },
  { id: 'OWNED', auth: true, n: 1 },
  { id: 'OWNED-EXTRAS-3', auth: true, n: 3, extras: true },
];
const vps = (process.env.VPS || '1366x600,1366x657,1280x600,1366x720,1366x900,1440x900').split(',').map((s) => s.split('x').map(Number));
const b = await chromium.launch(); const rows = [];
for (const st of states) for (const [w, h] of vps) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((a) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (a) localStorage.setItem('auth_user', JSON.stringify(a)); } catch {} }, st.auth ? AUTH : null);
  const p = await ctx.newPage();
  await p.route(/\/api\/auth\/profile/, (r) => ok(r, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
  await p.route(/\/api\/cart(\?|$)/, (r) => ok(r, { id: 1, items: Array.from({ length: st.n }, (_, k) => item(k + 1)), itemCount: st.n, subtotal: 29 * st.n, discountAmount: 0, giftCardAmount: 0, total: 29 * st.n - (st.extras ? 15 : 0), ...(st.extras ? extras : {}) }));
  await p.route(/\/api\/downloads(\?|$)/, (r) => ok(r, { products: st.auth ? [{ isAvailable: true, productId: 1, productTitle: 'Stub Track 1', handle: 'stub-track-1', category: 'music', licenseType: 'Universal', purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] : [] }));
  await p.goto(BASE + '/cart', { waitUntil: 'load', timeout: 60000 });
  await p.getByText('Order Summary').first().waitFor({ timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(2500);
  const co = p.getByRole('button', { name: /Proceed to Checkout|Resolve Issues/ }).last();
  const read = () => co.evaluate((e) => { const r = e.getBoundingClientRect(); const m = document.querySelector('main').getBoundingClientRect(); const cx = r.x + r.width / 2; const cy = r.y + r.height / 2; const t = document.elementFromPoint(cx, Math.min(cy, innerHeight - 1)); let col = e; while (col && !String(col.className).includes('lg:col-span-1')) col = col.parentElement; return { top: Math.round(r.top), bottom: Math.round(r.bottom), mainBottom: Math.round(m.bottom), vh: innerHeight, inView: r.bottom <= Math.min(innerHeight, m.bottom) + 0.5 && r.top >= 0, hit: !!t && (t === e || e.contains(t) || (e.disabled && !!t.closest('div') && t.closest('div').contains(e))), col: col ? { h: Math.round(col.getBoundingClientRect().height), sh: col.scrollHeight, st: Math.round(col.scrollTop), ovY: getComputedStyle(col).overflowY } : null, winScroll: Math.round(scrollY) }; });
  const row = { state: st.id, vp: `${w}x${h}` };
  row.before = await read();
  const sb = await p.getByText('Order Summary').first().boundingBox();
  await p.mouse.move(sb.x + 40, sb.y + 20);
  for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 300); await p.waitForTimeout(150); }
  await p.waitForTimeout(600);
  row.afterWheel = await read();
  await p.screenshot({ path: `${out}/${label}-wheel-${st.id}-${w}x${h}.png` });
  // keyboard: reload state by scrolling back, focus gift card field, Tab until the checkout button
  await p.evaluate(() => { scrollTo(0, 0); document.querySelectorAll('.lg\\:col-span-1, .lg\\:col-span-2').forEach((c) => { c.scrollTop = 0; }); });
  let tabbedTo = null;
  const started = await p.evaluate(() => { const h = [...document.querySelectorAll('h2, h3')].find((e) => e.textContent.trim() === 'Order Summary'); let c = h; while (c && !String(c.className).includes('lg:col-span-1')) c = c.parentElement; const f = c && c.querySelector('input, button:not([disabled]), a[href]'); if (f) { f.focus(); return f.tagName + ':' + (f.getAttribute('placeholder') || f.innerText || '').slice(0, 20); } return null; });
  row.tabStart = started;
  if (started && !st.auth) { for (let i = 0; i < 15; i++) { await p.keyboard.press('Tab'); const t = await p.evaluate(() => document.activeElement && document.activeElement.innerText ? document.activeElement.innerText.trim().slice(0, 30) : document.activeElement && document.activeElement.tagName); if (/Checkout/.test(t || '')) { tabbedTo = t; break; } } }
  row.tab = { reached: tabbedTo, state: tabbedTo ? await read() : null, ring: tabbedTo ? await co.evaluate((e) => { const cs = getComputedStyle(e); return { outline: cs.outlineStyle, w: cs.outlineWidth, off: cs.outlineOffset }; }) : null };
  if (tabbedTo) await p.screenshot({ path: `${out}/${label}-tab-${st.id}-${w}x${h}.png` });
  rows.push(row); await ctx.close();
}
await b.close(); fs.writeFileSync(`${out}/${label}-wheel.json`, JSON.stringify(rows, null, 1));
for (const r of rows) console.log(r.state, r.vp, 'before', `${r.before.top}-${r.before.bottom}/${r.before.mainBottom}`, r.before.inView, 'wheel', `${r.afterWheel.top}-${r.afterWheel.bottom}/${r.afterWheel.mainBottom}`, 'inView', r.afterWheel.inView, 'hit', r.afterWheel.hit, 'col', JSON.stringify(r.afterWheel.col), 'tab', r.tab.reached ? `${r.tab.state.inView} ${JSON.stringify(r.tab.ring)}` : 'n/a');
