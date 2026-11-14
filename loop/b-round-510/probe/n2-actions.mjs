// usage: BASE=http://127.0.0.1:5173 node n2-actions.mjs <outdir> <label>
// Round 511 (NONBRAND N2) interaction probe (-STUBBED signed-in, L36): A1 signed-in Buy Now click (POST counts, busy state, width),
// A2 Add to Cart click -> In Cart state (radius, colours), A3 keyboard Tab to Buy Now / mouse press (focus-visible ring),
// A4 price-unknown Buy Now click (0 POST, focus kept), A5 owned SFX Tab to "Open in Studio" ring. Viewports 1440x900 and 1280x720.
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
const ITEM_CART = { ...EMPTY_CART, items: [{ id: 21, productId: 1, productTitle: 'Middle East', productHandle: 'middle-east', productVariantId: 11, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }], itemCount: 1, subtotal: 29, total: 29 };
const box = (sel) => { const e = [...document.querySelectorAll('a,button')].find((x) => x.innerText.trim() === sel); if (!e) return null; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
  return { text: e.innerText.trim(), disabled: e.disabled === true, ariaDisabled: e.getAttribute('aria-disabled'), w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, color: cs.color, opacity: cs.opacity, cursor: cs.cursor, pointerEvents: cs.pointerEvents,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`, fv: e.matches(':focus-visible'), focused: document.activeElement === e, svg: !!e.querySelector('svg.animate-spin') }; };
const browser = await chromium.launch();
const res = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const sc of ['A1', 'A2', 'A3', 'A4', 'A5']) {
    const signed = sc === 'A1' || sc === 'A2' || sc === 'A5';
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, signed ? AUTH : null);
    const page = await ctx.newPage();
    const errors = []; const posts = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('request', (rq) => { if (rq.method() === 'POST' && /\/api\//.test(rq.url())) posts.push(new URL(rq.url()).pathname); });
    let cart = EMPTY_CART;
    if (signed) {
      await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
      const owned = sc === 'A5' ? { products: [{ isAvailable: true, productId: 6, productTitle: 'Stub', handle: 'door-slams', category: 'sfx', licenseType: 'Universal', purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] } : { products: [] };
      await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, owned));
    }
    await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, cart));
    await page.route(/\/api\/cart\/items/, async (r) => { if (r.request().method() === 'OPTIONS') return ok(r, 204, null); await new Promise((f) => setTimeout(f, 800)); cart = ITEM_CART; return ok(r, 200, ITEM_CART); });
    await page.route(/\/api\/cart\/checkout/, async (r) => { if (r.request().method() === 'OPTIONS') return ok(r, 204, null); await new Promise((f) => setTimeout(f, 2500)); return ok(r, 200, { id: 501, orderNumber: 'O-501', total: 29 }); });
    await page.route(/\/api\/payments\/checkout/, (r) => ok(r, 200, { sessionId: 'cs_stub', sessionUrl: `${ORIGIN}/__stripe-stub` }));
    await page.route(/\/__stripe-stub/, (r) => r.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>stripe stub</body></html>' }));
    if (sc === 'A4') {
      await page.route(/\/products\/harbour-lights\?.*_data=/, async (route) => { const r = await route.fetch(); const j = await r.json(); const p = j.product; p.standardPrice = null; p.premiumPrice = null; p.minPrice = null; p.variants = (p.variants || []).map((v) => ({ ...v, price: null })); await route.fulfill({ response: r, json: j }); });
    }
    const row = { sc, vp: `${w}x${h}` };
    await page.goto(BASE + (sc === 'A5' ? '/products/door-slams' : '/products/middle-east'), { waitUntil: 'load', timeout: 60000 }).catch(() => { row.gotoError = true; });
    await page.waitForTimeout(4000);
    if (sc === 'A4') { await page.evaluate(async () => { await window.__remixRouter.navigate('/products/harbour-lights'); }); await page.waitForTimeout(3000); }
    const target = sc === 'A2' ? 'Add to Cart' : sc === 'A5' ? 'Open in Studio' : 'Buy Now';
    const loc = page.locator('a,button').filter({ hasText: new RegExp(`^\\s*${target}\\s*$`) }).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    row.before = await page.evaluate(box, target);
    if (sc === 'A3' || sc === 'A5') {
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
      let found = false;
      for (let i = 0; i < 80 && !found; i++) { await page.keyboard.press('Tab'); found = await page.evaluate((t) => document.activeElement && document.activeElement.innerText && document.activeElement.innerText.trim() === t, target); }
      row.tabReached = found;
      await page.waitForTimeout(300);
      row.keyboard = await page.evaluate(box, target);
      await loc.screenshot({ path: `${out}/${label}-${sc}-${w}-kbd.png` }).catch(() => {});
      if (sc === 'A3') { const bb = await loc.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.waitForTimeout(150); row.pressed = await page.evaluate(box, target); await page.mouse.up(); await page.waitForTimeout(1500); row.afterMouse = await page.evaluate(box, target); row.dialogEmail = await page.locator('input[type=email]').count(); }
    } else {
      const bb = await loc.boundingBox();
      await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
      await page.waitForTimeout(sc === 'A1' ? 900 : sc === 'A2' ? 300 : 1500);
      if (sc === 'A1') { row.busy = await page.evaluate(box, 'Processing...'); await page.screenshot({ path: `${out}/${label}-A1-${w}-busy.png` }); await page.waitForURL(/__stripe-stub/, { timeout: 15000 }).catch(() => {}); row.arrived = new URL(page.url()).pathname; }
      if (sc === 'A2') { row.adding = await page.evaluate(box, 'Adding...'); await page.waitForTimeout(2500); row.inCart = await page.evaluate(box, 'In Cart'); row.added = await page.evaluate(box, 'Added'); await loc.screenshot({ path: `${out}/${label}-A2-${w}-after.png` }).catch(() => {}); await page.locator('a,button').filter({ hasText: /^\s*In Cart\s*$/ }).first().screenshot({ path: `${out}/${label}-A2-${w}-incart.png` }).catch(() => {}); }
      if (sc === 'A4') { row.after = await page.evaluate(box, target); row.url = new URL(page.url()).pathname; row.toast = await page.locator('[role=status],[role=alert]').allInnerTexts(); row.reasonId = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Buy Now'); const id = b && b.getAttribute('aria-describedby'); const p = id && document.getElementById(id); return p ? p.innerText.trim() : null; }); }
    }
    row.posts = posts;
    row.errors = errors;
    res.push(row);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/${label}-actions.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.sc, r.vp, JSON.stringify({ before: r.before && [r.before.w, r.before.h, r.before.radius], busy: r.busy && [r.busy.text, r.busy.disabled, r.busy.w, r.busy.svg, r.busy.opacity, r.busy.pointerEvents], adding: r.adding && [r.adding.text, r.adding.radius], inCart: r.inCart && [r.inCart.radius, r.inCart.bg, r.inCart.color, r.inCart.w], kbd: r.keyboard && [r.tabReached, r.keyboard.fv, r.keyboard.outline], pressed: r.pressed && [r.pressed.fv, r.pressed.outline], afterMouse: r.afterMouse && [r.afterMouse.fv, r.afterMouse.focused], after: r.after && [r.after.focused, r.after.opacity, r.after.cursor], reason: r.reasonId, toast: r.toast, posts: r.posts, arrived: r.arrived, err: r.errors.length }));
