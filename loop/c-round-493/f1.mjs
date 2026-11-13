import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out='/home/runner/czaba-project/tmp/studio-real-loop/c-round-493';
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('czaba_lead_magnet', JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().slice(0,10),dismissed:true,submitted:false})); localStorage.setItem('auth_user', JSON.stringify({id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',accessToken:'stub-token',refreshToken:'stub-refresh',expiresAt:'2099-01-01T00:00:00Z'})); }catch{} });
  await ctx.route('**/api/auth/profile', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',authProvider:'Email'}})}));
  await ctx.route('**/api/downloads**', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:[]})}));
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/account',{waitUntil:'load'});
  await p.getByText('Click to change password').waitFor({timeout:30000}); await p.waitForTimeout(1500);
  await p.getByText('Click to change password').click(); await p.waitForTimeout(700);
  const r = await p.evaluate(()=>{ const d=document.querySelector('[role="dialog"]'); const bd=d?.parentElement; const bb=bd?.getBoundingClientRect(); const H=innerHeight;
    const hit=(y)=>{const e=document.elementFromPoint(300,y); return {y, tag:e?.tagName, inDialogRoot:!!(bd&&e&&bd.contains(e)), role:e?.closest('[role="dialog"]')?!0:!1}};
    return {fixedAncestor:bd?.className.slice(0,80), dialog:!!d, backdropBox: bb&&[bb.x,bb.y,bb.width,bb.height], H, hits:[10,H/2,H-60,H-30,H-5].map(y=>hit(Math.round(y)))}; });
  res[`${w}x${h}`]=r;
  await p.screenshot({path:`${out}/shots/f1-open-${w}x${h}.png`});
  await p.mouse.click(300,h-10); await p.waitForTimeout(600);
  res[`${w}x${h}`].dialogOpenAfterBottomStripClick = await p.locator('[role="dialog"]').count();
  await ctx.close();
}
await b.close(); writeFileSync(`${out}/f1.json`, JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
