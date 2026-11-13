// B round 484->485 planning: route announcement probe. Usage: node announce-probe.mjs <base> <out.json> [w h]
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [base, out, w = '1440', h = '900'] = process.argv.slice(2);
const vp = { width: Number(w), height: Number(h) };
const res = { base, viewport: vp, steps: [] };
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: vp });
await ctx.addInitScript(() => {
  try { localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().slice(0, 10), dismissed: true, submitted: false })); } catch {}
  window.__ann = [];
  const start = () => {
    const mo = new MutationObserver(() => {
      const el = document.querySelector('[data-route-announcer]');
      window.__ann.push({ t: Math.round(performance.now()), text: el ? el.textContent : null, title: document.title, path: location.pathname });
    });
    mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const read = () => page.evaluate(() => {
  const el = document.querySelector('[data-route-announcer]');
  return {
    path: location.pathname, title: document.title, titleEls: document.querySelectorAll('head title').length,
    announcer: el ? { text: el.textContent, live: el.getAttribute('aria-live'), atomic: el.getAttribute('aria-atomic'), role: el.getAttribute('role'), cls: el.className,
      rect: (() => { const r = el.getBoundingClientRect(); return [r.width, r.height]; })(), count: document.querySelectorAll('[data-route-announcer]').length } : null,
    h1: (document.querySelector('.page-transition-wrapper h1')?.textContent || '').trim(),
    active: document.activeElement ? document.activeElement.tagName + (document.activeElement.textContent || '').trim().slice(0, 30) : null,
  };
});
const nav = async (to) => { await page.evaluate((p) => window.__remixRouter.navigate(p), to); await page.waitForTimeout(2000); };
const annLog = async () => page.evaluate(() => { const a = window.__ann.filter((x) => x.text !== null); window.__ann = []; return a.filter((x, i) => i === 0 || x.text !== a[i - 1].text); });
await page.goto(base + '/', { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(2500);
res.steps.push({ step: 'initial /', ...(await read()), log: await annLog() });
for (const to of ['/faq', '/cart', '/search', '/account', '/account/orders', '/account/reset/x/y', '/account/login', '/support', '/support', '/store', '/about']) {
  await nav(to);
  res.steps.push({ step: 'nav ' + to, ...(await read()), log: await annLog() });
}
// footer click (real link) + first Tab
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
const sup = page.locator('footer a', { hasText: 'FAQ' }).first();
await sup.click();
await page.waitForTimeout(2000);
const afterClick = await read();
await page.keyboard.press('Tab');
await page.waitForTimeout(300);
res.steps.push({ step: 'footer click FAQ then Tab', ...afterClick, afterTab: (await read()).active, log: await annLog() });
// store -> studio, studio -> store
await nav('/studio-lab');
await page.waitForFunction(() => document.body.innerText.includes('Demo collection ready'), null, { timeout: 60000 }).catch(() => {});
res.steps.push({ step: 'nav /studio-lab', ...(await read()), log: await annLog() });
const back = page.locator('a[href="/"]').first();
const backText = (await back.textContent().catch(() => '')) || '';
await back.click().catch(() => {});
await page.waitForTimeout(2500);
res.steps.push({ step: 'studio exit link click (' + backText.trim() + ')', ...(await read()), log: await annLog() });
// direct load of studio: silent
await page.goto(base + '/studio-lab', { waitUntil: 'load' });
await page.waitForTimeout(3000);
res.steps.push({ step: 'initial /studio-lab', ...(await read()), log: await annLog() });
res.errors = errors;
fs.writeFileSync(out, JSON.stringify(res, null, 1));
await browser.close();
console.log('done', out);
