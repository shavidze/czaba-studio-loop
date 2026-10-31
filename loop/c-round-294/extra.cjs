const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
const fs=require('fs');const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));const BASE='http://127.0.0.1:5173';
(async()=>{const b=await chromium.launch();const out={};
for(const p of ['/','/store']){const c=await b.newContext({viewport:{width:1440,height:900}});const pg=await c.newPage();const r=await pg.goto(BASE+p,{waitUntil:'load'});await sleep(3000);
out[p]=await pg.evaluate(()=>({status:null,mainEls:document.querySelectorAll('main,[role=main]').length,h1:[...document.querySelectorAll('h1')].map(h=>h.textContent.trim().slice(0,60)),h2:[...document.querySelectorAll('h2')].slice(0,4).map(h=>h.textContent.trim().slice(0,50)),header:!!document.querySelector('header,nav'),footer:!!document.querySelector('footer'),textLen:document.body.innerText.length,errorBoundary:/Application Error|Unexpected Server Error|404/i.test(document.body.innerText.slice(0,500)),markers:document.querySelectorAll('[data-studio-theme]').length}));out[p].status=r.status();await c.close();}
// auth legacy with robust waits
const c=await b.newContext({viewport:{width:1440,height:900}});const pg=await c.newPage();const nav=[];pg.on('framenavigated',f=>{if(f===pg.mainFrame())nav.push(f.url())});
const r=await pg.goto(BASE+'/studio/middle-east',{waitUntil:'load'});await sleep(5000);await pg.waitForLoadState('load');await pg.waitForSelector('body',{timeout:15000});
out.legacy={status:r.status(),nav,url:pg.url(),...await pg.evaluate(()=>({signIn:document.body.innerText.includes('Sign in required'),audioSrc:document.querySelectorAll('audio[src]').length,authUser:localStorage.getItem('auth_user')}))};
await pg.screenshot({path:'shots/auth-legacy.png'});
out.token=await pg.evaluate(async()=>{const r=[];for(const m of ['GET','POST']){const x=await fetch('/api/studio-token?product=middle-east&file=stem-01.wav',{method:m});const t=await x.text();r.push({m,status:x.status,body:t.slice(0,200),hasToken:/token"\s*:\s*"[A-Za-z0-9._-]{10,}/.test(t)})}return r});
await c.close();await b.close();fs.writeFileSync('extra.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));})();
