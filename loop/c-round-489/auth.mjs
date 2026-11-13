import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const out = [];
for (const [w, h] of [[1440, 900], [1280, 720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  const r = { vp: `${w}x${h}` };
  await p.goto('http://127.0.0.1:5191/account', { waitUntil: 'load', timeout: 20000 }).catch(() => {}); await p.waitForTimeout(3000);
  const t = await p.evaluate(() => document.body.innerText); r.account = { signInRequired: /Sign in required/i.test(t), fullName: /Full Name/i.test(t) };
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'load' }); await p.waitForTimeout(3000);
  r.lab = { auth_user: await p.evaluate(() => localStorage.getItem('auth_user')), title: await p.title(), hasTimeline: await p.locator('text=/Insert|Arrangement|Library|Studio/i').count() > 0, signInGate: /Sign in required/i.test(await p.evaluate(() => document.body.innerText)) };
  await p.screenshot({ path: `studio-lab-${w}.png` });
  await p.goto('http://127.0.0.1:5191/studio/middle-east', { waitUntil: 'load', timeout: 20000 }).catch(() => {}); await p.waitForTimeout(3000);
  r.purchased = { signInRequired: /Sign in required/i.test(await p.evaluate(() => document.body.innerText)), audioSrc: await p.locator('audio[src]').count() };
  out.push(r); await ctx.close();
}
console.log(JSON.stringify(out, null, 1)); await b.close();
