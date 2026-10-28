import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';

const label = process.argv[2] ?? 'before';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-235/shots';
const url = 'http://127.0.0.1:5173/studio-lab';
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
];

const browser = await chromium.launch();
const result = [];
for (const viewport of viewports) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-bars-ruler"]', { state: 'attached' });
  await page.waitForTimeout(1500);
  const tag = `${label}-${viewport.width}`;
  await page.screenshot({ path: `${out}/${tag}-empty.png` });
  await page.click('[data-source-id="demo-stem-pulse"]');
  await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
  await page.waitForTimeout(1200);
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${out}/${tag}-seeded.png` });
  const bars = await page.getByTestId('arrangement-bars-ruler').boundingBox();
  const strip = await page.locator('[data-testid="arrangement-bars-scrub-strip"]').count();
  if (bars) {
    await page.mouse.move(bars.x + 160, bars.y + 4);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${out}/${tag}-strip-hover.png` });
  }
  result.push({ viewport, bars, stripCount: strip, errors });
  await context.close();
}
await browser.close();
console.log(JSON.stringify(result, null, 2));
