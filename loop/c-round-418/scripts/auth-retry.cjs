const { chromium } = require('/home/runner/czaba-project/store/node_modules/playwright');
(async()=>{const b=await chromium.launch();const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'domcontentloaded',timeout:120000});
await p.waitForTimeout(15000);
const body=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g,' ').slice(0,200);
const r={authUser:await p.evaluate(()=>localStorage.getItem('auth_user')),body,signIn:/Sign in required/i.test(body),audioSrc:await p.locator('audio[src]').count(),tl:await p.locator('[data-testid="arrangement-timeline-scroller"]').count(),token:(await p.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3')).status()};
await p.screenshot({path:'shots/auth-premium-1440x900-retry.png'});console.log(JSON.stringify(r));await b.close();})();
