// usage: MOCK=on|off BASE=http://127.0.0.1:5173 node measure-499.mjs <outdir> <tag>
// MOCK=on: run with loop mock-api on :5199 (targets marked mock 'on'); MOCK=off: mock stopped (targets marked 'off').
// Signed-in states use the L36 stub recipe: auth_user with a stub accessToken, /api/auth/profile and /api/downloads
// stubbed with the {success,data} envelope and CORS headers; /api/products/1/recordings stubbed per state.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
const MOCK = process.env.MOCK || 'on';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const ORIGIN = new URL(BASE).origin;
const AUTH = { id: 7, email: 'buyer@example.invalid', firstName: 'Test', accessToken: 'stub-token', refreshToken: 'stub-refresh' };
const CORS = { 'access-control-allow-origin': ORIGIN, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': 'authorization, content-type, x-session-id', 'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS' };
const ok = (r, status, body) => r.request().method() === 'OPTIONS' ? r.fulfill({ status: 204, headers: CORS }) : r.fulfill({ status, headers: CORS, contentType: 'application/json', body: JSON.stringify(status < 300 ? { success: true, data: body } : { success: false, error: 'stub' }) });
const CATALOG = { productId: 1, productTitle: 'Stub', licenseType: 'standard', recordings: [] };
const targets = [
  { id: 'STORE-TRY', mock: 'off', path: '/store', role: 'link', name: 'Try again', href: '/store' },
  { id: 'CART-EMPTY', mock: 'on', path: '/cart', role: 'link', name: 'Discover the Collection', href: '/store' },
  { id: 'REC-DENIED-PRIMARY', mock: 'on', path: '/recordings/1', auth: true, rec: 403, role: 'link', name: 'Go to Downloads', href: '/account/downloads', pair: 'REC-DENIED' },
  { id: 'REC-DENIED-GHOST', mock: 'on', path: '/recordings/1', auth: true, rec: 403, role: 'link', name: 'Browse the store', href: '/store', pair: 'REC-DENIED' },
  { id: 'REC-NOTFOUND', mock: 'on', path: '/recordings/abc', auth: true, role: 'link', name: 'Go to Downloads', href: '/account/downloads' },
  { id: 'REC-EMPTY', mock: 'on', path: '/recordings/1', auth: true, rec: 200, role: 'link', name: 'Go to Downloads', href: '/account/downloads' },
  { id: 'DOWNLOADS-EMPTY', mock: 'on', path: '/account/downloads', auth: true, role: 'link', name: 'Browse Music', href: '/music' },
  { id: 'ROOT-ERR-TRY', mock: 'on', path: '/recordings/1', auth: true, rec: 'malformed', role: 'button', name: 'Try Again', pair: 'ROOT-ERR' },
  { id: 'ROOT-ERR-HOME', mock: 'on', path: '/recordings/1', auth: true, rec: 'malformed', role: 'link', name: 'Go Home', href: '/', pair: 'ROOT-ERR' },
  { id: 'ROUTE-ERR-TRY', mock: 'on', path: '/products/does-not-exist-xyz', role: 'button', name: 'Try Again' },
].filter((t) => t.mock === MOCK);
const props = ['display','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopLeftRadius','borderTopWidth','fontSize','fontWeight','color','backgroundColor','boxShadow','lineHeight','gap','opacity','whiteSpace','transitionProperty'];
const vps = [[1440,900],[1280,720],[375,812]];
const lum = (rgb) => { const m = rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(c=> c<=0.03928? c/12.92 : ((c+0.055)/1.055)**2.4); return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return +( (x+0.05)/(y+0.05) ).toFixed(2); };
async function setup(ctx, t) {
  await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify(auth)); } catch {} }, t.auth ? AUTH : null);
  if (t.auth) {
    await ctx.route(/\/api\/auth\/profile/, (r) => ok(r, 200, { id: 7, email: 'buyer@example.invalid', firstName: 'Test', lastName: 'Buyer', authProvider: 'Email', emailVerified: true }));
    await ctx.route(/\/api\/downloads/, (r) => ok(r, 200, []));
  }
  if (t.rec) {
    await ctx.route(/\/api\/products\/1\/recordings/, (r) => t.rec === 200 ? ok(r, 200, CATALOG) : t.rec === 'malformed' ? ok(r, 200, { productId: 1, productTitle: 'Stub', recordings: [] }) : ok(r, t.rec, null));
  }
}
const res = [];
const browser = await chromium.launch();
for (const [w,h] of vps) {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await setup(ctx, t);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    try { await page.goto(BASE + t.path, { waitUntil: 'load', timeout: 45000 }); } catch {}
    await page.waitForTimeout(3000);
    const loc = page.getByRole(t.role, { name: t.name, exact: true });
    const n = await loc.count();
    const row = { id: t.id, vp: `${w}x${h}`, count: n, errors: errors.slice(0, 6) };
    if (n) {
      const el = loc.first();
      await el.scrollIntoViewIfNeeded();
      row.rest = await el.evaluate((e, props) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const o = {}; for (const p of props) o[p] = cs[p]; o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; o.tag = e.tagName; o.type = e.getAttribute('type'); o.href = e.getAttribute('href'); o.discover = e.hasAttribute('data-discover'); o.svg = e.querySelectorAll('svg').length; o.cls = e.className; let p = e.parentElement; let bg = 'rgba(0, 0, 0, 0)'; while (p) { const b = getComputedStyle(p).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; } p = p.parentElement; } o.pageBg = bg; return o; }, props);
      const fill = row.rest.backgroundColor === 'rgba(0, 0, 0, 0)' ? row.rest.pageBg : row.rest.backgroundColor;
      row.restContrast = ratio(row.rest.color, fill);
      await el.hover(); await page.waitForTimeout(400);
      row.hover = await el.evaluate((e) => { const cs = getComputedStyle(e); return { backgroundColor: cs.backgroundColor, color: cs.color, opacity: cs.opacity }; });
      const hfill = row.hover.backgroundColor === 'rgba(0, 0, 0, 0)' ? row.rest.pageBg : row.hover.backgroundColor;
      row.hoverContrast = ratio(row.hover.color, hfill);
      row.hoverVsPage = ratio(row.hover.backgroundColor === 'rgba(0, 0, 0, 0)' ? row.rest.pageBg : row.hover.backgroundColor, row.rest.pageBg);
      const bb = await el.boundingBox();
      await page.screenshot({ path: `${out}/${tag}-${t.id}-${w}.png`, clip: { x: Math.max(0, bb.x - 24), y: Math.max(0, bb.y - 24), width: Math.min(bb.width + 48, w - Math.max(0, bb.x - 24)), height: bb.height + 48 } });
      await page.mouse.move(1, 1); await page.waitForTimeout(300);
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
      let found = false;
      for (let i = 0; i < 80 && !found; i++) { await page.keyboard.press('Tab'); found = await el.evaluate((e) => e === document.activeElement); }
      if (found) { await page.waitForTimeout(200); row.focus = await el.evaluate((e) => { const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset }; }); await page.screenshot({ path: `${out}/${tag}-${t.id}-focus-${w}.png`, clip: { x: Math.max(0, bb.x - 24), y: Math.max(0, bb.y - 24), width: Math.min(bb.width + 48, w - Math.max(0, bb.x - 24)), height: bb.height + 48 } }); }
      else row.focus = { found: false };
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); });
      await el.dispatchEvent('pointerdown').catch(() => {});
      await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.mouse.down(); await page.waitForTimeout(120);
      row.press = await el.evaluate((e) => { const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), outlineStyle: cs.outlineStyle, opacity: cs.opacity }; });
      await page.mouse.move(1, 1); await page.mouse.up();
      if (t.pair && (t.id.endsWith('PRIMARY') || t.id.endsWith('TRY'))) await page.screenshot({ path: `${out}/${tag}-${t.pair}-pair-${w}.png`, fullPage: false });
      if (!t.pair) await page.screenshot({ path: `${out}/${tag}-${t.id}-page-${w}.png`, fullPage: false });
    }
    res.push(row);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/${tag}-${MOCK}.json`, JSON.stringify(res, null, 1));
console.log(`${tag}-${MOCK}: ${res.length} rows, missing ${res.filter((r) => !r.count).map((r) => r.id + '@' + r.vp).join(',') || 'none'}`);
