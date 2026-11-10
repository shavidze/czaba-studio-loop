// B round 431 -> 432: hold recipe for the Export dialog <progress> at HEAD (both states), real Chromium.
// usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> [CPU=20] node progress-hold-probe.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT;
const CPU = Number(process.env.CPU ?? 20);
mkdirSync(OUT, { recursive: true });
const result = { base: BASE, cpu: CPU, started: new Date().toISOString(), cells: {} };
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
const readBar = (page) => page.evaluate(() => {
  const p = document.querySelector('[data-testid="arrangement-export-progress"]');
  if (!p) return null;
  const cs = getComputedStyle(p);
  const r = p.getBoundingClientRect();
  return { hasValue: p.hasAttribute('value'), value: p.hasAttribute('value') ? p.value : null, position: p.position, indeterminate: p.matches(':indeterminate'), appearance: cs.appearance, accentColor: cs.accentColor, bg: cs.backgroundColor, color: cs.color, borderR: cs.borderTopLeftRadius, x: r.x, y: r.y, w: r.width, h: r.height, label: document.querySelector('[data-testid="arrangement-export-progress-label"]')?.textContent ?? null, valuetext: p.getAttribute('aria-valuetext'), t: performance.now() };
});
async function crop(page, file) {
  const box = await page.locator('[data-testid="arrangement-export-progress"]').boundingBox().catch(() => null);
  if (box) await page.screenshot({ path: path.join(OUT, file), clip: { x: box.x - 6, y: box.y - 6, width: box.width + 12, height: box.height + 12 } });
}
for (const [W, H] of [[1440, 900], [1280, 720]]) {
  const key = `${W}x${H}`;
  const cell = { pageErrors: [], requests: [] };
  result.cells[key] = cell;
  // A. indeterminate: stall the encoder module request
  {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => cell.pageErrors.push(String(e).slice(0, 300)));
    let release;
    const gate = new Promise((r) => { release = r; });
    let stalled = 0;
    await page.route(/mp3-encoder\.client/, async (route) => { stalled++; cell.requests.push(route.request().url()); await gate; await route.continue(); });
    await openDialog(page);
    await page.locator('[data-testid="arrangement-export-format-mp3"]').check({ force: true }).catch(() => {});
    const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    const btn = page.getByRole('dialog').getByRole('button', { name: /^Export MP3/ });
    await btn.click();
    const samples = [];
    for (let i = 0; i < 40; i++) { const s = await readBar(page); if (s) samples.push(s); if (s && !s.hasValue && samples.filter((x) => !x.hasValue).length >= 3) break; await page.waitForTimeout(250); }
    cell.indeterminate = { stalled, samples };
    await page.waitForTimeout(1000);
    cell.indeterminateHeld1s = await readBar(page);
    await crop(page, `${key}-indeterminate.png`);
    await page.screenshot({ path: path.join(OUT, `${key}-indeterminate-dialog.png`) });
    release();
    const file = await dl;
    cell.mp3Download = file ? file.suggestedFilename() : null;
    await ctx.close();
  }
  // B. determinate: CPU-throttled WAV render
  {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, acceptDownloads: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => cell.pageErrors.push(String(e).slice(0, 300)));
    await openDialog(page);
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
    const dl = page.waitForEvent('download', { timeout: 240000 }).catch(() => null);
    await page.getByRole('dialog').getByRole('button', { name: 'Export WAV', exact: true }).click();
    const samples = [];
    let shot = false;
    for (let i = 0; i < 200; i++) {
      const s = await readBar(page);
      if (s) samples.push(s);
      if (s && s.hasValue && s.value > 0.2 && s.value < 0.8 && !shot) { await crop(page, `${key}-determinate.png`); shot = true; samples.push({ ...(await readBar(page)), afterShot: true }); }
      if (!s && samples.length > 0) break;
      await page.waitForTimeout(100);
    }
    cell.determinate = { samples, shot };
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const file = await dl;
    cell.wavDownload = file ? file.suggestedFilename() : null;
    await ctx.close();
  }
}
await browser.close();
writeFileSync(path.join(OUT, 'progress-hold.json'), JSON.stringify(result, null, 1));
console.log('done', OUT);
