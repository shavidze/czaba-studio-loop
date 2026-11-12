import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const br=await chromium.launch();
const ctx=await br.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();
p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text().slice(0,150))});
const t=Date.now();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:180000});
for(let i=0;i<12;i++){await p.waitForTimeout(5000);const b=(await p.locator('body').innerText()).slice(0,300).replace(/\n/g,' | ');console.log(Date.now()-t,b);if(/Demo collection ready/.test(await p.locator('body').innerText()))break;}
await p.screenshot({path:`${process.argv[2]}/probe.png`});
await br.close();
