const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const [,, base, tag] = process.argv;
(async () => {
  const browser = await chromium.launch();
  for (const vp of [[1440, 900], [1280, 720]]) for (const p of ['/studio-lab', '/', '/store']) {
    const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(base + p, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3000);
    await page.evaluate(() => { document.querySelectorAll('video').forEach(v => v.pause()); });
    const name = `${tag}-${p === '/' ? 'home' : p.slice(1).replace(/\//g, '_')}-${vp[0]}.png`;
    await page.screenshot({ path: `shots/${name}` });
    await ctx.close();
  }
  await browser.close();
})();
