import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const BASE='http://127.0.0.1:5173'; const O='/home/runner/czaba-project/tmp/studio-real-loop/c-round-497';
const res={}; const b=await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
  const vp=`${w}x${h}`; res[vp]={};
  const ctx=await b.newContext({viewport:{width:w,height:h}});
  await ctx.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet_dismissed','1')}catch{}});
  const page=await ctx.newPage(); const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,140))});
  for (let i=0;i<2;i++){ await page.goto(BASE+'/no-such-page-496',{waitUntil:'networkidle'}).catch(()=>{}); await page.waitForTimeout(2500);}
  const nf=await page.evaluate(()=>{const f=(t)=>{const a=[...document.querySelectorAll('a')].find(x=>x.textContent.trim()===t);if(!a)return null;const r=a.getBoundingClientRect();return {box:[r.x,r.y,r.width,r.height].map(Math.round),tag:a.tagName,innerButtons:a.querySelectorAll('button').length,closestButton:!!a.closest('button'),bg:getComputedStyle(a).backgroundColor,rad:getComputedStyle(a).borderTopLeftRadius,cls:a.className}};return {home:f('Back Home'),browse:f('Browse Store')}});
  res[vp].nf=nf; await page.screenshot({path:`${O}/nf-${w}.png`});
  // wrap check: same y
  // login/search nesting
  for (const p of ['/account/login','/search']) { await page.goto(BASE+p,{waitUntil:'networkidle'}).catch(()=>{}); await page.waitForTimeout(2000);
    res[vp][p]=await page.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>x.textContent.trim()==='Back to Home');return a?{tag:a.tagName,innerButtons:a.querySelectorAll('button').length,closestButton:!!a.closest('button')}:null}); }
  // hero nesting + journey
  await page.goto(BASE+'/',{waitUntil:'networkidle'}).catch(()=>{}); await page.waitForTimeout(4500);
  res[vp].hero=await page.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>x.textContent.includes('Discover the Collection'));return {tag:a.tagName,innerButtons:a.querySelectorAll('button').length,closestButton:!!a.closest('button'),href:a.getAttribute('href')}});
  await page.screenshot({path:`${O}/j1-home-${w}.png`});
  await page.getByRole('link',{name:'Discover the Collection'}).click(); await page.waitForTimeout(3000); res[vp].afterHero=new URL(page.url()).pathname; await page.screenshot({path:`${O}/j2-store-${w}.png`});
  await page.goBack(); await page.waitForTimeout(3000);
  await page.locator('header button:has-text("Sign In")').first().click(); await page.waitForTimeout(1200); await page.screenshot({path:`${O}/j3-signin-${w}.png`});
  res[vp].signinHeading=await page.getByRole('heading',{name:'Sign in',exact:true}).isVisible().catch(()=>false);
  await page.keyboard.press('Escape'); await page.waitForTimeout(800); res[vp].afterEsc=await page.getByRole('heading',{name:'Sign in',exact:true}).isVisible().catch(()=>false);
  res[vp].consoleErrors=[...new Set(errs)];
  // header signed-out metrics
  res[vp].hdrOut=await page.evaluate(()=>{const h=document.querySelector('header');const r=h.getBoundingClientRect();return {h:Math.round(r.height),navH:Math.round(h.querySelector('nav')?.getBoundingClientRect().height||0)}});
  await ctx.close();
  // C15 signed-in
  const c2=await b.newContext({viewport:{width:w,height:h}});
  await c2.addInitScript(()=>{try{localStorage.setItem('czaba_lead_magnet_dismissed','1');localStorage.setItem('auth_user',JSON.stringify({id:'u1',email:'c@test.local',firstName:'Test',lastName:'User',displayName:'Test User'}))}catch{}});
  const p2=await c2.newPage(); await p2.goto(BASE+'/',{waitUntil:'networkidle'}).catch(()=>{}); await p2.waitForTimeout(5000);
  res[vp].signedIn=await p2.evaluate(()=>{const h=document.querySelector('header');const r=h.getBoundingClientRect();const si=[...h.querySelectorAll('button')].filter(x=>x.textContent.trim()==='Sign In'&&x.getBoundingClientRect().width>0).length;const btns=[...h.querySelectorAll('button,a')].filter(x=>x.getBoundingClientRect().width>0).map(x=>({t:(x.getAttribute('aria-label')||x.textContent||'').trim().slice(0,20),b:[x.getBoundingClientRect().x,x.getBoundingClientRect().y,x.getBoundingClientRect().width,x.getBoundingClientRect().height].map(Math.round)}));return {hdrH:Math.round(r.height),signInVisible:si,btns}});
  await p2.screenshot({path:`${O}/signedin-${w}.png`,clip:{x:0,y:0,width:w,height:100}});
  await c2.close();
}
await b.close(); fs.writeFileSync(`${O}/extra.json`,JSON.stringify(res,null,1)); console.log('ok');
