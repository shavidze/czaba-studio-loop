// usage: BASE=http://127.0.0.1:5173 node cart-states.mjs <outdir> <label>
// Cart layout probe for B-R502-CART-MOBILE-ITEMS-HIDDEN. All rows are -STUBBED (page.route on /api/cart, /api/downloads, /api/auth/profile): client path only.
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
const ok = (r, b) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status: 200, headers: CORS, contentType: 'application/json', body: JSON.stringify({ success: true, data: b }) });
const item = (i) => ({ id: 10 + i, productId: i, productTitle: `Stub Track ${i}`, productHandle: `stub-track-${i}`, variantName: 'Standard', unitPrice: 29, quantity: 1, total: 29 });
const cart = (n, extras) => ({ id: 1, items: Array.from({ length: n }, (_, k) => item(k + 1)), itemCount: n, subtotal: 29 * n, discountAmount: extras ? 5 : 0, giftCardAmount: extras ? 10 : 0, total: 29 * n - (extras ? 15 : 0), ...(extras ? { appliedCoupon: { code: 'SAVE5', description: 'Five off', discountType: 'fixed', discountValue: 5, discountAmount: 5 }, appliedGiftCard: { code: 'GC-1', maskedCode: '****-0001', balance: 50, amountToUse: 10 } } : {}) });
const DOWNLOADS = { products: [{ isAvailable: true, productId: 1, productTitle: 'Stub Track 1', handle: 'stub-track-1', category: 'music', licenseType: 'Universal', purchasedAt: '2026-01-01T00:00:00Z', orderNumber: 'O-1' }] };
const states = [
  { id: 'ANON-1', auth: false, n: 1 },
  { id: 'ANON-3', auth: false, n: 3 },
  { id: 'OWNED-1', auth: true, n: 1 },
  { id: 'ANON-1-EXTRAS', auth: false, n: 1, extras: true },
];
const vps = (process.env.VPS || '375x812,390x844,768x1024,1024x768,1280x720,1440x900').split(',').map((s) => s.split('x').map(Number));
const browser = await chromium.launch();
const rows = [];
for (const st of states) for (const [w, h] of vps) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript((a) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); if (a) localStorage.setItem('auth_user', JSON.stringify(a)); } catch {} }, st.auth ? AUTH : null);
  const page = await ctx.newPage();
  await page.route(/\/api\/auth\/profile/, (r) => ok(r, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
  await page.route(/\/api\/cart(\?|$)/, (r) => ok(r, cart(st.n, st.extras)));
  await page.route(/\/api\/downloads(\?|$)/, (r) => ok(r, st.auth ? DOWNLOADS : { products: [] }));
  await page.goto(BASE + '/cart', { waitUntil: 'load', timeout: 60000 });
  await page.getByText('Order Summary').first().waitFor({ timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const m = await page.evaluate(() => {
    const vis = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); const cx = r.x + r.width / 2; const cy = r.y + r.height / 2; return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
    const main = document.querySelector('main');
    const titles = [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0 && /^Stub Track \d$/.test(e.textContent.trim()));
    const firstTitle = titles[0] || null;
    let col = firstTitle; while (col && !(col.className && String(col.className).includes('lg:col-span-2'))) col = col.parentElement;
    const btns = [...document.querySelectorAll('button')];
    const checkout = btns.find((b) => /Checkout|Resolve Issues|Continue to/i.test(b.innerText));
    const remove = document.querySelector('button[aria-label="Remove item"]');
    const summaryCard = [...document.querySelectorAll('h2, h3')].find((e) => e.textContent.trim() === 'Order Summary');
    let card = summaryCard; for (let i = 0; i < 3 && card; i++) card = card.parentElement;
    const mainR = main.getBoundingClientRect();
    const docH = document.documentElement.scrollHeight;
    return { docH, innerH: innerHeight, main: { h: Math.round(mainR.height), bottom: Math.round(mainR.bottom + scrollY), ov: getComputedStyle(main).overflow }, col: col ? { ...vis(col), ov: getComputedStyle(col).overflowY, sh: col.scrollHeight } : null, firstTitle: vis(firstTitle), titles: titles.length, checkout: checkout ? { ...vis(checkout), text: checkout.innerText.trim() } : null, remove: vis(remove), summary: vis(summaryCard) };
  });
  // reachability: scroll each target into view and hit-test its centre
  const hit = async (getter) => page.evaluate(async (g) => {
    const btns = [...document.querySelectorAll('button')];
    const el = g === 'checkout' ? btns.find((b) => /Checkout|Resolve Issues|Continue to/i.test(b.innerText)) : g === 'remove' ? (document.querySelector('button[aria-label="Remove item"]')) : [...document.querySelectorAll('main *')].find((e) => e.children.length === 0 && /^Stub Track 1$/.test(e.textContent.trim()));
    if (!el) return { found: false };
    el.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 300));
    const r = el.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { found: true, h: Math.round(r.height), hits: !!top && (top === el || el.contains(top)), disabled: !!el.disabled, pe: getComputedStyle(el).pointerEvents, topIsInsideMain: !!top && !!top.closest('main'), top: top ? top.tagName + '.' + String(top.className).slice(0, 40) : null };
  }, getter);
  m.reach = { title: await hit('title'), remove: await hit('remove'), checkout: await hit('checkout') };
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `${out}/${label}-${st.id}-${w}x${h}.png`, fullPage: true });
  rows.push({ state: st.id, vp: `${w}x${h}`, ...m });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${label}-cart.json`, JSON.stringify(rows, null, 1));
for (const r of rows) console.log(r.state, r.vp, 'docH', r.docH, 'main', r.main.h, r.main.ov, 'col', r.col ? `${r.col.h}/${r.col.sh} ${r.col.ov}` : null, 'titleHit', r.reach.title.hits, 'removeHit', r.reach.remove.hits, 'checkoutHit', r.reach.checkout.hits, r.checkout ? `co.bottom ${r.checkout.y + r.checkout.h} main.bottom ${r.main.bottom}` : 'no checkout');
