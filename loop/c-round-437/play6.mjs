import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
p.on('console',m=>{if(m.type()!=='log')console.log('CON',m.type(),m.text().slice(0,200))});p.on('pageerror',e=>console.log('ERR',e.message.slice(0,200)));
p.on('requestfailed',r=>console.log('RF',r.url().slice(0,100)));
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const pb=p.getByRole('button',{name:'Play',exact:true});
for(let k=0;k<3;k++){await pb.click();await p.waitForTimeout(1500);console.log(k,await pb.getAttribute('data-playing'),await p.getByTestId('arrangement-position').innerText(),await p.getByTestId('arrangement-playhead').getAttribute('style'),await p.getByTestId('arrangement-status').innerText())}
await br.close();
