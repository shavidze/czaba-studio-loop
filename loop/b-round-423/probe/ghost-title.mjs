// B round 423 -> 424 probe: cross-lane drag ghost label (title now resolved inside the memo inner).
// Add the demo clip, press its name bar, move 10 px right, then one lane down; read every
// [data-testid=arrangement-lane-move-ghost-label] text; release with Escape-free path: move back up and release, then Ctrl+Z if the clip moved.
// Usage: node ghost-title.mjs <baseUrl> <outJson>. Both viewports.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  const clip = page.locator('[data-clip-kind="audio"]').first();
  await clip.waitFor({ timeout: 30000 });
  await page.waitForTimeout(1500);
  const bar = clip.getByTitle(/ — drag to move$/).first();
  const box = await bar.boundingBox();
  const lane = await clip.evaluate((el) => {
    const own = el.closest('[data-track-id]');
    const lanes = [...document.querySelectorAll('[data-track-id]')];
    const next = lanes[lanes.indexOf(own) + 1];
    const r = next.getBoundingClientRect();
    return { own: own.getAttribute('data-track-id'), next: next.getAttribute('data-track-id'), nextMidY: r.top + r.height / 2 };
  });
  const x = box.x + 20;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 5; i += 1) await page.mouse.move(x + 2 * i, y);
  for (let i = 1; i <= 5; i += 1) await page.mouse.move(x + 10, y + ((lane.nextMidY - y) * i) / 5);
  await page.waitForTimeout(300);
  const labels = await page.getByTestId('arrangement-lane-move-ghost-label').allTextContents();
  const ghostLane = await page.getByTestId('arrangement-lane-move-ghost').first().evaluate((el) => el.closest('[data-track-id]')?.getAttribute('data-track-id') ?? null).catch(() => null);
  for (let i = 1; i <= 5; i += 1) await page.mouse.move(x + 10, lane.nextMidY + ((y - lane.nextMidY) * i) / 5);
  await page.mouse.up();
  await page.waitForTimeout(300);
  out[`${w}x${h}`] = { lane, labels, ghostLane, errors };
  await page.close();
}
writeFileSync(outPath, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
