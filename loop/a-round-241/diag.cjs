const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,200));});
const t0=Date.now();await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000});
try{await p.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:90000});console.log('ready after',Date.now()-t0);}catch(e){console.log('not ready');}
console.log(await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));console.log(errs.slice(0,8).join('\n'));await p.screenshot({path:'diag.png'});await b.close();})();
