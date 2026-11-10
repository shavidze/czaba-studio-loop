import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-423/auth';
const res = {}; const browser = await chromium.launch();
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const k = `${w}x${h}`; const r = (res[k] = {});
  const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
  await page.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForSelector('[data-testid="arrangement-timeline-scroller"]', { timeout: 120000 });
  r.lab = { authUser: await page.evaluate(() => localStorage.getItem('auth_user')), options: await page.getByRole('listbox', { name: 'Sounds' }).getByRole('option').count(), title: await page.title() };
  await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded', timeout: 120000 }); await page.waitForTimeout(4000);
  r.premium = { url: page.url(), signIn: await page.getByText('Sign in required').first().isVisible().catch(() => false), audioSrc: await page.locator('audio[src]').count(), timeline: await page.locator('[data-testid="arrangement-timeline-scroller"]').count() };
  await page.screenshot({ path: `${out}/premium-${k}.png` });
  const t = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3'); const body = await t.text();
  r.token = { status: t.status(), bodyHasToken: /"token"|signedUrl|url/i.test(body) && t.status() === 200, body: body.slice(0, 120) };
  await page.evaluate(() => localStorage.setItem('auth_user', JSON.stringify({ accessToken: 'forged', refreshToken: 'forged', email: 'x@y.z' })));
  await page.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(4000);
  r.forged = { signIn: await page.getByText('Sign in required').first().isVisible().catch(() => false), audioSrc: await page.locator('audio[src]').count(), timeline: await page.locator('[data-testid="arrangement-timeline-scroller"]').count(), text: (await page.locator('body').innerText()).slice(0, 120).replace(/\s+/g, ' ') };
  await page.screenshot({ path: `${out}/forged-${k}.png` });
  const t2 = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3', { headers: { Authorization: 'Bearer forged' } });
  r.fakeBearer = { status: t2.status(), body: (await t2.text()).slice(0, 100) };
  r.errs = errs.filter((e) => !/cart|CONNECTION|TUNNEL/i.test(e)); await ctx.close();
}
writeFileSync(`${out}/auth.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1)); await browser.close();
