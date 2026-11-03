import { createRequire } from 'node:module'; import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const B = 'http://127.0.0.1:5173'; const D = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-318';
const browser = await chromium.launch(); const out = {};
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const vp = `${w}x${h}`; const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage(); const r = (out[vp] = {});
  await page.goto(`${B}/studio-lab`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.getByText(/Demo collection ready/).first().waitFor({ timeout: 180000 });
  r.lab = await page.evaluate(() => ({ authUser: localStorage.getItem('auth_user'), lanes: document.querySelectorAll('[data-grid-seconds]:not([data-testid])').length, demoBadge: [...document.querySelectorAll('*')].some((e) => e.children.length === 0 && /^demo$/i.test((e.textContent ?? '').trim())), title: document.title, url: location.pathname }));
  await page.screenshot({ path: `${D}/shots/auth-lab-${vp}.png` });
  await page.goto(`${B}/studio/middle-east`, { waitUntil: 'networkidle', timeout: 180000 }); await page.waitForTimeout(1500);
  r.premium = await page.evaluate(() => ({ url: location.pathname, signIn: /Sign in required/i.test(document.body.innerText), audioSrc: document.querySelectorAll('audio[src]').length, authUser: localStorage.getItem('auth_user') }));
  await page.screenshot({ path: `${D}/shots/auth-premium-${vp}.png` });
  const resp = await page.request.get(`${B}/api/studio-token`, { failOnStatusCode: false }); r.token = resp.status();
  const resp2 = await page.request.post(`${B}/api/studio-token`, { failOnStatusCode: false, data: {} }); r.tokenPost = resp2.status();
  await ctx.close();
}
writeFileSync(`${D}/auth.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await browser.close();
