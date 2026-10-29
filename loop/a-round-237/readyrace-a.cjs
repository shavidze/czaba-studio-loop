const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2];
const outDir = process.argv[3];
const delayMs = Number(process.argv[4] || 4000);
const sel = '[data-testid="arrangement-status"]';
const LOADING = 'Loading the demo collection…';
(async () => {
  const out = { base, delayMs };
  const browser = await chromium.launch();
  {
    const warm = await browser.newPage();
    await warm.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await warm.waitForTimeout(20000);
    await warm.close();
  }
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const mode of ['delay', 'fail', 'idle', 'placement']) {
      const context = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      if (mode !== 'idle') {
        await page.route('**/middle-east.mp3', async (route) => {
          await new Promise((r) => setTimeout(r, delayMs));
          await route.continue();
        });
        await page.route('**/hero-music.mp3', async (route) => {
          await new Promise((r) => setTimeout(r, delayMs));
          if (mode === 'fail') {
            await route.fulfill({ status: 404, body: '' });
          } else {
            await route.continue();
          }
        });
      }
      await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector(sel, { timeout: 60000 });
      await page.evaluate((s) => {
        window.__st = [];
        const el = document.querySelector(s);
        const rec = () => window.__st.push([Math.round(performance.now()), el.textContent]);
        rec();
        new MutationObserver(rec).observe(el, { childList: true, subtree: true, characterData: true });
      }, sel);
      const key = `${w}x${h}.${mode}`;
      const row = {};
      if (mode === 'idle') {
        await page.waitForFunction((s) => /ready/.test(document.querySelector(s).textContent), sel, {
          timeout: 60000,
        });
      } else {
        const sourceId = mode === 'placement' ? 'demo-soft-impact' : 'demo-stem-pulse';
        const item = page.locator(`[data-source-id="${sourceId}"]`);
        for (let i = 0; i < 40 && (await item.getAttribute('aria-selected')) !== 'true'; i += 1) {
          await item.click({ timeout: 60000 });
          await page.waitForTimeout(100);
        }
        row.selected = await item.getAttribute('aria-selected');
        row.statusBeforeAdd = await page.locator(sel).textContent();
        row.valid = row.statusBeforeAdd === LOADING;
        const add = page.locator('button:enabled', { hasText: /^Add/ }).first();
        await add.click({ timeout: 60000 });
        row.addedAt = await page.evaluate(() => Math.round(performance.now()));
        row.statusAfterAdd = await page.locator(sel).textContent();
      }
      await page.waitForTimeout(7000);
      const status = page.locator(sel);
      const box = await status.boundingBox();
      row.final = await status.textContent();
      row.boxHeight = box ? box.height : null;
      row.bpm = await page.locator('[data-testid="arrangement-bars-ruler"]').getAttribute('data-bpm');
      row.snap = await page.locator('[data-testid="arrangement-grid-control"]').getAttribute('data-snap');
      row.history = await page.evaluate(() => window.__st);
      row.entriesAfterAddStartingWithReady = row.addedAt
        ? row.history.filter(([t, s]) => t >= row.addedAt && s.startsWith('Demo collection ready')).length
        : null;
      row.leadingSpace = row.history.some(([, s]) => s.startsWith(' '));
      if (mode === 'fail') {
        row.heroRowError = await page
          .locator('[data-source-id="demo-hero-music"]')
          .innerText()
          .then((t) => t.includes('Error: File failed to load (404)'))
          .catch(() => 'not-found');
      }
      if (mode === 'delay' || mode === 'placement') {
        await page.screenshot({ path: `${outDir}/${key}.png`, fullPage: false });
      }
      row.errors = errors;
      out[key] = row;
      await context.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
