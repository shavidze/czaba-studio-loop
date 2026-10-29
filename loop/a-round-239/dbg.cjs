const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,150))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});await p.waitForTimeout(8000);
console.log(await p.evaluate(()=>({status:document.querySelector('[data-testid="arrangement-status"]')?.textContent, mode:document.querySelector('[data-testid="arrangement-grid-control"]')?.getAttribute('data-grid-mode')})));
console.log(errs.slice(0,8).join('\n'));await p.screenshot({path:'dbg.png'});await b.close();})();
