const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    await page.click('[data-source-id="demo-stem-pulse"]');
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForSelector('[data-testid="arrangement-bars-scrub-strip"]');
    await page.evaluate(() => {
      window.__ev = [];
      const root = document.querySelector('[data-testid="arrangement-bars-ruler"]');
      for (const type of ['pointerdown', 'pointerup', 'click', 'dblclick']) {
        root.addEventListener(type, (e) => window.__ev.push(`${type}:${e.target.dataset?.testid ?? e.target.tagName}`), true);
      }
    });
    const bars = await page.locator('[data-testid="arrangement-bars-ruler"]').boundingBox();
    const status = () => page.locator('[role="status"]').first().innerText().catch(() => '');
    await page.mouse.dblclick(bars.x + 3 * 40, bars.y + 4);
    await page.waitForTimeout(400);
    const playLabel = await page.locator('button[aria-label="Pause"], button[aria-label="Play"]').first().getAttribute('aria-label');
    out[`${w}x${h}`] = { events: await page.evaluate(() => window.__ev), playLabel, status: await status(), errors };
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
