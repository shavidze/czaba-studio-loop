// B round 430 -> 431: forced-colors fallback + disabled-checked scope radio during a WAV render.
// usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node radio-extra-probe.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT;
mkdirSync(OUT, { recursive: true });
const result = { base: BASE, started: new Date().toISOString(), cells: {} };
const browser = await chromium.launch();
async function openDialog(page) {
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(800);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(400);
}
for (const [W, H] of [[1440, 900], [1280, 720]]) {
  const key = `${W}x${H}`;
  const cell = { pageErrors: [] };
  result.cells[key] = cell;
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => cell.pageErrors.push(String(e).slice(0, 300)));
  await openDialog(page);
  await page.emulateMedia({ forcedColors: 'active' });
  await page.waitForTimeout(300);
  cell.forcedColors = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] input[type="radio"]')].map((r) => ({ id: r.getAttribute('data-testid') ?? 'video', appearance: getComputedStyle(r).appearance, w: r.getBoundingClientRect().width })));
  await page.screenshot({ path: path.join(OUT, `${key}-forced-colors-dialog.png`) });
  await page.emulateMedia({ forcedColors: 'none' });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const w = window;
    w.__dc = [];
    const project = document.querySelector('[data-testid="arrangement-export-scope-project"]');
    const snap = () => {
      if (project.disabled && project.checked && w.__dc.length < 3) {
        const cs = getComputedStyle(project);
        w.__dc.push({ t: performance.now(), opacity: cs.opacity, border: cs.borderTopColor, borderW: cs.borderTopWidth, appearance: cs.appearance });
        if (w.__dc.length === 1) {
          setTimeout(() => {
            const late = getComputedStyle(project);
            w.__dcLate = { stillDisabled: project.disabled, checked: project.checked, opacity: late.opacity, border: late.borderTopColor, borderW: late.borderTopWidth };
          }, 250);
        }
      }
    };
    new MutationObserver(snap).observe(project, { attributes: true });
  });
  const dl = page.waitForEvent('download', { timeout: 180000 }).catch(() => null);
  await page.getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true }).click();
  const box = await page.locator('[data-testid="arrangement-export-scope-project"]').boundingBox();
  if (box) await page.screenshot({ path: path.join(OUT, `${key}-project-disabled-checked.png`), clip: { x: box.x - 8, y: box.y - 8, width: box.width + 16, height: box.height + 16 } });
  const file = await dl;
  cell.download = file ? file.suggestedFilename() : null;
  await page.waitForTimeout(400);
  cell.disabledChecked = await page.evaluate(() => window.__dc);
  cell.disabledCheckedLate = await page.evaluate(() => window.__dcLate ?? null);
  await ctx.close();
}
await browser.close();
writeFileSync(path.join(OUT, 'radio-extra-probe.json'), JSON.stringify(result, null, 1));
console.log('done', OUT);
