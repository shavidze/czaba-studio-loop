// B round 436 -> 437 (COPY-PD-VIS stage 2: STUDIO-VIS-7, STUDIO-VIS-10, SABA-LANE-RESIZE-HANDLE). Real Chromium.
// usage: node vis-probe.mjs <base> <absolute outdir>
// Measures computed paint (not class tokens) at rest / hover / pressed / keyboard focus / drag, element boxes,
// pixel rows across the lane border and the Detail top edge, and WCAG contrast of the Export label on its fill.
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3];
if (!out) throw new Error('outdir required');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const res = { base, chromium: browser.version() };

function parseRgb(s) {
  const c = s.match(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/);
  if (c) return { r: +c[1] * 255, g: +c[2] * 255, b: +c[3] * 255, a: c[4] === undefined ? 1 : +c[4] };
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}
function lum({ r, g, b }) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function blend(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return +((x + 0.05) / (y + 0.05)).toFixed(2);
}
const style = (loc, pseudo) => loc.evaluate((el, ps) => {
  const c = getComputedStyle(el, ps ?? null);
  const b = el.getBoundingClientRect();
  return {
    bg: c.backgroundColor, color: c.color, opacity: c.opacity, cursor: c.cursor, borderColor: c.borderTopColor,
    borderWidth: c.borderTopWidth, outline: `${c.outlineStyle} ${c.outlineWidth} ${c.outlineColor}`,
    outlineOffset: c.outlineOffset, height: c.height, top: c.top, bottom: c.bottom, content: c.content,
    box: { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2) },
    ariaBusy: el.getAttribute('aria-busy'), disabled: el.disabled ?? null, text: el.textContent?.trim().slice(0, 40),
  };
}, pseudo);

async function rows(page, x, y0, y1, name) {
  const vp = page.viewportSize();
  if (x < 0 || x >= vp.width || y0 < 0 || y1 > vp.height || y1 <= y0) return { error: 'outside viewport', x, y0, y1 };
  const buf = await page.screenshot({ clip: { x, y: y0, width: 1, height: y1 - y0 } });
  fs.writeFileSync(`${out}/${name}.png`, buf);
  return { file: `${name}.png`, y0, y1 };
}

