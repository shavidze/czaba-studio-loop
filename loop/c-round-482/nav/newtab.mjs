import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const out=[];
const lm=()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:99,lastShown:Date.now(),dismissed:true,submitted:true}))}catch{}};
for(const [w,h] of [[1440,900],[1280,720]]){
 for(const mode of ['ctrl-click','middle-click','plain-click-3s']){
  const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(lm);const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/faq',{waitUntil:'load'});await p.waitForTimeout(2500);
  await p.evaluate(()=>{window.__mk=1;window.scrollTo(0,document.documentElement.scrollHeight)});await p.waitForTimeout(800);
  const link=p.locator('footer a[href="/support"]').first();await link.scrollIntoViewIfNeeded();
  const y0=await p.evaluate(()=>Math.round(scrollY));
  const np=ctx.waitForEvent('page',{timeout:4000}).catch(()=>null);
  if(mode==='ctrl-click')await link.click({modifiers:['Control']});
  else if(mode==='middle-click')await link.click({button:'middle'});
  else await link.click();
  const n=mode==='plain-click-3s'?null:await np;
  const r={w,mode,pages:ctx.pages().length};
  if(n){await n.waitForLoadState('domcontentloaded').catch(()=>{});r.newUrl=n.url()}
  await p.waitForTimeout(mode==='plain-click-3s'?400:1000);
  r.cur=await p.evaluate(()=>({path:location.pathname,y:Math.round(scrollY),mk:window.__mk===1}));r.y0=y0;
  if(mode==='plain-click-3s'){r.t400=r.cur;await p.waitForTimeout(2600);r.t3=await p.evaluate(()=>({path:location.pathname,y:Math.round(scrollY),mk:window.__mk===1}));
    await p.keyboard.press('Tab');r.firstTab=await p.evaluate(()=>{const e=document.activeElement;return e.tagName+' '+(e.getAttribute('href')||'')})}
  out.push(r);await ctx.close()}}
console.log(JSON.stringify(out,null,1));await b.close();
