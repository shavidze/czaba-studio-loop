const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const e=[];p.on('pageerror',x=>e.push(String(x)));p.on('console',m=>{if(m.type()==='error')e.push('console:'+m.text().slice(0,200))});
await p.goto('http://127.0.0.1:5173/studio-lab');for(let i=0;i<8;i++){await new Promise(r=>setTimeout(r,5000));console.log(i,await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent));}
console.log(e.slice(0,10).join('\n'));await b.close();})();
