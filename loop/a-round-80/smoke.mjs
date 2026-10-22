import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/a-round-80';
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const noise = [];
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) noise.push(m.text().slice(0, 160)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' });
  await page.waitForTimeout(6000);
  const lane = (n) => page.locator(`button[aria-label^="${n} — აქტიური ხაზის არჩევა"]`);
  const items = page.locator('[data-testid^="arrangement-library-item"], [data-source-id]');
  const itemCount = await items.count();
  for (const [name, idx] of [['სტემები', 0], ['SFX', 1]]) {
    await lane(name).click();
    if (itemCount > idx) { await items.nth(idx).click(); await page.keyboard.press('Enter'); }
  }
  await lane('სტემები').click();
  await lane('SFX').click({ modifiers: ['Shift'] });
  await page.keyboard.press('Control+g');
  const focus1 = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
  const heights = async () => { await page.waitForTimeout(450); return page.locator('[data-track-id]').evaluateAll((els) => els.map((e) => `${e.dataset.trackId}:${Math.round(e.getBoundingClientRect().height)}/${e.style.height}`)); };
  const before = await heights();
  await page.keyboard.press('u');
  const collapsed = await heights();
  const blocks = await page.locator('[data-overview-clip-id]').evaluateAll((els) => els.map((e) => `${e.dataset.overviewStart}-${e.dataset.overviewEnd}`));
  const label = await page.getByTestId('arrangement-group-name').getAttribute('aria-label');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/smoke-collapsed-${w}.png` });
  await page.keyboard.press('u');
  await page.waitForTimeout(400);
  const expanded = await heights();
  console.log(JSON.stringify({ w, h, itemCount, focus1, before, collapsed, blocks, label, expanded, noise: noise.filter((t) => !/cart|ERR_CONNECTION_REFUSED|ERR_TUNNEL|Failed to load resource/i.test(t)) }));
  await page.close();
}
await browser.close();
