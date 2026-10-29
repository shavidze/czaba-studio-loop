const fs=require('node:fs');const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch();const R={};
for (const [w,h] of [[1440,900],[1280,720]]){const ctx=await b.newContext({viewport:{width:w,height:h},reducedMotion:'reduce'});const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForFunction(()=>{const s=document.querySelector('[data-testid="arrangement-status"]');return s&&s.textContent.startsWith('Demo collection ready');},undefined,{timeout:150000});await sleep(800);
await p.evaluate(()=>document.activeElement&&document.activeElement.blur());await p.keyboard.press('Shift+Slash');await sleep(500);
R[`${w}x${h}`]=await p.evaluate(()=>{const d=document.querySelector('[role="dialog"]');const scrollers=[d,...d.querySelectorAll('*')].filter(e=>{const cs=getComputedStyle(e);return /(auto|scroll)/.test(cs.overflowY)&&e.scrollHeight>e.clientHeight;}).map(e=>({tag:e.tagName,testid:e.getAttribute('data-testid'),scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,excess:e.scrollHeight-e.clientHeight}));
 const rows=[...d.querySelectorAll('[data-shortcut-id]')].map(li=>({id:li.getAttribute('data-shortcut-id'),h:Math.round(li.getBoundingClientRect().height)}));
 return {dialogRect:d.getBoundingClientRect().height,scrollers,rowCount:rows.length,tallRows:rows.filter(r=>r.h>24)};});
await p.screenshot({path:`${__dirname}/${w}x${h}-sheet-scroll.png`});await ctx.close();}
fs.writeFileSync(`${__dirname}/sheet-scroll.json`,JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));await b.close();})();
