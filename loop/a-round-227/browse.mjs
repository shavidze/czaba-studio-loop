import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch();
const results = {};
for (const [w, h] of [[1280, 720], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Keyboard shortcuts (?)' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const rows = {};
  for (const id of ['fit', 'waveform-zoom']) {
    const li = dialog.locator(`[data-shortcut-id="${id}"]`);
    rows[id] = await li.evaluate((el) => ({
      chips: [...el.querySelectorAll('kbd')].map((k) => ({ text: k.textContent, h: k.getBoundingClientRect().height, sw: k.scrollWidth, cw: k.clientWidth })),
      liSW: el.scrollWidth, liCW: el.clientWidth,
    }));
    await li.screenshot({ path: `${out}/row-${id}-${w}.png` });
  }
  const sheetOverflow = await dialog.evaluate((d) => [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').length);
  results[`${w}x${h}`] = { rows, sheetOverflowEls: sheetOverflow, pageErrors: errors };
  await ctx.storageState({ path: '/home/runner/czaba-project/tmp/studio-real-loop/a-browse.json' });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
