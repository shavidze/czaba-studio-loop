import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const state = (page) => page.evaluate(() => {
  const g = document.querySelector('[data-testid="arrangement-grid-control"]');
  return { snap: g?.getAttribute('data-snap'), division: g?.getAttribute('data-grid-division'), tempo: document.querySelector('[data-testid="arrangement-tempo-input"]')?.value ?? null,
    clips: document.querySelectorAll('[data-clip-id]').length, status: document.querySelector('[data-testid="arrangement-status"]')?.textContent,
    statusBox: (() => { const s = document.querySelector('[data-testid="arrangement-status"]'); if (!s) return null; const r = s.getBoundingClientRect(); return { w: r.width, h: r.height, sw: s.scrollWidth, cw: s.clientWidth, ws: getComputedStyle(s).whiteSpace, ov: getComputedStyle(s).textOverflow }; })() };
});
const res = {};
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => { const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim())); return add && !add.disabled; }, undefined, { timeout: 90000 });
await page.waitForTimeout(800);
// Enter on a focused option
await page.locator('[data-source-id="demo-synth-mix"]').first().focus();
await page.keyboard.press('Enter'); await page.waitForTimeout(800);
res.enterMix = await state(page);
// grid select to 0.5
await page.selectOption('[data-testid="arrangement-grid-division"]', '0.5'); await page.waitForTimeout(300);
res.select05 = await state(page);
// G toggles snap (focus body first)
await page.locator('[data-testid="arrangement-status"]').click({ position: { x: 2, y: 2 } }).catch(() => {});
await page.evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('g'); await page.waitForTimeout(300);
res.afterG = await state(page);
// tempo field 90 Enter
await page.fill('[data-testid="arrangement-tempo-input"]', '90');
await page.press('[data-testid="arrangement-tempo-input"]', 'Enter'); await page.waitForTimeout(300);
res.tempo90 = await state(page);
// long status measure: use a long known status
res.errors = errors;
await page.screenshot({ path: `${out}/recipes-1280x720.png` });
await browser.close();
writeFileSync(`${out}/recipes.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
