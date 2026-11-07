const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const out={};
for(const mode of ['direct','journey','journey-clientnav']){const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(()=>localStorage.setItem('czaba_analytics_consent','denied'));const p=await ctx.newPage();const w=[];p.on('console',m=>{if(/preload/i.test(m.text()))w.push(m.type()+': '+m.text().slice(0,140))});
const t=Date.now();
if(mode==='direct'){await p.goto('http://127.0.0.1:5192/studio-lab',{waitUntil:'load'});}
else{await p.goto('http://127.0.0.1:5192/products/middle-east',{waitUntil:'load'});await p.waitForTimeout(2500);const l=p.getByTestId('product-studio-link');await l.click();await p.waitForURL(/studio-lab/,{timeout:60000});}
await p.waitForTimeout(9000);
out[mode]={url:p.url(),warnings:w,preloadLinks:await p.evaluate(()=>[...document.querySelectorAll('link[rel=preload]')].map(l=>l.getAttribute('href')))};await ctx.close();}
console.log(JSON.stringify(out,null,1));require('fs').writeFileSync('out/preload-warn-prod.json',JSON.stringify(out,null,1));await b.close();})();
