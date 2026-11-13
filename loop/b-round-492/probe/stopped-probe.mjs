import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = {};
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(7000);
  const st = () => p.locator('[data-testid="arrangement-playback-state"]').first().textContent();
  const r = { initial: await st() };
  const items = p.locator('[role="option"], [data-testid*="library-item"], [data-library-item]');
  r.items = await items.count();
  await items.first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  await p.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
  await p.keyboard.press('Space'); await p.waitForTimeout(1500);
  r.afterSpace1 = await st();
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  r.afterSpace2 = await st();
  await p.screenshot({ path: `stopped-${w}x${h}.png` });
  out[`${w}x${h}`] = r;
}
await b.close();
console.log(JSON.stringify(out));
