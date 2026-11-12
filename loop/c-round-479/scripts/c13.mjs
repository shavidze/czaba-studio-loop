import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const BASE='http://127.0.0.1:5173';const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-479';
const b=await chromium.launch();const out={};
const seed=()=>{const d=new Date().toISOString().split('T')[0];localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:d,dismissed:true,submitted:true}));};
async function c13(from){const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();await p.goto(BASE+from,{waitUntil:'networkidle'});await p.waitForTimeout(3500);
 await p.evaluate(()=>{window.__probeMarker='alive'});
 for(let i=0;i<14;i++){await p.mouse.wheel(0,200);await p.waitForTimeout(60);}
 await p.waitForTimeout(800);
 const mid=await p.evaluate(()=>Math.round(scrollY/(document.documentElement.scrollHeight-innerHeight)*100));
 const dlg0=await p.locator('[role="dialog"]').count();
 const t0=Date.now();await p.evaluate(()=>[...document.querySelectorAll('footer a')].find(a=>a.textContent.trim()==='FAQ').click());await p.waitForTimeout(1200);
 const path=await p.evaluate(()=>({p:location.pathname,m:window.__probeMarker}));
 let opened=null;for(let i=0;i<14;i++){await p.waitForTimeout(1000);if(await p.locator('[role="dialog"]').count()){opened=Date.now()-t0;break;}}
 const r={from,scrollPctAtNav:mid,dialogBeforeNav:dlg0,afterNav:path,dialogOpenedMsAfterNav:opened,pathNow:await p.evaluate(()=>location.pathname)};await p.screenshot({path:`${OUT}/c13-after.png`});await ctx.close();return r;}
out.c13=await c13('/');
console.log(JSON.stringify(out,null,1));await b.close();
