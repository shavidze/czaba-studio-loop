import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = {};
const state = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  return {
    snap: g?.getAttribute('data-snap'), division: g?.getAttribute('data-grid-division'), gridSeconds: g?.getAttribute('data-grid-seconds'),
    tempo: document.querySelector('[data-testid="arrangement-tempo-input"]')?.value ?? null,
    barsRuler: !!document.querySelector('[data-testid="arrangement-bars-ruler"]'),
    barsMarks: document.querySelectorAll('[data-testid="arrangement-bars-mark"]').length,
    clips: [...document.querySelectorAll('[data-clip-id]')].map((c) => c.getAttribute('data-clip-id')).length,
    status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
  };
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  for (const sourceId of ['demo-stem-pulse', 'demo-soft-impact', 'demo-middle-east']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
    await page.waitForTimeout(800);
    const r = { start: await state(page) };
    const opt = page.locator(`[data-source-id="${sourceId}"]`).first();
    r.optionFound = await opt.count();
    await opt.click();
    await page.waitForTimeout(300);
    const add = page.locator('button', { hasText: /^Add/ }).first();
    r.addLabel = (await add.textContent())?.trim();
    await add.click();
    await page.waitForTimeout(800);
    r.afterAdd = await state(page);
    r.errors = errors;
    if (sourceId === 'demo-stem-pulse') await page.screenshot({ path: `${out}/baseline-after-add-${w}x${h}.png` });
    res[`${w}x${h}:${sourceId}`] = r;
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`${out}/seed.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
