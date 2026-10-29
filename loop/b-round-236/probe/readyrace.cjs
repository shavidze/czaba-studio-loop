const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
const sel = '[data-testid="arrangement-status"]';
(async () => {
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const mode of ['delay', 'fail', 'idle']) {
      const page = await browser.newPage({ viewport: { width: w, height: h } });
      const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
      if (mode !== 'idle') {
        await page.route('**/middle-east.mp3', async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.continue(); });
      }
      if (mode === 'fail') {
        await page.route('**/hero-music.mp3', async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.fulfill({ status: 404, body: '' }); });
      } else if (mode === 'delay') {
        await page.route('**/hero-music.mp3', async (route) => { await new Promise((r) => setTimeout(r, 4000)); await route.continue(); });
      }
      await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector(sel, { timeout: 60000 });
      await page.evaluate((s) => {
        window.__st = [];
        const el = document.querySelector(s);
        const rec = () => window.__st.push([Math.round(performance.now()), el.textContent]);
        rec(); new MutationObserver(rec).observe(el, { childList: true, subtree: true, characterData: true });
      }, sel);
      if (mode === 'idle') {
        await page.waitForFunction((s) => /ready/.test(document.querySelector(s).textContent), sel, { timeout: 60000 });
      } else {
        const pulse = page.locator('[data-source-id="demo-stem-pulse"]');
        for (let i = 0; i < 40 && (await pulse.getAttribute('aria-selected')) !== 'true'; i += 1) {
          await pulse.click({ timeout: 60000 });
          await page.waitForTimeout(100);
        }
        out[`${w}x${h}.${mode}.pulseSelected`] = await pulse.getAttribute('aria-selected');
        const add = page.locator('button:enabled', { hasText: /^Add/ }).first();
        await add.waitFor({ timeout: 60000 });
        await add.click({ timeout: 60000 });
        out[`${w}x${h}.${mode}.addedAt`] = await page.evaluate(() => Math.round(performance.now()));
      }
      await page.waitForTimeout(7000);
      out[`${w}x${h}.${mode}`] = {
        final: await page.locator(sel).innerText(),
        bpm: await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm'),
        history: await page.evaluate(() => window.__st),
        errors,
      };
      await page.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
