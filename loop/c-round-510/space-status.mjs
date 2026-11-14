import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000});await p.waitForTimeout(1200);
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
await p.waitForSelector('[data-clip-id]');await p.keyboard.press('Space');await p.waitForTimeout(250);await p.screenshot({path:'/home/runner/czaba-project/tmp/studio-real-loop/c-round-510/space-after-add-1440.png'});console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('[aria-live],[role=status],[role=log]')].map(e=>e.textContent.replace(/\s+/g,' ').slice(0,150)))));
const out=[];for(let i=0;i<8;i++){await p.waitForTimeout(500);out.push(await p.evaluate(()=>{const t=document.body.innerText.replace(/\s+/g,' ');return [document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent.trim(),(t.match(/.{50}(Loading|loaded yet|Playing from).{50}/g)||[]).slice(0,3)]}))}
console.log(JSON.stringify(out));await br.close();
