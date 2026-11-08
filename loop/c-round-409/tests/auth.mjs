import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
import fs from 'node:fs';
const res = {};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.getByText('Demo collection ready').first().waitFor({ timeout: 120000 });
  const authUser = await p.evaluate(() => localStorage.getItem('auth_user'));
  const signIn = await p.getByText('Sign in required').count();
  await p.screenshot({ path: `${out}/auth-demo-${w}x${h}.png` });
  const p2 = await ctx.newPage();
  await p2.goto('http://127.0.0.1:5173/studio/middle-east', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p2.getByText('Sign in required').first().waitFor({ timeout: 60000 }).catch(() => {});
  const signIn2 = await p2.getByText('Sign in required').count();
  const audio = await p2.locator('audio[src]').count();
  await p2.screenshot({ path: `${out}/auth-premium-${w}x${h}.png` });
  const r = await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3');
  res[`${w}x${h}`] = { authUser, demoSignIn: signIn, pageErrors: errs.length, premiumSignIn: signIn2, premiumAudio: audio, tokenStatus: r.status() };
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${out}/auth.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res));
