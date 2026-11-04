import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage(); const r={};
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
  r.labAuthUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
  r.labBodyLen=await p.evaluate(()=>document.body.innerText.length);
  r.demoBadge=(await p.getByText(/demo/i).first().textContent().catch(()=>null))?.trim().slice(0,80);
  await p.screenshot({path:`c-round-336/screens/auth-lab-${w}x${h}.png`});
  await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle'});
  await p.waitForTimeout(3000);
  r.protBody=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,300);
  r.protSignIn=/Sign in required/i.test(r.protBody);
  r.protWorkspace=await p.locator('[data-testid="arrangement-timeline-scroller"]').count();
  r.protAudio=await p.locator('audio[src]').count();
  r.protAuthUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
  await p.screenshot({path:`c-round-336/screens/auth-protected-${w}x${h}.png`});
  const a=await ctx.request.get('http://127.0.0.1:5173/api/studio-token?productId=middle-east');
  r.tokenNoHeader={status:a.status(),body:(await a.text()).slice(0,200)};
  const f=await ctx.request.get('http://127.0.0.1:5173/api/studio-token?productId=middle-east',{headers:{Authorization:'Bearer fake.token.value'}});
  r.tokenFake={status:f.status(),body:(await f.text()).slice(0,200)};
  res[w]=r; await ctx.close();
}
writeFileSync('c-round-336/auth.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1)); await b.close();
