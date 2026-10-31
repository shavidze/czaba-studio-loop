const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const base = process.argv[2] || 'http://127.0.0.1:5173';
  const tag = process.argv[3] || 'head';
  const out = {};
  const browser = await chromium.launch();
  for (const [w, h] of [[1440, 900], [1280, 720]]) {
    for (const handle of ['door-slams', 'middle-east']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const page = await ctx.newPage();
      await page.goto(`${base}/products/${handle}`, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500);
      const r = await page.evaluate(() => {
        const txt = document.body.innerText;
        const m = txt.match(/\$[0-9]+\.[0-9]{2}\s*USD/g);
        const btn = (label) => [...document.querySelectorAll('button')].filter(b => b.innerText.trim().includes(label)).map(b => ({ disabled: b.disabled }));
        return { prices: m, buyNow: btn('Buy Now'), addToCart: btn('Add to Cart'), complimentary: txt.includes('Complimentary Download') };
      });
      await page.screenshot({ path: `${tag}-${handle}-${w}.png` });
      out[`${handle}-${w}`] = r;
      await ctx.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
