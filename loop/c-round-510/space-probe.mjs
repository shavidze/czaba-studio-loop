import { createRequire } from 'node:module';import fs from 'node:fs';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const out={};
for(const [w,h] of [[1440,900],[1280,720]]){for(const delay of [0,3000]){
 const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
 await p.getByText('Demo collection ready').first().waitFor({timeout:120000});await p.waitForTimeout(1200);
 const st=()=>p.evaluate(()=>document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent.trim());
 const clk=()=>p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&/^\d+:\d{2}\.\d+$/.test(x.textContent.trim()));return e&&e.textContent.trim()});
 const stat=()=>p.evaluate(()=>(document.querySelector('[role=status]')?.textContent||'').replace(/\s+/g,' ').slice(0,160));
 await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
 await p.waitForSelector('[data-clip-id]');await p.waitForTimeout(delay);
 const r={focus:await p.evaluate(()=>document.activeElement?.tagName+':'+(document.activeElement?.getAttribute('role')||'')+':'+(document.activeElement?.getAttribute('data-testid')||''))};
 r.statusAfterAdd=await stat();
 await p.keyboard.press('Space');const a=[];
 for(const t of [150,500,1000,1500]){await p.waitForTimeout(t===150?150:t===500?350:500);a.push([t,await st(),await clk()])}
 r.afterSpace1=a;r.status1=await stat();
 await p.keyboard.press('Space');await p.waitForTimeout(500);r.afterSpace2=[await st(),await clk()];
 out[`${w}x${h}-delay${delay}`]=r;await c.close();}}
console.log(JSON.stringify(out,null,1));await br.close();
