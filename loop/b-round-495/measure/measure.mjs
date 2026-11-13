import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const tag = process.argv[3] || 'head';
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
const targets = [
  { id: 'NF-PRIMARY', path: '/no-such-page-496', sel: 'a[href="/"]:has-text("Back Home")' },
  { id: 'NF-SECONDARY', path: '/no-such-page-496', sel: 'a[href="/store"]:has-text("Browse Store")' },
  { id: 'LOGIN', path: '/account/login', sel: 'main a[href="/"]:has-text("Back to Home"), a[href="/"]:has-text("Back to Home")' },
  { id: 'SEARCH', path: '/search', sel: 'a[href="/"]:has-text("Back to Home")' },
  { id: 'HERO', path: '/', sel: 'a[href="/store"]:has-text("Discover the Collection")' },
  { id: 'HDR-SIGNIN', path: '/', sel: 'header button:has-text("Sign In")' },
];
const props = ['display','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopLeftRadius','fontSize','fontWeight','fontFamily','color','backgroundColor','boxShadow','lineHeight','gap','opacity','transitionProperty'];
const vps = [[1440,900],[1280,720],[1023,800],[1024,800],[375,812]];
const res = [];
const browser = await chromium.launch();
for (const [w,h] of vps) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} });
  const page = await ctx.newPage();
  for (const t of targets) {
    try {
      await page.goto(BASE + t.path, { waitUntil: 'networkidle', timeout: 45000 });
    } catch (e) { }
    await page.waitForTimeout(t.id === 'HERO' || t.id === 'HDR-SIGNIN' ? 4500 : 2500);
    const loc = page.locator(t.sel).first();
    const n = await page.locator(t.sel).count();
    const row = { id: t.id, vp: `${w}x${h}`, count: n };
    if (n) {
      row.visible = await loc.isVisible();
      row.rest = await loc.evaluate((el, props) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = {}; for (const p of props) o[p] = cs[p]; o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; o.cls = el.className; return o; }, props);
      if (row.visible) {
        await loc.scrollIntoViewIfNeeded();
        await loc.hover(); await page.waitForTimeout(400);
        row.hover = await loc.evaluate((el) => { const cs = getComputedStyle(el); return { backgroundColor: cs.backgroundColor, color: cs.color, opacity: cs.opacity }; });
        const bb = await loc.boundingBox();
        await page.screenshot({ path: `${out}/${tag}-${t.id}-${w}.png`, clip: { x: Math.max(0, bb.x - 24), y: Math.max(0, bb.y - 24), width: Math.min(bb.width + 48, w), height: bb.height + 48 } });
        await page.mouse.move(1, 1);
      }
    }
    res.push(row);
  }
  // mobile menu Sign In
  if (w < 1024) {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(3000);
    const tog = page.getByRole('button', { name: 'Toggle menu' });
    if (await tog.count()) { await tog.click(); await page.waitForTimeout(800);
      const all = page.locator('button:has-text("Sign In")');
      const n = await all.count(); const rows = [];
      for (let i = 0; i < n; i++) rows.push(await all.nth(i).evaluate((el, props) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { visible: r.width > 0 && cs.display !== 'none' }; for (const p of props) o[p] = cs[p]; o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; o.cls = el.className; return o; }, props));
      res.push({ id: 'MENU-SIGNIN', vp: `${w}x${h}`, count: n, all: rows });
      await page.screenshot({ path: `${out}/${tag}-MENU-${w}.png` });
    }
  }
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${tag}.json`, JSON.stringify(res, null, 1));
console.log('rows', res.length);
