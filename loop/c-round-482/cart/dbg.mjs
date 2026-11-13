import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1440,height:900}});
const cart={id:1,items:[{id:11,productId:1,productTitle:'Middle East',productHandle:'middle-east',unitPrice:29,quantity:1,total:29,variantName:'Standard'}],itemCount:1,subtotal:29,discountAmount:0,giftCardAmount:0,total:29};
await ctx.route('**/api/cart*',r=>{console.log('ROUTE',r.request().method(),r.request().url());return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'http://127.0.0.1:5173','access-control-allow-credentials':'true'},body:JSON.stringify(cart)})});
const p=await ctx.newPage();p.on('console',m=>console.log('C',m.text().slice(0,150)));p.on('request',r=>{if(/api\//.test(r.url()))console.log('REQ',r.method(),r.url())});
await p.goto('http://127.0.0.1:5173/cart',{waitUntil:'load'});await p.waitForTimeout(3000);
console.log(await p.locator('main').innerText().then(t=>t.slice(0,300)));await p.screenshot({path:'dbg.png'});await b.close();
