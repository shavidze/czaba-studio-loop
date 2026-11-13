import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D=process.argv[2];const br=await chromium.launch();const out={};
const lm=()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:99,lastShown:Date.now(),dismissed:true,submitted:true}))}catch{}};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h}});await c.addInitScript(lm);const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 const r={};
 await p.goto('http://127.0.0.1:5173/hire-us',{waitUntil:'load'});await p.waitForTimeout(2500);
 r.hire={title:await p.title(),form:await p.locator('form').count(),inputs:await p.locator('form input, form textarea, form select').count(),h1:await p.locator('h1').first().textContent().catch(()=>null)};
 await p.screenshot({path:`${D}/hire-${w}.png`,fullPage:false});
 const glow=async(path,tag)=>{await p.goto('http://127.0.0.1:5173'+path,{waitUntil:'load'});await p.waitForTimeout(3500);
  const info=await p.evaluate(()=>{const sh=(e)=>e?getComputedStyle(e).boxShadow:null;
   const btns=[...document.querySelectorAll('button,a')].filter(e=>/btn|button/i.test(e.className)||e.querySelector('svg')===null&&false);
   const prim=[...document.querySelectorAll('button')].filter(b=>/bg-brand|bg-\[var\(--color-brand/.test(b.className)||/brand/.test(b.className)).slice(0,3).map(b=>({t:b.textContent.trim().slice(0,24),cls:b.className.slice(0,80),shadow:sh(b)}));
   const hdr=document.querySelector('header');return{prim,header:hdr?sh(hdr):null,headerChildren:[...(hdr?.querySelectorAll('*')||[])].map(e=>getComputedStyle(e).boxShadow).filter(s=>s!=='none').slice(0,5)}});
  const hv=await p.evaluate(()=>0);
  // hover first primary button
  const b=p.locator('button').filter({hasText:/add to cart|buy|get|view|browse|explore/i}).first();let hover=null;
  if(await b.count()){await b.scrollIntoViewIfNeeded().catch(()=>{});await b.hover().catch(()=>{});await p.waitForTimeout(500);hover=await b.evaluate(e=>({t:e.textContent.trim().slice(0,24),shadow:getComputedStyle(e).boxShadow}))}
  r[tag]={info,hover};await p.screenshot({path:`${D}/${tag}-${w}.png`});};
 await glow('/store','store');await glow('/products/middle-east','product');
 r.errs=errs;out[`${w}x${h}`]=r;await c.close()}
console.log(JSON.stringify(out,null,1));await br.close();
