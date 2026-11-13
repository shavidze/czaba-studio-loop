const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
for(let i=0;i<8;i++){await p.waitForTimeout(3000);console.log(i*3+3,JSON.stringify(await p.evaluate(()=>({st:document.querySelector('[data-testid=arrangement-status]')?.textContent,body:document.body.innerText.slice(0,200)}))));}
console.log(errs.slice(0,10));await p.screenshot({path:'out/peek.png'});await b.close();})();
