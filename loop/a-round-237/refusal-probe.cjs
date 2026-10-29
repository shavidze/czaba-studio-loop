const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2]; const delayMs = Number(process.argv[3] || 6000);
const sel = '[data-testid="arrangement-status"]';
(async () => {
  const browser = await chromium.launch(); const out = { base, delayMs };
  const warm = await browser.newPage(); await warm.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' }); await warm.waitForTimeout(20000); await warm.close();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    for (const pat of ['**/middle-east.mp3', '**/hero-music.mp3']) {
      await page.route(pat, async (route) => { await new Promise((r) => setTimeout(r, delayMs)); await route.continue(); });
    }
    await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector(sel, { timeout: 60000 });
    await page.evaluate((s) => { window.__st = []; const el = document.querySelector(s); const rec = () => window.__st.push([Math.round(performance.now()), el.textContent]); rec(); new MutationObserver(rec).observe(el, { childList: true, subtree: true, characterData: true }); }, sel);
    const fader = page.getByRole('slider', { name: /^Volume — / }).first();
    await fader.waitFor({ timeout: 60000 }); await page.waitForTimeout(1500);
    const row = { statusBeforeGesture: await page.locator(sel).textContent() };
    row.valid = row.statusBeforeGesture === 'Loading the demo collection…';
    const b = await fader.boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2 + 4, b.y + b.height / 2, { steps: 3 });
    await page.keyboard.press('Control+z');
    row.statusAfterCtrlZ = await page.locator(sel).textContent();
    await page.waitForTimeout(delayMs + 1500);
    row.statusAtReleaseTime = await page.locator(sel).textContent();
    row.sourcesRowsLoading = await page.locator('[data-source-id="demo-hero-music"]').innerText().catch(() => null);
    await page.mouse.up(); await page.waitForTimeout(1500);
    row.finalAfterRelease = await page.locator(sel).textContent();
    row.history = await page.evaluate(() => window.__st); row.errors = errors;
    await page.screenshot({ path: `refusal-${w}x${h}.png` });
    out[`${w}x${h}`] = row; await ctx.close();
  }
  await browser.close(); console.log(JSON.stringify(out, null, 1));
})();
