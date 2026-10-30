// C276: text field focused + mouse click on unavailable Undo (new vs HEAD). usage: node c276-blur.cjs
const fs=require('fs');const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const out={};
for(const [label,base] of [['new','http://127.0.0.1:5173'],['head','http://127.0.0.1:5174']]){
 const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
 await p.goto(base+'/studio-lab');await p.waitForFunction(()=>/^Demo collection ready/.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent||''),undefined,{timeout:150000});await sleep(2000);
 const inp=p.getByTestId('arrangement-tempo-input');const r={};
 r.before=await inp.inputValue();await inp.click();await inp.fill('97');await sleep(200);
 r.activeBefore=await p.evaluate(()=>document.activeElement?.dataset?.testid||document.activeElement?.tagName);
 const undo=p.locator('[data-testid="arrangement-transport-edit"] button',{hasText:/^Undo/}).first();
 r.undoAttrs=await undo.evaluate(u=>({ad:u.getAttribute('aria-disabled'),dis:u.disabled}));
 const bb=await undo.boundingBox();await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await sleep(700);
 r.activeAfter=await p.evaluate(()=>document.activeElement?.dataset?.testid||document.activeElement?.tagName);
 r.inputValueAfter=await inp.inputValue();
 r.bpmAttr=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-bars-ruler"]')?.getAttribute('data-bpm'));
 r.status=await p.evaluate(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent);
 r.undoTitleAfter=await undo.getAttribute('title');
 out[label]=r;await ctx.close();}
fs.writeFileSync('c276-blur.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));await b.close();})();
