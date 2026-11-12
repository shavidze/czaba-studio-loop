import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const OUT='/home/runner/czaba-project/tmp/studio-real-loop/c-round-466';
const br=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const res={};
for (const [w,h] of [[1440,900],[1280,720]]){
  const r={};res[w]=r;
  const ctx=await br.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle',timeout:120000}).catch(()=>{});
  await p.getByText('Demo collection ready').first().waitFor({timeout:90000});
  r.authUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
  const before=await p.locator('[data-testid*="clip"]').count();
  const opt=p.getByRole('option').filter({hasText:'Full mix'}).first();
  await opt.focus();await p.keyboard.press('Enter');await p.waitForTimeout(1500);
  r.clipsBefore=before;r.clipsAfter=await p.locator('[data-testid*="clip"]').count();
  await p.screenshot({path:`${OUT}/lab-added-${w}.png`});
  await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle',timeout:120000}).catch(()=>{});
  await p.waitForTimeout(1500);
  r.signIn=await p.getByText(/Sign in required/i).count();
  r.audioSrc=await p.locator('audio[src]').count();
  await p.screenshot({path:`${OUT}/premium-${w}.png`});
  r.token=await p.evaluate(async()=>{const x=await fetch('/api/studio-token?product=middle-east&file=stem.mp3');return x.status;});
  await ctx.close();
}
fs.writeFileSync(`${OUT}/data/auth.json`,JSON.stringify(res,null,1));console.log(JSON.stringify(res,null,1));
await br.close();
