const { chromium, sleep, save, SHOTS, BASE } = require('./lib.cjs');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const res = { utc: new Date().toISOString() };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const forbidden = []; const auth = []; const errors = [];
  page.on('request', (q) => { if (/studio-token|\/api\/recording-|\/api\/download|r2\.dev|r2\.cloudflarestorage/.test(q.url())) forbidden.push(q.url()); if (q.headers().authorization) auth.push(q.url()); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/`, { waitUntil: 'load' }); res.homeUrl = page.url();
  await sleep(4000); await page.waitForLoadState('load'); res.homeUrlAfter = page.url();
  const links = await page.evaluate(() => [...document.querySelectorAll('header a[href]')].map((a) => [a.getAttribute('href'), a.textContent.trim().slice(0, 40)]));
  res.headerLinks = links;
  const studioLink = page.locator('header a[href="/studio-lab"]').first();
  res.headerHasStudioLab = (await studioLink.count()) > 0;
  if (res.headerHasStudioLab) {
    await studioLink.click();
    await page.waitForURL('**/studio-lab', { timeout: 30000 });
    await page.waitForSelector('[data-testid=arrangement-grid-control]', { timeout: 90000 });
    await sleep(1500);
    res.lab = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), demoBadge: /demo|დემო/i.test(document.body.innerText) ? (document.body.innerText.match(/.{0,30}(demo|დემო).{0,30}/i) || [''])[0] : null }));
    await page.screenshot({ path: path.join(SHOTS, 'g110-3-lab-1440x900.png') });
  }
  await page.goto(`${BASE}/studio/middle-east`, { waitUntil: 'domcontentloaded' });
  await sleep(5000);
  res.protected = await page.evaluate(() => ({ url: location.pathname, workspace: !!document.querySelector('[data-testid=arrangement-grid-control]'), audioSrc: document.querySelectorAll('audio[src]').length, signIn: /sign in|შესვლა|ავტორიზ/i.test(document.body.innerText), text: document.body.innerText.slice(0, 300) }));
  await page.screenshot({ path: path.join(SHOTS, 'g110-3-protected-1440x900.png') });
  const r = await ctx.request.get(`${BASE}/api/studio-token`, { failOnStatusCode: false });
  res.token = { status: r.status() };
  res.pageForbidden = forbidden; res.pageAuth = auth; res.errors = errors;
  await browser.close();
  save('g110-3.json', res);
  console.log(JSON.stringify(res, null, 1));
})();
