import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const BASE = 'http://127.0.0.1:5173';
const res = {};
const browser = await chromium.launch();
const seed = () => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} };
async function open(w, h, mode) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(seed);
  const page = await ctx.newPage();
  const errs = []; const posts = [];
  page.on('pageerror', e => errs.push(String(e)));
  page.on('request', rq => { if (rq.method() === 'POST' && /\/api\//.test(rq.url())) posts.push(new URL(rq.url()).pathname); });
  if (mode) await page.route(/\/products\/harbour-lights\?.*_data=/, async (route) => {
    const r = await route.fetch(); const j = await r.json(); const p = j.product;
    if (mode === 'free') { p.standardPrice = 0; p.premiumPrice = 0; p.minPrice = 0; p.variants = (p.variants || []).map(v => ({ ...v, price: 0 })); }
    if (mode === 'split') { p.standardPrice = 0; p.minPrice = 0; p.premiumPrice = 9; p.variants = (p.variants || []).map(v => ({ ...v, price: /premium/i.test(v.name) ? 9 : 0 })); }
    await route.fulfill({ response: r, json: j });
  });
  return { ctx, page, errs, posts };
}
async function toFree(page) {
  await page.goto(BASE + '/products/middle-east', { waitUntil: 'load' });
  await page.waitForTimeout(3000);
  const ok = await page.evaluate(async () => { const r = window.__remixRouter; if (!r) return false; await r.navigate('/products/harbour-lights'); return true; });
  await page.waitForTimeout(2500);
  return ok;
}
const getFree = (page) => page.getByRole('button', { name: 'Get it free', exact: true });
// C1 + C2 + C3
for (const [w, h] of [[1440, 900], [1280, 720], [375, 812]]) {
  const { ctx, page, errs, posts } = await open(w, h, 'free');
  const r = { };
  r.viaRouter = await toFree(page);
  const btn = getFree(page);
  r.count = await btn.count();
  r.complimentary = await page.getByText(/Complimentary\s+Download/).count();
  if (r.count) {
    await btn.first().scrollIntoViewIfNeeded();
    r.info = await btn.first().evaluate(el => { const cs = getComputedStyle(el); const rect = el.getBoundingClientRect(); const col = el.parentElement.getBoundingClientRect(); const span = el.querySelector('span'); const sr = span && span.getBoundingClientRect(); return { tag: el.tagName, type: el.getAttribute('type'), svg: el.querySelectorAll('svg').length, bg: cs.backgroundColor, brand: getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim(), w: Math.round(rect.width*10)/10, h: Math.round(rect.height*10)/10, parentW: Math.round(col.width*10)/10, lineHeight: cs.lineHeight, spanH: sr ? sr.height : null, text: el.innerText.trim(), disabled: el.disabled, whiteSpace: cs.whiteSpace }; });
    r.header = await page.evaluate(() => ({ usd: (document.body.innerText.match(/\$0\.00[^\n]{0,6}/)||[null])[0], addToCart: !!([...document.querySelectorAll('button')].find(b => /Add to Cart/.test(b.innerText))), buyNow: !!([...document.querySelectorAll('button')].find(b => /^\s*Buy Now\s*$/.test(b.innerText))) }));
    await page.screenshot({ path: `${out}/c1-${w}.png` });
    if (w !== 375) {
      // C2
      const urlBefore = page.url();
      const modalCount = async () => ({ email: await page.locator('input[type=email]').count(), close: await page.getByRole('button', { name: /^close$/i }).count(), dialog: await page.locator('[role=dialog]').count() });
      r.modalBefore = await modalCount();
      await btn.first().click();
      await page.waitForTimeout(1200);
      r.modalAfter = await modalCount();
      r.toast = await page.getByText('Sign in to get it free.').count();
      r.urlSame = page.url() === urlBefore;
      r.postsAfterClick = [...posts];
      await page.screenshot({ path: `${out}/c2-${w}.png` });
      // close modal then header buy now
      await page.keyboard.press('Escape'); await page.waitForTimeout(600);
      r.modalAfterEsc = await modalCount();
      r.activeAfterEsc = await page.evaluate(() => ({ text: document.activeElement?.innerText?.trim(), fv: document.activeElement?.matches(':focus-visible') }));
      if (r.modalAfterEsc.email) { const c = page.getByRole('button', { name: /^close$/i }); if (await c.count()) await c.first().click(); await page.waitForTimeout(500); }
      await page.waitForTimeout(3500);
      const hb = page.locator('button').filter({ hasText: /^\s*Buy Now\s*$/ });
      r.headerBuyCount = await hb.count();
      await hb.first().click(); await page.waitForTimeout(800);
      r.headerToast = await page.getByText('Please sign in to continue with your purchase').count();
    }
  }
  r.errs = errs; r.posts = posts;
  res[`free-${w}`] = r;
  await ctx.close();
}
// C3 keyboard
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const { ctx, page, errs } = await open(w, h, 'free');
  await toFree(page);
  await page.evaluate(() => { window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
  const stops = []; let reached = false;
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => { const e = document.activeElement; return { t: (e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 40), fv: e.matches(':focus-visible'), ol: getComputedStyle(e).outlineStyle + ' ' + getComputedStyle(e).outlineWidth + ' ' + getComputedStyle(e).outlineColor }; });
    stops.push(s);
    if (s.t === 'Get it free') { reached = true; break; }
  }
  const r = { reached, tabs: stops.length, prev: stops[stops.length - 2], at: stops[stops.length - 1] };
  if (reached) {
    await page.screenshot({ path: `${out}/c3-focus-${w}.png` });
    await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
    r.toast = await page.getByText('Sign in to get it free.').count();
    r.email = await page.locator('input[type=email]').count();
    await page.keyboard.press('Escape'); await page.waitForTimeout(800);
    r.afterEsc = await page.evaluate(() => ({ t: document.activeElement.innerText.trim().slice(0, 40), fv: document.activeElement.matches(':focus-visible') }));
    r.emailAfterEsc = await page.locator('input[type=email]').count();
  }
  r.errs = errs;
  res[`kbd-${w}`] = r; await ctx.close();
}
// C4 split
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const { ctx, page, errs } = await open(w, h, 'split');
  await toFree(page);
  const r = {};
  r.initial = await getFree(page).count();
  r.cards = await page.evaluate(() => [...document.querySelectorAll('[aria-pressed]')].map(e => e.innerText.replace(/\s+/g, ' ').slice(0, 60) + ' |' + e.getAttribute('aria-pressed')));
  const prem = page.locator('[aria-pressed]').filter({ hasText: /Premium/ }).first();
  const std = page.locator('[aria-pressed]').filter({ hasText: /Standard/ }).first();
  if (await prem.count()) { await prem.click(); await page.waitForTimeout(800); r.afterPremium = await getFree(page).count(); r.headerPrem = await page.evaluate(() => /\$9\.00/.test(document.body.innerText)); await page.screenshot({ path: `${out}/c4-premium-${w}.png` }); }
  if (await std.count()) { await std.click(); await page.waitForTimeout(800); r.afterStd = await getFree(page).count(); }
  r.errs = errs; res[`split-${w}`] = r; await ctx.close();
}
// C5 paid unstubbed
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const { ctx, page, errs, posts } = await open(w, h, null);
  await page.goto(BASE + '/products/middle-east', { waitUntil: 'load' }); await page.waitForTimeout(4000);
  const r = { getFree: await getFree(page).count(), compl: await page.getByText(/Complimentary\s+Download/).count(), buyNow: await page.locator('button').filter({ hasText: /^\s*Buy Now\s*$/ }).count(), add: await page.locator('button').filter({ hasText: /Add to Cart/ }).count(), price: await page.evaluate(() => (document.body.innerText.match(/\$\d+\.\d\d USD/) || [])[0]) };
  await page.locator('button').filter({ hasText: /^\s*Buy Now\s*$/ }).first().click(); await page.waitForTimeout(1000);
  r.toast = await page.getByText('Please sign in to continue with your purchase').count(); r.email = await page.locator('input[type=email]').count(); r.posts = posts; r.errs = errs;
  await page.screenshot({ path: `${out}/c5-${w}.png` });
  res[`paid-${w}`] = r; await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/anon.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
