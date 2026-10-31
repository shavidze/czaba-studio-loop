const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const vp of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
    const ctx = await b.newContext({ viewport: vp }); const page = await ctx.newPage();
    const t0 = Date.now();
    await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load' });
    const ok = await page.waitForFunction(() => /Sign in required/i.test(document.body.innerText), undefined, { timeout: 60000 }).then(() => true, () => false);
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => ({ signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, workspace: !!document.querySelector('[data-testid=arrangement-timeline-scroller]'), authUser: localStorage.getItem('auth_user') }));
    r.ok = ok; r.ms = Date.now() - t0; out[`${vp.width}x${vp.height}`] = r;
    await page.screenshot({ path: `${__dirname}/auth-guard-wait-${vp.width}x${vp.height}.png` });
    await ctx.close();
  }
  require('fs').writeFileSync(`${__dirname}/c278-auth-wait.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close();
})();
