import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O='http://127.0.0.1:5173';
const AUTH={id:7,email:'b@example.invalid',firstName:'T',accessToken:'s',refreshToken:'r'};
const CORS={'access-control-allow-origin':O,'access-control-allow-credentials':'true','access-control-allow-headers':'authorization, content-type, x-session-id','access-control-allow-methods':'GET, POST, PUT, DELETE, OPTIONS'};
const ok=(r,b)=>r.request().method()==='OPTIONS'?r.fulfill({status:204,headers:CORS}):r.fulfill({status:200,headers:CORS,contentType:'application/json',body:JSON.stringify({success:true,data:b})});
const CART={id:1,items:[{id:11,productId:1,productTitle:'Stub Track',productHandle:'stub-track',variantName:'Standard',unitPrice:29,quantity:1,total:29}],itemCount:1,subtotal:29,discountAmount:0,giftCardAmount:0,total:29};
const DL={products:[{isAvailable:true,productId:1,productTitle:'Stub Track',handle:'stub-track',category:'music',licenseType:'Universal',purchasedAt:'2026-01-01T00:00:00Z',orderNumber:'O-1'}]};
const CAT={productId:1,productTitle:'C',licenseType:'Universal',recordings:[{id:5,title:'Door slam',durationMs:2000,sampleRateHz:48000,bitDepth:24,channels:2,position:1}]};
const b=await chromium.launch();
for (const [id,path,name,section] of [['up','/cart','Upgrade'],['scene','/recordings/1','Create a scene'],['browse','/','Browse the Collection']]) {
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  await ctx.addInitScript((a)=>{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');localStorage.setItem('auth_user',JSON.stringify(a));},AUTH);
  const p=await ctx.newPage();
  await p.route(/\/api\/auth\/profile/,r=>ok(r,{id:7,email:'b@example.invalid',firstName:'T',lastName:'B',authProvider:'Email',emailVerified:true}));
  await p.route(/\/api\/cart(\?|$)/,r=>ok(r,CART));await p.route(/\/api\/downloads(\?|$)/,r=>ok(r,DL));await p.route(/\/api\/products\/1\/recordings/,r=>ok(r,CAT));
  await p.goto(O+path);await p.waitForTimeout(2500);
  const l=p.getByRole('link',{name:new RegExp(name)}).last();
  await l.scrollIntoViewIfNeeded();await p.waitForTimeout(1500);
  await l.focus();await p.keyboard.press('Shift+Tab');await p.keyboard.press('Tab');
  await p.waitForTimeout(800);const bx=await l.boundingBox();
  const info=await l.evaluate(e=>{const s=getComputedStyle(e);return [e.matches(':focus-visible'),s.outlineStyle,s.outlineWidth,s.outlineOffset,s.outlineColor]});
  await p.screenshot({path:`focus-${id}.png`,clip:{x:Math.max(0,bx.x-20),y:Math.max(0,bx.y-20),width:bx.width+40,height:bx.height+40}});
  console.log(id,JSON.stringify(info));
  await ctx.close();
}
await b.close();
