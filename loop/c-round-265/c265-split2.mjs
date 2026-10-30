import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-265';
const browser = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1000);
  const lb = await page.locator('[data-grid-seconds]:not([data-testid])').first().boundingBox(); const y = lb.y + lb.height * 0.7;
  await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  const rd = () => page.evaluate(() => ({ clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-start')), range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').slice(0, 52), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent }));
  const drag = async (x0, x1) => { await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, y, { steps: 4 }); await page.mouse.move(x1, y, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
  await drag(clip.x + 100, clip.x + 400); r.inClip = await rd();
  await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.inClipSplit = await rd();
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(300); r.undo = await rd();
  await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300);
  await drag(clip.x + 100, clip.x - 150); r.pastStart = await rd();
  await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.pastStartSplit = await rd();
  await page.screenshot({ path: `${DIR}/shots/after-split-refused-${vp}.png` });
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(300); r.ctrlZAfterRefusal = await rd();
  r.errors = errors; await ctx.close();
}
writeFileSync(`${DIR}/split2-after.json`, JSON.stringify(out, null, 1)); await browser.close(); console.log(JSON.stringify(out, null, 1));
