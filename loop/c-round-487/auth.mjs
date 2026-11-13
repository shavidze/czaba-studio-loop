import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const B='http://127.0.0.1:5173'; const b=await chromium.launch(); const out={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage(); const r={};
  await p.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet',JSON.stringify({viewCount:0,lastResetDate:new Date().toISOString().slice(0,10),dismissed:true,submitted:false}))}catch{}});
  await p.goto(B+'/account',{waitUntil:'load'}); await p.waitForTimeout(3500);
  r.account={signIn:await p.getByText('Sign in required').count(), fullName:await p.getByText('Full Name',{exact:true}).count()};
  await p.screenshot({path:`auth-account-${w}.png`});
  await p.goto(B+'/studio-lab',{waitUntil:'load'}); await p.waitForTimeout(3500);
  r.lab={authUser:await p.evaluate(()=>localStorage.getItem('auth_user')),h1:await p.evaluate(()=>document.body.innerText.slice(0,120).replace(/\n/g,' | '))};
  await p.screenshot({path:`auth-lab-${w}.png`});
  await p.goto(B+'/studio/middle-east',{waitUntil:'load'}); await p.waitForTimeout(3500);
  r.studio={signIn:await p.getByText('Sign in required').count(), audioSrc:await p.locator('audio[src]').count()};
  out[`${w}x${h}`]=r; await ctx.close();
}
writeFileSync('auth.json',JSON.stringify(out,null,1)); await b.close();
