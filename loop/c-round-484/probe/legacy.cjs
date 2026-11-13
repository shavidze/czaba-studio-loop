const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
const errs=[];p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,160))});p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,160)));
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load'});
for(let i=0;i<4;i++){await p.waitForTimeout(4000);console.log(p.url(),JSON.stringify(await p.evaluate(()=>({t:document.body.innerText.slice(0,120),bb:JSON.stringify(document.body.getBoundingClientRect()),vis:getComputedStyle(document.body).visibility,disp:getComputedStyle(document.body).display}))));}
console.log(errs);await p.screenshot({path:'out/legacy.png'});await b.close();})();
