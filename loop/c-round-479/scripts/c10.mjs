import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE='http://127.0.0.1:5175';const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-479';
const b=await chromium.launch();const out=[];
const seed=()=>{const d=new Date().toISOString().split('T')[0];localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:d,dismissed:true,submitted:true}));};
for(const v of [{width:1440,height:900},{width:1280,height:720}]){
 const ctx=await b.newContext({viewport:v});await ctx.addInitScript(seed);const p=await ctx.newPage();
 await p.goto(BASE+'/',{waitUntil:'networkidle',timeout:120000});await p.waitForTimeout(7000);await p.evaluate(()=>{window.__probeMarker='alive'});
 const banner=p.locator('body');
 const vis=await banner.count();
 await p.screenshot({path:`${OUT}/c10-banner-before-${v.width}.png`});
 const lk=p.locator('a[href="/privacy"]:not(footer a)').first();
 const tag=await lk.evaluate(e=>({dd:e.getAttribute('data-discover')}));
 await lk.click();await p.waitForTimeout(2500);
 out.push({vp:v.width,bannerCount:vis,tag,path:await p.evaluate(()=>location.pathname),marker:await p.evaluate(()=>window.__probeMarker),acceptAfter:await p.getByRole('button',{name:'Accept'}).count(),declineAfter:await p.getByRole('button',{name:'Decline'}).count(),bannerAfter:await p.locator('p',{hasText:/cookie/i}).count(),storedConsent:await p.evaluate(()=>Object.keys(localStorage).filter(k=>/consent/i.test(k)))});
 await p.screenshot({path:`${OUT}/c10-banner-after-${v.width}.png`});await ctx.close();}
console.log(JSON.stringify(out,null,1));await b.close();
