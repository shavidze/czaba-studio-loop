import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json'); const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:5173'; const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-271'; const a = {};
const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  await page.goto(`${BASE}/studio-lab`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => (document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? '').includes('Demo collection ready'), undefined, { timeout: 180000 });
  const lab = { url: page.url(), lanes: await page.locator('[data-track-id]').count(), authUser: await page.evaluate(() => localStorage.getItem('auth_user')), cookies: (await ctx.cookies()).map((c) => c.name) };
  await page.screenshot({ path: `${OUT}/shots/auth-lab-${w}x${h}.png` });
  const p2 = await ctx.newPage(); const reqs = [];
  p2.on('request', (q) => { if (/\.(wav|mp3|flac)(\?|$)|studio-token/.test(q.url())) reqs.push(q.url()); });
  await p2.goto(`${BASE}/studio/middle-east`, { waitUntil: 'load', timeout: 120000 }).catch((e) => { lab.productGotoError = String(e).slice(0, 200); });
  await p2.waitForTimeout(4000);
  const product = { url: p2.url(), signInRequired: await p2.getByText('Sign in required', { exact: false }).count(), audioSrc: await p2.locator('audio[src]').count(), audioRequests: reqs, authUser: await p2.evaluate(() => localStorage.getItem('auth_user')), clips: await p2.locator('[data-clip-id]').count() };
  await p2.screenshot({ path: `${OUT}/shots/auth-product-${w}x${h}.png` });
  a[`${w}x${h}`] = { lab, product }; await ctx.close();
}
const api = await browser.newContext(); const u = `${BASE}/api/studio-token?product=middle-east&file=stem-1.wav`;
const x = await api.request.get(u, { failOnStatusCode: false }); const y = await api.request.get(u, { headers: { Authorization: 'Bearer fake.token.value' }, failOnStatusCode: false });
const xt = await x.text(); const yt = await y.text();
a.api = { noHeader: { status: x.status(), body: xt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(xt) }, fakeBearer: { status: y.status(), body: yt.slice(0, 160), tokenLike: /"token"\s*:\s*"[^"]+"/.test(yt) } };
await api.close(); await browser.close();
writeFileSync(`${OUT}/auth.json`, JSON.stringify(a, null, 1)); console.log(JSON.stringify(a, null, 1));
