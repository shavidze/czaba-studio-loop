import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000});
await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Night Pulse|Middle East/}).first().click(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(()=>({tids:[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid))],btns:[...document.querySelectorAll('button,[role=slider],input')].map(e=>(e.getAttribute('aria-label')||e.title||e.textContent||'').trim().slice(0,40)).filter(Boolean)}))));
await b.close();
