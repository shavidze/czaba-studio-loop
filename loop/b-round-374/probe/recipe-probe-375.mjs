// B round 374 -> 375 recipe probe (L29 state recipes for LIB-PREVIEW (c)/(d) and LIB-LAYOUT (d)).
// Usage: node recipe-probe-375.mjs <baseUrl> <outJson>. Both viewports. Records only; no app change.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const outPath = process.argv[3];
const out = { base, at: new Date().toISOString() };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const r = {}; out[`${w}x${h}`] = r;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const previewSel = page.getByTestId('arrangement-library-preview');
  const readPreview = async () => {
    const add = previewSel.getByRole('button', { name: 'Add' });
    const row = previewSel.locator('p[title^="Active track"]');
    return {
      addCount: await add.count(),
      addAriaDisabled: await add.first().getAttribute('aria-disabled'),
      addTitle: await add.first().getAttribute('title'),
      activeRowTitle: (await row.count()) ? await row.first().getAttribute('title') : null,
    };
  };
  const status = () => page.getByTestId('arrangement-status').first().textContent().catch(() => null);
  try {
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
    await page.waitForTimeout(800);
    r.listboxSounds = await page.getByRole('listbox', { name: 'Sounds' }).count();
    r.headers = await page.getByTestId('arrangement-track-header').allInnerTexts();
    const bass = page.getByRole('option', { name: /Bass/ }).first();
    await bass.click();
    await page.waitForTimeout(400);
    r.afterSelect = await readPreview();
    const nameButton = (name) => page.getByRole('button', { name: new RegExp(`^${name} — set as the active track`) }).first();
    await nameButton('Video').click();
    await page.waitForTimeout(400);
    r.afterVideoHeader = await readPreview();
    await nameButton('Music').click();
    await page.waitForTimeout(400);
    r.afterMusicHeader = await readPreview();
    const clipsBefore = await page.locator('[data-clip-id]').count();
    r.trackIds = await page.locator('[data-track-id]').evaluateAll((els) => els.map((e) => e.getAttribute('data-track-id')));
    const musicLane = page.locator('[data-track-id]').filter({ has: page.getByTestId('arrangement-track-header').filter({ hasText: 'Music' }) }).first().locator('[data-grid-seconds]').first();
    const box = await musicLane.boundingBox();
    if (box) {
      await bass.dragTo(musicLane, { targetPosition: { x: Math.min(200, box.width - 10), y: box.height / 2 } });
      await page.waitForTimeout(800);
    }
    r.drag = { clipsBefore, clipsAfter: await page.locator('[data-clip-id]').count(), status: await status() };
    await page.screenshot({ path: outPath.replace(/\.json$/, `-${w}.png`) });
  } catch (e) {
    r.error = String(e);
  }
  await ctx.close();
}
await browser.close();
writeFileSync(outPath, JSON.stringify(out, null, 1));
