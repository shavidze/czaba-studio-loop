import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const B='http://127.0.0.1:5173'; const out={};
const br=await chromium.launch();
let ctx=await br.newContext({viewport:{width:1440,height:900}});
await ctx.addInitScript(()=>{localStorage.setItem('czaba_lead_magnet_dismissed','1')});
let p=await ctx.newPage();
await p.goto(B+'/checkout/cancel',{waitUntil:'networkidle'}); await p.waitForTimeout(2000);
const l=p.getByRole('link',{name:'Return to Cart',exact:true}); const bb=await l.boundingBox();
await p.mouse.move(bb.x+20,bb.y+20); await p.mouse.down();
out.press=await l.evaluate(e=>({fv:e.matches(':focus-visible'),ol:getComputedStyle(e).outlineStyle,tr:getComputedStyle(e).transform}));
await p.mouse.up(); await ctx.close();
for (const [w,h] of [[1440,900],[1280,720]]) {
 const c=await br.newContext({viewport:{width:w,height:h}}); const pg=await c.newPage();
 const errs=[]; pg.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120))});
 await pg.goto(B+'/studio-lab',{waitUntil:'networkidle'}); await pg.waitForTimeout(2500);
 out['lab'+w]={url:pg.url(),title:await pg.title(),body:(await pg.innerText('body')).slice(0,200),errs:errs.length, hasPrem: await pg.getByText(/sign in|log in/i).count()};
 await pg.screenshot({path:`c-round-498/lab-${w}.png`}); 
 await pg.goto(B+'/studio/some-product',{waitUntil:'networkidle'}).catch(()=>{}); await pg.waitForTimeout(1500);
 out['prot'+w]={url:pg.url(),body:(await pg.innerText('body')).slice(0,160).replace(/\n/g,' | ')};
 await c.close();
}
fs.writeFileSync('c-round-498/extra.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1));
await br.close();
