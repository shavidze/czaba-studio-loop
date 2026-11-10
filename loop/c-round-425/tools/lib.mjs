import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),null,{timeout:200000});
console.log(JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('button')].filter(x=>/^Add/.test(x.textContent.trim())||/^Add/.test(x.getAttribute('aria-label')||'')).map(x=>[x.textContent.trim(),x.getAttribute('aria-label'),x.disabled]))));
await b.close();
