// usage: BASE=http://127.0.0.1:5173 node measure-502.mjs <outdir> <label>
// Measures the three stage 2b-3 targets. CART-UPGRADE and REC-SCENE are -STUBBED rows (L36): Playwright page.route stubs, client path only.
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
const targets = [
  { id: 'CART-UPGRADE', path: '/cart', name: 'Upgrade', stubbed: true },
  { id: 'REC-SCENE', path: '/recordings/1', name: 'Create a scene', stubbed: true },
  { id: 'SHOWCASE-BROWSE', path: '/', name: 'Browse the Collection', scrollTo: true },
];
const viewports = [[1440, 900], [1280, 720], [375, 812]];
function lum(c) { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }
function contrast(a, b) { const x = lum(a), y = lum(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; }
const browser = await chromium.launch();
const res = [];
for (const t of targets) for (const [w, h] of viewports) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, t.stubbed ? AUTH : null);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  if (t.stubbed) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, CART));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, DOWNLOADS));
    await page.route(/\/api\/products\/1\/recordings/, (r) => ok(r, 200, CATALOG));
  }
  const row = { id: t.id, vp: `${w}x${h}`, stubbed: !!t.stubbed };
  try { const resp = await page.goto(BASE + t.path, { waitUntil: 'load', timeout: 60000 }); row.status = resp && resp.status(); } catch (e) { row.status = 'goto-error'; }
  const loc = page.getByRole('link', { name: t.name, exact: true });
  try { await loc.first().waitFor({ state: 'attached', timeout: 15000 }); } catch {}
  row.count = await loc.count();
  if (row.count) {
    const el = loc.first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(1800);
    const read = () => el.evaluate((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); let p = e.parentElement; let pbg = 'rgba(0, 0, 0, 0)'; while (p) { const b = getComputedStyle(p).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { pbg = b; break; } p = p.parentElement; } return { tag: e.tagName, href: e.getAttribute('href'), cls: e.className, text: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, font: `${cs.fontSize} / ${cs.fontWeight}`, padding: cs.padding, radius: cs.borderTopLeftRadius, shadow: cs.boxShadow, transform: cs.transform, opacity: cs.opacity, svg: e.querySelector('svg') ? getComputedStyle(e.querySelector('svg')).color : null, pageBg: pbg, lines: Math.round(r.height / parseFloat(cs.lineHeight || '20')) }; });
    row.rest = await read();
    row.restContrast = contrast(row.rest.color, row.rest.bg);
    const box = await el.boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.waitForTimeout(400);
    row.hit = await page.evaluate(([x, y, t]) => { const a = document.elementFromPoint(x, y); const l = a && a.closest('a'); return { top: a ? a.tagName + '.' + String(a.className).slice(0, 40) : null, isTarget: !!(l && l.innerText.trim() === t) }; }, [box.x + box.width / 2, box.y + box.height / 2, t.name]);
    row.hover = await read();
    row.hoverContrast = contrast(row.hover.color, row.hover.bg);
    await page.mouse.move(2, 2); await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${label}-${t.id}-${w}.png` });
    await el.screenshot({ path: `${out}/${label}-${t.id}-${w}-crop.png` }).catch(() => {});
  }
  row.errors = errors.filter((e) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|favicon/.test(e)).slice(0, 4);
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.id, r.vp, 'count', r.count, r.rest ? `${r.rest.w}x${r.rest.h} bg ${r.rest.bg} color ${r.rest.color} font ${r.rest.font} pad ${r.rest.padding} radius ${r.rest.radius} hoverBg ${r.hover.bg} hoverT ${r.hover.transform} c ${r.restContrast}/${r.hoverContrast}` : '', 'errors', r.errors.length);
