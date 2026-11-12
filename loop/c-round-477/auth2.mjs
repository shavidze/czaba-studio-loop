import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(3000);
console.log(p.url()); console.log((await p.innerText('body')).slice(0,500)); console.log('audio',await p.$$eval('audio,audio source',e=>e.map(x=>x.src)));
await p.screenshot({path:'auth-studio.png'}); await b.close();
