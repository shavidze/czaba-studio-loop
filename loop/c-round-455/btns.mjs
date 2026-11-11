import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.addInitScript(()=>sessionStorage.setItem('czaba_entrance_seen','1'));
await p.goto(process.argv[2], { waitUntil: 'networkidle' });
console.log(await p.evaluate(() => [...document.querySelectorAll('button')].map(b => (b.getAttribute('aria-label')||'') + '|' + b.className.slice(0,60) + '|' + b.textContent.trim().slice(0,30)).join('\n')));
await b.close();
