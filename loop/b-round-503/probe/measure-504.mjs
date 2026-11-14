// usage: BASE=http://127.0.0.1:5173 node measure-504.mjs <outdir> <label>
// Round 504 (DPG-BUTTON-CLEANUP-2 stage 2c, PurchaseHeader). -STUBBED rows (L36): page.route stubs auth profile,
// downloads (ownership), cart and checkout; the product itself comes from the loop mock API (:5199). Client path only.
// States: S1P owns Premium (middle-east), S1X owns SFX Universal (door-slams), S2 owns Standard + Standard selected,
// S3 owns Standard + ?upgrade=premium, S0 anonymous (siblings only). Measures every action in the PurchaseHeader card.
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
const EMPTY_CART = { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 };
const dl = (productId, handle, licenseType, category) => ({ products: [{ isAvailable: true, productId, productTitle: 'Stub', handle, category, licenseType, purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] });
const states = [
  { id: 'S1P', path: '/products/middle-east', owned: dl(1, 'middle-east', 'Premium', 'music'), targets: ['Go to Downloads'] },
  { id: 'S1X', path: '/products/door-slams', owned: dl(6, 'door-slams', 'Universal', 'sfx'), targets: ['Go to Downloads', 'Open in Studio'] },
  { id: 'S2', path: '/products/middle-east', owned: dl(1, 'middle-east', 'Standard', 'music'), targets: ['Upgrade to Premium', 'Downloads'] },
  { id: 'S3', path: '/products/middle-east?upgrade=premium', owned: dl(1, 'middle-east', 'Standard', 'music'), targets: ['Unlock Premium', 'Add to Cart'] },
  { id: 'S0', path: '/products/middle-east', owned: null, targets: ['Buy Now', 'Add to Cart'] },
];
const viewports = [[1440, 900], [1280, 720], [375, 812]];
function lum(c) { const m = c.match(/\d+(\.\d+)?/g).map(Number); const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }
function contrast(a, b) { if (!a || !b || /rgba\(0, 0, 0, 0\)/.test(b)) return null; const x = lum(a), y = lum(b); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; }
const browser = await chromium.launch();
const res = [];
for (const s of states) for (const [w, h] of viewports) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, s.owned ? AUTH : null);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  if (s.owned) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, s.owned));
  }
  await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, EMPTY_CART));
  const row = { id: s.id, vp: `${w}x${h}`, stubbed: !!s.owned, items: [] };
  try { const resp = await page.goto(BASE + s.path, { waitUntil: 'load', timeout: 60000 }); row.status = resp && resp.status(); } catch { row.status = 'goto-error'; }
  for (const name of s.targets) {
    const loc = page.locator('a, button').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) });
    try { await loc.first().waitFor({ state: 'visible', timeout: 15000 }); } catch {}
    const item = { name, count: await loc.count() };
    row.items.push(item);
    if (item.count !== 1) continue;
    const el = loc.first();
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(1500);
    const read = () => el.evaluate((e) => {
      const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      const svg = e.querySelector('svg'); const sr = svg && svg.getBoundingClientRect();
      return { tag: e.tagName, type: e.getAttribute('type'), href: e.getAttribute('href'), disabled: e.disabled ?? null, cls: e.className, text: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        display: cs.display, bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, font: `${cs.fontSize} / ${cs.fontWeight}`, padding: cs.padding, gap: cs.columnGap, radius: cs.borderTopLeftRadius, minWidth: cs.minWidth, shadow: cs.boxShadow,
        transform: cs.transform, opacity: cs.opacity, transition: `${cs.transitionProperty} ${cs.transitionDuration}`, cursor: cs.cursor, whiteSpace: cs.whiteSpace, pointerEvents: cs.pointerEvents,
        svg: svg ? { color: getComputedStyle(svg).color, w: Math.round(sr.width), h: Math.round(sr.height) } : null,
        row: (() => { const p = e.parentElement; const pr = p.getBoundingClientRect(); return { w: Math.round(pr.width), h: Math.round(pr.height), kids: p.children.length }; })(),
        card: (() => { const c = e.closest('div.p-6'); if (!c) return null; const cr = c.getBoundingClientRect(); return { y: Math.round(cr.y), w: Math.round(cr.width), h: Math.round(cr.height) }; })() };
    });
    item.rest = await read();
    item.restContrast = contrast(item.rest.color, item.rest.bg);
    const bb = await el.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
    await page.mouse.move(cx, cy); await page.waitForTimeout(400);
    item.hit = await page.evaluate(([x, y, n]) => { const a = document.elementFromPoint(x, y); const l = a && a.closest('a,button'); return { top: a ? a.tagName : null, isTarget: !!(l && l.innerText.trim() === n) }; }, [cx, cy, name]);
    const hov = await read();
    item.hover = { bg: hov.bg, color: hov.color, transform: hov.transform, border: hov.border, cursor: hov.cursor };
    item.hoverContrast = contrast(hov.color, hov.bg);
    await page.mouse.down(); await page.waitForTimeout(250);
    const pressed = await read();
    item.press = { transform: pressed.transform, opacity: pressed.opacity, bg: pressed.bg, focusVisible: await el.evaluate((e) => e.matches(':focus-visible')) };
    await page.evaluate(() => document.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true }));
    await page.mouse.move(2, 2); await page.mouse.up(); await page.waitForTimeout(300);
    await el.evaluate((e) => e.blur());
    await page.keyboard.press('Escape');
    await el.evaluate((e) => e.focus());
    await page.waitForTimeout(250);
    item.focus = await el.evaluate((e) => { const cs = getComputedStyle(e); return { source: document.documentElement.dataset.focusSource || null, focusVisible: e.matches(':focus-visible'), active: document.activeElement === e, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, offset: cs.outlineOffset }; });
    const pad = 8; const fb = await el.boundingBox();
    await page.screenshot({ path: `${out}/${label}-${s.id}-${w}-${name.replace(/\W+/g, '_')}-focus.png`, clip: { x: Math.max(0, fb.x - pad), y: Math.max(0, fb.y - pad), width: fb.width + 2 * pad, height: fb.height + 2 * pad } }).catch(() => {});
    await el.evaluate((e) => e.blur());
    await page.mouse.move(2, 2); await page.waitForTimeout(300);
  }
  row.cardInfo = await page.evaluate(() => { const c = [...document.querySelectorAll('div.p-6')].find((d) => d.querySelector('a[href], button')); if (!c) return null; const de = document.documentElement;
    return { focusables: [...c.querySelectorAll('a[href], button')].map((e) => e.innerText.trim()), cardScrollW: c.scrollWidth, cardClientW: c.clientWidth, docOverflowX: de.scrollWidth - de.clientWidth }; });
  const first = page.locator('div.p-6').filter({ has: page.locator('a, button') }).first();
  await first.screenshot({ path: `${out}/${label}-${s.id}-${w}-card.png` }).catch(() => {});
  row.errors = errors.filter((e) => !/Failed to load cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|favicon/.test(e)).slice(0, 4);
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}.json`, JSON.stringify(res, null, 1));
for (const r of res) {
  console.log(`== ${r.id} ${r.vp} status ${r.status} errors ${r.errors.length} card ${JSON.stringify(r.cardInfo)}`);
  for (const i of r.items) {
    const a = i.rest;
    console.log(`  ${i.name} count ${i.count}`, a ? `${a.tag} ${a.w}x${a.h} bg ${a.bg} color ${a.color} border ${a.border} font ${a.font} pad ${a.padding} radius ${a.radius} minW ${a.minWidth} shadow ${a.shadow} svg ${a.svg && a.svg.color} | hover ${i.hover.bg} | press op ${i.press.opacity} T ${i.press.transform} fv ${i.press.focusVisible} | focus ${i.focus.focusVisible} ${i.focus.outline} off ${i.focus.offset} | c ${i.restContrast}/${i.hoverContrast} hit ${i.hit.isTarget} | row ${JSON.stringify(a.row)} card ${JSON.stringify(a.card)}` : '');
  }
}
