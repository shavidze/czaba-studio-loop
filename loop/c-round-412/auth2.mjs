import { createRequire } from 'node:module';
const { chromium } = createRequire('/home/runner/czaba-project/store/package.json')('@playwright/test');
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,100)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000});
const r=await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle',timeout:120000});
for (const t of [2000,6000]) { await p.waitForTimeout(t);
 console.log(r.status(), 'signIn', await p.getByText('Sign in required').count(), 'audio[src]', await p.locator('audio[src]').count(), 'text:', (await p.locator('body').innerText()).slice(0,200).replace(/\n/g,' | ')); }
console.log(errs);
await p.screenshot({path:'c-round-412/auth-premium2.png'}); await b.close();
