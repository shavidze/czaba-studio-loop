import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-505/';
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
 const c = await b.newContext({viewport:{width:w,height:h}}); const p = await c.newPage();
 for (const u of ['/studio/1','/account/downloads','/studio-lab']) {
  await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'load',timeout:90000}).catch(e=>console.log('err',u,e.message.slice(0,60)));
  await p.waitForSelector('body',{timeout:30000}).catch(()=>{}); await p.waitForTimeout(6000);
  const t = await p.evaluate(()=>({signin:/Sign in required/i.test((document.body?document.body.innerText:'')), dl:[...document.querySelectorAll('a')].filter(a=>/download/i.test(a.href)&&!/free-downloads/.test(a.href)).length, h1:(document.querySelector('h1')||{}).innerText, url:location.pathname}));
  console.log(w,u,JSON.stringify(t));
  if(u==='/studio-lab') await p.screenshot({path:out+`studio-lab-${w}.png`});
 }
 await c.close();
}
await b.close();
