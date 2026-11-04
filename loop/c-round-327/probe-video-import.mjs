// C327: plain-desktop reachability of C-R327-01: the user picks a video ("Your own video"), then immediately drags an
// audio clip's Fade In and holds while the import finishes (async runVideoImport status writes). Also checks the bars
// ruler in a no-BPM (SFX-only) project for INFO-C327-ALT-CLICK-MARKER.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const [BASE, TAG] = [process.argv[2], process.argv[3]];
const DIR = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-327';
const VIDEO = '/home/runner/czaba-project/store/public/videos/hero/1.mp4';
const res = { base: BASE, tag: TAG };
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.locator('[data-source-id="demo-stem-pulse"]').first().click(); await page.waitForTimeout(250);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(1500);
    const id = await page.locator('[data-clip-kind="audio"]').first().getAttribute('data-clip-id');
    await page.evaluate(() => document.activeElement?.blur());
    for (let i = 0; i < 20 && (await page.locator(`[data-clip-id="${id}"]`).boundingBox()).width > 520; i++) { await page.keyboard.press('Minus'); await page.waitForTimeout(200); }
    const hb = await page.locator(`[data-clip-id="${id}"]`).locator('[title^="Fade In"]').first().boundingBox();
    const from = { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 };
    await page.evaluate(() => { const o = document.querySelector('[data-testid="arrangement-status"]'); window.__rec = []; const t0 = performance.now(); new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) window.__rec.push(`${Math.round(performance.now() - t0)} +${(n.textContent ?? '').trim().slice(0, 90)}`); for (const n of m.removedNodes) window.__rec.push(`${Math.round(performance.now() - t0)} -${(n.textContent ?? '').trim().slice(0, 90)}`); } }).observe(o, { childList: true, subtree: true, characterData: true }); });
    await page.setInputFiles('[data-testid="arrangement-video-input"]', VIDEO);
    await page.mouse.move(from.x, from.y); await page.mouse.down();
    await page.mouse.move(from.x + 40, from.y, { steps: 4 });
    await page.waitForTimeout(6000);
    r.duringHold = await page.evaluate(() => { const x = window.__rec; window.__rec = []; return x; });
    r.videoClips = await page.locator('[data-clip-kind="video"]').count();
    await page.mouse.up(); await page.waitForTimeout(600);
    r.afterRelease = await page.evaluate(() => window.__rec);
    r.finalStatus = await page.locator('[data-testid="arrangement-status"]').textContent();
    // no-BPM project: bars ruler state
    await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent || ''), null, { timeout: 180000 });
    await page.locator('[data-source-id="demo-soft-impact"]').first().click(); await page.waitForTimeout(250);
    await page.locator('button', { hasText: /^Add/ }).first().click(); await page.waitForTimeout(1200);
    r.noBpmRuler = await page.evaluate(() => { const e = document.querySelector('[data-testid="arrangement-bars-ruler"]'); if (!e) return 'absent'; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { h: b.height, w: b.width, y: b.y, display: cs.display, visibility: cs.visibility, bpm: document.querySelector('input[aria-label*="BPM" i], [data-testid*="bpm"]')?.value ?? null }; });
  } catch (e) { r.error = String(e).slice(0, 400); }
  await ctx.close();
}
writeFileSync(`${DIR}/probe-video-import-${TAG}.json`, JSON.stringify(res, null, 1));
await browser.close();
