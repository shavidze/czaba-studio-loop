import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import { writeFileSync } from 'node:fs';
const base='http://127.0.0.1:5173'; const out={}; const b=await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet_dismissed','1')}catch{}});
  const p=await ctx.newPage(); const r={};
  await p.goto(base+'/',{waitUntil:'commit'});
  await p.waitForSelector('[data-testid="entrance-loader"]',{timeout:8000});
  await p.waitForSelector('[data-testid="entrance-loader"]',{state:'detached',timeout:8000});
  await p.waitForTimeout(500); await p.screenshot({path:`j1-home-${w}.png`});
  const links=await p.$$eval('a[href^="/products/"]',a=>a.map(x=>x.getAttribute('href')));
  r.links=links.slice(0,3);
  if(links[0]){ await p.click(`a[href="${links[0]}"]`,{timeout:8000}).catch(e=>r.clickErr=e.message.slice(0,100));
    await p.waitForTimeout(2000); r.url=p.url(); r.h1=await p.$eval('h1',e=>e.textContent.trim()).catch(()=>null);
    r.logo=await p.$eval('header a[href="/"] span',e=>getComputedStyle(e).color).catch(()=>null);
    r.loaderOnProduct=!!(await p.$('[data-testid="entrance-loader"]'));
    await p.screenshot({path:`j2-product-${w}.png`});
    await p.goBack(); await p.waitForTimeout(1500);
    r.afterBackUrl=p.url(); r.loaderAfterBack=!!(await p.$('[data-testid="entrance-loader"]'));
    await p.screenshot({path:`j3-back-${w}.png`}); }
  out[w]=r; await ctx.close();
}
// auth
const ctx=await b.newContext({viewport:{width:1440,height:900}}); const p=await ctx.newPage(); const a={};
await p.goto(base+'/studio/middle-east',{waitUntil:'networkidle'}).catch(()=>{}); await p.waitForTimeout(1500);
a.signIn=(await p.content()).includes('Sign in required'); a.audioSrc=await p.$$eval('audio[src],audio source[src]',e=>e.length);
await p.screenshot({path:'auth-studio.png'});
a.token=(await ctx.request.get(base+'/api/studio-token?product=middle-east&file=x')).status();
const lab=await ctx.newPage(); await lab.goto(base+'/studio-lab',{waitUntil:'networkidle'}).catch(()=>{}); await lab.waitForTimeout(2500);
a.labUrl=lab.url(); a.labText=(await lab.innerText('body')).slice(0,200); await lab.screenshot({path:'auth-studio-lab.png'});
out.auth=a; await b.close(); writeFileSync('journey.json',JSON.stringify(out,null,1)); console.log(JSON.stringify(out,null,1));
