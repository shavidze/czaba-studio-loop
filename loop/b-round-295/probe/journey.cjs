const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs = require('fs');
const base = process.argv[2]; const tag = process.argv[3]; const out = __dirname;
(async () => {
  const browser = await chromium.launch();
  const result = { base, tag, viewports: {} };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const r = {}; const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}/products/middle-east`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.goto(`${base}/products/middle-east`, { waitUntil: 'networkidle' });
    const link = page.getByRole('link', { name: 'Try it in the Studio' });
    r.linkCount = await link.count();
    r.otherProductLinkCount = 0;
    await page.screenshot({ path: `${out}/shots/${tag}-product-${w}.png`, fullPage: false });
    if (r.linkCount === 1) {
      r.linkHref = await link.getAttribute('href');
      r.linkBox = await link.boundingBox();
      await link.click();
      await page.waitForURL('**/studio-lab?preview=middle-east');
      await page.waitForSelector('[role="option"][data-source-id="demo-middle-east"]');
      await page.waitForFunction(() => document.querySelector('[data-testid="arrangement-status"]')?.textContent?.includes('ready'), null, { timeout: 30000 }).catch(() => {});
      r.url = page.url();
      r.active = await page.evaluate(() => { const a = document.activeElement; return { role: a?.getAttribute('role'), id: a?.getAttribute('data-source-id'), selected: a?.getAttribute('aria-selected'), focusVisible: a?.matches(':focus-visible') }; });
      await page.screenshot({ path: `${out}/shots/${tag}-landing-${w}.png` });
      await page.keyboard.press('Enter');
      await page.waitForTimeout(800);
      r.clipsAfterEnter = await page.locator('[data-testid^="arrangement-clip"]').count();
      r.statusAfterEnter = await page.locator('[data-testid="arrangement-status"]').textContent();
      await page.screenshot({ path: `${out}/shots/${tag}-added-${w}.png` });
    }
    await page.goto(`${base}/products/harbour-lights`, { waitUntil: 'networkidle' });
    r.otherProductLinkCount = await page.getByRole('link', { name: 'Try it in the Studio' }).count();
    const p2 = await ctx.newPage();
    await p2.goto(`${base}/studio-lab`, { waitUntil: 'networkidle' });
    await p2.waitForTimeout(500);
    r.plainLabActive = await p2.evaluate(() => document.activeElement?.tagName + ':' + (document.activeElement?.getAttribute('data-source-id') ?? ''));
    r.plainLabSelected = await p2.evaluate(() => document.querySelector('[role="option"][aria-selected="true"]')?.getAttribute('data-source-id'));
    r.libraryOrder = await p2.evaluate(() => [...document.querySelectorAll('[role="option"]')].map((o) => o.getAttribute('data-source-id')));
    r.pageErrors = errors;
    result.viewports[`${w}x${h}`] = r; await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${out}/journey-${tag}.json`, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})();
