const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const out=[];
for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
const p=await (await b.newContext({viewport:vp})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await p.waitForTimeout(500);
const g=()=>p.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');return g.getAttribute('data-grid-mode')+' '+g.getAttribute('data-grid-division')+' | '+document.querySelector('[data-testid="arrangement-status"]').textContent+' | '+(document.body.innerText.match(/[\d.]+ px\/s/)||[''])[0]});
const steps=[];const k=async(key,n=1,label)=>{for(let i=0;i<n;i++){await p.keyboard.press(key);await p.waitForTimeout(120);}steps.push((label||key+'x'+n)+' => '+await g());};
steps.push('mount => '+await g());
await k('Digit1',2); await k('Equal',10); await k('Digit2',1); await k('Minus',10,'back to load zoom');
// control: same without the zoom detour
await k('Digit5',1,'5 (fixed)'); await k('Digit5',1,'5 (adaptive, density reset)'); await k('Digit1',1); 
out.push({vp:vp.width,steps,errs});}
await b.close();fs.writeFileSync('out/density-skip.json',JSON.stringify(out,null,1));for(const o of out){console.log(o.vp,o.errs.length);o.steps.forEach(s=>console.log('  ',s))}})();
