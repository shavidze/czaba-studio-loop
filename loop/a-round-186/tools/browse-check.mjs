import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const result = {};
for (const [name, url] of [['home', 'http://127.0.0.1:5173/'], ['middle-east', 'http://127.0.0.1:5173/products/middle-east'], ['archived-rain', 'http://127.0.0.1:5173/products/archived-rain']]) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const remote = []; const errors = []; const consoleMsgs = [];
  page.on('request', (r) => { const h = new URL(r.url()).host; if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(h)) remote.push(r.url()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  const entry = { status: response?.status(), remote, pageErrors: errors, console: consoleMsgs };
  if (name === 'home') {
    for (let y = 0; y < 12000; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(120); }
    const img = page.locator('img[alt="Gift Card"]');
    await img.evaluate((i) => i.scrollIntoView({ block: 'center' }));
    await page.waitForFunction(() => { const i = document.querySelector('img[alt="Gift Card"]'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 10000 });
    entry.giftCard = await img.evaluate((i) => ({ currentSrc: i.currentSrc, complete: i.complete, naturalWidth: i.naturalWidth, loading: i.loading, decoding: i.decoding }));
    entry.remoteAfterScroll = [...remote];
    await page.locator('section').filter({ hasText: 'Give the Gift of Sound' }).last().screenshot({ path: `${out}/home-special-offers-1440.png` });
  } else {
    entry.hydratedMeta = await page.evaluate(() => ['description', 'og:description', 'twitter:description'].map((k) => document.querySelector(`meta[name="${k}"], meta[property="${k}"]`)?.getAttribute('content')));
    entry.h1 = await page.locator('h1').allInnerTexts();
    entry.hasBuy = await page.getByText(/Add to Cart|Buy Now|TOTAL PRICE/i).count();
  }
  result[name] = entry;
  await context.close();
}
await browser.close();
console.log(JSON.stringify(result, null, 2));
