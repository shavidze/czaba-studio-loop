import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
await page.waitForTimeout(1000);
const lanes = await page.locator('[data-grid-seconds]').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, testid: e.getAttribute('data-testid') }; }));
console.log(JSON.stringify(lanes));
for (const l of lanes) {
  const x = l.x + Math.min(400, l.w - 20), y = l.y + l.h / 2;
  const hit = await page.evaluate(({ x, y }) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${e.getAttribute('data-testid')}|${(e.className||'').toString().slice(0,60)}` : null; }, { x, y });
  await page.mouse.click(x, y, { button: 'right' });
  await page.waitForTimeout(300);
  console.log(JSON.stringify({ x, y, hit, menus: await page.locator('[role="menu"]').count() }));
  await page.keyboard.press('Escape');
}
await browser.close();
