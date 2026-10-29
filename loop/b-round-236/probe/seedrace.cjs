const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const mode of ['fast', 'afterReady']) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
      const statuses = [];
      await page.waitForSelector('[data-testid="arrangement-status"]', { timeout: 60000 });
      await page.evaluate(() => {
        window.__st = [];
        const el = document.querySelector('[data-testid="arrangement-status"]');
        const rec = () => window.__st.push([Math.round(performance.now()), el.textContent]);
        rec(); new MutationObserver(rec).observe(el, { childList: true, subtree: true, characterData: true });
      });
      if (mode === 'afterReady') await page.waitForFunction(() => /ready/.test(document.querySelector('[data-testid="arrangement-status"]').textContent), null, { timeout: 60000 });
      await page.click('[data-source-id="demo-stem-pulse"]', { timeout: 60000 });
      await page.waitForTimeout(50);
      await page.click('[data-source-id="demo-stem-pulse"]', { timeout: 60000 });
      const add = page.locator('button:enabled', { hasText: /^Add/ }).first();
      await add.waitFor({ timeout: 60000 });
      out[`${w}x${h}.${mode}.addText`] = await add.innerText();
      await add.click({ timeout: 60000 });
      await page.waitForTimeout(4000);
      out[`${w}x${h}.${mode}`] = { final: await page.locator('[data-testid="arrangement-status"]').innerText(), history: await page.evaluate(() => window.__st), bpm: await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm'), errors };
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
