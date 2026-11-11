// usage: node added-probe.cjs <base> <out.json> <shotDir>
// STORE-2b-3b row ADDED-STUBBED: stubs POST /api/cart/items (client path only) and samples the
// product-page Add-to-cart button's computed box-shadow while it shows "Added" (1.5 s window).
const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const [base, outFile, shotDir = 'shots-added'] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(shotDir, { recursive: true });
  const browser = await chromium.launch(); const out = { base, rows: [] };
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('czaba_entrance_seen', '1'); localStorage.setItem('czaba_lead_magnet', JSON.stringify({ viewCount: 0, lastResetDate: new Date().toISOString().split('T')[0], dismissed: true, submitted: false })); } catch (e) {} });
    let posted = 0;
    await ctx.route('**/api/cart/items', async (route) => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': new URL(base).origin, 'access-control-allow-credentials': 'true', 'access-control-allow-headers': '*', 'access-control-allow-methods': 'POST' } });
      posted += 1;
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': new URL(base).origin, 'access-control-allow-credentials': 'true' }, body: JSON.stringify({ success: true, data: { id: 1, items: [], itemCount: 0, subtotal: 0, discountAmount: 0, giftCardAmount: 0, total: 0 } }) });
    });
    const page = await ctx.newPage(); const row = { vp: w };
    try {
      await page.goto(base + '/products/quiet-valley', { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const btn = page.getByRole('button', { name: /add to cart/i }).first();
      await btn.waitFor({ state: 'visible', timeout: 10000 });
      row.restShadow = await btn.evaluate((e) => getComputedStyle(e).boxShadow);
      await btn.click();
      const added = page.getByRole('button', { name: /^Added$/ }).first();
      await added.waitFor({ state: 'visible', timeout: 3000 });
      await page.waitForTimeout(450);
      row.addedShadow = await added.evaluate((e) => getComputedStyle(e).boxShadow);
      row.addedText = (await added.innerText()).trim();
      await added.screenshot({ path: `${shotDir}/added-${w}.png` }).catch(() => {});
      row.posted = posted;
    } catch (e) { row.error = String(e).split('\n')[0]; row.posted = posted; }
    out.rows.push(row); await ctx.close();
  }
  await browser.close(); fs.writeFileSync(outFile, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out.rows));
})();
