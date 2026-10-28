const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const out = {};
  for (const port of [5188, 5173]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage(); const s = []; const pe = [];
    page.on('request', (q) => s.push(q.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, '')));
    page.on('pageerror', (e) => pe.push(String(e).slice(0, 200)));
    await page.goto(`http://127.0.0.1:${port}/studio/middle-east`, { waitUntil: 'load', timeout: 120000 }); await page.waitForTimeout(5000);
    const pre = await page.evaluate(() => [...document.querySelectorAll('link[rel=modulepreload]')].map((l) => l.getAttribute('href')));
    out[port] = { requests: s.length, encoderReq: s.filter((u) => /mp3-encoder|mediabunny|ffmpeg|unpkg/i.test(u)), preloads: pre.length, badPreloads: pre.filter((u) => /mp3-encoder|mediabunny|ffmpeg/i.test(u)), signIn: await page.evaluate(() => document.body.innerText.includes('Sign in required')), pageErrors: pe, scripts: s.filter((u) => /\.(js|ts|tsx)(\?|$)/.test(u)).length };
    await page.screenshot({ path: `/home/runner/czaba-project/tmp/studio-real-loop/c-round-220/guard-page-${port}.png` });
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(out, null, 1));
})();
