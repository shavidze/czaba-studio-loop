import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.argv[2]; const TAG = process.argv[3];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-265';
const browser = await chromium.launch();
const out = { base: BASE, tag: TAG, at: new Date().toISOString() };
const rd = (page) => page.evaluate(() => {
  const lanes = [...document.querySelectorAll('[data-grid-seconds]:not([data-testid])')];
  return {
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-start')),
    range: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim().slice(0, 50),
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    overlays: [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((o) => { const row = o.closest('[data-track-id]'); return `${lanes.findIndex((l) => l.contains(o))}|${row?.getAttribute('data-track-id') ?? o.parentElement?.getAttribute('data-testid') ?? o.parentElement?.className.slice(0, 40)}`; }),
    active: document.activeElement === document.body ? 'BODY' : `${document.activeElement.tagName}|${document.activeElement.getAttribute('aria-label')}`,
  };
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (out[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${DIR}/shots/${TAG}-empty-${vp}.png` });
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  const lb = await lane.boundingBox(); const y = lb.y + lb.height * 0.7;
  await page.mouse.click(lb.x + 400, y); await page.waitForTimeout(300);
  await page.getByRole('option').first().focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  await page.screenshot({ path: `${DIR}/shots/${TAG}-setupS-${vp}.png` });
  const clip = await page.locator('[data-clip-id]').first().boundingBox();
  const drag = async (x0, x1) => { await page.mouse.move(x0, y); await page.mouse.down(); await page.mouse.move((x0 + x1) / 2, y, { steps: 4 }); await page.mouse.move(x1, y, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(300); };
  const clear = async () => { await page.mouse.click(lb.x + 60, y); await page.waitForTimeout(300); };
  await drag(clip.x + 100, clip.x - 150); r.pastStart = await rd(page);
  await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.pastStartSplit = await rd(page);
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(300); await clear();
  await drag(clip.x + 100, clip.x + 400); r.inClip = await rd(page);
  await page.keyboard.press('Control+KeyE'); await page.waitForTimeout(300); r.inClipSplit = await rd(page);
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(300); await clear();
  await drag(clip.x + 100, clip.x + 400); await page.keyboard.press('Control+Shift+KeyL'); await page.waitForTimeout(300); r.allTracks = await rd(page); await clear();
  await page.locator('button[aria-keyshortcuts="G 4"]').first().focus(); r.snapFocusBefore = (await rd(page)).active;
  await drag(lb.x + 40, lb.x + 300); r.snapFocusAfter = (await rd(page)).active; r.rangeAfterBgDrag = (await rd(page)).range; await clear();
  r.errors = errors; await ctx.close();
}
writeFileSync(`${DIR}/nb-${TAG}.json`, JSON.stringify(out, null, 1));
await browser.close(); console.log(JSON.stringify(out, null, 1));
