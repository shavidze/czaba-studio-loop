import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || './out-baseline';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  const geo = () => page.evaluate(() => {
    const box = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), cursor: getComputedStyle(e).cursor, pe: getComputedStyle(e).pointerEvents, title: e.getAttribute('title') }; };
    const pos = document.querySelector('[data-testid="arrangement-playhead-handle"]');
    return { ruler: box('[data-testid="arrangement-ruler"]'), bars: box('[data-testid="arrangement-bars-ruler"]'), markerRow: box('[data-testid="arrangement-marker-row"]'), marks: document.querySelectorAll('[data-testid="arrangement-bars-mark"]').length, playhead: pos?.getAttribute('aria-valuenow'), playing: [...document.querySelectorAll('button')].find((b) => /^(Play|Pause)/.test((b.getAttribute('aria-label')||b.textContent).trim()))?.getAttribute('aria-label'), status: document.querySelector('[data-testid="arrangement-status"]')?.textContent };
  });
  const r = {};
  r.empty = await geo();
  await page.locator('[data-source-id="demo-stem-pulse"]').first().click();
  await page.locator('button', { hasText: /^Add/ }).first().click();
  await page.waitForTimeout(800);
  r.seeded = await geo();
  // click on bars ruler at 4 s (40 px/s) top and bottom
  const b = r.seeded.bars;
  await page.mouse.click(b.x + 4 * 40 + 3, b.y + 4); await page.waitForTimeout(400);
  r.afterBarsTopClick = await geo();
  await page.mouse.click(b.x + 6 * 40 + 3, b.y + 15); await page.waitForTimeout(400);
  r.afterBarsBottomClick = await geo();
  const s = r.seeded.ruler;
  await page.mouse.click(s.x + 3 * 40 + 7, s.y + 14); await page.waitForTimeout(400);
  r.afterSecondsClick = await geo();
  // elementFromPoint at bars ruler
  r.hitBars = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e?.getAttribute('data-testid') || e?.tagName; }, [b.x + 100, b.y + 5]);
  r.markerRowTestids = await page.evaluate(() => [...new Set([...document.querySelectorAll('[data-testid^="arrangement-marker"]')].map((e) => e.getAttribute('data-testid')))]);
  await page.screenshot({ path: `${out}/seeded-${w}.png` });
  r.errors = errors;
  res[`${w}x${h}`] = r;
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/baseline.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
