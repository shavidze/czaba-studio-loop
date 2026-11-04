import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const [, , base, out] = process.argv;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(`${base}/studio-lab`, { waitUntil: 'load', timeout: 120000 });
await page.getByRole('button', { name: 'Add', exact: true }).first().waitFor({ timeout: 120000 }); await page.waitForTimeout(3000);
await page.getByRole('button', { name: 'Add', exact: true }).first().click();
const clips = page.locator('[data-clip-kind="audio"]');
await clips.first().waitFor();
const head = clips.first().getByTitle(/./).first();
const box = await clips.first().boundingBox();
await page.mouse.click(box.x + 30, box.y + 8);
await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur());
for (let i = 1; i < 30; i++) { await page.keyboard.press('Control+d'); }
await page.waitForTimeout(800);
const info = async (label) => {
  const rows = await clips.evaluateAll((els) => els.map((e) => { const b = e.getBoundingClientRect(); return [e.getAttribute('data-clip-start'), Math.round(b.left), Math.round(b.width)]; }).filter((r) => r[1] + r[2] > 0 && r[1] < window.innerWidth));
  console.log(label, clips && rows.length, JSON.stringify(rows.slice(0, 8)));
};
await info('after30');
for (let i = 0; i < 14; i++) { await page.keyboard.press('-'); await page.waitForTimeout(300); await info(`minus${i + 1}`); }
await page.screenshot({ path: out });
await browser.close();
