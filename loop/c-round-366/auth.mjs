import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const br=await chromium.launch();const out=[];
for (const [w,h] of [[1440,900],[1280,720]]) {
 const ctx=await br.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));
 const p=await ctx.newPage();await p.goto('http://127.0.0.1:5189/studio-lab',{waitUntil:'load'});
 await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:120000});
 const lab=await p.evaluate(()=>({auth:localStorage.getItem('auth_user'),demo:/demo/i.test(document.body.innerText),ws:!!document.querySelector('[data-testid="arrangement-position"]')}));
 await p.screenshot({path:`/home/runner/czaba-project/tmp/studio-real-loop/c-round-366/lab-${w}x${h}.png`});
 await p.goto('http://127.0.0.1:5189/studio/middle-east',{waitUntil:'load'});await p.waitForTimeout(2500);
 const st=await p.evaluate(()=>({signin:/sign in required/i.test(document.body.innerText),audio:document.querySelectorAll('audio[src]').length,url:location.pathname}));
 const r=await ctx.request.get('http://127.0.0.1:5189/api/studio-token?product=middle-east&file=stem.wav');const r2=await ctx.request.get('http://127.0.0.1:5189/api/studio-token?product=middle-east&file=stem.wav',{headers:{Authorization:'Bearer fake'}});const body=await r.text();
 out.push({vp:`${w}x${h}`,lab,studio:st,tokenGet:r.status(),tokenFakeBearer:r2.status(),bodyHasToken:/eyJ|token":"/.test(body)});await ctx.close();}
console.log(JSON.stringify(out));await br.close();
