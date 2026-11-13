import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const O = process.argv[2]; const out={};
const b = await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}}); const p = await ctx.newPage(); const r = out[w]={};
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load',timeout:120000});
  await p.waitForFunction(()=>/Demo collection ready/.test(document.body.innerText),null,{timeout:90000});
  const t = (id)=>p.locator(`[data-testid="${id}"]`).first().innerText();
  const clips = ()=>p.evaluate(()=>document.querySelectorAll('[data-testid="arrangement-clip"]').length);
  r.clips0 = await clips();
  const opt = p.locator('[data-testid="arrangement-library-option-title"]').first();
  await opt.click(); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
  r.clips1 = await clips(); await p.screenshot({path:`${O}/c9/lab-added-${w}.png`});
  await p.locator('body').click({position:{x:5,y:5}}).catch(()=>{});
  await p.keyboard.press('Space'); await p.waitForTimeout(1500);
  r.state1 = await t('arrangement-playback-state'); r.clock1 = await t('arrangement-position');
  await p.screenshot({path:`${O}/c9/lab-playing-${w}.png`});
  await p.keyboard.press('Space'); await p.waitForTimeout(500);
  r.state2 = await t('arrangement-playback-state'); r.clock2 = await t('arrangement-position');
  await p.screenshot({path:`${O}/c9/lab-stopped-${w}.png`});
  r.authUser = await p.evaluate(()=>localStorage.getItem('auth_user'));
  await ctx.close();
}
writeFileSync(O+'/c9b.json',JSON.stringify(out,null,1)); await b.close(); console.log(JSON.stringify(out));
