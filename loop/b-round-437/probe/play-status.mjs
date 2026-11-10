import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const out={};
for(const [w,h] of [[1440,900],[1280,720]]){
const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const pb=p.getByRole('button',{name:'Play',exact:true});const t0=Date.now();await pb.click();
const log=[];let last='';
for(let i=0;i<70;i++){const s=await p.getByTestId('arrangement-status').innerText().catch(()=>'?');const pl=await pb.getAttribute('data-playing').catch(()=>'?');const k=s+'|'+pl;if(k!==last){log.push([Date.now()-t0,s,pl]);last=k}await p.waitForTimeout(100)}
await pb.click();await p.waitForTimeout(1500);
log.push(['second-click',await p.getByTestId('arrangement-status').innerText(),await pb.getAttribute('data-playing'),await p.getByTestId('arrangement-position').innerText()]);
out[w]=log;await p.screenshot({path:`play-status-${w}.png`});await c.close()}
await br.close();console.log(JSON.stringify(out,null,1));
