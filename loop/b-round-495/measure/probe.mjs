import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE || 'http://127.0.0.1:5173'; const out = process.argv[2]; const tag = process.argv[3];
fs.mkdirSync(out, { recursive: true });
const res = {};
const browser = await chromium.launch();
async function ctxFor(w, h) { const c = await browser.newContext({ viewport: { width: w, height: h } }); await c.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); } catch {} }); return c; }
const ring = (el) => { const cs = getComputedStyle(el); return { tag: el.tagName, text: (el.textContent || '').trim().slice(0, 40), fv: el.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow }; };
async function tabTo(page, pred, max = 40) { for (let i = 0; i < max; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); const hit = await page.evaluate(pred); if (hit) return i + 1; } return -1; }
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await ctxFor(w, h); const page = await ctx.newPage(); const vp = `${w}x${h}`; res[vp] = {};
  // focus on 404 Back Home, Browse Store
  await page.goto(BASE + '/no-such-page-496', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2500);
  for (const name of ['Back Home', 'Browse Store']) {
    const steps = await (async () => { for (let i = 0; i < 40; i++) { const t = await page.evaluate(() => (document.activeElement?.textContent || '').trim()); if (t === name) return i; await page.keyboard.press('Tab'); await page.waitForTimeout(120); } return -1; })();
    res[vp]['focus-' + name] = { steps, ring: await page.evaluate(ring, await page.evaluateHandle(() => document.activeElement)) };
    const bb = await page.evaluate(() => { const r = document.activeElement.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
    await page.screenshot({ path: `${out}/${tag}-focus-${name.replace(' ', '')}-${w}.png`, clip: { x: Math.max(0, bb.x - 12), y: Math.max(0, bb.y - 12), width: bb.w + 24, height: bb.h + 24 } });
  }
  // pointer press ring on Back Home (press, read, move away, release: no navigation)
  await page.goto(BASE + '/no-such-page-496', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2000);
  { const b = await page.getByRole('link', { name: 'Back Home' }).boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down(); await page.waitForTimeout(200);
    res[vp].backHomePointerPress = await page.evaluate(ring, await page.evaluateHandle(() => document.activeElement));
    await page.mouse.move(5, 5); await page.mouse.up(); await page.waitForTimeout(300); }
  // Enter on Back Home -> URL
  await page.goto(BASE + '/no-such-page-496', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2000);
  const bh = page.getByRole('link', { name: 'Back Home' }); await bh.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1500);
  res[vp].enterBackHome = new URL(page.url()).pathname;
  await page.goto(BASE + '/no-such-page-496', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2000);
  const bs = page.getByRole('link', { name: 'Browse Store' }); await bs.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(2500);
  res[vp].enterBrowseStore = new URL(page.url()).pathname;
  // header Sign In: keyboard focus ring, pointer press ring, modal
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(4500);
  const si = page.locator('header button:has-text("Sign In")').first();
  await si.focus(); await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Tab'); await page.waitForTimeout(200);
  res[vp].signinKeyboard = await si.evaluate(ring);
  await page.mouse.click(1, 1); await page.waitForTimeout(200);
  await si.click(); await page.waitForTimeout(1200);
  res[vp].dialogAfterClick = await page.locator('[role="dialog"]').count();
  res[vp].signinHeadingVisible = await page.getByRole('heading', { name: 'Sign in', exact: true }).isVisible().catch(() => false);
  await page.screenshot({ path: `${out}/${tag}-signin-modal-${w}.png` });
  await page.keyboard.press('Escape'); await page.waitForTimeout(800);
  res[vp].dialogAfterEsc = await page.locator('[role="dialog"]').count();
  res[vp].signinHeadingAfterEsc = await page.getByRole('heading', { name: 'Sign in', exact: true }).isVisible().catch(() => false);
  res[vp].signinAfterPointer = await si.evaluate(ring);
  // hero Enter
  await page.goto(BASE + '/', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(4500);
  const hero = page.getByRole('link', { name: 'Discover the Collection' }); await hero.focus(); await page.waitForTimeout(150);
  res[vp].heroFocus = await hero.evaluate(ring);
  await page.keyboard.press('Enter'); await page.waitForTimeout(2500); res[vp].enterHero = new URL(page.url()).pathname;
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(2000);
  await page.getByRole('link', { name: 'Back to Home' }).click(); await page.waitForTimeout(2000); res[vp].clickSearchBack = new URL(page.url()).pathname;
  res[vp].nestedButtonsInLinksOnHome = await page.evaluate(() => document.querySelectorAll('a button').length);
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/${tag}-probe.json`, JSON.stringify(res, null, 1)); console.log('done');
