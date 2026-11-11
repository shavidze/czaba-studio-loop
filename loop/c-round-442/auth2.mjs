import { createRequire } from 'node:module';
const require=createRequire('/home/runner/czaba-project/store/package.json');const {chromium}=require('@playwright/test');
const br=await chromium.launch();const out={};
const c=await br.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
out.studioLab={authUser:await p.evaluate(()=>localStorage.getItem('auth_user'))};
try{await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:90000});}catch(e){out.gotoErr=String(e).slice(0,100)}
await p.waitForTimeout(15000);
out.studio={url:p.url(),signIn:await p.getByText(/sign in required/i).count(),audioSrc:await p.locator('audio[src]').count()};
try{out.studio.body=(await p.evaluate(()=>document.body.innerText)).slice(0,200)}catch(e){out.bodyErr=String(e).slice(0,80)}
await p.screenshot({path:'/home/runner/czaba-project/tmp/studio-real-loop/c-round-442/auth-studio-product.png'});
const r=await p.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem.mp3');
out.token={status:r.status()};
await br.close();console.log(JSON.stringify(out,null,1));
