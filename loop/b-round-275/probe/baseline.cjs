const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const out = {};
(async () => {
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto('http://127.0.0.1:5173/studio-lab');
    await page.getByText('Demo collection ready').first().waitFor({ timeout: 150000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const r = {};
    r.buttons = await page.$$eval('[data-testid="arrangement-transport"] button', (bs) => bs.map((b) => ({
      text: (b.textContent || '').trim().slice(0, 20), title: b.getAttribute('title'), disabled: b.disabled,
      ariaDisabled: b.getAttribute('aria-disabled'), testid: b.dataset.testid || null })));
    // Tab stops inside the transport
    await page.locator('body').click({ position: { x: 5, y: 5 } }).catch(() => {});
    const stops = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const s = await page.evaluate(() => { const a = document.activeElement; const t = a && a.closest('[data-testid="arrangement-transport"]'); return t ? ((a.getAttribute('aria-label') || a.textContent || a.getAttribute('title') || a.tagName).trim().slice(0, 30)) : null; });
      if (s) stops.push(s);
    }
    r.transportTabStops = stops;
    // Space on focused Fit button
    const fit = page.locator('[data-testid="arrangement-transport"] button', { hasText: 'Fit' }).first();
    const fitCount = await fit.count();
    r.fitFound = fitCount;
    if (fitCount) {
      await fit.focus();
      const before = await page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
      await page.keyboard.press('Space');
      await page.waitForTimeout(600);
      const after = await page.evaluate(() => document.querySelector('[data-playing]')?.getAttribute('data-playing'));
      r.spaceOnFit = { before, after, focusedAfter: await page.evaluate(() => (document.activeElement?.textContent || '').trim().slice(0, 20)) };
      await page.keyboard.press('Space');
      await page.waitForTimeout(400);
    }
    r.status = await page.evaluate(() => document.querySelector('[role="status"]')?.textContent?.trim().slice(0, 160));
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/b-round-275/probe/head-${w}.png` });
    out[`${w}x${h}`] = r;
    await page.close();
  }
  await browser.close();
  require('fs').writeFileSync('/home/runner/czaba-project/tmp/studio-real-loop/b-round-275/probe/baseline.json', JSON.stringify(out, null, 1));
  console.log(JSON.stringify(out, null, 1).slice(0, 5000));
})();
