import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForSelector('[data-clip-id]');
const snap=()=>p.evaluate(()=>{const o={};document.querySelectorAll('[data-testid]').forEach(e=>{const t=e.getAttribute('data-testid');if(/position|clock|playhead|time|status|marker/i.test(t))o[t]=(e.textContent||'').trim().slice(0,60)+'|'+(e.getAttribute('style')||'').slice(0,60)});return o});
console.log(JSON.stringify(await snap()));
await p.getByRole('button',{name:'Play',exact:true}).click();
for(let i=0;i<4;i++){await p.waitForTimeout(700);console.log(JSON.stringify(await snap()))}
console.log(await p.getByRole('button',{name:'Play',exact:true}).evaluate(b=>b.outerHTML.slice(0,300)));
await br.close();
