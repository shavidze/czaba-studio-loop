import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const res = {}; const b = await chromium.launch();
for (const [tag, base] of [['tree','http://127.0.0.1:5195'],['head','http://127.0.0.1:5196']]) for (const [w,h] of [[1440,900],[1280,720],[375,812]]) for (const mode of ['mouse','keyboard']) {
  const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('czaba_lead_magnet', JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().slice(0,10),dismissed:true,submitted:false})); localStorage.setItem('auth_user', JSON.stringify({id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',accessToken:'stub-token',refreshToken:'stub-refresh',expiresAt:'2099-01-01T00:00:00Z'})); }catch{} });
  await ctx.route('**/api/auth/profile', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',authProvider:'Email'}})}));
  await ctx.route('**/api/downloads**', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:[]})}));
  const p = await ctx.newPage();
  await p.goto(`${base}/account`,{waitUntil:'load'});
  const trig = p.getByText('Click to change password'); await trig.waitFor({timeout:30000}); await p.waitForTimeout(2000);
  if (mode==='mouse') await trig.click(); else { await p.evaluate(()=>document.querySelector('[type="button"]:has(+*), button')&&0); await trig.focus(); await p.keyboard.press('Enter'); }
  await p.waitForTimeout(1200);
  const info = await p.evaluate(()=>{const a=document.activeElement; const cs=getComputedStyle(a); return {name:a.getAttribute('aria-label')||a.id, outline:cs.outlineStyle+' '+cs.outlineWidth, color:cs.outlineColor, fv:a.matches(':focus-visible')}});
  const inp = p.getByLabel('Current Password', {exact:true}).first();
  await inp.screenshot({path:`${out}/shots/c7-${tag}-${mode}-${w}x${h}.png`}).catch(e=>{info.shotErr=String(e).slice(0,80)});
  res[`${tag}-${mode}-${w}x${h}`]=info; await ctx.close();
}
await b.close(); writeFileSync(`${out}/c7.json`, JSON.stringify(res,null,1)); console.log(JSON.stringify(res));
