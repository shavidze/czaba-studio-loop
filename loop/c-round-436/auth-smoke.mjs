import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2]; const base='http://127.0.0.1:5173'; const res={};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({viewport:{width:w,height:h}}); const p = await ctx.newPage(); const r={};
  await p.goto(base+'/studio-lab',{waitUntil:'networkidle'});
  r.labTitle=await p.title(); r.authUser=await p.evaluate(()=>localStorage.getItem('auth_user'));
  await p.getByText('Demo collection ready').first().waitFor({timeout:30000}).catch(()=>{r.noReady=true});
  const pos=()=>p.locator('[data-testid="arrangement-position"]').first().innerText();
  // add first library item
  const item=p.locator('[role="option"],[role="treeitem"],li[tabindex]').first();
  await item.focus().catch(()=>{}); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  r.pos0=await pos();
  await p.keyboard.press('Space'); await p.waitForTimeout(1600); r.posPlaying=await pos();
  await p.keyboard.press('Space'); await p.waitForTimeout(400); const h1=await pos(); await p.waitForTimeout(600); r.posStopped=h1; r.posHeld=await pos();
  const exp=p.getByRole('button',{name:/^Export/}).first();
  await exp.click(); await p.waitForTimeout(500); r.dialogOpen=await p.getByRole('dialog').count();
  await p.keyboard.press('Escape'); await p.waitForTimeout(400); r.dialogClosed=await p.getByRole('dialog').count();
  await p.screenshot({path:`${out}/smoke-${w}x${h}.png`});
  const q = await ctx.newPage();
  await q.goto(base+'/studio/middle-east',{waitUntil:'networkidle'});
  r.protectedText=(await q.locator('body').innerText()).slice(0,200); r.audioSrc=await q.locator('audio[src]').count();
  r.signIn=/Sign in required/i.test(r.protectedText);
  const api=await q.request.get(base+'/api/studio-token?product=middle-east&file=stem.mp3'); r.tokenStatus=api.status();
  await q.screenshot({path:`${out}/auth-${w}x${h}.png`});
  res[`${w}x${h}`]=r; await ctx.close();
}
await b.close(); writeFileSync(out+'/auth-smoke.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res,null,1));
