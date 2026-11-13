import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D=process.argv[2];const b=await chromium.launch();const res={};
for(const [w,h] of [[1440,900],[1280,720]]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();const r={};
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
 r.authUser=await p.evaluate(()=>localStorage.getItem('auth_user'));r.title=await p.title();
 await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'load'}).catch(()=>{});await p.waitForTimeout(3500);
 r.studioUrl=p.url();r.signInRequired=await p.getByText('Sign in required').first().isVisible().catch(()=>false);
 r.audioSrc=await p.locator('audio[src]').count();r.timeline=await p.locator('[data-testid="arrangement-timeline-scroller"]').count();
 await p.screenshot({path:`${D}/auth-studio-${w}.png`});
 const resp=await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=a.mp3');
 r.token={status:resp.status(),body:(await resp.text()).slice(0,160)};r.tokenLeak=/"token"\s*:\s*"|ey[A-Za-z0-9_-]{10,}\./.test(r.token.body);
 res[`${w}x${h}`]=r;await ctx.close()}
console.log(JSON.stringify(res,null,1));await b.close();
