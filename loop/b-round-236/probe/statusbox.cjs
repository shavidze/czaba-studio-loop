const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const base = process.argv[2]; const tag = process.argv[3];
const sel = '[data-testid="arrangement-status"]';
(async () => {
  const out = {}; const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.route('**/middle-east.mp3', async (r) => { await new Promise((x) => setTimeout(x, 4000)); await r.continue(); });
    await page.route('**/hero-music.mp3', async (r) => { await new Promise((x) => setTimeout(x, 4000)); await r.fulfill({ status: 404, body: '' }); });
    await page.goto(`${base}/studio-lab`, { waitUntil: 'domcontentloaded' });
    const pulse = page.locator('[data-source-id="demo-stem-pulse"]');
    for (let i = 0; i < 40 && (await pulse.getAttribute('aria-selected')) !== 'true'; i += 1) { await pulse.click(); await page.waitForTimeout(100); }
    await page.locator('button:enabled', { hasText: /^Add/ }).first().click();
    await page.waitForTimeout(6000);
    out[`${w}x${h}`] = await page.evaluate((s) => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { text: el.textContent, h: r.height, w: r.width, scrollW: el.scrollWidth, clientW: el.clientWidth, scrollH: el.scrollHeight, clientH: el.clientHeight, overflow: cs.overflow, whiteSpace: cs.whiteSpace, textOverflow: cs.textOverflow, title: el.getAttribute('title') }; }, sel);
    await page.screenshot({ path: `statusbox-${tag}-${w}.png` });
    await page.close();
  }
  await browser.close(); console.log(JSON.stringify(out, null, 1));
})();
