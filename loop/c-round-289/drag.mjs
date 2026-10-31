// C289 neighbour: drag from a grouped option onto a lane + listbox aria snapshot. node drag.mjs <base> <tag>
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const [BASE, TAG] = process.argv.slice(2); const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-289'; const out = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), undefined, { timeout: 150000 });
  await page.waitForTimeout(800);
  const r = {}; out[k] = r;
  r.aria = await page.locator('[data-testid="arrangement-library-list"]').ariaSnapshot();
  const opt = page.locator('[role="option"][data-source-id="demo-stem-pad"]'); await opt.scrollIntoViewIfNeeded();
  const lane = page.getByText('Drag a sound here, or press Enter to add it').first();
  const lb = await lane.boundingBox();
  await opt.dragTo(lane, { force: true, targetPosition: { x: 40, y: 10 } });
  await page.waitForTimeout(1500);
  r.after = await page.evaluate(() => ({ status: document.querySelector('[data-testid="arrangement-status"]')?.textContent.trim(), clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.textContent.trim().slice(0, 60)) }));
  r.laneBox = lb;
  await page.screenshot({ path: `${DIR}/shots/drag-${TAG}-${k}.png` });
  await ctx.close();
}
await browser.close(); fs.writeFileSync(`${DIR}/probe/drag-${TAG}.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
