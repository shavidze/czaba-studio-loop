const path = require('path');
const fs = require('fs');
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const BASE = 'http://127.0.0.1:5173';
const OUT = __dirname;
(async () => {
  const browser = await chromium.launch();
  const out = { viewport: '1440x900' };
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'networkidle', timeout: 120000 });
  await page.waitForFunction(() => {
    const add = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === 'Add');
    return add instanceof HTMLButtonElement && document.querySelector('[data-testid="arrangement-library-preview-wave"] rect') !== null;
  }, undefined, { timeout: 90000 }).catch(async (e) => { out.readyError = String(e).slice(0, 200); await page.screenshot({ path: path.join(OUT, 'debug-ready.png') }); });
  out.addTextButtons = await page.evaluate(() => [...document.querySelectorAll('button')].filter((b) => b.textContent?.trim() === 'Add').map((b) => ({ aria: b.getAttribute('aria-label'), disabled: b.disabled })));
  out.lab = {
    url: page.url(),
    addButtons: await page.getByRole('button', { name: 'Add', exact: true }).count(),
    playButtons: await page.getByRole('button', { name: 'Play', exact: true }).count(),
    lanes: await page.locator('[data-track-id]').count(),
    demoText: await page.getByText(/demo/i).count(),
    demoTextSamples: await page.getByText(/demo/i).evaluateAll((els) => els.slice(0, 4).map((e) => e.textContent.trim().slice(0, 90))),
    collectionBadge: await page.getByText(/^Synthetic demo · /).count(),
    demoNotice: await page.getByText('Synthetic demo stems — not CZABA catalogue audio.', { exact: true }).count(),
    signInRequired: await page.getByText('Sign in required').count(),
    authUser: await page.evaluate(() => localStorage.getItem('auth_user')),
    cookies: (await ctx.cookies()).length,
    pageErrors: errors.slice(),
  };
  await page.screenshot({ path: path.join(OUT, 'g266-studio-lab-anon-1440x900.png') });
  const p2 = await ctx.newPage();
  const audioReqs = [];
  p2.on('request', (r) => { if (/\.(wav|mp3)(\?|$)|studio-token/.test(r.url())) audioReqs.push(r.url()); });
  await p2.goto(`${BASE}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 120000 }).catch((e) => { out.productGotoError = String(e); });
  await p2.waitForTimeout(1500);
  out.product = {
    url: p2.url(),
    signInRequired: await p2.getByText('Sign in required', { exact: false }).count(),
    audioSrc: await p2.locator('audio[src]').count(),
    audioRequests: audioReqs,
    authUser: await p2.evaluate(() => localStorage.getItem('auth_user')),
  };
  await p2.screenshot({ path: path.join(OUT, 'g266-studio-product-anon-1440x900.png') });
  await ctx.close();
  const api = await browser.newContext();
  const u = `${BASE}/api/studio-token?product=middle-east&file=stem-1.wav`;
  const a = await api.request.get(u, { failOnStatusCode: false });
  const b = await api.request.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
  const at = await a.text();
  const bt = await b.text();
  out.api = {
    noHeader: { status: a.status(), body: at.slice(0, 200), tokenLike: /"token"\s*:\s*"[^"]+"/.test(at) },
    fakeBearer: { status: b.status(), body: bt.slice(0, 200), tokenLike: /"token"\s*:\s*"[^"]+"/.test(bt) },
  };
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'g266-auth.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out, null, 2));
})();
