const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/cart|ERR_CONNECTION|ERR_TUNNEL|Failed to load resource/.test(m.text())) console.log('ERR', m.text().slice(0, 300)); });
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
  const option = page.locator('[role="option"][data-source-id]').first();
  await option.waitFor(); await page.waitForTimeout(2500); await option.dblclick();
  const clip = page.locator('[data-clip-kind="audio"]').first();
  await clip.waitFor({ timeout: 15000 }); await page.waitForTimeout(1000);
  await page.keyboard.press('a');
  const editor = clip.locator('[data-testid="arrangement-clip-envelope-editor"]');
  await editor.waitFor();
  const eb = await editor.boundingBox();
  console.log('clip', await clip.boundingBox(), 'editor', eb, 'status', await page.getByTestId('arrangement-status').textContent());
  await page.evaluate(() => { for (const t of ['pointerdown','click','dblclick']) document.addEventListener(t, (e) => console.log('EV', t, e.target.getAttribute('data-testid') || e.target.tagName, e.detail), true); });
  page.on('console', (m) => { if (m.text().startsWith('EV')) console.log(m.text()); });
  for (const fx of [0.25, 0.5, 0.75]) {
    const x = eb.x + eb.width * fx, y = eb.y + eb.height * 0.6;
    console.log('top', await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.getAttribute('data-testid'), [x, y]));
    await page.mouse.dblclick(x, y);
    await page.waitForTimeout(200);
    console.log('after', fx, await clip.getAttribute('data-envelope'), '|', await page.getByTestId('arrangement-status').textContent());
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
