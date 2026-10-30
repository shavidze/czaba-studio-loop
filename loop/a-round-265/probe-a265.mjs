import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const OUT = process.argv[2] ?? '/tmp/probe-11c.json';
const browser = await chromium.launch();
const res = {};
const read = (page) => page.evaluate(() => {
  const r = document.querySelector('[data-range-start]');
  const laneRanges = [...document.querySelectorAll('[data-testid="arrangement-lane-range"]')].map((e) => ({ row: e.closest('[data-track-id]')?.getAttribute('data-track-id'), s: e.getAttribute('data-range-start'), e: e.getAttribute('data-range-end'), hidden: e.getAttribute('aria-hidden'), text: e.textContent }));
  const im = document.querySelector('[data-testid="arrangement-insert-marker"]');
  const clips = [...document.querySelectorAll('[data-clip-id]')].map((c) => ({ start: c.getAttribute('data-clip-start'), w: Math.round(c.getBoundingClientRect().width) }));
  const clipRangeLabels = [...document.querySelectorAll('[data-clip-id] span.font-mono')].map((s) => s.textContent);
  const a = document.activeElement;
  return {
    clips,
    laneRanges,
    insertMarker: im ? [im.getAttribute('data-insert-marker'), im.hidden] : null,
    laneRange: r ? [r.getAttribute('data-range-start'), r.getAttribute('data-range-end')] : null,
    clipRangeLabels,
    marquee: !!document.querySelector('[data-testid="arrangement-marquee"]'),
    selection: (document.querySelector('[data-testid="arrangement-selection-count"]')?.textContent ?? '').trim(),
    oneClipSelected: !!document.querySelector('[data-testid="arrangement-detail-clip-gain"]'),
    rangeReadout: (document.querySelector('[data-testid="arrangement-range"]')?.textContent ?? '').trim(),
    status: (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').trim(),
    active: !a || a === document.body ? 'BODY' : `${a.tagName}|${a.getAttribute('aria-label') ?? ''}`,
  };
});
async function open(w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle', timeout: 120000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 90000 });
  await page.waitForTimeout(1000);
  const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
  const lb = await lane.boundingBox();
  await page.mouse.click(lb.x + 400, lb.y + lb.height * 0.7);
  await page.waitForTimeout(300);
  await page.getByRole('option').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(800);
  return { ctx, page, errors };
}
async function drag2(page, x0, y0, x1, y1) {
  await page.mouse.move(x0, y0); await page.mouse.down();
  await page.mouse.move(x1, y1, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(300);
  return await read(page);
}
async function drag(page, x0, y, x1, mods = []) {
  for (const m of mods) await page.keyboard.down(m);
  await page.mouse.move(x0, y); await page.mouse.down();
  await page.mouse.move((x0 + x1) / 2, y, { steps: 4 });
  const mid = await read(page);
  await page.mouse.move(x1, y, { steps: 4 }); await page.mouse.up();
  for (const m of mods) await page.keyboard.up(m);
  await page.waitForTimeout(300);
  return { mid, after: await read(page) };
}
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const r = (res[vp] = {});
  {
    const { ctx, page, errors } = await open(w, h);
    const clip = await page.locator('[data-clip-id]').first().boundingBox();
    const lane = page.locator('[data-grid-seconds]:not([data-testid])').first();
    const laneBox = await lane.boundingBox();
    r.clipBox = clip; r.laneBox = laneBox; r.start = await read(page);
    const y = clip.y + clip.height * 0.7;
    r.CLIP_PAST_START = await drag(page, clip.x + 100, y, clip.x - 150);
    await page.screenshot({ path: `a-round-265/clip-past-start-${vp}.png` });
    r.IN_CLIP_SAME = await drag(page, clip.x + 100, y, clip.x + 400);
    r.BG_RANGE = await drag(page, laneBox.x + 40, y, laneBox.x + 300);
    await page.screenshot({ path: `a-round-265/bg-range-${vp}.png` });
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.BG_EMPTY_DELETE = await read(page);
    r.BG_INTO_CLIP = await drag(page, laneBox.x + 40, y, clip.x + 200);
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.BG_INTO_CLIP_DELETE = await read(page);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
    r.BG_INTO_CLIP_UNDO = await read(page);
    await page.mouse.click(laneBox.x + 60, y); await page.waitForTimeout(300);
    r.MARQUEE_CTRL = await drag(page, laneBox.x + 40, y, clip.x + 200, ['Control']);
    await page.keyboard.press('Delete'); await page.waitForTimeout(300);
    r.MARQUEE_CTRL_DELETE = await read(page);
    await page.keyboard.press('Control+z'); await page.waitForTimeout(300);
    const lane2 = await page.locator('[data-grid-seconds]:not([data-testid])').nth(1).boundingBox();
    r.VERTICAL = await drag2(page, laneBox.x + 40, y, laneBox.x + 300, lane2.y + lane2.height * 0.7);
    await page.mouse.click(laneBox.x + 120, y); await page.waitForTimeout(300);
    r.CLICK_SAME = await read(page);
    r.errors = errors; await ctx.close();
  }
}
writeFileSync(OUT, JSON.stringify(res, null, 1));
await browser.close();
console.log('ok');
