const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const out = process.argv[2];
const BASE = process.env.BASE || 'http://127.0.0.1:5173';
(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const w of [1440, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', e => errs.push(String(e)));
    const seen = [];
    await page.route(/\/products\/harbour-lights\?.*_data=/, async (route) => {
      seen.push(route.request().url());
      const r = await route.fetch();
      const j = await r.json();
      const p = j.product;
      p.standardPrice = 0; p.premiumPrice = 0; p.minPrice = 0;
      p.variants = (p.variants || []).map(v => ({ ...v, price: 0 }));
      await route.fulfill({ response: r, json: j });
    });
    await page.goto(BASE + '/products/middle-east', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);
    await page.keyboard.press('Escape');
    const before = await page.locator('text=Complimentary Download').count();
    await page.evaluate(() => { const a = document.createElement('a'); a.href='/products/harbour-lights'; a.id='probe-nav'; a.textContent='x'; document.body.appendChild(a); });
    // use remix client navigation via a real Link? fallback: window.__remixRouter
    const viaRouter = await page.evaluate(async () => { const r = window.__remixRouter; if (!r) return false; await r.navigate('/products/harbour-lights'); return true; });
    await page.waitForTimeout(2500);
    const btn = page.locator('button:has-text("Complimentary Download"), a:has-text("Complimentary Download")');
    const count = await btn.count();
    let info = null;
    if (count) {
      info = await btn.first().evaluate(el => ({ tag: el.tagName, href: el.getAttribute('href'), type: el.getAttribute('type'), cls: el.className }));
      const urlBefore = page.url();
      await btn.first().click();
      await page.waitForTimeout(1500);
      info.urlAfterClick = page.url(); info.urlBefore = urlBefore;
      info.dialog = await page.locator('[role=dialog]').count();
    }
    const priceText = await page.locator('text=Total Price').locator('..').innerText().catch(() => null);
    await page.screenshot({ path: `${out}/free-${w}.png`, fullPage: false });
    res[w] = { before, viaRouter, seen, count, info, priceText, url: page.url(), errs };
    await ctx.close();
  }
  fs.writeFileSync(`${out}/free-stub.json`, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
