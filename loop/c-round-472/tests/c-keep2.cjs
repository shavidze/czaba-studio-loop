const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();
for(const [n,base] of Object.entries({head:'http://127.0.0.1:3101',tree:'http://127.0.0.1:3102'})){for(const w of [1440,1280]){
 const c=await b.newContext({viewport:{width:w,height:w==1440?900:720}});const p=await c.newPage();
 await p.goto(base+'/',{waitUntil:'networkidle'}).catch(()=>{});await p.waitForTimeout(1500);
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);for(let y=0;y<H;y+=400){await p.evaluate(v=>window.scrollTo(0,v),y);await p.waitForTimeout(200);}
 const r=await p.evaluate(()=>{const t=document.body.textContent.toLowerCase();return ['2,500+','netflix original score','happy customers','special offer','limited','free sample'].map(s=>[s,t.includes(s)])});
 console.log(n,w,JSON.stringify(r));await c.close();}}await b.close();})();
