import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));
const resp=await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load',timeout:60000});
await p.waitForTimeout(15000);
console.log(JSON.stringify({status:resp.status(),text:(await p.innerText('body')).slice(0,400),sign:await p.getByText(/Sign in required/i).count(),audio:await p.locator('audio[src]').count(),errs}));
await p.screenshot({path:'auth-studio-product.png'});await br.close();
