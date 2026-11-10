import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const snap=()=>p.evaluate(()=>[...document.querySelectorAll('*')].filter(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim())).map(x=>(x.getAttribute('data-testid')||x.className.slice(0,30))+'='+x.textContent.trim()));
console.log('pre',await snap());
await p.getByRole('button',{name:'Play',exact:true}).click();
for(let i=0;i<4;i++){await p.waitForTimeout(500);console.log(i,await snap(),await p.getByRole('button',{name:/^(Play|Pause)$/}).first().getAttribute('aria-pressed'))}
await p.getByRole('button',{name:'Stop',exact:true}).click();await p.waitForTimeout(500);console.log('stop',await snap());
await p.getByText(/./,{}).first();console.log(await p.getByRole('status').allInnerTexts());
await br.close();
