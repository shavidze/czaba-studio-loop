const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{
 const b=await chromium.launch(); const out={};
 for (const vp of [[1440,900],[1280,720]]){
  const c=await b.newContext({viewport:{width:vp[0],height:vp[1]}}); const p=await c.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'}); await p.waitForTimeout(2500);
  await p.screenshot({path:`auth-lab-${vp[0]}.png`});
  const t=await p.evaluate(()=>document.body.innerText.slice(0,200));
  const r1=await p.goto('http://127.0.0.1:5173/studio/premium-demo',{waitUntil:'load'}); await p.waitForTimeout(2000);
  const t2=await p.evaluate(()=>document.body.innerText.slice(0,300));
  await p.screenshot({path:`auth-premium-${vp[0]}.png`});
  const api=await c.request.get('http://127.0.0.1:5173/api/studio-token?productId=x');
  const api2=await c.request.post('http://127.0.0.1:5173/api/studio-token',{data:{}});
  out[vp[0]]={lab:t.replace(/\n/g,' | '),premiumStatus:r1&&r1.status(),premiumUrl:p.url(),premiumText:t2.replace(/\n/g,' | '),workspace:await p.locator('[data-testid*=arrangement],[aria-label*=Arrangement]').count(),api:api.status(),apiPost:api2.status(),errs:errs.slice(0,3)};
  await c.close();
 }
 console.log(JSON.stringify(out,null,1)); await b.close();
})();
