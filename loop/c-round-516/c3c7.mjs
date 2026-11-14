import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const out = {};
const base='http://127.0.0.1:5173';
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem('czaba_entrance_seen','1');localStorage.setItem('czaba_lead_magnet_dismissed','1');}catch{}});
  const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  await p.goto(base+'/',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
  const g=p.getByRole('link',{name:'Browse Gift Cards',exact:true}); await g.scrollIntoViewIfNeeded(); await g.click();
  await p.waitForURL('**/gift-cards',{timeout:15000}); await p.waitForTimeout(1500);
  const r1={url:p.url(),h1:await p.locator('h1').first().innerText().catch(()=>null)}; await p.screenshot({path:`extra/c3-gift-${w}.png`});
  await p.goBack({waitUntil:'networkidle'}); await p.waitForTimeout(1500);
  const c=p.getByRole('link',{name:'View Collection',exact:true}); await c.scrollIntoViewIfNeeded(); await c.click();
  await p.waitForURL('**/store',{timeout:15000}); await p.waitForTimeout(1500);
  const r2={url:p.url(),h1:await p.locator('h1').first().innerText().catch(()=>null)}; await p.screenshot({path:`extra/c3-store-${w}.png`});
  out['c3-'+w]={r1,r2,errs}; await ctx.close();
  for (const path of ['/studio/middle-east','/account/downloads']) {
    const ctx2=await b.newContext({viewport:{width:w,height:h}}); await ctx2.addInitScript(()=>{localStorage.setItem('czaba_lead_magnet_dismissed','1');sessionStorage.setItem('czaba_entrance_seen','1');});
    const q=await ctx2.newPage(); await q.goto(base+path,{waitUntil:'load'}); await q.waitForTimeout(9000);
    out[`prot-${w}${path}`]=await q.evaluate(()=>({signin:/Sign in required/i.test((document.body?.innerText||"")),links:[...document.querySelectorAll('a')].filter(a=>/download/i.test(a.href+a.innerText)).map(a=>a.getAttribute('href')+'|'+a.innerText.trim().slice(0,30))}));
    await q.screenshot({path:`extra/prot-${w}-${path.replace(/\W/g,'_')}.png`}); await ctx2.close();
  }
  const ctx3=await b.newContext({viewport:{width:w,height:h}}); const s=await ctx3.newPage(); await s.goto(base+'/studio-lab',{waitUntil:'load'}); await s.waitForTimeout(9000);
  out['lab-'+w]=await s.evaluate(()=>({title:document.title,hasCZABAStudio:/CZABA Studio/.test((document.body?.innerText||"")),lanes:document.querySelectorAll('[data-testid*=lane],[role=row]').length,txt:(document.body?.innerText||"").slice(0,200)}));
  await s.screenshot({path:`extra/lab-${w}.png`}); await ctx3.close();
}
const r=await (await b.newContext()).request.post(base+'/api/studio-token',{data:{}}); out.token=r.status();
console.log(JSON.stringify(out,null,1)); await b.close();
