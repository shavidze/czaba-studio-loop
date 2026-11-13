// B round 484->485: HEAD/sketch evidence for RA-VISUAL, RA-TAB ring, LF-FOOTER, RA-TITLES (full load), STUDIO-485.
// Usage: node extra-probe.mjs <base> <label> <outdir> [w h]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, label, outdir, w = '1440', h = '900'] = process.argv.slice(2);
const vp = { width: Number(w), height: Number(h) };
fs.mkdirSync(outdir, { recursive: true });
const res = { base, label, viewport: vp };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp });
await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); } catch {} });
const page = await ctx.newPage();
const tag = `${label}-${w}x${h}`;
const tabStops = async (n) => { const out = []; await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.evaluate(() => { document.body.tabIndex = -1; document.body.focus(); document.body.removeAttribute('tabindex'); });
  for (let i = 0; i < n; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(80); out.push(await page.evaluate(() => { const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a); return `${a.tagName}|${(a.getAttribute('aria-label') || a.textContent || '').trim().slice(0, 24)}|${a.hasAttribute('data-route-announcer') ? 'ANNOUNCER' : ''}|ring:${cs.outlineStyle}/${cs.outlineWidth}`; })); } return out; };
const sizes = () => page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, bodyText: document.body.innerText.length }));
for (const p of ['/', '/faq']) {
  await page.goto(base + p, { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2500);
  await page.screenshot({ path: `${outdir}/${tag}${p === '/' ? '-home' : p.replace('/', '-')}.png` });
  res[p] = { sizes: await sizes(), tabs: await tabStops(14) };
}
// RA-TAB ring + LF-FOOTER
await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2000);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(1500);
const faq = page.locator('footer a', { hasText: 'FAQ' }).first();
await faq.click(); await page.waitForTimeout(2000);
res.afterPlainClick = await page.evaluate(() => ({ active: document.activeElement?.tagName, bodyTabindex: document.body.getAttribute('tabindex'), path: location.pathname }));
await page.keyboard.press('Tab'); await page.waitForTimeout(300);
res.firstTab = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { tag: a.tagName, text: a.textContent.trim().slice(0, 20), focusVisible: a.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` }; });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(1500);
const sup = page.locator('footer a', { hasText: 'Support' }).first();
await sup.click({ modifiers: ['Control'] }).catch((e) => { res.ctrlErr = String(e); }); await page.waitForTimeout(1200);
res.afterCtrlClick = await page.evaluate(() => ({ active: document.activeElement?.tagName, text: (document.activeElement?.textContent || '').trim().slice(0, 20), bodyTabindex: document.body.getAttribute('tabindex'), path: location.pathname }));
for (const pg of ctx.pages()) if (pg !== page) await pg.close();
// RA-TITLES full load
res.fullLoadTitles = {};
for (const p of ['/cart', '/search', '/account', '/account/login', '/account/orders', '/account/reset/x/y']) { await page.goto(base + p, { waitUntil: 'load' }).catch(() => {}); await page.waitForTimeout(1500); res.fullLoadTitles[p] = await page.evaluate(() => ({ title: document.title, ann: document.querySelector('[data-route-announcer]')?.textContent ?? null })); }
// STUDIO-485
await page.goto(base + '/studio-lab', { waitUntil: 'load' });
await page.waitForFunction(() => document.body.innerText.includes('Demo collection ready'), null, { timeout: 90000 }).catch(() => { res.studioReadyTimeout = true; });
await page.waitForTimeout(1000);
await page.screenshot({ path: `${outdir}/${tag}-studio.png` });
res.studio = await page.evaluate(() => { const box = (s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; }; return { scrollW: document.documentElement.scrollWidth, scrollH: document.documentElement.scrollHeight, wrapper: box('.page-transition-wrapper'), main: box('main'), header: box('header'), announcerCount: document.querySelectorAll('[data-route-announcer]').length }; });
await page.locator('body').click({ position: { x: 5, y: vp.height - 5 } }).catch(() => {});
await page.keyboard.press('Space'); await page.waitForTimeout(1500);
res.studioAfterSpace = await page.evaluate(() => { const s = [...document.querySelectorAll('[role=status],[aria-live]')].map((e) => (e.textContent || '').trim()).filter(Boolean); return s.slice(0, 6); });
await page.keyboard.press('Space'); await page.waitForTimeout(500);
fs.writeFileSync(`${outdir}/${tag}.json`, JSON.stringify(res, null, 1));
await browser.close();
console.log('done', tag);
