import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const B='http://127.0.0.1:5173', O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-501/';
const b = await chromium.launch(); const out={};
// C5 FD all 3 at 375
{ const c=await b.newContext({viewport:{width:375,height:812}}); await c.addInitScript(()=>localStorage.setItem('czaba_lead_magnet_dismissed','1')); const p=await c.newPage();
  await p.goto(B+'/free-downloads',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(3000);
  const l=p.getByRole('button',{name:'Download',exact:true}); out.fd375=[];
  for(let i=0;i<await l.count();i++){ out.fd375.push(await l.nth(i).evaluate(n=>{const r=n.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),n.scrollHeight<=n.clientHeight+1, getComputedStyle(n).whiteSpace]}))}
  await p.screenshot({path:O+'fd-375-full.png',fullPage:true}); await c.close(); }
for (const [w,h] of [[1440,900],[1280,720]]) {
  const c=await b.newContext({viewport:{width:w,height:h}}); const p=await c.newPage(); const errs=[]; p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,120))});
  for (const u of ['/studio/1','/account/downloads']) { await p.goto(B+u,{waitUntil:'load',timeout:90000}).catch(()=>{}); await p.waitForTimeout(4000);
    const t=(await p.locator('body').innerText({timeout:60000})).slice(0,400); out[u+w]={signIn:/sign in required/i.test(t),dl:await p.locator('a[href*="download"], a[download]').count(),url:p.url(), t:t.replace(/\s+/g,' ').slice(0,160)}; await p.screenshot({path:O+`c13${u.replace(/\W/g,'_')}-${w}.png`}); }
  await p.goto(B+'/studio-lab',{waitUntil:'load',timeout:90000}); await p.waitForTimeout(5000);
  out['lab'+w]={url:p.url(),title:await p.title(),h1:await p.locator('body').innerText({timeout:60000}).then(t=>t.replace(/\s+/g,' ').slice(0,150)),errs:errs.slice(0,3)}; await p.screenshot({path:O+`c13-studio-lab-${w}.png`}); await c.close(); }
fs.writeFileSync(O+'c13.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1)); await b.close();
