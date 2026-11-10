const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const crypto = require('crypto');
const [, , base, out] = process.argv;
const routes = ['/studio-lab', '/', '/store', '/studio/middle-east'];
(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const route of routes) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const pending = [];
    page.on('response', (res) => {
      const url = res.url();
      const type = res.headers()['content-type'] || '';
      if (url.includes('.woff2') || type.includes('font/woff2')) {
        pending.push(res.body().then((buf) => ({ url, sha: crypto.createHash('sha256').update(buf).digest('hex'), bytes: buf.length })).catch((e) => ({ url, error: String(e) })));
      }
    });
    await page.goto(base + route, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(3000);
    const loaded = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight}`).sort());
    const files = (await Promise.all(pending)).sort((a, b) => (a.sha < b.sha ? -1 : 1));
    result[route] = { files, shas: files.map((f) => f.sha), loaded };
    await ctx.close();
  }
  await browser.close();
  require('fs').writeFileSync(out, JSON.stringify(result, null, 1));
})();
