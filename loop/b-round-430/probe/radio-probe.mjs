// B round 430 -> 431: Export dialog radio probe (SABA-B-12 stage 2a).
// usage: BASE=http://127.0.0.1:5173 OUT=<abs dir> node radio-probe.mjs
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE = process.env.BASE ?? 'http://127.0.0.1:5173';
const OUT = process.env.OUT;
mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [[1440, 900], [1280, 720]];
const IDS = ['wav', 'mp3', 'both', 'video', 'project', 'range'];
const sel = {
  wav: '[data-testid="arrangement-export-format-wav"]',
  mp3: '[data-testid="arrangement-export-format-mp3"]',
  both: '[data-testid="arrangement-export-format-both"]',
  video: 'input[name="arrangement-export-format"][disabled]',
  project: '[data-testid="arrangement-export-scope-project"]',
  range: '[data-testid="arrangement-export-scope-range"]',
};
const result = { base: BASE, started: new Date().toISOString(), cells: {} };
const browser = await chromium.launch();
for (const [W, H] of VIEWPORTS) {
  const key = `${W}x${H}`;
  const cell = { pageErrors: [], radios: {} };
  result.cells[key] = cell;
  const ctx = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => cell.pageErrors.push(String(e).slice(0, 300)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  await page.waitForTimeout(800);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  await page.evaluate(() => document.activeElement?.blur());
  await page.getByRole('button', { name: 'Export', exact: true }).first().click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  await page.waitForTimeout(400);
  const measure = async (id) => page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const lb = el.closest('label');
    const r = el.getBoundingClientRect();
    const lr = lb?.getBoundingClientRect();
    return {
      appearance: cs.appearance, w: r.width, h: r.height, x: r.x, y: r.y,
      margin: cs.margin, bg: cs.backgroundColor, border: cs.borderTopColor, borderW: cs.borderTopWidth,
      outline: cs.outlineStyle + ' ' + cs.outlineWidth, checked: el.checked, disabled: el.disabled,
      label: lr ? { x: lr.x, y: lr.y, w: lr.width, h: lr.height } : null,
      labelBg: lb ? getComputedStyle(lb).backgroundColor : null,
    };
  }, sel[id]);
  const crop = async (id, state) => {
    const box = await page.locator(sel[id]).boundingBox();
    if (!box) return;
    await page.screenshot({ path: path.join(OUT, `${key}-${id}-${state}.png`), clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: box.width + 16, height: box.height + 16 } });
  };
  for (const id of IDS) {
    cell.radios[id] = { rest: await measure(id) };
    await page.mouse.move(1, 1);
    await crop(id, 'rest');
    const loc = page.locator(sel[id]);
    await loc.hover({ force: true });
    await page.waitForTimeout(400);
    cell.radios[id].hover = await measure(id);
    await crop(id, 'hover');
    await page.mouse.move(1, 1);
  }
  // keyboard focus: focus the checked wav radio via Tab path from previous element, then ArrowDown
  await page.locator(sel.wav).click();
  await page.waitForTimeout(100);
  cell.mousePress = { wav: await measure('wav'), focusSource: await page.evaluate(() => document.documentElement.dataset.focusSource ?? null), matchesFocusVisible: await page.evaluate((s) => document.querySelector(s).matches(':focus-visible'), sel.wav) };
  await crop('wav', 'mouse-pressed');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  cell.arrowDown = { mp3Checked: await page.evaluate((s) => document.querySelector(s).checked, sel.mp3), active: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')), focusVisible: await page.evaluate((s) => document.querySelector(s).matches(':focus-visible'), sel.mp3) };
  cell.radios.mp3.keyFocus = await measure('mp3');
  await crop('mp3', 'key-focus');
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  cell.arrowDown2 = { bothChecked: await page.evaluate((s) => document.querySelector(s).checked, sel.both), active: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) };
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(150);
  cell.arrowDown3 = { wavChecked: await page.evaluate((s) => document.querySelector(s).checked, sel.wav), active: await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) };
  cell.radios.both.checkedRest = await measure('both');
  await page.mouse.move(1, 1);
  await crop('both', 'checked');
  await page.locator(sel.wav).click();
  await page.waitForTimeout(100);
  // tab stops inside dialog
  cell.tabStops = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    return [...d.querySelectorAll('button,input,select,textarea,a[href],[tabindex]')].filter((e) => !e.disabled && e.tabIndex >= 0).map((e) => e.getAttribute('data-testid') ?? e.getAttribute('aria-label') ?? e.textContent?.trim().slice(0, 30) ?? e.tagName);
  });
  await page.screenshot({ path: path.join(OUT, `${key}-dialog.png`) });
  await ctx.close();
}
await browser.close();
writeFileSync(path.join(OUT, 'radio-probe.json'), JSON.stringify(result, null, 1));
console.log('done', OUT);
