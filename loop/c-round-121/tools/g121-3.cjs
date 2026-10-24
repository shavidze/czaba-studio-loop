// C round 121 — G121-3 (adapted from round 115). Fresh context, no credentials; run alone and last.
const L = require('./lib.cjs');
const path = require('path');
(async () => {
  const browser = await L.launch();
  const res = { utc: new Date().toISOString() };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const forbidden = [], auth = [], errors = [], hyd = [];
  page.on('request', (q) => { if (/studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage|r2-proxy|workers\.dev|shopify|identitytoolkit|securetoken|brevo|sendinblue/i.test(q.url())) forbidden.push(q.url()); if (q.headers().authorization) auth.push(q.url()); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  page.on('console', (m) => { if (/hydrat|did not match|server rendered/i.test(m.text())) hyd.push(m.text().slice(0, 200)); });
  await page.goto(`${L.BASE}/studio-lab`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
  await L.sleep(2000);
  res.lab = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), demoBadge: document.body.innerText.includes('დემო კოლექცია — ავტორიზაცია არ სჭირდება') }));
  await page.screenshot({ path: path.join(L.SHOTS, 'g121-3-lab-1440.png') });
  await page.goto(`${L.BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' });
  await L.sleep(5000);
  res.protected = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), audioSrc: document.querySelectorAll('audio[src]').length, signInRequired: /sign in required/i.test(document.body.innerText), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) }));
  await page.screenshot({ path: path.join(L.SHOTS, 'g121-3-protected-1440.png') });
  const r = await ctx.request.get(`${L.BASE}/api/studio-token?product=middle-east&file=stem1.wav`, { failOnStatusCode: false });
  res.token = { status: r.status(), body: (await r.text()).slice(0, 200) };
  res.fakeBearer403 = 'BLOCKED: backend unavailable in cloud';
  res.pageForbidden = forbidden; res.pageAuth = auth; res.errors = errors; res.hydration = hyd;
  await browser.close();
  L.save(L.OUT, 'g121-3.json', res);
  console.log(JSON.stringify(res, null, 1));
})();
