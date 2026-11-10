import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();
for(const mode of ['click','space','wait5-click']){
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
p.on('requestfailed',r=>console.log(mode,'RF',r.url().slice(-30),r.failure()?.errorText));
p.on('response',r=>{if(/mp3/.test(r.url()))console.log(mode,'RESP',r.status(),r.url().slice(-30))});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
if(mode==='wait5-click')await p.waitForTimeout(5000);
const pb=p.getByRole('button',{name:'Play',exact:true});
const act=async()=>mode==='space'?p.keyboard.press('Space'):pb.click();
const res=[];for(let k=0;k<3;k++){await act();await p.waitForTimeout(1200);res.push([await pb.getAttribute('data-playing').catch(()=>'?'),await p.getByTestId('arrangement-position').innerText()])}
console.log(mode,JSON.stringify(res));await c.close()}
await br.close();
