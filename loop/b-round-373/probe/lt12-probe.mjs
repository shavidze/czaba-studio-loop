// B round 373 -> 374 baseline probe (L29 state recipe for STATUS-LT12-BROWSER). Usage: node lt12-probe.mjs <base> <out>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2]; const outPath = process.argv[3];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const status = () => page.getByTestId('arrangement-status').innerText().catch(() => null);
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(800);
  await page.getByTestId('arrangement-library-list').getByRole('option', { name: /Bass/ }).first().click(); await page.keyboard.press('Enter'); await page.waitForTimeout(1200);
  r.afterAdd = await status();
  await page.keyboard.press('Space'); await page.waitForTimeout(1000); r.whilePlaying = await status();
  await page.keyboard.press('Space'); await page.waitForTimeout(500); r.afterStop = await status();
  const strip = page.getByTestId('arrangement-bars-scrub-strip');
  r.stripFound = await strip.count();
  let box = r.stripFound ? await strip.first().boundingBox() : null;
  if (!box) { const ruler = page.getByTestId('arrangement-bars-ruler'); r.rulerFound = await ruler.count(); box = r.rulerFound ? await ruler.first().boundingBox() : null; r.usedRulerTop = true; }
  if (box) {
    const scroller = await page.getByTestId('arrangement-timeline-scroller').boundingBox();
    r.box = box;
    await page.mouse.click(Math.min(box.x + box.width - 5, box.x + 6 * 20 + 2), box.y + 3);
    await page.waitForTimeout(500);
    r.afterStripClick = await status();
    r.playing = await page.locator('[data-playing]').first().getAttribute('data-playing').catch(() => null);
    await page.keyboard.press('Space'); await page.waitForTimeout(500); r.afterSpace = await status();
    r.scroller = scroller;
  }
  await ctx.close();
}
await browser.close(); writeFileSync(outPath, JSON.stringify(out, null, 1));
