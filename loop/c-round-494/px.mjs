import { createRequire } from 'node:module';
import { writeFileSync, readFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const b = await chromium.launch(); const res = {};
const shot = async (base,w,h) => { const ctx = await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{ try{ localStorage.setItem('czaba_lead_magnet', JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().slice(0,10),dismissed:true,submitted:false})); localStorage.setItem('auth_user', JSON.stringify({id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',accessToken:'stub-token',refreshToken:'stub-refresh',expiresAt:'2099-01-01T00:00:00Z'})); }catch{} });
  await ctx.route('**/api/auth/profile', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:{id:7,email:'probe@example.invalid',firstName:'Probe',lastName:'User',authProvider:'Email'}})}));
  await ctx.route('**/api/downloads**', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data:[]})}));
  const p = await ctx.newPage(); await p.goto(base+'/account',{waitUntil:'load'}); const t=p.getByText('Click to change password'); await t.waitFor({timeout:30000}); await p.waitForTimeout(2000); await t.click(); await p.waitForTimeout(1500);
  const buf = await p.screenshot(); await ctx.close(); return buf.toString('base64'); };
const page = await b.newPage();
for (const [w,h] of [[1440,900],[1280,720],[375,812]]) {
  const a = await shot('http://127.0.0.1:5196',w,h), c = await shot('http://127.0.0.1:5195',w,h);
  res[`${w}x${h}`] = await page.evaluate(async ([a,c])=>{ const L=(s)=>new Promise(r=>{const i=new Image(); i.onload=()=>{const k=document.createElement('canvas'); k.width=i.width;k.height=i.height; const x=k.getContext('2d'); x.drawImage(i,0,0); r(x.getImageData(0,0,i.width,i.height).data)}; i.src='data:image/png;base64,'+s}); const A=await L(a),B=await L(c); let n=0,n16=0,max=0; for(let i=0;i<A.length;i+=4){const d=Math.max(Math.abs(A[i]-B[i]),Math.abs(A[i+1]-B[i+1]),Math.abs(A[i+2]-B[i+2])); if(d>0)n++; if(d>16)n16++; if(d>max)max=d;} return {n,n16,max}; },[a,c]);
}
await b.close(); writeFileSync(`${out}/px.json`, JSON.stringify(res)); console.log(JSON.stringify(res));
