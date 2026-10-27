// C round 186 — G186-3 (copied from c-round-185/tools/g185-3.cjs; output names only).
// C round 184 — G184-3 (copied from c-round-183/tools/g183-3.cjs; lib path and output names only).
// C round 182 — G182-3 (copied from c-round-181/tools/g181-3.cjs; output names only).
// C round 181 — G181-3 (copied from c-round-180/tools/g180-3.cjs; paths and output names only).
// C round 179 — G179-3 (copied from c-round-178/tools/g178-3.cjs, output names only). Fresh context, no credentials.
// C round 177 — G177-3 (copied from c-round-176 g176-3.cjs, output names only)
// C round 176 — G176-3 (copied from c-round-175 g175-3.cjs, output names only) (copied from c-round-174/tools/g174-3.cjs, output names only) (copied from c-round-173/tools/g173-3.cjs, output names only) (copied from c-round-172/tools/g172-3.cjs, output names only) (copied from c-round-171/tools/g171-3.cjs, output names only) (copied from c-round-170/tools/g170-3.cjs, output names only) (copied from c-round-169/tools/g169-3.cjs; adds fontsWait on the lab page) (copied from c-round-167/tools/g167-3.cjs, output names only). Fresh context, no credentials; run alone and last.
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
  res.fonts = await L.fontsWait(page);
  res.lab = await page.evaluate(() => ({ authUser: localStorage.getItem('auth_user'), cookies: document.cookie.length, url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), demoBadge: document.body.innerText.includes('Demo collection — no sign-in required'), anyGeorgianBadge: document.body.innerText.includes('დემო კოლექცია') }));
  await page.screenshot({ path: path.join(__dirname, '..', 'shots', 'g186-3-lab-1440.png') });
  await page.goto(`${L.BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' });
  await L.sleep(5000);
  res.protected = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), audioSrc: document.querySelectorAll('audio[src]').length, signInRequired: /sign in required/i.test(document.body.innerText), text: document.body.innerText.replace(/\s+/g, ' ').slice(0, 300) }));
  await page.screenshot({ path: path.join(__dirname, '..', 'shots', 'g186-3-protected-1440.png') });
  const r = await ctx.request.get(`${L.BASE}/api/studio-token?product=middle-east&file=stem1.wav`, { failOnStatusCode: false });
  res.token = { status: r.status(), body: (await r.text()).slice(0, 200) };
  const r2 = await ctx.request.get(`${L.BASE}/api/studio-token?product=middle-east&file=stem1.wav`, { failOnStatusCode: false, headers: { Authorization: 'Bearer fake' } }); res.fakeBearer = { status: r2.status(), body: (await r2.text()).slice(0, 200), setCookie: r2.headers()['set-cookie'] || null }; res.ctxCookiesAfter = (await ctx.cookies()).length;
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 720 } }); const p2 = await ctx2.newPage(); await p2.goto(`${L.BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' }); await L.sleep(5000); res.protected1280 = await p2.evaluate(() => ({ workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), audioSrc: document.querySelectorAll('audio[src]').length, signInRequired: /sign in required/i.test(document.body.innerText) })); await p2.screenshot({ path: path.join(__dirname, '..', 'shots', 'g186-3-protected-1280.png') }); await ctx2.close();
  res.pageForbidden = forbidden; res.pageAuth = auth; res.errors = errors; res.hydration = hyd;
  await browser.close();
  L.save(require('path').join(__dirname,'..','out'), 'g186-3.json', res);
  console.log(JSON.stringify(res, null, 1));
})();
