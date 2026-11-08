import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-401';
const b=await chromium.launch();const R={};
for (const [w,h] of [[1440,900],[1280,720]]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();const r={};
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:90000});
 await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
 await p.waitForTimeout(3000);
 r.lab={url:p.url(),title:await p.title(),workspace:await p.locator('[data-testid^="arrangement"]').count(),authUser:await p.evaluate(()=>localStorage.getItem('auth_user')),demoReady:await p.getByText('Demo collection ready').first().isVisible().catch(()=>false)};
 await p.screenshot({path:`${out}/auth-lab-${w}x${h}.png`});
 const resp=await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle',timeout:90000});await p.waitForTimeout(6000);
 r.studio={status:resp.status(),url:p.url(),signIn:await p.getByText('Sign in required').first().isVisible().catch(()=>false),audioSrc:await p.locator('audio[src]').count(),workspace:await p.locator('[data-testid^="arrangement"]').count(),authUser:await p.evaluate(()=>localStorage.getItem('auth_user'))};
 await p.screenshot({path:`${out}/auth-studio-${w}x${h}.png`});
 const t=await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=stem.mp3');
 r.token={status:t.status(),body:(await t.text()).slice(0,200),hasTokenField:/token/i.test(await t.text().catch(()=>''))};
 R[`${w}x${h}`]=r;await ctx.close();
}
await b.close();writeFileSync(out+'/auth401.json',JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));
