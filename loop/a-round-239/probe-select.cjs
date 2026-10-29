const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const res=[];for(const [w,h] of [[1440,900],[1280,720]]){const c=await b.newContext({viewport:{width:w,height:h}});const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(String(e)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});await p.getByText('Demo collection ready',{exact:false}).first().waitFor({timeout:30000});await p.waitForTimeout(800);
const g=()=>p.evaluate(()=>{const e=document.querySelector('[data-testid="arrangement-grid-control"]');const s=document.querySelector('[data-testid="arrangement-grid-division"]');return {mode:e.dataset.gridMode,division:e.dataset.gridDivision,value:s.value,focused:document.activeElement===s,title:s.title}});
const sel=p.locator('[data-testid="arrangement-grid-division"]');await sel.focus();const a=await g();await p.keyboard.press('Digit5');await p.waitForTimeout(150);const b1=await g();await p.keyboard.press('Digit5');await p.waitForTimeout(150);const b2=await g();
res.push({viewport:`${w}x${h}`,errors,before:a,after5:b1,after55:b2});await c.close();}
await b.close();require('fs').writeFileSync('probe-select.json',JSON.stringify(res,null,2));console.log(JSON.stringify(res,null,1));})();
