import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out = process.argv[2];
const label = process.argv[3] || 'standard';
const pages = process.argv.slice(4);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const result = { label };
await page.goto('http://127.0.0.1:5173/store', { waitUntil: 'networkidle' });
result.storeCards = await page.$$eval('a[href^="/products/"]', (as) =>
  as.map((a) => ({ href: a.getAttribute('href'), price: [...a.querySelectorAll('span')].map((s) => s.textContent.trim()).filter((t) => /^\$|Price unavailable/.test(t)), cls: [...a.querySelectorAll('span')].filter((s) => /^\$|Price unavailable/.test(s.textContent.trim())).map((s) => s.className) })),
);
await page.screenshot({ path: `${out}/${label}-store-1440.png` }).catch((e) => { result.shotError = String(e).slice(0, 80); });
for (const handle of pages) {
  await page.goto(`http://127.0.0.1:5173/products/${handle}`, { waitUntil: 'networkidle' });
  result[handle] = await page.$$eval('button[aria-pressed]', (bs) => bs.map((b) => b.innerText.replace(/\s+/g, ' ').trim()));
  await page.screenshot({ path: `${out}/${label}-${handle}-1440.png` }).catch((e) => { result.shotError = String(e).slice(0, 80); });
}
await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
console.log(JSON.stringify(result, null, 1));
await browser.close();
