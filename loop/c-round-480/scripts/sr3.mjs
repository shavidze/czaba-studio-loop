import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1440,height:900}});
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
console.log(JSON.stringify(await p.evaluate(()=>{const ex=document.querySelector('[data-testid="arrangement-exit"]');return [ex,...ex.querySelectorAll('*')].map(e=>({tag:e.tagName,t:e.textContent.trim().slice(0,12),color:getComputedStyle(e).color}))})));
await b.close();
