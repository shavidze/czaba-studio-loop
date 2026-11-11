const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs = require('fs');
const base = process.argv[2]; const tag = process.argv[3]; const out = __dirname;
const res = {};
async function mk(browser, vp, extra = {}) {
  const ctx = await browser.newContext({ viewport: vp, ...extra });
  await ctx.addInitScript(() => { try { localStorage.setItem('cookie-consent', 'declined'); } catch {} });
  return [ctx, await ctx.newPage()];
}
(async () => {
  const browser = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 375, height: 812 }]) {
    const [ctx, page] = await mk(browser, vp);
    await page.goto(base + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4500);
    for (let y = 0; y < 14000; y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
    await page.waitForTimeout(800);
    res['keep' + vp.width] = await page.evaluate(() => {
      const t = document.body.innerText;
      return { text: t, hrefs: [...document.querySelectorAll('a')].map((a) => a.getAttribute('href')), has: ['Gift Cards', 'Complete Collection', 'Subscribe', 'Limited', '2,500', 'Netflix'].map((w) => [w, t.includes(w)]) };
    });
    await ctx.close();
  }
  // LCP/CLS 3 loads
  for (const [name, vp, path] of [['home1440', { width: 1440, height: 900 }, '/'], ['home375', { width: 375, height: 812 }, '/'], ['store1440', { width: 1440, height: 900 }, '/store'], ['store375', { width: 375, height: 812 }, '/store']]) {
    res[name] = [];
    for (let i = 0; i < 3; i++) {
      const [ctx, page] = await mk(browser, vp);
      await page.addInitScript(() => {
        window.__lcp = 0; window.__cls = 0;
        new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      });
      await page.goto(base + path, { waitUntil: 'load' });
      await page.waitForTimeout(6000);
      res[name].push(await page.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(4) })));
      await ctx.close();
    }
  }
  // reduced motion
  for (const vp of [{ width: 1440, height: 900 }, { width: 375, height: 812 }]) {
    const [ctx, page] = await mk(browser, vp, { reducedMotion: 'reduce' });
    await page.goto(base + '/', { waitUntil: 'commit' });
    const t0 = Date.now(); let seen = false, gone = null;
    for (let i = 0; i < 60; i++) {
      const n = await page.locator('[data-testid="entrance-loader"]').count();
      if (n) seen = true; else if (seen && gone === null) { gone = Date.now() - t0; break; }
      await page.waitForTimeout(150);
    }
    res['rm' + vp.width] = { seen, goneMs: gone };
    await ctx.close();
  }
  // studio-lab
  {
    const [ctx, page] = await mk(browser, { width: 1440, height: 900 });
    await page.goto(base + '/studio-lab', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${out}/shots/${tag}-studio-1440.png` });
    res.studio = { title: await page.title(), bodyLen: (await page.evaluate(() => document.body.innerText)).length, hasPlay: await page.getByRole('button', { name: /play/i }).count() };
    await ctx.close();
  }
  {
    const [ctx, page] = await mk(browser, { width: 1440, height: 900 });
    const reqs = [];
    page.on('request', (r) => reqs.push(r.url()));
    await page.goto(base + '/studio/middle-east', { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(2000);
    res.auth = { url: page.url(), signin: await page.getByText(/Sign in required/i).count(), audioSrc: await page.locator('audio[src]').count(), mediaReqs: reqs.filter((u) => /\.(wav|mp3|m4a)(\?|$)/.test(u)).length };
    await page.screenshot({ path: `${out}/shots/${tag}-auth-1440.png` });
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${out}/rows2-${tag}.json`, JSON.stringify(res, null, 1));
  console.log('done', tag);
})();
