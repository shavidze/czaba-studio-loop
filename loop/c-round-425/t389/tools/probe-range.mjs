import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const page = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' }); await page.getByText('Demo collection ready').first().waitFor({ timeout: 240000 });
await page.getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
const lane = page.locator('[data-track-id="music"]').first(); const lb = await lane.boundingBox(); const cb = await page.locator('[data-clip-id]').first().boundingBox();
console.log(JSON.stringify({ lb, cb }));
const cnt = () => page.getByTestId('arrangement-lane-range').count();
const tries = [['body-plain', cb.x + 40, cb.y + cb.height * 0.6, 120, null], ['bg-plain', cb.x + cb.width + 60, lb.y + lb.height * 0.5, 120, null], ['bg-ctrl', cb.x + cb.width + 60, lb.y + lb.height * 0.5, 120, 'Control'], ['body-ctrl', cb.x + 40, cb.y + cb.height * 0.6, 120, 'Control']];
for (const [n, x, y, dx, mod] of tries) {
  await page.mouse.click(5, 5); if (mod) await page.keyboard.down(mod);
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + dx, y, { steps: 6 }); await page.mouse.up(); if (mod) await page.keyboard.up(mod); await page.waitForTimeout(300);
  console.log(n, await cnt(), await page.getByTestId('arrangement-status').first().textContent().catch(() => null));
}
await b.close();
