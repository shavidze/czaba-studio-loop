import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const base of process.argv.slice(2)) { const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
  await p.goto(base+'/studio-lab',{waitUntil:'load'});
  await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),null,{timeout:240000});
  console.log(base,'ready'); }
await b.close();
