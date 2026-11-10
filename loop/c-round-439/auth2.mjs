import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded'});
const t0=Date.now();let r;
for(let i=0;i<30;i++){await p.waitForTimeout(2000);const txt=await p.evaluate(()=>document.body.innerText.slice(0,300));if(txt.trim()){r=txt;break;}}
console.log(JSON.stringify({ms:Date.now()-t0,text:r,signIn:await p.getByText(/sign in/i).count(),audioSrc:await p.locator('audio[src]').count(),url:p.url(),errs},null,1));
await p.screenshot({path:'auth-studio-product.png'});await br.close();
