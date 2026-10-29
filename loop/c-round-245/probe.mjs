import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const ctx = await b.newContext({viewport:{width:1440,height:900}}); const p = await ctx.newPage();
const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text().slice(0,200))});
const t0=Date.now(); await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
console.log('load ms',Date.now()-t0);
try{await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:90000});console.log('scroller ms',Date.now()-t0);}catch(e){console.log('no scroller')}
await p.screenshot({path:'probe.png'}); console.log((await p.innerText('body')).slice(0,400)); console.log(errs.slice(0,10).join('\n'));
await b.close();
