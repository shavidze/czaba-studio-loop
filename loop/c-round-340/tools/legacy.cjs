const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:60000}).catch(e=>console.log('goto',String(e).slice(0,100)));
for(let i=0;i<6;i++){await p.waitForTimeout(5000);console.log(JSON.stringify(await p.evaluate(()=>[location.href,document.body.innerText.length,document.body.innerText.slice(0,150),document.querySelectorAll('audio[src]').length])));}
console.log(errs);await p.screenshot({path:'shots/legacy-peek.png'});await b.close();})();
