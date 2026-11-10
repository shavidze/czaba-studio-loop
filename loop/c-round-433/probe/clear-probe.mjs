import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const out = process.argv[3] ?? 'head';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const results = {};
const active = (page) => page.evaluate(() => {
  const a = document.activeElement;
  return a ? (a.getAttribute('aria-label') ?? a.tagName) : null;
});
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const key = `${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForSelector('[data-testid="arrangement-library"]', { timeout: 90000 });
  await page.waitForTimeout(800);
  const open = async () => {
    await page.evaluate(() => { if (document.activeElement instanceof HTMLElement) document.activeElement.blur(); });
    await page.keyboard.press('Shift+Slash');
    await page.getByRole('searchbox', { name: 'Search shortcuts' }).waitFor({ timeout: 10000 });
  };
  await open();
  const search = page.getByRole('searchbox', { name: 'Search shortcuts' });
  const clear = page.getByRole('dialog').getByRole('button', { name: 'Clear search' });
  const rowCount = () => page.locator('[role="dialog"] [data-shortcut-id]').count();
  const r = { errors };
  r.rowsEmpty = await rowCount();
  r.clearWhenEmpty = await clear.count();
  r.inputBoxEmpty = await search.boundingBox();
  await search.pressSequentially('loop');
  r.rowsLoop = await rowCount();
  r.clearWhenTyped = await clear.count();
  await page.waitForTimeout(600);
  const boxes = await page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const i = d.querySelector('input[type="search"]');
    const b = d.querySelector('button[aria-label="Clear search"]');
    const rect = (el) => { const q = el.getBoundingClientRect(); return { x: q.x, y: q.y, width: q.width, height: q.height }; };
    return { input: rect(i), clear: b ? rect(b) : null };
  });
  r.inputBoxTyped = boxes.input;
  r.clearBox = boxes.clear;
  r.inputPadding = await search.evaluate((el) => getComputedStyle(el).paddingRight);
  if (r.clearWhenTyped) {
    r.clearColourRest = await clear.evaluate((el) => getComputedStyle(el).color);
    await clear.hover();
    await page.waitForTimeout(250);
    r.clearColourHover = await clear.evaluate((el) => getComputedStyle(el).color);
  }
  await search.hover();
  const ib = r.inputBoxTyped;
  const tail = await page.screenshot({ clip: { x: ib.x + ib.width - 44, y: ib.y + 2, width: 42, height: ib.height - 4 } });
  r.inputTailPixels = await page.evaluate(async (b64) => {
    const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
    const c = new OffscreenCanvas(img.width, img.height);
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    let blue = 0; let light = 0;
    for (let i = 0; i < d.length; i += 4) {
      const [rr, gg, bb] = [d[i], d[i + 1], d[i + 2]];
      if (bb > 120 && bb - rr > 40 && bb - gg > 15) blue++;
      if (rr > 120 && gg > 110 && bb > 100) light++;
    }
    return { w: img.width, h: img.height, blue, light };
  }, tail.toString('base64'));
  await page.screenshot({ path: `${out}/${key}-typed.png`, clip: { x: ib.x - 8, y: ib.y - 70, width: ib.width + 16, height: ib.height + 80 } });
  // long query: text must stop before the button
  await search.fill('x'.repeat(120));
  await search.press('End');
  r.longQuery = await search.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, paddingRight: getComputedStyle(el).paddingRight }));
  await page.screenshot({ path: `${out}/${key}-long.png`, clip: { x: ib.x - 8, y: ib.y - 6, width: ib.width + 16, height: ib.height + 12 } });
  await search.fill('');
  await search.pressSequentially('loop');
  // real Tab order
  await search.focus();
  await page.keyboard.press('Tab');
  r.tab1 = await active(page);
  await page.keyboard.press('Tab');
  r.tab2 = await active(page);
  await page.keyboard.press('Shift+Tab');
  r.shiftTab = await active(page);
  if (r.shiftTab === 'Clear search') {
    r.focusRing = await page.evaluate(() => { const cs = getComputedStyle(document.activeElement); return { outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset }; });
    await page.screenshot({ path: `${out}/${key}-clear-focus.png`, clip: { x: ib.x - 8, y: ib.y - 6, width: ib.width + 16, height: ib.height + 12 } });
    // held Enter: first press clears; repeats do nothing more
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    r.afterEnter = { value: await search.inputValue(), active: await active(page), dialogOpen: await page.getByRole('dialog').count(), rows: await rowCount(), clear: await clear.count() };
    // Space on Clear
    await search.pressSequentially('zoom');
    await page.keyboard.press('Tab');
    r.spaceTarget = await active(page);
    await page.keyboard.press('Space');
    r.afterSpace = { value: await search.inputValue(), active: await active(page), dialogOpen: await page.getByRole('dialog').count(), playing: await page.locator('[data-playing="true"]').count() };
    // mouse click
    await search.pressSequentially('split');
    await clear.click();
    r.afterClick = { value: await search.inputValue(), active: await active(page), rows: await rowCount(), clear: await clear.count() };
  }
  // Esc with a query closes
  await search.pressSequentially('loop');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  r.afterEsc = { dialogOpen: await page.getByRole('dialog').count() };
  await open();
  r.reopenValue = await page.getByRole('searchbox', { name: 'Search shortcuts' }).inputValue();
  await page.keyboard.press('Escape');
  results[key] = r;
  await ctx.close();
}
await browser.close();
fs.writeFileSync(`${out}/clear.json`, JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
