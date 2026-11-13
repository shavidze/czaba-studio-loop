import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D=process.argv[2];const b=await chromium.launch();const out={};
const cart={id:1,items:[{id:11,productId:1,productTitle:'Middle East',productHandle:'middle-east',unitPrice:29,quantity:1,total:29,variantName:'Standard'}],itemCount:1,subtotal:29,discountAmount:0,giftCardAmount:0,total:29};
for(const [w,h] of [[1440,900],[1280,720]]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});
 await ctx.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:99,lastShown:Date.now(),dismissed:true,submitted:true}))}catch{}});
 await ctx.route('**/api/cart',r=>{ if(r.request().method()==='GET') return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:cart})}); return r.continue();});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://127.0.0.1:5173/cart',{waitUntil:'load'});await p.waitForTimeout(3000);
 const r={items:await p.locator('[aria-label="Remove item"]').count()};
 if(r.items){await p.locator('[aria-label="Remove item"]').first().click();await p.waitForTimeout(800);
  r.dialog=await p.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]');if(!d)return null;
   const sc=[...d.querySelectorAll('*'),d].filter(e=>/styled-scrollbar/.test(e.className));
   const all=[...d.querySelectorAll('*')].filter(e=>getComputedStyle(e).overflowY==='auto'||getComputedStyle(e).overflowY==='scroll');
   const e=sc[0]||all[0];return{title:d.textContent.slice(0,60),styledClassHolders:sc.map(e=>e.className.slice(0,100)),overflowAuto:all.length,scrollbarColor:e?getComputedStyle(e).scrollbarColor:null,scrollbarWidth:e?getComputedStyle(e).scrollbarWidth:null,thumbRule:null}});
  await p.screenshot({path:`${D}/cart-dialog-${w}.png`});}
 r.errs=errs.filter(x=>!/cart|fetch/i.test(x));out[`${w}x${h}`]=r;await ctx.close()}
console.log(JSON.stringify(out,null,1));await b.close();
