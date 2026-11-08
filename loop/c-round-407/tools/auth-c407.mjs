import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base='http://127.0.0.1:5173'; const L=process.argv[2]; const out={};
const browser=await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await browser.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
  const page=await ctx.newPage(); const r={}; const errs=[]; page.on('pageerror',e=>errs.push(String(e)));
  await page.goto(base+'/studio-lab',{waitUntil:'load',timeout:100000});
  await page.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:100000});
  r.lab={authUser:await page.evaluate(()=>localStorage.getItem('auth_user')),signInRequired:await page.getByText(/Sign in required/i).count(),workspace:await page.locator('[data-testid="arrangement-position"]').count()};
  await page.screenshot({path:`${L}/auth-lab-${w}x${h}.png`});
  const p2=await ctx.newPage();
  await p2.goto(base+'/studio/middle-east',{waitUntil:'load',timeout:100000}); await p2.waitForTimeout(2500);
  r.premium={signInRequired:await p2.getByText(/Sign in required/i).count(),audioSrc:await p2.locator('audio[src]').count(),workspace:await p2.locator('[data-testid="arrangement-position"]').count()};
  await p2.screenshot({path:`${L}/auth-premium-${w}x${h}.png`});
  const resp=await ctx.request.get(base+'/api/studio-token?product=middle-east&file=a.mp3'); r.token={status:resp.status()};
  r.pageErrors=errs; out[`${w}x${h}`]=r; await ctx.close();
}
writeFileSync(`${L}/auth.json`,JSON.stringify(out,null,1)); await browser.close();
