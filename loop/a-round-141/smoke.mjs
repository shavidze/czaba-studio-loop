import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
await page.waitForSelector('[aria-label$="set as the active track"]', { timeout: 30000 }).catch(() => console.log('no selector'));
const labels = await page.$$eval('[aria-label$="set as the active track"]', (els) => els.map((e) => [e.getAttribute('aria-label'), e.textContent]));
console.log(JSON.stringify(labels));
await page.screenshot({ path: process.argv[2] });
await browser.close();
