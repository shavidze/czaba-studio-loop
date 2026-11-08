import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const res = {};
const browser = await chromium.launch(); const B='http://127.0.0.1:5173';
for (const [w,h] of [[1440,900],[1280,720]]) {
  const k=`${w}x${h}`; const r=res[k]={};
  const c2 = await browser.newContext({ viewport:{width:w,height:h} });
  const p2 = await c2.newPage();
  const t0=Date.now();
  try { await p2.goto(B+'/studio/middle-east',{waitUntil:'domcontentloaded',timeout:120000}); } catch(e){ r.gotoErr=String(e).slice(0,100); }
  await p2.waitForTimeout(8000);
  r.ms=Date.now()-t0;
  r.url=p2.url();
  r.authUser = await p2.evaluate(()=>localStorage.getItem('auth_user')).catch(e=>'ERR '+e);
  r.body = (await p2.evaluate(()=>document.body.innerText).catch(e=>'ERR '+String(e).slice(0,80))).replace(/\s+/g,' ').slice(0,250);
  r.signIn = /Sign in required/i.test(r.body);
  r.audioSrc = await p2.locator('audio[src]').count();
  r.tl = await p2.locator('[data-testid="arrangement-timeline-scroller"]').count();
  await p2.screenshot({path:`${out}/auth-premium-${k}.png`});
  const resp = await p2.request.get(B+'/api/studio-token?product=middle-east&file=stem.mp3');
  r.tokenStatus=resp.status(); r.tokenBody=(await resp.text()).slice(0,150);
  await c2.close();
}
await browser.close();
writeFileSync(`${out}/auth.json`,JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
