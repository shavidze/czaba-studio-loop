import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const outDir = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-348';
const base = 'http://127.0.0.1:5173';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  const r = {};
  await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 240000 });
  await sleep(1000);
  await page.getByRole('button', { name: 'Add', exact: true }).first().click();
  await page.locator('[data-clip-kind="audio"]').first().waitFor();
  await sleep(1200);
  await page.getByRole('button', { name: 'Fit', exact: true }).first().click(); await sleep(800);
  const clip = page.locator('[data-clip-kind="audio"]').first();
  const state = () => clip.evaluate((e) => ({ start: e.getAttribute('data-clip-start'), fadeIn: e.getAttribute('data-fade-in'), width: Math.round(e.getBoundingClientRect().width), left: Math.round(e.getBoundingClientRect().left) }));
  const undoBtn = page.getByRole('button', { name: /^Undo/ }).first();
  const undoTitle = async () => (await undoBtn.getAttribute('title')) ?? '';
  const targets = {
    trim: clip.getByTitle('Trim — left edge', { exact: true }),
    move: clip.getByTitle(/ — drag to move$/),
    fade: clip.getByTestId('arrangement-clip-fade-in-handle'),
  };
  r.initial = await state(); r.undo0 = await undoTitle();
  for (const name of ['trim', 'move', 'fade']) {
    const el = targets[name].first();
    const b = await el.boundingBox();
    const g = { name, bbox: b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) } : null };
    if (!b) { r[name] = g; continue; }
    const before = await state(); const u0 = await undoTitle();
    const x = b.x + b.width / 2, y = b.y + b.height / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + 20, y, { steps: 4 });
    await page.mouse.move(x + 50, y, { steps: 4 });
    await sleep(150);
    g.mid = await state(); g.undoDuring = await undoTitle();
    if (name === 'move') await page.screenshot({ path: `${outDir}/drag-move-mid-${w}.png` });
    await page.mouse.up(); await sleep(400);
    g.after = await state(); g.undoAfter = await undoTitle();
    await page.keyboard.press('Control+KeyZ'); await sleep(400);
    g.afterUndo = await state(); g.undoAfterUndo = await undoTitle();
    g.before = before; g.u0 = u0;
    g.previewedDuring = JSON.stringify(g.mid) !== JSON.stringify(before);
    g.committed = JSON.stringify(g.after) !== JSON.stringify(before);
    g.undoRestores = JSON.stringify(g.afterUndo) === JSON.stringify(before);
    g.undoLabelAdded = g.undoAfter !== u0;
    r[name] = g;
  }
  r.clipsEnd = await page.locator('[data-clip-kind="audio"]').count();
  await page.screenshot({ path: `${outDir}/drag-end-${w}.png` });
  out[w] = r; await ctx.close();
}
writeFileSync(`${outDir}/drag.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
