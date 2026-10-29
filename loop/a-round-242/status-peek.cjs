const {chromium}=require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
for(let i=0;i<24;i++){const s=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent);console.log(i*5,'s:',s?.slice(0,80));if(s&&s.startsWith('Demo collection ready'))break;await new Promise(r=>setTimeout(r,5000));}
console.log('errors',errs.slice(0,3));await b.close();})();
