import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const [base, out, tag] = process.argv.slice(2);
const b = await chromium.launch();
const res = { base, vp: {} };
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const r = {};
  await p.goto(`${base}/studio-lab`);
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
  r.lab = { authUser: await p.evaluate(() => localStorage.getItem('auth_user')), options: await p.locator('[role=option]').count(), title: await p.title() };
  await p.screenshot({ path: `auth-${tag}-${w}-lab.png` });
  await p.goto(`${base}/studio/middle-east`);
  await p.waitForTimeout(4000);
  const txt = await p.locator('body').innerText();
  r.studio = { signIn: /sign in required/i.test(txt), audioSrc: await p.locator('audio[src]').count(), clips: await p.locator('[data-clip-kind]').count(), url: p.url() };
  await p.screenshot({ path: `auth-${tag}-${w}-studio.png` });
  const t = await ctx.request.get(`${base}/api/studio-token?product=middle-east&file=a.wav`);
  const body = await t.text();
  r.token = { status: t.status(), body: body.slice(0, 200), hasToken: /eyJ/.test(body) };
  const t2 = await ctx.request.get(`${base}/api/studio-token?product=middle-east&file=a.wav`, { headers: { Authorization: 'Bearer fake.fake.fake' } });
  r.tokenFakeBearer = { status: t2.status(), body: (await t2.text()).slice(0, 120) };
  res.vp[`${w}x${h}`] = r;
  await ctx.close();
}
writeFileSync(out, JSON.stringify(res, null, 1)); await b.close(); console.log(JSON.stringify(res, null, 1));
