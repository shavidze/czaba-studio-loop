import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const OUT = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-465';
const B = 'http://127.0.0.1:5173';
const res = {};
const br = await chromium.launch();
// warm
{ const p = await br.newPage(); for (const u of ['/studio-lab','/studio/middle-east']) { await p.goto(B+u,{waitUntil:'networkidle',timeout:180000}).catch(e=>console.log('warm',u,String(e).slice(0,80))); await p.waitForTimeout(4000);} await p.close(); }
for (const [w,h] of [[1440,900],[1280,720]]) {
  const r = {}; res[w] = r;
  const ctx = await br.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,150)));
  await p.goto(B+'/studio-lab',{waitUntil:'networkidle',timeout:120000}).catch(()=>{});
  await p.getByText('Demo collection ready').first().waitFor({timeout:60000}).catch(e=>r.readyErr=String(e).slice(0,100));
  r.authUser = await p.evaluate(()=>localStorage.getItem('auth_user'));
  r.title = await p.title();
  await p.screenshot({path:`${OUT}/lab-ready-${w}.png`});
  // smoke: audio graph probe
  await p.addInitScript(()=>{});
  const items = p.getByRole('option'); const cnt = await items.count().catch(()=>0); r.optionCount=cnt;
  r.libTexts = await p.evaluate(()=>[...document.querySelectorAll('[role=option],[role=treeitem],li,button')].slice(0,60).map(e=>(e.getAttribute('aria-label')||e.textContent||'').trim().slice(0,40)).filter(Boolean).slice(0,40));
  fs.writeFileSync(`${OUT}/data/probe-${w}.json`, JSON.stringify(r,null,1));
  // premium
  const p2 = await ctx.newPage();
  await p2.goto(B+'/studio/middle-east',{waitUntil:'networkidle',timeout:120000}).catch(()=>{});
  await p2.waitForTimeout(4000);
  r.premium = { hasSignIn: await p2.getByText('Sign in required').count(), audioSrc: await p2.locator('audio[src]').count(), authUser: await p2.evaluate(()=>localStorage.getItem('auth_user')), url:p2.url() };
  await p2.screenshot({path:`${OUT}/premium-${w}.png`});
  const api = await ctx.request.get(B+'/api/studio-token?product=middle-east&file=stem.mp3');
  r.tokenStatus = api.status(); r.tokenBody=(await api.text()).slice(0,200);
  r.errs=errs;
  await ctx.close();
}
fs.writeFileSync(`${OUT}/data/auth-rows.json`, JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
await br.close();
