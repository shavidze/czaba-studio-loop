import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const out={};
for(const [w,h] of [[1440,900],[1280,720]]){
const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
await p.waitForFunction(()=>/ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent??''),null,{timeout:180000});
const opt=p.getByRole('listbox',{name:'Sounds'}).getByRole('option').first();await opt.click();await p.keyboard.press('Enter');
await p.waitForTimeout(1500);
const pb=()=>p.evaluate(()=>({st:document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent,status:document.querySelector('[data-testid="arrangement-status"]')?.textContent,clips:document.querySelectorAll('[data-testid^="arrangement-clip"]').length}));
out[w]={before:await pb()};
await p.keyboard.press('Escape');await p.locator('body').click({position:{x:5,y:5}}).catch(()=>{});
await p.keyboard.press('Space');await p.waitForTimeout(1500);out[w].playing=await pb();
out[w].clock=await p.evaluate(()=>[...document.querySelectorAll('[data-testid*=clock],[data-testid*=time]')].map(e=>e.textContent).slice(0,3));
await p.keyboard.press('Space');await p.waitForTimeout(300);out[w].stopped=await pb();
await p.screenshot({path:`/home/runner/czaba-project/tmp/studio-real-loop/c-round-442/play-${w}.png`});await c.close();}
await br.close();console.log(JSON.stringify(out,null,1));
