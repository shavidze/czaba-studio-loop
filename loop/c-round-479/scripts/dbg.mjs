import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
p.on('pageerror',e=>console.log('PE',e.message.slice(0,200)));
await p.goto('http://127.0.0.1:5173/faq',{waitUntil:'networkidle'});await p.waitForTimeout(3500);
console.log(await p.evaluate(()=>({f:document.querySelectorAll('footer').length,a:[...document.querySelectorAll('footer a')].map(a=>a.textContent+'|'+a.getAttribute('href')),t:document.title,h:document.body.innerText.slice(0,200)})));
await b.close();
