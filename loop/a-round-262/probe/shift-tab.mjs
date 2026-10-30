import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const res = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const v = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const header = await page.locator('header').boundingBox();
  const toolbar = await page.locator('[data-testid="arrangement-transport"]').boundingBox();
  await page.getByRole('button', { name: 'Keyboard shortcuts (?)' }).focus();
  const back = [];
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Shift+Tab');
    back.push(await page.evaluate(() => {
      const a = document.activeElement;
      const cs = a ? getComputedStyle(a) : null;
      return { tag: a?.tagName, name: a?.getAttribute('aria-label') ?? (a?.textContent ?? '').trim().slice(0, 20), inFooter: !!a?.closest('footer'), outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth}` : null, focusVisible: a?.matches(':focus-visible') };
    }));
  }
  res[v] = { header, toolbar, back };
  await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
  await ctx.close();
}
await browser.close();
writeFileSync(process.argv[2], JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
