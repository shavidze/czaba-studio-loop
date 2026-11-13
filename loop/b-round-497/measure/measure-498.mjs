// usage: BASE=http://127.0.0.1:5173 node measure-498.mjs <outdir> <tag>
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const targets = [
  { id: 'CANCEL-PRIMARY', path: '/checkout/cancel', name: 'Return to Cart', href: '/cart', pair: 'CANCEL' },
  { id: 'CANCEL-GHOST', path: '/checkout/cancel', name: 'Continue Shopping', href: '/store', pair: 'CANCEL' },
  { id: 'SUCCESS-PRIMARY', path: '/checkout/success', name: 'Access Your Downloads', href: '/account/downloads', pair: 'SUCCESS', wait: 3000 },
  { id: 'SUCCESS-GHOST', path: '/checkout/success', name: 'Discover More', href: '/store', pair: 'SUCCESS', wait: 3000 },
  { id: 'FAQ', path: '/faq', name: 'Contact Us', href: '/hire-us' },
  { id: 'ORDERS', path: '/account/orders', name: 'Browse Music', href: '/store', auth: true },
];
const props = ['display','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopLeftRadius','fontSize','fontWeight','color','backgroundColor','boxShadow','lineHeight','gap','opacity','whiteSpace'];
const vps = [[1440,900],[1280,720],[375,812]];
const lum = (rgb) => { const m = rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(c=> c<=0.03928? c/12.92 : ((c+0.055)/1.055)**2.4); return 0.2126*m[0]+0.7152*m[1]+0.0722*m[2]; };
const ratio = (a,b) => { const [x,y]=[lum(a),lum(b)].sort((p,q)=>q-p); return +( (x+0.05)/(y+0.05) ).toFixed(2); };
const res = [];
const browser = await chromium.launch();
for (const [w,h] of vps) {
  for (const t of targets) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((auth) => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); if (auth) localStorage.setItem('auth_user', JSON.stringify({ id: 7, email: 'buyer@example.invalid', firstName: 'Test' })); } catch {} }, !!t.auth);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    await page.route(/\/api\/orders\/my/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [], totalCount: 0, pageNumber: 1, pageSize: 50 }) }));
    try { await page.goto(BASE + t.path, { waitUntil: 'networkidle', timeout: 45000 }); } catch {}
    await page.waitForTimeout(t.wait || 2500);
    const loc = page.getByRole('link', { name: t.name, exact: true });
    const n = await loc.count();
    const row = { id: t.id, vp: `${w}x${h}`, count: n, errors };
    if (n) {
      const el = loc.first();
      await el.scrollIntoViewIfNeeded();
      row.rest = await el.evaluate((e, props) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); const o = {}; for (const p of props) o[p] = cs[p]; o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; o.tag = e.tagName; o.href = e.getAttribute('href'); o.innerButtons = e.querySelectorAll('button').length; o.cls = e.className; o.lines = Math.round(r.height / parseFloat(cs.lineHeight || '24')); let p = e.parentElement; let bg = 'rgba(0, 0, 0, 0)'; while (p) { const b = getComputedStyle(p).backgroundColor; if (b && b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break; } p = p.parentElement; } o.pageBg = bg; return o; }, props);
      const fill = row.rest.backgroundColor === 'rgba(0, 0, 0, 0)' ? row.rest.pageBg : row.rest.backgroundColor;
      row.restContrast = ratio(row.rest.color, fill);
      await el.hover(); await page.waitForTimeout(400);
      row.hover = await el.evaluate((e) => { const cs = getComputedStyle(e); return { backgroundColor: cs.backgroundColor, color: cs.color, opacity: cs.opacity }; });
      const bb = await el.boundingBox();
      await page.screenshot({ path: `${out}/${tag}-${t.id}-${w}.png`, clip: { x: Math.max(0, bb.x - 24), y: Math.max(0, bb.y - 24), width: Math.min(bb.width + 48, w - Math.max(0, bb.x - 24)), height: bb.height + 48 } });
      await page.mouse.move(1, 1); await page.waitForTimeout(300);
      // keyboard focus
      await page.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); });
      let found = false;
      for (let i = 0; i < 60 && !found; i++) { await page.keyboard.press('Tab'); found = await el.evaluate((e) => e === document.activeElement); }
      if (found) { await page.waitForTimeout(200); row.focus = await el.evaluate((e) => { const cs = getComputedStyle(e); return { fv: e.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset }; }); }
      else row.focus = { found: false };
      if (t.pair && t.id.endsWith('PRIMARY')) await page.screenshot({ path: `${out}/${tag}-${t.pair}-pair-${w}.png`, fullPage: false });
    }
    res.push(row);
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(`${out}/${tag}.json`, JSON.stringify(res, null, 1));
console.log('rows', res.length, 'missing', res.filter(r => !r.count).map(r => r.id + '@' + r.vp).join(','));
