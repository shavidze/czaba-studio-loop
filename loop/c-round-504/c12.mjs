import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-504/c12/';
const b = await chromium.launch();
const res=[];
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h}, storageState: undefined });
  await ctx.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');}catch{}});
  const p = await ctx.newPage();
  for (const path of ['/studio/1','/account/downloads','/studio-lab']) {
    await p.goto('http://127.0.0.1:5173'+path,{waitUntil:'domcontentloaded'}); await p.waitForTimeout(4000);
    const txt=(await p.locator('body').innerText()).slice(0,2000);
    const info={vp:w,path,url:p.url(),signIn:/sign in required/i.test(txt),dlLinks:await p.locator('a[href*="download" i]:not([href="/account/downloads"])').count(),hasDemo:/studio|arrangement|clip|library/i.test(txt),authUser:await p.evaluate(()=>localStorage.getItem('auth_user'))};
    if(path==='/studio-lab'){info.canvas=await p.locator('[role],button').count();info.snippet=txt.replace(/\s+/g,' ').slice(0,200);}
    else info.snippet=txt.replace(/\s+/g,' ').slice(0,160);
    res.push(info);
    await p.screenshot({path:O+`${path.replace(/\W+/g,'_')}-${w}.png`});
  }
  await ctx.close();
}
console.log(JSON.stringify(res,null,1));
await b.close();
