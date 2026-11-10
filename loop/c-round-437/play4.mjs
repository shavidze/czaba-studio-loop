import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const out={};
for(const [w,h] of [[1440,900],[1280,720]]){
const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const pos=()=>p.getByTestId('arrangement-position').innerText();
const t0=Date.now();await p.getByRole('button',{name:'Play',exact:true}).click();
const log=[];for(let i=0;i<14;i++){await p.waitForTimeout(500);log.push([Date.now()-t0,await pos()])}
await p.getByRole('button',{name:'Stop',exact:true}).click();
const s=[];for(let i=0;i<3;i++){await p.waitForTimeout(400);s.push(await pos())}
out[w]={log,afterStop:s};await c.close()}
console.log(JSON.stringify(out));await br.close();
