import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const B='http://127.0.0.1:5173';const br=await chromium.launch();
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto(B+'/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const clk=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim()));return e&&e.textContent.trim()});
const names=await p.getByRole('button').evaluateAll(l=>l.map(b=>b.getAttribute('aria-label')||b.textContent.trim()).filter(t=>/play|stop|pause/i.test(t)));console.log(names);
const log=[];const t0=Date.now();
await p.getByRole('button',{name:/^play/i}).first().click();
for(let i=0;i<6;i++){await p.waitForTimeout(400);log.push([Date.now()-t0,await clk()])}
await p.getByRole('button',{name:/^(stop|pause)/i}).first().click();
for(let i=0;i<3;i++){await p.waitForTimeout(400);log.push(['after-stop',await clk()])}
console.log(JSON.stringify(log));await br.close();
