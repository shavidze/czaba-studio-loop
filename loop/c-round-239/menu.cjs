const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const fs=require('fs');
(async()=>{const b=await chromium.launch();const out=[];
for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
for (const seed of [false,true]){
const p=await (await b.newContext({viewport:vp})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForFunction(()=>document.querySelector('[data-testid="arrangement-status"]')?.textContent.startsWith('Demo collection ready'),undefined,{timeout:120000});await p.waitForTimeout(500);
if(seed){const row=p.locator('[data-source-id="demo-synth-mix"]').first();const btn=row.locator('button').first();await ((await btn.count())?btn:row).focus();await p.keyboard.press('Enter');await p.waitForTimeout(1500);}
await p.evaluate(()=>document.activeElement&&document.activeElement.blur());
for(let i=0;i<4;i++){await p.keyboard.press('Equal');await p.waitForTimeout(150);}
const g=()=>p.evaluate(()=>{const g=document.querySelector('[data-testid="arrangement-grid-control"]');return {mode:g.getAttribute('data-grid-mode'),division:g.getAttribute('data-grid-division'),status:document.querySelector('[data-testid="arrangement-status"]').textContent}});
const before=await g();
const lane=p.locator('[data-track-id] [data-grid-seconds]').nth(2);const lb=await lane.boundingBox();
const hb=await p.locator('[data-testid="arrangement-track-header"]').first().boundingBox();await p.mouse.click(hb.x+hb.width+250,lb.y+lb.height/2,{button:'right'});await p.waitForTimeout(400);
const menu=await p.evaluate(()=>{const m=document.querySelector('[data-testid="arrangement-grid-menu"]');if(!m)return null;return [...m.querySelectorAll('[role=menuitemradio],[role=menuitemcheckbox]')].map(e=>({role:e.getAttribute('role'),text:e.textContent.trim(),checked:e.getAttribute('aria-checked')}))});
await p.screenshot({path:`out/menu-${seed?'musical':'seconds'}-${vp.width}.png`});
const checked=menu&&menu.filter(m=>m.role==='menuitemradio'&&m.checked==='true').map(m=>m.text);
let chose=null,after=null;
if(menu){const target=menu.find(m=>m.role==='menuitemradio'&&m.checked!=='true');chose=target.text;await p.locator('[data-testid="arrangement-grid-menu"] [role=menuitemradio]',{hasText:target.text}).first().click();await p.waitForTimeout(400);after=await g();
for(let i=0;i<3;i++){await p.keyboard.press('Minus');await p.waitForTimeout(150);} after.afterZoom=(await g()).division;}
out.push({vp:vp.width,seed,before,checked,menu,chose,after,errs});}}
await b.close();fs.writeFileSync('out/menu.json',JSON.stringify(out,null,1));for(const o of out)console.log(o.vp,o.seed?'musical':'seconds','before',o.before.mode,o.before.division,'checked',JSON.stringify(o.checked),'chose',o.chose,'after',o.after&&[o.after.mode,o.after.division,o.after.status,'zoomed',o.after.afterZoom].join(' | '),'errs',o.errs.length)})();
