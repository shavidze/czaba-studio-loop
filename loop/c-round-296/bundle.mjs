import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext()).newPage(); const urls = [];
p.on('request', (r) => urls.push(r.url()));
await p.goto('http://127.0.0.1:5173/products/middle-east', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(JSON.stringify({ demo: urls.filter((u) => /studio-lab-demo|arrangement\/|ArrangementContext/.test(u)), links: urls.filter((u) => /studio-lab-links/.test(u)).length, total: urls.length }));
await b.close();
