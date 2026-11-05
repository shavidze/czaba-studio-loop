const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,150))});
const t=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
for(let i=0;i<8;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>[document.title,document.querySelector('h1')?.innerText,(document.body.innerText.match(/Demo collection[^\n]*/g)||[]).slice(0,3),!!document.querySelector('[data-testid="arrangement-transport"]')]);console.log(Date.now()-t,JSON.stringify(s));}
console.log(errs.slice(0,6));await p.screenshot({path:'shots/peek.png'});await b.close();})();
