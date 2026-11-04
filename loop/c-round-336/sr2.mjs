import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab?preview=middle-east',{waitUntil:'networkidle'});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
  await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
  await p.waitForTimeout(1000);
  for (const part of ['Pulse','Bass','Pad','Melody']) {
    const hdr=p.getByTestId('arrangement-track-header').filter({hasText:'Stems'}).first();
    await hdr.getByText(/^Stems/).first().click(); await p.waitForTimeout(200);
    await p.getByRole('button',{name:'All'}).first().click().catch(()=>{});
    await p.getByTestId('arrangement-library-list').getByRole('option',{name:new RegExp(part)}).first().click();
    await p.waitForTimeout(200); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  }
  const m=await p.evaluate(()=>{
    const l=document.querySelector('[data-testid="arrangement-library-list"]'); const lr=l.getBoundingClientRect();
    const opts=[...l.querySelectorAll('[role=option]')].map(o=>{const r=o.getBoundingClientRect();return {t:o.textContent.replace(/\s+/g,' ').trim().slice(0,40),top:Math.round(r.top*10)/10,bottom:Math.round(r.bottom*10)/10}});
    const vis=opts.filter(o=>o.bottom>lr.top&&o.top<lr.bottom);
    return {listTop:lr.top,listBottom:lr.bottom,scrollTop:l.scrollTop,first:vis[0],last:vis[vis.length-1],n:opts.length,
      active:document.body.innerText.match(/Active track:[^\n]*/)?.[0], status:document.querySelector('[data-testid=arrangement-status]')?.textContent.trim()};
  });
  res[w]=m; await p.screenshot({path:`c-round-336/screens/sr2-${w}x${h}.png`}); await ctx.close();
}
writeFileSync('c-round-336/sr2.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
await b.close();
