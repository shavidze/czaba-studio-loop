import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE='http://127.0.0.1:5173'; const out='extra'; fs.mkdirSync(out,{recursive:true});
const ORIGIN=BASE; const CORS={'access-control-allow-origin':ORIGIN,'access-control-allow-credentials':'true','access-control-allow-headers':'authorization, content-type, x-session-id','access-control-allow-methods':'GET, POST, PUT, DELETE, OPTIONS'};
const ok=(r,b)=>r.request().method()==='OPTIONS'?r.fulfill({status:204,headers:CORS}):r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({success:true,data:b})});
const EMPTY={id:1,items:[],itemCount:0,subtotal:0,discountAmount:0,giftCardAmount:0,total:0};
const res={}; const browser=await chromium.launch();
const mk=async(w,h,auth)=>{const ctx=await browser.newContext({viewport:{width:w,height:h}});await ctx.addInitScript((a)=>{try{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');if(a)localStorage.setItem('auth_user',JSON.stringify(a));}catch{}},auth||null);const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(String(e).slice(0,150)));return [ctx,p];};
const st=(sel)=>(e)=>{const c=getComputedStyle(e);return {bg:c.backgroundColor,border:`${c.borderTopWidth} ${c.borderTopStyle} ${c.borderTopColor}`,color:c.color,opacity:c.opacity,cursor:c.cursor};};
// C3 mouse-down opacity on unknown Buy Now
{ const [ctx,p]=await mk(1440,900); await p.route(/\/api\/cart(\?|$)/,r=>ok(r,EMPTY));
  await p.route(/\/products\/harbour-lights\?.*_data=/,async r=>{const f=await r.fetch();const j=await f.json();const q=j.product;q.standardPrice=null;q.premiumPrice=null;q.minPrice=null;q.variants=(q.variants||[]).map(v=>({...v,price:null}));await r.fulfill({response:f,json:j});});
  await p.goto(BASE+'/products/middle-east',{waitUntil:'load'});await p.waitForTimeout(4000);
  await p.evaluate(async()=>{await window.__remixRouter.navigate('/products/harbour-lights');});await p.waitForTimeout(3000);
  const b=p.locator('button',{hasText:/^\s*Buy Now\s*$/}).first(); await b.scrollIntoViewIfNeeded();
  const bb=await b.boundingBox(); await p.mouse.move(bb.x+bb.width/2,bb.y+bb.height/2); await p.mouse.down(); await p.waitForTimeout(400);
  res.C3_mousedown=await b.evaluate((e)=>({ad:e.getAttribute('aria-disabled'),opacity:getComputedStyle(e).opacity,cursor:getComputedStyle(e).cursor}));
  await p.screenshot({path:out+'/c3-mousedown.png'}); await p.mouse.up(); await ctx.close(); }
// C6b hover
{ const [ctx,p]=await mk(1440,900,{id:7,email:'b@example.invalid',firstName:'T',accessToken:'s',refreshToken:'r'});
  await p.route(/\/api\/auth\/profile/,r=>ok(r,{id:7,email:'b@example.invalid',firstName:'T',lastName:'B',authProvider:'Email',emailVerified:true}));
  await p.route(/\/api\/downloads(\?|$)/,r=>ok(r,{products:[{isAvailable:true,productId:6,productTitle:'Stub',handle:'door-slams',category:'sfx',licenseType:'Universal',purchasedAt:'2026-01-01T00:00:00Z',orderNumber:'O-1'}]}));
  await p.route(/\/api\/cart(\?|$)/,r=>ok(r,EMPTY));
  await p.goto(BASE+'/products/door-slams',{waitUntil:'load'});await p.waitForTimeout(4000);
  const l=p.locator('a',{hasText:/^\s*Open in Studio\s*$/}).first();await l.scrollIntoViewIfNeeded();
  res.C6b_open_rest=await l.evaluate(st());await l.hover();await p.waitForTimeout(500);res.C6b_open_hover=await l.evaluate(st());
  const bb=await l.boundingBox();await p.screenshot({path:out+'/c6b-open-hover.png',clip:{x:Math.max(0,bb.x-20),y:Math.max(0,bb.y-20),width:bb.width+400,height:bb.height+40}});
  res.errs_hover=p.errs; await ctx.close(); }
{ const [ctx,p]=await mk(1440,900); await p.route(/\/api\/cart(\?|$)/,r=>ok(r,EMPTY));
  await p.goto(BASE+'/products/middle-east',{waitUntil:'load'});await p.waitForTimeout(4000);
  const b=p.locator('button',{hasText:/^\s*Add to Cart\s*$/}).first();await b.scrollIntoViewIfNeeded();
  res.C6b_cart_rest=await b.evaluate(st());await b.hover();await p.waitForTimeout(500);res.C6b_cart_hover=await b.evaluate(st());
  await p.screenshot({path:out+'/c6b-cart-hover.png'});
  // C8 anon journey
  await p.goto(BASE+'/store',{waitUntil:'load'});await p.waitForTimeout(3000);await p.screenshot({path:out+'/c8-1-store.png'});
  await p.goto(BASE+'/products/middle-east',{waitUntil:'load'});await p.waitForTimeout(3500);await p.screenshot({path:out+'/c8-2-product.png'});
  res.C8_before=await p.locator('input[type=email]').count();
  await p.locator('button',{hasText:/^\s*Buy Now\s*$/}).first().click();await p.waitForTimeout(2500);
  res.C8_after=await p.locator('input[type=email]').count();res.C8_dialog=await p.locator('[role=dialog]').count();
  await p.screenshot({path:out+'/c8-3-signin.png'});res.C8_errs=p.errs;await ctx.close(); }
// C13 protection fresh context
for (const [w,h] of [[1440,900],[1280,720]]) { const [ctx,p]=await mk(w,h);
  for (const path of ['/studio/middle-east','/account/downloads']) { await p.goto(BASE+path,{waitUntil:'load'});await p.waitForTimeout(3500);
    res[`C13_${path}_${w}`]={signin:await p.locator('text=/Sign in required/i').count(),dl:await p.locator('a[href*="download" i]:not([href="/account/downloads"])').count(),url:p.url()};
    await p.screenshot({path:`${out}/c13-${path.replace(/\W/g,'_')}-${w}.png`}); }
  if(w===1440){ const r=await p.request.get(BASE+'/api/studio-token?product=middle-east&file=stem.mp3'); res.C13_token={status:r.status(),body:(await r.text()).slice(0,200)}; }
  await p.goto(BASE+'/studio-lab',{waitUntil:'load'});await p.waitForTimeout(5000);
  res[`C13_studiolab_${w}`]={title:await p.title(),h:await p.locator('text=/Studio|Arrangement/').count()};await p.screenshot({path:`${out}/c13-studiolab-${w}.png`});
  await ctx.close(); }
await browser.close(); fs.writeFileSync(out+'/extra.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res));
