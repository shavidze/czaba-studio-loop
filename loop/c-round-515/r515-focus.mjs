// Round 515 cookie-banner probe: pointer dismissal after a text field, and a simulated no-focus click (Safari-like).
// Usage: node r515-focus.mjs <baseUrl> <outDir>. Needs VITE_GA4_MEASUREMENT_ID on the server and the mock API on :5199.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2];
const out = path.resolve(process.argv[3]);
fs.mkdirSync(out, { recursive: true });
const res = { base, rows: [], errors: [] };

async function newPage(browser, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 640, isMobile: w < 640 });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  page.on('pageerror', (e) => res.errors.push(`${w}: ${String(e).slice(0, 200)}`));
  return { ctx, page };
}
async function openBanner(page) {
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Accept', exact: true }).waitFor({ state: 'visible', timeout: 25000 });
  await page.waitForTimeout(800);
}
const readFocus = () => {
  const a = document.activeElement;
  let fv = false; try { fv = a ? a.matches(':focus-visible') : false; } catch {}
  return {
    tag: a ? a.tagName : null, type: a?.getAttribute('type') ?? null, label: a?.getAttribute('aria-label') ?? null,
    text: a ? (a.textContent || '').trim().slice(0, 40) : null, href: a?.getAttribute('href') ?? null,
    focusVisible: fv, scrollY: Math.round(window.scrollY),
    bannerGone: ![...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Accept'),
    consent: (() => { try { return Object.fromEntries(Object.entries(localStorage).filter(([k]) => /consent/i.test(k))); } catch { return null; } })(),
  };
};
const browser = await chromium.launch();
for (const [w, h] of [[375, 812], [1280, 720]]) {
  // P1: tap/click a text field, then tap/click Accept with the pointer.
  { const { ctx, page } = await newPage(browser, w, h);
    try {
      await openBanner(page);
      const email = page.locator('input[type="email"]').first();
      await email.scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
      if (w < 640) await email.tap(); else await email.click();
      const before = await page.evaluate(readFocus);
      const accept = page.getByRole('button', { name: 'Accept', exact: true });
      if (w < 640) await accept.tap(); else await accept.click();
      await page.waitForTimeout(400);
      const after = await page.evaluate(readFocus);
      await page.screenshot({ path: path.join(out, `p1-pointer-from-email-${w}.png`) });
      res.rows.push({ row: 'P1-pointer-from-email', w, before, after });
    } catch (e) { res.rows.push({ row: 'P1-pointer-from-email', w, error: String(e).slice(0, 300) }); }
    await ctx.close(); }
  // P2: Safari-like click that does not focus the button (mousedown preventDefault injected),
  // after focus entered the banner from the footer "Cookie Policy" link and then left it to BODY.
  { const { ctx, page } = await newPage(browser, w, h);
    try {
      await openBanner(page);
      await page.evaluate(() => { for (const b of document.querySelectorAll('button')) if (['Accept', 'Decline'].includes(b.textContent.trim())) b.addEventListener('mousedown', (e) => e.preventDefault()); });
      const policy = page.getByRole('link', { name: 'Cookie Policy' }).last();
      await policy.focus(); await page.waitForTimeout(300);
      await page.keyboard.press('Tab'); await page.waitForTimeout(300);
      const inBanner = await page.evaluate(readFocus);
      await page.keyboard.press('Tab'); await page.waitForTimeout(300);
      await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
      const atBody = await page.evaluate(readFocus);
      await page.getByRole('button', { name: 'Accept', exact: true }).click();
      await page.waitForTimeout(400);
      const after = await page.evaluate(readFocus);
      res.rows.push({ row: 'P2-nofocus-click-after-leaving', w, inBanner, atBody, after, note: 'simulated: mousedown preventDefault stands in for Safari; not a Safari check' });
    } catch (e) { res.rows.push({ row: 'P2-nofocus-click-after-leaving', w, error: String(e).slice(0, 300) }); }
    await ctx.close(); }
  // P3: /hire-us fields. Textarea (type "abc", pointer Accept) -> not the textarea, value kept;
  // select (pointer Decline) -> back on the select. scrollY recorded before and after.
  for (const [field, ctl] of [['textarea', 'Accept'], ['select', 'Decline']]) {
    const { ctx, page } = await newPage(browser, w, h);
    try {
      await page.goto(base + '/hire-us', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: ctl, exact: true }).waitFor({ state: 'visible', timeout: 25000 });
      await page.waitForTimeout(800);
      const el = page.locator(field).first();
      await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(1300);
      if (field === 'textarea') { if (w < 640) await el.tap(); else await el.click(); await page.keyboard.type('abc'); }
      else { await el.focus(); }
      const before = await page.evaluate(readFocus);
      const btn = page.getByRole('button', { name: ctl, exact: true });
      if (w < 640) await btn.tap(); else await btn.click();
      await page.waitForTimeout(400);
      const after = await page.evaluate(readFocus);
      const value = field === 'textarea' ? await el.inputValue() : null;
      await page.screenshot({ path: path.join(out, `p3-hireus-${field}-${w}.png`) });
      res.rows.push({ row: `P3-hireus-${field}`, w, before, after, value, note: field === 'select' ? 'select focused by focus() (a pointer click would open the native popup)' : '' });
    } catch (e) { res.rows.push({ row: `P3-hireus-${field}`, w, error: String(e).slice(0, 300) }); }
    await ctx.close();
  }
}
await browser.close();
fs.writeFileSync(path.join(out, 'r515.json'), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res.rows.map((r) => ({ row: r.row, w: r.w, err: r.error, atBody: r.atBody?.tag, inBanner: r.inBanner && [r.inBanner.tag, r.inBanner.text], before: r.before && [r.before.tag, r.before.scrollY], after: r.after && [r.after.tag, r.after.type, r.after.text, r.after.focusVisible, r.after.scrollY, r.after.bannerGone], value: r.value }))));
console.log('errors', res.errors.length);
