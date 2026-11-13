import { chromium } from '/home/runner/czaba-project/store/node_modules/@playwright/test/index.mjs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-493';
const base = 'http://127.0.0.1:5173';
const res = {};
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  const p = await ctx.newPage();
  const k = `${w}x${h}`; const r = res[k] = {};
  for (const [name,path] of [['account','/account'],['studio','/studio/middle-east']]) {
    await p.goto(base+path, {waitUntil:'load'}); await p.waitForTimeout(6000);
    const txt = await p.locator('body').innerText();
    r[name] = { signInRequired: /Sign in required/i.test(txt), changePassword: /Change Password/i.test(txt), audioSrc: await p.locator('audio[src]').count(), url:p.url() };
    await p.screenshot({path:`${out}/shots/c8-${name}-${k}.png`});
  }
  await p.goto(base+'/studio-lab',{waitUntil:'load'}); await p.waitForTimeout(7000);
  r.lab = { authUser: await p.evaluate(()=>localStorage.getItem('auth_user')), demoReady: /Demo collection ready/i.test(await p.locator('body').innerText()) };
  await p.screenshot({path:`${out}/shots/c8-lab-${k}.png`});
  const items = p.locator('[role="option"], [data-testid*="library-item"], [data-library-item]');
  r.lab.itemCount = await items.count();
  if (r.lab.itemCount) { await items.first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
    r.lab.clips = await p.locator('[data-testid*="clip"], [data-arrangement-clip]').count(); }
  await p.screenshot({path:`${out}/shots/c8-lab-added-${k}.png`});
  await p.locator('body').click({position:{x:5,y:5}}).catch(()=>{});
  await p.keyboard.press('Space'); await p.waitForTimeout(1800);
  const status1 = await p.evaluate(()=>document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent);
  const clock = await p.evaluate(()=>document.body.innerText.match(/\d\d:\d\d\.\d{3}/g));
  r.lab.afterSpace = {status1, clock};
  await p.screenshot({path:`${out}/shots/c8-lab-play-${k}.png`});
  await p.keyboard.press('Space'); await p.waitForTimeout(600);
  r.lab.afterSecondSpace = await p.evaluate(()=>document.querySelector('[data-testid="arrangement-playback-state"]')?.textContent);
  await ctx.close();
}
await b.close();
(await import('fs')).writeFileSync(`${out}/c8.json`, JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
