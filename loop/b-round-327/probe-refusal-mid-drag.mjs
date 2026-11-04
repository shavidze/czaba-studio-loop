// B327 probe: a key refusal mid fade drag (a text-changing committed write). Compare trees.
// usage: node probe-refusal-mid-drag.mjs <BASE> <tag>
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, TAG] = [process.argv[2], process.argv[3]];
const DIR = process.env.PROBE_DIR ?? '/home/runner/czaba-project/tmp/studio-real-loop/b-round-327';
const res = { base: BASE, tag: TAG };
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => !/Loading/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? 'Loading'), null, { timeout: 180000 });
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await page.waitForTimeout(300);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(1500);
    const id = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-id');
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 20 && (await page.locator(`[data-clip-id="${id}"]`).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    const hb = await page.locator(`[data-clip-id="${id}"]`).getByTestId('arrangement-clip-fade-in-handle').first().boundingBox();
    const from = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 };
    await page.evaluate(() => { const o = document.querySelector('[data-testid="arrangement-status"]'); window.__rec = []; new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) window.__rec.push(`+${(n.textContent ?? '').trim()}`); for (const n of m.removedNodes) window.__rec.push(`-${(n.textContent ?? '').trim()}`); } }).observe(o, { childList: true, subtree: true, characterData: true }); });
    const take = () => page.evaluate(() => { const x = window.__rec; window.__rec = []; return x; });
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y, { steps: 4 }); await page.waitForTimeout(300);
    r.atHold = await take();
    await page.keyboard.press('Delete'); await page.waitForTimeout(400);
    r.afterKey = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), rec: await take() };
    await page.mouse.move(from.x + 60, from.y, { steps: 2 }); await page.waitForTimeout(300);
    r.afterMove = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), rec: await take() };
    await page.mouse.up(); await page.waitForTimeout(400);
    r.afterRelease = { status: await page.locator('[data-testid="arrangement-status"]').textContent(), rec: await take(), undo: await page.locator('button[title^="Undo"]').first().getAttribute('title').catch(() => null) };
  } catch (e) { r.error = String(e); }
  await ctx.close();
}
await browser.close();
writeFileSync(`${DIR}/probe-refusal-${TAG}.json`, JSON.stringify(res, null, 1));
