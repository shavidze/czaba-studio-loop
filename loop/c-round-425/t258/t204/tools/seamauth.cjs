const L = require('./lib.cjs'); const path = require('path');
(async () => {
  const browser = await L.launch(); const { page, ctx } = await L.newPage(browser, 1280, { signedIn: true }); const forb = [], auth = [];
  page.on('request', (q) => { if (/studio-token|\/api\/download|r2\.|workers\.dev/i.test(q.url())) forb.push(q.url()); if (q.headers().authorization) auth.push(q.url()); });
  await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'load', timeout: 180000 }); await L.sleep(6000);
  const r = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), audioSrc: document.querySelectorAll('audio[src]').length, text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 220) }));
  await page.screenshot({ path: path.join(L.SHOTS, 'seam-studio-1280.png') });
  const t = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem1.wav', { failOnStatusCode: false });
  const R = { ...r, token: t.status(), forb, auth }; L.save(path.join(L.OUT, 'seam-auth.json'), R); console.log(JSON.stringify(R)); await browser.close();
})();
