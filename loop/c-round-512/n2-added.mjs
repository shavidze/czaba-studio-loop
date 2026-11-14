// usage: BASE=http://127.0.0.1:5173 node n2-added.mjs <outdir> <label>
// Round 512 record probe (-STUBBED signed-in, L36): Add to Cart click on /products/middle-east, sampled every 50 ms for 4 s.
// Records the label sequence (Add to Cart -> Adding... -> Added -> In Cart), the max CSS transform scale while "Added"
// shows, radius and colours, with prefers-reduced-motion no-preference and reduce. Viewports 1440x900 and 1280x720.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const label = process.argv[3] || 'b';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: body }) });
const EMPTY_CART = { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 };
const ITEM_CART = { ...EMPTY_CART, items: [{ id: 21, productId: 1, productTitle: 'Middle East', productHandle: 'middle-east', productVariantId: 11, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 }], itemCount: 1, subtotal: 29, total: 29 };
const sample = () => {
  const e = [...document.querySelectorAll('button')].find((x) => /^(Add to Cart|Adding\.\.\.|Added|In Cart)$/.test(x.innerText.trim()));
  if (!e) return null;
  const cs = getComputedStyle(e);
  const m = cs.transform && cs.transform !== 'none' ? cs.transform.match(/matrix\(([^,]+)/) : null;
  return { t: Math.round(performance.now()), text: e.innerText.trim(), scale: m ? Math.round(Number(m[1]) * 1000) / 1000 : 1, radius: cs.borderTopLeftRadius, bg: cs.backgroundColor, color: cs.color, w: Math.round(e.getBoundingClientRect().width) };
};
const browser = await chromium.launch();
const res = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const motion of ['no-preference', 'reduce']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: motion });
    await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, AUTH);
    const page = await ctx.newPage();
    const errors = []; const posts = [];
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    page.on('request', (rq) => { if (rq.method() === 'POST' && /\/api\//.test(rq.url())) posts.push(new URL(rq.url()).pathname); });
    let cart = EMPTY_CART;
    await page.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, 200, { products: [] }));
    await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, 200, cart));
    await page.route(/\/api\/cart\/items/, async (r) => { if (r.request().method() === 'OPTIONS') return ok(r, 204, null); await new Promise((f) => setTimeout(f, 800)); cart = ITEM_CART; return ok(r, 200, ITEM_CART); });
    const row = { vp: `${w}x${h}`, motion };
    await page.goto(BASE + '/products/middle-east', { waitUntil: 'load', timeout: 60000 }).catch(() => { row.gotoError = true; });
    await page.waitForTimeout(4000);
    const loc = page.locator('button').filter({ hasText: /^\s*Add to Cart\s*$/ }).first();
    await loc.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);
    row.before = await page.evaluate(sample);
    const bb = await loc.boundingBox();
    await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
    const seq = [];
    let shot = false;
    for (let i = 0; i < 80; i++) {
      const s = await page.evaluate(sample);
      if (s) seq.push(s);
      if (s && s.text === 'Added' && !shot) { await page.screenshot({ path: `${out}/${label}-added-${w}-${motion}.png` }); shot = true; }
      await page.waitForTimeout(50);
    }
    row.labels = seq.map((s) => s.text).filter((t, i, a) => i === 0 || a[i - 1] !== t);
    const added = seq.filter((s) => s.text === 'Added');
    row.addedSamples = added.length;
    row.addedMaxScale = added.length ? Math.max(...added.map((s) => s.scale)) : null;
    row.addedRadius = added.length ? added[0].radius : null;
    row.final = seq.length ? seq[seq.length - 1] : null;
    row.posts = posts;
    row.errors = errors;
    res.push(row);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/${label}-added.json`, JSON.stringify(res, null, 1));
for (const r of res) console.log(r.vp, r.motion, JSON.stringify({ labels: r.labels, addedSamples: r.addedSamples, maxScale: r.addedMaxScale, radius: r.addedRadius, final: r.final && [r.final.text, r.final.radius, r.final.color, r.final.w], posts: r.posts, err: r.errors.length }));
