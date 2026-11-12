import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-474';
const b=await chromium.launch(); const res={};
for (const [w,h] of [[1440,900]]) {
 const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'}); const p=await ctx.newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,80)));
 for (const [n,path] of [['home','/'],['studio-lab','/studio-lab']]) {
  await p.goto('http://127.0.0.1:5180'+path,{waitUntil:'load'}); await p.waitForTimeout(5000);
  await p.screenshot({path:`${out}/head-${w}-${n}.png`});
  res[n]=await p.evaluate(()=>document.body.innerText.length);
 }
 res.errs=errs;
 for (const base of ['http://127.0.0.1:5180','http://127.0.0.1:5173']) { const r=await ctx.request.get(base+'/api/studio-token'); res['token'+base.slice(-4)]=[r.status(),(await r.text()).slice(0,100)]; }
 // which stylesheet rule has 19,217,204 on tree
 await p.goto('http://127.0.0.1:5173/store',{waitUntil:'load'}); await p.waitForTimeout(2500);
 res.tealRule=await p.evaluate(()=>{const o=[];for(const s of document.styleSheets){try{for(const r of s.cssRules){if(/19,\s*217,\s*204/.test(r.cssText))o.push((s.href||'inline')+' :: '+r.cssText.slice(0,200));}}catch{}}return o;});
 res.tealRuleHead=null;
 await ctx.close();
}
await b.close(); console.log(JSON.stringify(res,null,1));
