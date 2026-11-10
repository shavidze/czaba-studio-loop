const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async () => {
  const out = [];
  const browser = await chromium.launch();
  for (let i = 0; i < 4; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errs = [], reactUrls = new Set(), statuses = [];
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type()[0] + ':' + m.text().slice(0, 140)); });
    page.on('pageerror', (e) => errs.push('pageerror:' + String(e).slice(0, 140)));
    page.on('response', (r) => { const u = r.url(); if (/node_modules\/\.vite\/deps\/(react|react-dom|chunk-)/.test(u)) reactUrls.add(u.replace('http://127.0.0.1:5173', '')); if (r.status() === 504) statuses.push('504 ' + u); });
    const t0 = Date.now();
    await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(4000);
    const text = (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 120);
    const audioSrc = await page.evaluate(() => document.querySelectorAll('audio[src]').length);
    const reactVersions = [...reactUrls].filter((u) => /deps\/react(-dom)?(_client)?\.js/.test(u));
    out.push({ i, ms: Date.now() - t0, text, audioSrc, errs, reactVersions, depsVariants: [...new Set([...reactUrls].map((u) => (u.match(/v=([0-9a-f]+)/) || [])[1]))], statuses });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
