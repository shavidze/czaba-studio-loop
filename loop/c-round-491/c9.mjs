import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O = process.argv[2]; mkdirSync(O+'/c9',{recursive:true});
const out = {};
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}}); const p = await ctx.newPage();
  const r = out[`${w}x${h}`] = {};
  await p.goto('http://127.0.0.1:5193/account',{waitUntil:'load'}); await p.waitForTimeout(2500);
  const bt = await p.locator('body').innerText();
  r.account = {signInRequired:/Sign in required/i.test(bt), fullName:/Full Name/.test(bt), authUser: await p.evaluate(()=>localStorage.getItem('auth_user'))};
  await p.screenshot({path:`${O}/c9/account-${w}.png`});
  await p.goto('http://127.0.0.1:5193/studio/middle-east',{waitUntil:'load'}); await p.waitForTimeout(2500);
  const st = await p.locator('body').innerText();
  r.studioProtected = {signInRequired:/Sign in required/i.test(st), audioSrc: await p.locator('audio[src]').count()};
  await p.screenshot({path:`${O}/c9/studio-protected-${w}.png`});
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000}); 
  await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:90000}).catch(()=>{});
  const lt = await p.locator('body').innerText();
  r.lab = {ready:/Demo collection ready/.test(lt), authUser: await p.evaluate(()=>localStorage.getItem('auth_user')), clipsBefore: await p.locator('[data-testid^="arrangement-clip"], [data-clip-id]').count()};
  await p.screenshot({path:`${O}/c9/lab-ready-${w}.png`});
  r.lab.html = await p.evaluate(()=>[...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.dataset.testid.replace(/[0-9a-f-]{8,}/g,'*')))].slice(0,80));
  await ctx.close();
}
writeFileSync(O+'/c9.json',JSON.stringify(out,null,1)); await b.close();
