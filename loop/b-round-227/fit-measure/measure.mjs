import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = process.argv[2];
const browser = await chromium.launch();
const results = {};
for (const [w, h] of [[1280, 720], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  const btn = page.getByRole('button', { name: 'Keyboard shortcuts (?)' });
  await btn.waitFor({ timeout: 60000 });
  await btn.click();
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  const li = dialog.locator('[data-shortcut-id="fit"]');
  const measure = () => li.evaluate((el) => ({
    chips: [...el.querySelectorAll('kbd')].map((k) => ({ text: k.textContent, w: k.getBoundingClientRect().width, h: k.getBoundingClientRect().height, sw: k.scrollWidth, cw: k.clientWidth })),
    li: { w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height, sw: el.scrollWidth, cw: el.clientWidth },
    dialogXOverflow: (() => { const d = el.closest('[role=dialog]'); return [...d.querySelectorAll('*')].filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible').length; })(),
  }));
  const before = await measure();
  await li.evaluate((el) => { const k = [...el.querySelectorAll('kbd')].find((x) => x.textContent === 'Double-click the ruler (no selection)'); if (k) k.textContent = 'Double-click the ruler (no time selection)'; });
  const after = await measure();
  await li.screenshot({ path: `${out}/fit-after-text-${w}.png` });
  results[`${w}x${h}`] = { before, after };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
