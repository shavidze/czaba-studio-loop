import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base='http://127.0.0.1:5173', out={};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} }); const p = await ctx.newPage(); const r = out[`${w}x${h}`]={};
  await p.goto(base+'/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000});
  r.lab = { auth_user: await p.evaluate(()=>localStorage.getItem('auth_user')), workspace: await p.getByTestId('arrangement-library').count(), demo: true };
  await p.goto(base+'/studio/middle-east',{waitUntil:'networkidle'}); await p.waitForTimeout(1500);
  const body = await p.locator('body').innerText();
  r.premium = { signIn: /Sign in required/i.test(body), workspace: await p.getByTestId('arrangement-library').count(), audioSrc: await p.locator('audio[src]').count() };
  const t = await ctx.request.get(base+'/api/studio-token'); r.token = { status: t.status(), leak: /eyJ[A-Za-z0-9_-]{10,}/.test(await t.text()) };
  await p.screenshot({path:`auth-${w}.png`}); await ctx.close();
}
await b.close(); writeFileSync('auth.json', JSON.stringify(out,null,1)); console.log(JSON.stringify(out));
