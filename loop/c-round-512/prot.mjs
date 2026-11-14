import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b=await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) for (const path of ['/studio/middle-east','/account/downloads']) {
 const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(()=>{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');});
 const p=await ctx.newPage();await p.goto('http://127.0.0.1:5173'+path,{waitUntil:'load'});await p.waitForTimeout(7000);
 const r=await p.evaluate(()=>({signin:/Sign in required/i.test(document.body.innerText),links:[...document.querySelectorAll('a')].filter(a=>/download/i.test(a.href+a.innerText)).map(a=>a.getAttribute('href')+'|'+a.innerText.trim().slice(0,30)+'|'+Math.round(a.getBoundingClientRect().width)),h1:document.querySelector('h1,h2')?.innerText}));
 console.log(w,path,JSON.stringify(r)); await p.screenshot({path:`extra/prot-${w}-${path.replace(/\W/g,'_')}.png`}); await ctx.close();}
await b.close();
