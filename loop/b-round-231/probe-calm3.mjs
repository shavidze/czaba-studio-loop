import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5174';
const out = process.argv[3] || '.';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
async function open(ctx) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.waitForFunction(() => {
    const add = [...document.querySelectorAll('button')].find((b) => /^Add/.test(b.textContent.trim()));
    return add && !add.disabled;
  }, undefined, { timeout: 90000 });
  await page.waitForTimeout(800);
  return { page, errors };
}
const m = (page) => page.evaluate(() => {
  const t = (id) => document.querySelector(`[data-testid="${id}"]`);
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.x.toFixed(1), +r.y.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  const ov = t('arrangement-overview');
  const cs = (el) => el ? getComputedStyle(el) : null;
  const cap = (ov ?? t('arrangement-overview-hidden-slot'))?.parentElement?.firstElementChild;
  return {
    clips: document.querySelectorAll('[data-clip-id]').length,
    state: ov?.getAttribute('data-overview-state') ?? null,
    ov: box(ov), ovBg: cs(ov)?.backgroundColor, overlay: ov ? cs(ov.firstElementChild)?.borderTopWidth + ' ' + cs(ov.firstElementChild)?.borderTopColor : null,
    baseline: box(t('arrangement-overview-baseline')), baselineBg: cs(t('arrangement-overview-baseline'))?.backgroundColor,
    frameVis: cs(t('arrangement-overview-frame'))?.visibility ?? null, playheadVis: cs(t('arrangement-overview-playhead'))?.visibility ?? null,
    slot: box(t('arrangement-overview-hidden-slot')), dock: box(t('arrangement-video-dock')), dockBg: cs(t('arrangement-video-dock'))?.backgroundColor,
    cap: box(cap), sc: t('arrangement-timeline-scroller')?.clientHeight,
    aria: ov ? [ov.getAttribute('role'), ov.tabIndex, ov.getAttribute('aria-valuenow'), ov.getAttribute('aria-valuemax'), ov.getAttribute('aria-label')] : null,
    active: document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.tagName,
    status: t('arrangement-status')?.textContent,
    key: localStorage.getItem('czaba-studio-overview-hidden'),
  };
});
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const { page, errors } = await open(ctx);
  r.S0 = await m(page);
  await page.locator('[data-testid="arrangement-overview"]').screenshot({ path: `${out}/ov-empty-${vp}.png` });
  await page.screenshot({ path: `${out}/S0-${vp}.png` });
  // overview interactions in empty project: ArrowRight, double-click
  await page.locator('[data-testid="arrangement-overview"]').focus();
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200);
  r.emptyArrow = await m(page);
  // toggle with overview focused
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(300);
  r.hiddenFromFocus = await m(page);
  await page.keyboard.press('Tab'); await page.waitForTimeout(150);
  r.tabAfterHide = await page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName);
  await page.screenshot({ path: `${out}/hidden-${vp}.png` });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  r.afterReload = await m(page);
  await page.mouse.click(5, 5);
  await page.keyboard.press('Control+Alt+KeyO'); await page.waitForTimeout(300);
  r.shownAgain = await m(page);
  await page.mouse.click(5, 5);
  await page.keyboard.press('Enter'); await page.waitForTimeout(800);
  r.S1 = await m(page);
  await page.locator('[data-testid="arrangement-overview"]').screenshot({ path: `${out}/ov-clip-${vp}.png` });
  await page.keyboard.press('Control+KeyZ'); await page.waitForTimeout(500);
  r.undo = await m(page);
  await page.mouse.click(5, 5);
  await page.keyboard.press('Shift+Slash'); await page.waitForTimeout(400);
  await page.keyboard.type('overview'); await page.waitForTimeout(300);
  r.sheet = await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] [data-shortcut-id]')].map((e) => e.getAttribute('data-shortcut-id') + ':' + e.textContent));
  r.errors = errors; res[vp] = r; await ctx.close();
}
writeFileSync(`${out}/scratch.json`, JSON.stringify(res, null, 1));
await browser.close(); console.log('ok');
