const F = require('./fl.cjs');
(async () => { const browser = await F.launch(); for (const port of [5173, 5176]) { const { ctx, page } = await F.newPage(browser, 375, 812, {}); await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' }); await F.sleep(3000); await F.declineCookies(page);
 const b = page.locator('button[aria-label="Toggle menu"]'); await b.click(); await F.sleep(500); const openNavVis = await page.locator('header .lg\\:hidden nav').isVisible(); await b.click(); await F.sleep(500);
 const c = page.locator('header .lg\\:hidden.max-h-0'); console.log(port, 'openNavVisible', openNavVis, 'closedContainerCount', await c.count(), 'closedContainerVisible', await c.isVisible(), 'box', JSON.stringify(await c.boundingBox()));
 await ctx.close(); } await browser.close(); })();
