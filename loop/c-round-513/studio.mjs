import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const out=[];
for (const base of ['http://127.0.0.1:5174']) for (const [w,h] of [[1440,900],[1280,720]]) for (const path of ['/studio-lab','/studio-lab','/studio/middle-east','/account/downloads']) {
  const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,100)));
  await p.route(/googletagmanager|google-analytics/, r=>r.abort());
  await p.goto(base+path,{waitUntil:'load'}); await p.waitForTimeout(7500);
  const r = await p.evaluate(()=>({accept:[...document.querySelectorAll('button')].filter(x=>x.textContent.trim()==='Accept').length, signin:/Sign in required/i.test(document.body.innerText), dl:[...document.querySelectorAll('a')].filter(a=>/download/i.test(a.href+a.innerText)).map(a=>a.getAttribute('href')).slice(0,5), ws:!!document.querySelector('[data-testid],main'), txt:document.body.innerText.slice(0,120).replace(/\n/g,' | ')}));
  out.push({w,path,...r,errs}); await p.screenshot({path:`studio-${w}-${path.replace(/\W/g,'_')}.png`}); await ctx.close();
}
console.log(JSON.stringify(out,null,1)); await b.close();
