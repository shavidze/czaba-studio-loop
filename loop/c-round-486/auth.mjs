import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const out = {};
for (const vp of [{width:1440,height:900},{width:1280,height:720}]) {
  const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('leadmagnet_dismissed','1'); } catch {} });
  const k = `${vp.width}x${vp.height}`; out[k] = {};
  for (const u of ['/account/orders','/studio-lab','/studio/middle-east']) {
    await p.goto('http://127.0.0.1:5173'+u,{waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(2500);
    out[k][u] = await p.evaluate(() => ({
      url: location.pathname, authUser: localStorage.getItem('auth_user'),
      signIn: /Sign in required/i.test(document.body.innerText),
      orderButtons: [...document.querySelectorAll('button[aria-controls]')].filter(e=>/Order #/.test(e.textContent)).length,
      audioSrc: document.querySelectorAll('audio[src]').length,
      title: document.title, h1: document.querySelector('h1')?.textContent?.slice(0,60),
      hasStudioUI: !!document.querySelector('[data-testid*="arrangement"],[aria-label*="Arrangement"],[aria-label*="Transport"]'),
    }));
  }
  if (vp.width===1440) await p.screenshot({path:'shots/auth-studio-lab-1440.png'});
  await ctx.close();
}
await b.close(); writeFileSync('auth.json', JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1));
