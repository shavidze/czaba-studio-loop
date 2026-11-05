const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();const logs=[];p.on('console',m=>logs.push(m.type()+': '+m.text().slice(0,120)));p.on('pageerror',e=>logs.push('PE '+String(e).slice(0,150)));
const t=Date.now();await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:120000});console.log('goto',Date.now()-t);
for(let i=0;i<8;i++){await p.waitForTimeout(5000);console.log(i,await p.evaluate(()=>document.body?document.body.innerText.length+' '+document.body.innerText.slice(0,80).replace(/\n/g,'|'):'nobody'));}
await p.screenshot({path:'legacy-dbg.png'});console.log(logs.slice(0,10));await b.close();})();
