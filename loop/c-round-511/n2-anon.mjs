// usage: BASE=http://127.0.0.1:5173 node n2-states.mjs <outdir> <label>
// Round 511 (NONBRAND N2) baseline probe: reaches every PurchaseHeader state whose controls N2 touches and measures them.
// States (-STUBBED where signed in, L36): ANON (middle-east), UNKNOWN (harbour-lights client-nav _data with prices removed),
// OWNED_SFX (door-slams owned -> "Open in Studio" + "Go to Downloads"), OWNED_STD (middle-east Standard owned -> "Downloads" + "Upgrade to Premium"),
// STEMS (harbour-lights, Premium selected -> count "Play Stems").
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3] || 'head';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: body }) });
const EMPTY_CART = { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 };
const dl = (productId, handle, licenseType, category) => ({ products: [{ isAvailable: true, productId, productTitle: 'Stub', handle, category, licenseType, purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] });
const STATES = [{ id: 'ANON', path: '/products/middle-east', owned: null, names: ['Add to Cart', 'Buy Now'] }].concat(0 ? [
  { id: 'ANON', path: '/products/middle-east', owned: null, names: ['Add to Cart', 'Buy Now'] },
  { id: 'UNKNOWN', path: '/products/middle-east', nav: '/products/harbour-lights', unknown: true, owned: null, names: ['Add to Cart', 'Buy Now'] },
  { id: 'OWNED_SFX', path: '/products/door-slams', owned: dl(6, 'door-slams', 'Universal', 'sfx'), names: ['Open in Studio', 'Go to Downloads'] },
  { id: 'OWNED_STD', path: '/products/middle-east', owned: dl(1, 'middle-east', 'Standard', 'music'), names: ['Downloads', 'Upgrade to Premium'] },
  { id: 'STEMS', path: '/products/harbour-lights', owned: null, premium: true, names: ['Add to Cart', 'Buy Now'] },
] : []);
const measure = (names) => {
  const res = {};
  for (const n of names) {
    const els = [...document.querySelectorAll('a,button')].filter((e) => e.innerText.trim() === n);
    res[n] = els.map((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const card = e.closest('.rounded-xl'); const cr = card ? card.getBoundingClientRect() : null;
      return { tag: e.tagName, cls: e.getAttribute('class'), type: e.getAttribute('type'), disabled: e.disabled === true, ariaDisabled: e.getAttribute('aria-disabled'), describedby: e.getAttribute('aria-describedby'),
        x: Math.round(r.x * 10) / 10, y: Math.round(r.y * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, radius: cs.borderTopLeftRadius,
        bg: cs.backgroundColor, color: cs.color, border: `${cs.borderTopWidth} ${cs.borderTopStyle} ${cs.borderTopColor}`, fontWeight: cs.fontWeight, fontSize: cs.fontSize, padding: `${cs.paddingTop} ${cs.paddingRight}`, opacity: cs.opacity, cursor: cs.cursor, pointerEvents: cs.pointerEvents,
        tabIndex: e.tabIndex, cardBg: card ? getComputedStyle(card).backgroundColor : null, cardH: cr ? Math.round(cr.height * 10) / 10 : null, cardW: cr ? Math.round(cr.width * 10) / 10 : null };
    });
  }
  res.playStems = [...document.querySelectorAll('a,button')].filter((e) => /Play Stems/.test(e.innerText)).length;
  return res;
};
const browser = await chromium.launch();
const res = [];
for (const s of STATES) for (const [w, h] of [[1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, s.owned ? AUTH : null);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  if (s.owned) {
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, s.owned));
  }
  await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, EMPTY_CART));
  if (s.unknown) {
    await page.route(/\/products\/harbour-lights\?.*_data=/, async (route) => {
      const r = await route.fetch(); const j = await r.json(); const p = j.product;
      p.standardPrice = null; p.premiumPrice = null; p.minPrice = null;
      p.variants = (p.variants || []).map((v) => ({ ...v, price: null }));
      await route.fulfill({ response: r, json: j });
    });
  }
  const row = { id: s.id, vp: `${w}x${h}` };
  try { await page.goto(BASE + s.path, { waitUntil: 'load', timeout: 60000 }); } catch { row.gotoError = true; }
  await page.waitForTimeout(4000);
  if (s.nav) { row.viaRouter = await page.evaluate(async (to) => { const r = window.__remixRouter; if (!r) return false; await r.navigate(to); return true; }, s.nav); await page.waitForTimeout(3000); }
  if (s.premium) { const card = page.locator('button,[role=radio]').filter({ hasText: /Premium/ }).first(); try { await card.click({ timeout: 5000 }); row.premiumClicked = true; } catch { row.premiumClicked = false; } await page.waitForTimeout(1500); }
  row.m = await page.evaluate(measure, s.names);
  row.priceReason = await page.locator('text=Price unavailable').count();
  const first = row.m[s.names[0]]?.[0];
  if (first) { await page.locator('a,button').filter({ hasText: new RegExp(`^\\s*${s.names[0]}\\s*$`) }).first().scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => { row.scrollFail = true; }); await page.waitForTimeout(600); }
  await page.screenshot({ path: `${out}/${label}-${s.id}-${w}.png` });
  row.errors = errors;
  res.push(row);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}-states.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.id, r.vp, JSON.stringify(Object.fromEntries(Object.entries(r.m).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => `${x.tag} ${x.w}x${x.h} r${x.radius} ${x.bg} ${x.color} fw${x.fontWeight} op${x.opacity} ${x.cursor} ad${x.ariaDisabled} dis${x.disabled}`) : v]))), 'reason', r.priceReason, 'err', r.errors.length);
