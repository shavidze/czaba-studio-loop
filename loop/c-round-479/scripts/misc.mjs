import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE='http://127.0.0.1:5173';const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-479';
const b=await chromium.launch();const out={};
const seed=()=>{const d=new Date().toISOString().split('T')[0];localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:d,dismissed:true,submitted:true}));};
// view all
{const ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(seed);const p=await ctx.newPage();await p.goto(BASE+'/',{waitUntil:'networkidle'});await p.waitForTimeout(3500);await p.evaluate(()=>{window.__probeMarker='alive'});
 const l=p.locator('a',{hasText:'Browse the Collection'}).first();out.viewAllCount=await p.locator('a',{hasText:'Browse the Collection'}).count();out.viewAllHref=await l.getAttribute('href');await l.evaluate(e=>e.scrollIntoView({block:'center'}));await p.waitForTimeout(900);const bx=await l.boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(2500);
 out.viewAll=await p.evaluate(()=>({path:location.pathname,marker:window.__probeMarker,active:document.activeElement.tagName,y:scrollY,tab:document.body.getAttribute('tabindex')}));await p.keyboard.press('Tab');out.viewAllTab=await p.evaluate(()=>document.activeElement.getAttribute('href'));await ctx.close();}
// C11
for(const v of [{width:1440,height:900},{width:1280,height:720}]){
 const ctx=await b.newContext({viewport:v});const p=await ctx.newPage();
 await p.goto(BASE+'/studio/middle-east',{waitUntil:'load',timeout:90000});await p.waitForTimeout(6000);
 const txt=await p.evaluate(()=>({t:document.body.innerText.slice(0,300),audioSrc:[...document.querySelectorAll('audio,source')].filter(e=>e.src).length}));
 await p.screenshot({path:`${OUT}/c11-studio-${v.width}.png`});
 const api=await ctx.request.get(BASE+'/api/studio-token?product=middle-east&file=x');
 await p.goto(BASE+'/studio-lab',{waitUntil:'load',timeout:90000});await p.waitForTimeout(8000);
 const lab=await p.evaluate(()=>({path:location.pathname,t:document.body.innerText.slice(0,200)}));
 await p.screenshot({path:`${OUT}/c11-lab-${v.width}.png`});
 out['c11_'+v.width]={studio:txt,apiStatus:api.status(),lab};await ctx.close();}
// C13 not seeded
console.log(JSON.stringify(out,null,1));await b.close();
