const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'networkidle' });
    const input = page.getByTestId('arrangement-tempo-input');
    await input.fill('120'); await input.press('Enter'); await page.waitForTimeout(300);
    const select = page.getByTestId('arrangement-grid-division');
    const values = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
    const rows = {};
    for (const v of values) {
      await select.selectOption(v);
      rows[v] = await page.evaluate(() => {
        const c = document.querySelector('[data-testid="arrangement-grid-control"]');
        const b = document.querySelector('[data-testid="arrangement-envelope-toggle"]');
        const s = document.querySelector('[data-testid="arrangement-grid-division"]');
        const cr = c.getBoundingClientRect(); const br = b.getBoundingClientRect(); const sr = s.getBoundingClientRect();
        return { scroll: c.scrollWidth, client: c.clientWidth, btnRightGap: +(cr.right - br.right).toFixed(1), btnWidth: +br.width.toFixed(1), selectWidth: +sr.width.toFixed(1) };
      });
    }
    await page.keyboard.press('3'); await page.waitForTimeout(200);
    const tripletValues = await select.locator('option').evaluateAll((os) => os.map((o) => o.value));
    for (const v of tripletValues.filter((x) => !(x in rows))) {
      await select.selectOption(v);
      rows[v] = await page.evaluate(() => { const c = document.querySelector('[data-testid="arrangement-grid-control"]'); const b = document.querySelector('[data-testid="arrangement-envelope-toggle"]'); return { scroll: c.scrollWidth, client: c.clientWidth, btnRightGap: +(c.getBoundingClientRect().right - b.getBoundingClientRect().right).toFixed(1) }; });
    }
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/a-round-83/pw/a-r83-grid-${w}.png`, clip: { x: 0, y: 150, width: 700, height: 120 } });
    out.push({ viewport: `${w}x${h}`, rows });
    await context.close();
  }
  console.log(JSON.stringify(out));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
