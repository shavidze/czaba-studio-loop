import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const browser = await chromium.launch();
const res = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await (await browser.newContext({ viewport: { width: w, height: h } })).newPage();
  await page.goto('http://127.0.0.1:5173/studio-lab?preview=middle-east', { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  await page.getByText('Demo collection ready', { exact: false }).first().waitFor({ timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(1200);
  const hdr = page.getByTestId('arrangement-track-header').filter({ hasText: 'Stems' }).first();
  for (const name of ['Pulse', 'Bass', 'Pad', 'Melody']) {
    await hdr.getByText(/^Stems/).first().click(); await page.waitForTimeout(250);
    await page.getByRole('button', { name: 'All' }).first().click().catch(() => {}); await page.waitForTimeout(200);
    await page.getByTestId('arrangement-library-list').getByRole('option', { name: new RegExp(name) }).first().click(); await page.waitForTimeout(250);
    await page.keyboard.press('Enter'); await page.waitForTimeout(900);
  }
  const names = () => page.locator('[data-clip-id]').evaluateAll((cs) => cs.map((c) => c.textContent.trim().slice(0, 30)));
  const sc = page.getByTestId('arrangement-timeline-scroller');
  const r = { viewportPx: await sc.evaluate((e) => e.clientWidth), before: await names() };
  await sc.evaluate((e) => { e.scrollLeft = e.scrollWidth; }); await page.waitForTimeout(800);
  r.scrollLeft = await sc.evaluate((e) => e.scrollLeft); r.afterScrollEnd = await names();
  await sc.evaluate((e) => { e.scrollLeft = 0; }); await page.waitForTimeout(800);
  r.afterScrollBack = await names();
  res[`${w}x${h}`] = r;
  await page.screenshot({ path: `${out}/melody-probe-${w}x${h}.png` });
  await page.context().close();
}
writeFileSync(`${out}/melody-probe.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
await browser.close();
