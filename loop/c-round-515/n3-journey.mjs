// N3 journey: first visit / -> banner -> Decline (keyboard) -> client nav to /store -> /products/middle-east; banner must not reappear. Usage: node n3-journey.mjs <base> <outDir>
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const out = path.resolve(process.argv[3]); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => { try { localStorage.setItem('czaba_lead_magnet_dismissed', '1'); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.route(/googletagmanager\.com|google-analytics\.com/, (r) => r.abort());
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  const count = () => page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => ['Accept', 'Decline'].includes(b.textContent.trim())).length);
  await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Decline', exact: true }).waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: `${out}/j1-home-${w}.png` });
  await page.getByRole('button', { name: 'Decline', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
  const step1 = { consent: await page.evaluate(() => localStorage.getItem('czaba_analytics_consent')), buttons: await count() };
  await page.locator('header a[href="/store"]').first().click();
  await page.waitForURL('**/store', { timeout: 15000 });
  await page.waitForTimeout(3000);
  const step2 = { url: page.url(), buttons: await count() };
  await page.screenshot({ path: `${out}/j2-store-${w}.png` });
  await page.goto(base + '/products/middle-east', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const step3 = { url: page.url(), buttons: await count() };
  await page.screenshot({ path: `${out}/j3-product-${w}.png` });
  res.push({ viewport: `${w}x${h}`, step1, step2, step3, errors });
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/journey.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
