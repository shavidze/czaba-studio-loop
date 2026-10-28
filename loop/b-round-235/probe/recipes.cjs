const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
(async () => {
  const out = {};
  const browser = await chromium.launch();
  const fresh = async (w, h) => {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    page.__errors = [];
    page.on('pageerror', (e) => page.__errors.push(String(e)));
    await page.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => /^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''), null, { timeout: 90000 });
    await page.click('[data-source-id="demo-stem-pulse"]');
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForSelector('[data-testid="arrangement-bars-scrub-strip"]');
    return page;
  };
  const read = async (page) => ({
    label: await page.locator('button[aria-label="Pause"], button[aria-label="Play"]').first().getAttribute('aria-label'),
    pos: await page.locator('[data-testid="arrangement-playhead-handle"]').getAttribute('aria-valuenow'),
    status: await page.locator('[data-testid="arrangement-status"]').innerText(),
    scrollLeft: await page.evaluate(() => document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft),
  });
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const k = `${w}x${h}`;
    out[k] = {};
    let page = await fresh(w, h);
    let bars = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    await page.mouse.dblclick(bars.x + 3 * 40, bars.y + 4);
    await page.waitForTimeout(300);
    out[k].stripDbl = await read(page);
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await page.mouse.dblclick(bars.x + 6 * 40, bars.y + 15);
    await page.waitForTimeout(300);
    out[k].lowerDblStopped = await read(page);
    out[k].errors1 = page.__errors; await page.close();
    page = await fresh(w, h);
    await page.evaluate(() => { document.querySelector('[data-testid="arrangement-timeline-scroller"]').scrollLeft = 300; });
    await page.waitForTimeout(200);
    bars = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    await page.mouse.click(bars.x + 15.95 * 40, bars.y + 4);
    await page.waitForTimeout(500);
    out[k].endClick = await read(page);
    out[k].errors2 = page.__errors; await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
