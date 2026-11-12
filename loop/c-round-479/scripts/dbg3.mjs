import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1440,height:900}});
await p.addInitScript(()=>{const d=new Date().toISOString().split('T')[0];localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:d,dismissed:true,submitted:true}));});
await p.goto('http://127.0.0.1:5175/',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(6000);
console.log(await p.evaluate(()=>({ga:[...document.scripts].map(s=>s.src).filter(s=>/gtag|google/.test(s)).length,btn:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>/Accept|Decline/.test(t)),ls:Object.keys(localStorage),links:[...document.querySelectorAll('a[href="/privacy"]')].map(a=>a.closest('footer')?'footer':'other')})));
await b.close();
