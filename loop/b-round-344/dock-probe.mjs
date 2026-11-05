// B344 dock-follow probe (PERF-DRAG-PREVIEW c5-ii behaviour oracle). Usage: node dock-probe.mjs <base-url> <out.json> [width] [height]
// Stopped transport. Imports public/videos/hero/10.mp4 (clip at 0, playhead at 0), then:
// move: press the name bar, move +60 px (mid) and +120 px (end), release, Ctrl+Z. Records the clip start, whether
// arrangement-video-gap is shown, and the status text at before / mid / end / afterUndo.
// fade: press the video fade-in handle, same moves. Records data-fade-in, the overlay data-video-opacity and the status text.
import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'dock.json';
const width = Number(process.argv[4] ?? 1440);
const height = Number(process.argv[5] ?? 900);
const file = '/home/runner/czaba-project/store/public/videos/hero/10.mp4';
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const context = await browser.newContext({ viewport: { width, height } });
await context.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /Demo collection ready/.test(document.body.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
const result = { viewport: `${width}x${height}`, pageErrors: errors };
await page.getByTestId('arrangement-video-input').setInputFiles(file);
const clip = page.locator('[data-clip-kind="video"]').first();
await clip.waitFor({ timeout: 60000 });
await page.waitForTimeout(4000);
result.undoAfterImport = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
const state = () => page.evaluate(() => {
  const c = document.querySelector('[data-clip-kind="video"]');
  const overlay = document.querySelector('[data-testid="arrangement-video-fade"]');
  return {
    start: c?.getAttribute('data-clip-start') ?? null,
    fadeIn: c?.getAttribute('data-fade-in') ?? null,
    gapShown: document.querySelector('[data-testid="arrangement-video-gap"]') !== null,
    overlayOpacity: overlay?.getAttribute('data-video-opacity') ?? null,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
    playing: /Pause/.test(document.querySelector('[data-testid="arrangement-transport"]')?.textContent ?? ''),
  };
});
const target = (drag) => drag === 'move' ? clip.getByTitle(/ — drag to move$/) : clip.getByTestId('arrangement-video-fade-in-handle');
for (const drag of ['move', 'fade']) {
  const t = target(drag);
  if ((await t.count()) !== 1) { result[drag] = { error: `target count ${await t.count()}` }; continue; }
  const box = await t.boundingBox();
  const x = drag === 'move' ? box.x + Math.min(200, box.width / 2) : box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const before = await state();
  const undoBefore = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + 60, y, { steps: 30 });
  await page.waitForTimeout(300);
  const mid = await state();
  await page.mouse.move(x + 120, y, { steps: 30 });
  await page.waitForTimeout(300);
  const held = await state();
  await page.mouse.up(); await page.waitForTimeout(800);
  const end = await state();
  const undoAfter = await page.getByRole('button', { name: /^Undo/ }).first().getAttribute('title');
  await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
  await page.keyboard.press('Control+z'); await page.waitForTimeout(800);
  const afterUndo = await state();
  result[drag] = { before, mid, held, end, undoBefore, undoAfter, afterUndo };
}
writeFileSync(out, JSON.stringify(result, null, 1));
await browser.close();
console.log(out);
