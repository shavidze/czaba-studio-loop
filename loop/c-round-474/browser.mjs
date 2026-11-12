import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = '/home/runner/czaba-project/tmp/studio-real-loop/c-round-474';
const b = await chromium.launch();
const res = {};
const pages = [['home','/'],['store','/store'],['product','/products/middle-east'],['studio-lab','/studio-lab']];
for (const [w,h] of [[1440,900],[1280,720]]) {
  for (const [tag, base] of [['tree','http://127.0.0.1:5173'],['head','http://127.0.0.1:5180']]) {
    const ctx = await b.newContext({ viewport:{width:w,height:h}, reducedMotion:'reduce' });
    const p = await ctx.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
    for (const [n,path] of pages) {
      await p.goto(base+path,{waitUntil:'load'}).catch(()=>{});
      await p.waitForTimeout(4500);
      const key=`${tag}-${w}-${n}`;
      await p.screenshot({path:`${out}/${key}.png`});
      res[key]={url:p.url(),title:await p.title(),text:(await p.evaluate(()=>document.body?document.body.innerText.length:-1).catch(()=>-2))};
    }
    res[`${tag}-${w}-pageerrors`]=errs;
    if (tag==='tree') {
      await p.goto(base+'/store',{waitUntil:'load'}); await p.waitForTimeout(2000);
      res[`probe-${w}`] = await p.evaluate(() => {
        const out={};
        const mk=(cls,tagn='div')=>{const e=document.createElement(tagn);e.className=cls;document.body.appendChild(e);return e;};
        const a=mk('stems-loader-list');
        const bt=mk('audio-preview-inline-button playing','button');
        const wb=mk('waveform-bar active');
        const cs=e=>getComputedStyle(e);
        out.scrollbarColor=cs(a).scrollbarColor;
        out.btnShadow=cs(bt).boxShadow; out.btnBg=cs(bt).backgroundImage; out.btnAnim=cs(bt).animationName;
        out.waveBg=cs(wb).backgroundImage+' | '+cs(wb).backgroundColor;
        const r=getComputedStyle(document.documentElement);
        out.gradPrimary=r.getPropertyValue('--gradient-primary'); out.glowPrimary=r.getPropertyValue('--color-glow-primary');
        out.brand=r.getPropertyValue('--color-brand');
        const css=[...document.styleSheets].map(s=>{try{return [...s.cssRules].map(r=>r.cssText).join('\n')}catch{return ''}}).join('\n');
        out.teal19217204=(css.match(/19,\s*217,\s*204/g)||[]).length;
        return out;
      });
      // animation frames: sample box-shadow at several times
      const samples=[];
      for(let i=0;i<4;i++){samples.push(await p.evaluate(()=>getComputedStyle(document.querySelector('.audio-preview-inline-button.playing')).boxShadow));await p.waitForTimeout(400);}
      res[`probe-${w}`].btnShadowSamples=samples;
      // anonymous auth
      await p.goto(base+'/studio/middle-east',{waitUntil:'load'}).catch(()=>{}); await p.waitForTimeout(2500);
      res[`auth-${w}`]=await p.evaluate(()=>({url:location.href,signin:/Sign in required/i.test(document.body.innerText),audioSrc:[...document.querySelectorAll('audio,video')].map(a=>a.src).filter(Boolean).length,text:document.body.innerText.slice(0,100)}));
      await p.screenshot({path:`${out}/tree-${w}-premium.png`});
      const r=await ctx.request.get(base+'/api/studio-token'); res[`token-${w}`]=r.status();
    }
    await ctx.close();
  }
}
await b.close();
fs.writeFileSync(`${out}/browser.json`,JSON.stringify(res,null,1));
console.log(JSON.stringify(res,null,1));
