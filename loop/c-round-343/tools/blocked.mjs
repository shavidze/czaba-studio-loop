import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [,, base, out, w, h] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +w, height: +h } });
await ctx.addInitScript(() => localStorage.setItem('czaba_analytics_consent', 'denied'));
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => /Demo collection ready/.test(document.body?.textContent ?? ''), null, { timeout: 120000 });
await page.waitForTimeout(1000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
await page.locator('[data-clip-kind="audio"]').first().waitFor();
await page.waitForTimeout(1200);
const clips = page.locator('[data-clip-kind="audio"]');
const first = clips.first();
const nb = (l) => l.getByTitle(/ — drag to move$/);
const b0 = await nb(first).boundingBox();
await page.mouse.click(b0.x + 40, b0.y + b0.height / 2); await page.waitForTimeout(300);
await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
await page.keyboard.press('Control+d'); await page.waitForTimeout(800);
await page.keyboard.down('Control'); await page.mouse.click(b0.x + 40, b0.y + b0.height / 2); await page.keyboard.up('Control');
await page.waitForTimeout(500);
const st = () => page.evaluate(() => ({
  starts: [...document.querySelectorAll('[data-clip-kind="audio"]')].map((c) => c.getAttribute('data-clip-start')),
  status: document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? null,
  undo: [...document.querySelectorAll('button')].find((b) => /^Undo/.test(b.getAttribute('aria-label') ?? b.getAttribute('title') ?? ''))?.getAttribute('title') ?? null,
  selected: document.querySelector('[data-testid="arrangement-selected-clip"]')?.textContent ?? null, selCount: document.querySelectorAll('[data-clip-kind="audio"][aria-pressed="true"],[data-clip-kind="audio"][data-clip-selected="true"],[data-clip-kind="audio"][data-selected="true"]').length,
}));
const before = await st();
const b = await nb(first).boundingBox();
const x = b.x + 40, y = b.y + b.height / 2;
await page.mouse.move(x, y); await page.mouse.down();
const mids = [];
for (let i = 1; i <= 6; i++) { await page.mouse.move(x - i * 20, y); await page.waitForTimeout(150); mids.push(await st()); }
await page.screenshot({ path: out.replace('.json', '-mid.png') });
await page.mouse.up(); await page.waitForTimeout(600);
const after = await st();
writeFileSync(out, JSON.stringify({ viewport: `${w}x${h}`, before, mids, after, pageErrors: errs }, null, 1));
await browser.close();
