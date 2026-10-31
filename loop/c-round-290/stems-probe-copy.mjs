import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const res = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 });
  await page.waitForTimeout(1000);
  const r = {};
  r.activeBefore = (await page.getByText(/Active track:/).first().textContent()).replace(/\s+/g, ' ');
  await page.getByRole('option', { name: /Bass/ }).first().click(); await page.waitForTimeout(200);
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  r.noSelectStatus = (await page.getByTestId('arrangement-status').textContent()).trim();
  const hdr = page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first();
  await hdr.getByText('Stems', { exact: true }).first().click(); await page.waitForTimeout(300);
  r.activeAfterNameClick = (await page.getByText(/Active track:/).first().textContent()).replace(/\s+/g, ' ');
  await page.getByRole('option', { name: /Pad/ }).first().click(); await page.waitForTimeout(200);
  await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  r.afterSelectStatus = (await page.getByTestId('arrangement-status').textContent()).trim();
  res[`${w}x${h}`] = r;
  await page.screenshot({ path: `${out}/stems-probe-${w}x${h}.png` });
}
await browser.close();
writeFileSync(`${out}/stems-probe.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
