import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-400';
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:1440,height:900}});
const p=await ctx.newPage();p.on('console',m=>{if(m.type()==='error')console.error('CE',m.text().slice(0,120))});
const res={};
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:"networkidle",timeout:90000});await p.waitForTimeout(8000);
res.labTitle=await p.title();res.labUrl=p.url();
res.labHasClipLib=await p.getByText(/Library|Arrangement/i).first().isVisible().catch(()=>false);
await p.screenshot({path:out+'/auth-studio-lab-1440.png'});
for (const h of ['premium-test','test-product']){
 const r=await p.goto('http://127.0.0.1:5173/studio/'+h,{waitUntil:"networkidle",timeout:90000});await p.waitForTimeout(8000);
 res['studio_'+h]={status:r.status(),url:p.url(),signIn:await p.getByText(/sign in|log in/i).first().isVisible().catch(()=>false),workspace:await p.locator('[data-testid^="arrangement"]').count()};
 await p.screenshot({path:out+`/auth-studio-${h}.png`});
}
const t=await ctx.request.get('http://127.0.0.1:5173/api/studio-token?product=premium-test&file=a.wav');
res.token={status:t.status(),body:(await t.text()).slice(0,150)};
console.log(JSON.stringify(res,null,1));await b.close();