for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const r = {};
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto(base + '/studio-lab', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => { r.readyTimeout = true; });
  await page.mouse.move(5, h - 5);

  // STUDIO-VIS-10 exit link: word and arrow, rest and hover.
  const exit = page.getByTestId('arrangement-exit');
  const arrow = exit.locator('svg');
  r.exitRest = { link: await style(exit), arrow: await style(arrow) };
  const eb = await exit.boundingBox();
  await page.mouse.move(eb.x + eb.width / 2, eb.y + eb.height / 2);
  await page.waitForTimeout(250);
  r.exitHover = { link: await style(exit), arrow: await style(arrow) };
  await page.mouse.move(5, h - 5);
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${out}/exit-${key}.png`, clip: { x: eb.x - 6, y: eb.y - 6, width: eb.width + 12, height: eb.height + 12 } });

  // Empty project: Export dialog primary button is disabled.
  await page.getByRole('button', { name: /^Export/ }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 10000 });
  await page.waitForTimeout(400);
  const primary = () => page.getByRole('dialog').locator('div.justify-end > button').last();
  r.exportDisabledEmpty = await style(primary());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // Add a clip so Export is enabled.
  await page.getByTestId('arrangement-library-list').getByRole('option').first().click();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-clip-id]', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.mouse.move(5, h - 5);

  // Lane height handle (music lane = first unfolded lane with a clip).
  const handle = page.locator('[data-testid="arrangement-track-height"]').first();
  r.laneHandleRest = { el: await style(handle), after: await style(handle, '::after') };
  const hb = await handle.boundingBox();
  const lx = Math.round(hb.x + 240);
  r.laneHandleBox = hb;
  r.laneRowsRest = await rows(page, lx, Math.floor(hb.y) - 2, Math.ceil(hb.y + hb.height) + 3, `lane-rows-rest-${key}`);
  await page.mouse.move(lx, hb.y + hb.height / 2);
  await page.waitForTimeout(250);
  r.laneHandleHover = { el: await style(handle), after: await style(handle, '::after') };
  r.laneRowsHover = await rows(page, lx + 120, Math.floor(hb.y) - 2, Math.ceil(hb.y + hb.height) + 3, `lane-rows-hover-${key}`);
  await page.mouse.down();
  await page.mouse.move(lx, hb.y + hb.height / 2 + 12, { steps: 3 });
  await page.waitForTimeout(250);
  const hb2 = await handle.boundingBox();
  r.laneHandleDrag = { el: await style(handle), after: await style(handle, '::after'), box: hb2 };
  await page.mouse.move(lx + 300, hb.y + hb.height / 2 + 60, { steps: 2 });
  await page.waitForTimeout(150);
  r.laneHandleDragPointerAway = { after: await style(handle, '::after') };
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.mouse.move(5, h - 5);
  await page.waitForTimeout(250);
  r.laneHandleReleased = { el: await style(handle), after: await style(handle, '::after') };
  r.laneHandleAfterUndo = null;
  await handle.focus();
  await page.evaluate(() => { document.documentElement.dataset.focusSource = 'keyboard'; });
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  r.laneHandleFocus = { focused: await handle.evaluate((el) => el === document.activeElement), el: await style(handle) };

  // Detail separator (top edge of Clip details).
  const sep = page.getByTestId('arrangement-detail-separator');
  await page.mouse.move(5, h - 5);
  await page.waitForTimeout(250);
  r.detailSepRest = { el: await style(sep), after: await style(sep, '::after') };
  const sb = await sep.boundingBox();
  const sx = Math.round(sb.x + sb.width / 2);
  r.detailRowsRest = await rows(page, sx, Math.floor(sb.y) - 3, Math.ceil(sb.y + sb.height) + 2, `detail-rows-rest-${key}`);
  await page.mouse.move(sx, sb.y + sb.height / 2);
  await page.waitForTimeout(250);
  r.detailSepHover = { el: await style(sep), after: await style(sep, '::after') };
  r.detailRowsHover = await rows(page, sx + 150, Math.floor(sb.y) - 3, Math.ceil(sb.y + sb.height) + 2, `detail-rows-hover-${key}`);
  await page.mouse.move(5, h - 5);
  await page.waitForTimeout(250);

  // Export dialog with a clip: rest, hover, pressed, keyboard focus, busy.
  await page.getByRole('button', { name: /^Export/ }).first().click();
  await page.getByRole('dialog').waitFor({ timeout: 10000 });
  await page.waitForTimeout(500);
  r.exportEnabledWaitMs = await page.evaluate(async () => {
    const t0 = performance.now();
    for (;;) {
      const b = [...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1);
      if (b && !b.disabled) return Math.round(performance.now() - t0);
      if (performance.now() - t0 > 60000) return -1;
      await new Promise((ok) => setTimeout(ok, 100));
    }
  });
  await page.waitForTimeout(300);
  const dialogBg = await primary().evaluate((el) => getComputedStyle(el.closest('.rounded-xl')).backgroundColor);
  r.dialogSurface = dialogBg;
  r.exportRest = await style(primary());
  const pb = await primary().boundingBox();
  await page.screenshot({ path: `${out}/export-rest-${key}.png`, clip: { x: pb.x - 8, y: pb.y - 8, width: pb.width + 16, height: pb.height + 16 } });
  await page.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2);
  await page.waitForTimeout(400);
  r.exportHover = await style(primary());
  await page.screenshot({ path: `${out}/export-hover-${key}.png`, clip: { x: pb.x - 8, y: pb.y - 8, width: pb.width + 16, height: pb.height + 16 } });
  // Pressed: mouse down, read, then move away before release so no export starts.
  await page.mouse.down();
  await page.waitForTimeout(400);
  r.exportPressed = await style(primary());
  await page.screenshot({ path: `${out}/export-pressed-${key}.png`, clip: { x: pb.x - 8, y: pb.y - 8, width: pb.width + 16, height: pb.height + 16 } });
  const db = await primary().evaluate((el) => { const b = el.closest('.rounded-xl').getBoundingClientRect(); return { x: b.x, y: b.y }; });
  await page.mouse.move(db.x + 24, db.y + 24);
  await page.mouse.up();
  await page.waitForTimeout(300);
  r.exportNoStartAfterDragAway = (await primary().getAttribute('aria-busy')) ?? null;
  // Keyboard focus: Shift+Tab from the Close/Done button (the button just before Export).
  await primary().focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  r.exportFocus = { focused: await primary().evaluate((el) => el === document.activeElement), ...(await style(primary())) };
  await page.screenshot({ path: `${out}/export-focus-${key}.png`, clip: { x: pb.x - 8, y: pb.y - 8, width: pb.width + 16, height: pb.height + 16 } });
  // Busy: start a WAV render and sample the button in the next frames.
  await page.mouse.move(db.x + 24, db.y + 24);
  const busySamples = await page.evaluate(async () => {
    const pick = () => [...document.querySelectorAll('[role="dialog"] div.justify-end > button')].at(-1);
    const btn = pick();
    btn.click();
    const s = [];
    for (let i = 0; i < 40; i += 1) {
      await new Promise((ok) => requestAnimationFrame(ok));
      const b = pick();
      if (!b) break;
      const c = getComputedStyle(b);
      s.push({ i, busy: b.getAttribute('aria-busy'), text: b.textContent.trim(), disabled: b.disabled, opacity: c.opacity, cursor: c.cursor, bg: c.backgroundColor, color: c.color });
      if (b.disabled && s.filter((x) => x.disabled).length >= 2) break;
    }
    return s;
  });
  r.exportBusySamples = busySamples;
  await page.waitForTimeout(3000);
  r.exportAfterRender = await style(primary());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Contrast: Export label on its fill (rest) and the focus ring against the dialog surface and the fill.
  const surf = parseRgb(dialogBg ?? 'rgb(0,0,0)');
  const fill = parseRgb(r.exportRest.bg);
  const label = parseRgb(r.exportRest.color);
  const ringColor = parseRgb(r.exportFocus.outline.replace(/^\S+ \S+ /, ''));
  r.contrast = {
    labelOnFill: fill && label ? ratio(blend(label, blend(fill, surf)), blend(fill, surf)) : null,
    ringOnSurface: ringColor && surf ? ratio(blend(ringColor, surf), surf) : null,
    fillOnSurface: fill && surf ? ratio(blend(fill, surf), surf) : null,
    ringOnFill: ringColor && fill ? ratio(blend(ringColor, blend(fill, surf)), blend(fill, surf)) : null,
  };
  res[key] = r;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/vis-probe.json`, JSON.stringify(res, null, 1));
console.log('wrote', `${out}/vis-probe.json`);
