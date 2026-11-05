import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const br=await chromium.launch();const ctx=await br.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const t=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:90000});
for(let i=0;i<8;i++){await p.waitForTimeout(5000);const s=await p.evaluate(()=>({st:document.querySelector('[data-testid="arrangement-status"]')?.textContent?.slice(0,120),body:document.body.innerText.slice(0,150)}));console.log(Math.round((Date.now()-t)/1000),JSON.stringify(s));if(/ready/i.test(s.st??''))break;}
console.log(errs);await p.screenshot({path:'probe.png'});await br.close();
