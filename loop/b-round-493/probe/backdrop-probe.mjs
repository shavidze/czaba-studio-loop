import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const base = process.argv[2] || 'http://127.0.0.1:5173';
const out = process.argv[3];
const b = await chromium.launch(); const res = {base};
for (const [w,h] of [[1440,900],[1280,720],[375,812]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('czaba_lead_magnet', JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().slice(0,10),dismissed:true,submitted:false})); localStorage.setItem('auth_user', JSON.stringify({id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',accessToken:'stub-token',refreshToken:'stub-refresh',expiresAt:'2099-01-01T00:00:00Z'})); }catch{} });
  await ctx.route('**/api/auth/profile', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',authProvider:'Email'}})}));
  await ctx.route('**/api/downloads**', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:[]})}));
  const p = await ctx.newPage();
  await p.goto(`${base}/account`,{waitUntil:'load'});
  await p.getByText('Click to change password').waitFor({timeout:30000}); await p.waitForTimeout(2000);
  await p.getByText('Click to change password').click(); await p.waitForTimeout(1000);
  const r = await p.evaluate(()=>{
    const bd=document.querySelector('[data-testid="password-dialog-backdrop"]'); const bb=bd.getBoundingClientRect(); const H=innerHeight;
    let cb=null; for(let e=bd.parentElement;e;e=e.parentElement){const cs=getComputedStyle(e); if(cs.transform!=='none'||cs.filter!=='none'||cs.willChange.includes('transform')||cs.perspective!=='none'||cs.contain.includes('paint')){cb={tag:e.tagName,cls:e.className.slice(0,90),transform:cs.transform,willChange:cs.willChange,rect:(r=>[r.x,r.y,r.width,r.height])(e.getBoundingClientRect())};break;}}
    const hit=(y)=>{const e=document.elementFromPoint(Math.round(innerWidth/2),y); return {y, inBackdropOrDialog: !!(e&&(e===bd||e.closest('[role="dialog"]'))), tag:e?.tagName, cls:(e?.className||'').toString().slice(0,50)}};
    const ys=[]; for(let y=Math.floor(bb.bottom)-2;y<H;y+=4) ys.push(y);
    const firstOutside = ys.map(hit).find(x=>!x.inBackdropOrDialog);
    return {H, scrollY, backdropRect:[bb.x,bb.y,bb.width,bb.height], backdropBottom: bb.bottom, stripPx: Math.max(0, H-bb.bottom), containingBlockAncestor: cb, firstOutsideHit: firstOutside||null, hitNearBottom: hit(H-3)};
  });
  await p.screenshot({path:`${out}/backdrop-${w}x${h}.png`});
  if (r.stripPx > 4) { await p.mouse.click(Math.round(w/2), h-3); await p.waitForTimeout(800); }
  r.dialogCountAfterStripClick = await p.locator('[role="dialog"]').count();
  res[`${w}x${h}`]=r; await ctx.close();
}
await b.close(); writeFileSync(`${out}/backdrop-probe.json`, JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
