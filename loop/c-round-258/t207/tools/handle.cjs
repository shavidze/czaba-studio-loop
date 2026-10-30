const { createRequire } = require('module');
const req = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = req('playwright'); const fs=require('fs'); const path=require('path');
(async()=>{const b=await chromium.launch();const out={};
for (const vp of [{width:1440,height:900},{width:1280,height:720}]){
const c=await b.newContext({viewport:vp});const p=await c.newPage();
await p.goto('http://127.0.0.1:5173/studio-lab');await p.waitForSelector('[data-testid=arrangement-grid-control]',{timeout:90000});await p.waitForTimeout(3000);
await p.locator('[data-testid=arrangement-video-input]').first().setInputFiles('/home/runner/czaba-project/tmp/studio-real-loop/media/beeps-6s-h264-aac.mp4');
await p.waitForFunction(()=>document.querySelectorAll('[data-clip-kind=video]').length>0,null,{timeout:30000});await p.waitForTimeout(1500);
await p.click('[data-testid=arrangement-video-expand]');await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const h=document.querySelector('[data-testid=arrangement-video-drag]');const before=getComputedStyle(h).cursor;const hits=[];
for(const s of document.styleSheets){let rules;try{rules=s.cssRules}catch(e){continue}for(let i=0;i<rules.length;i++){const ru=rules[i];if(ru.selectorText==='button'&&/cursor/.test(ru.cssText)){hits.push({sheet:(s.href||'inline').slice(-60),i,css:ru.cssText,layer:ru.parentRule?ru.parentRule.constructor.name:'top'});}}}
const saved=[];for(const s of document.styleSheets){let rules;try{rules=s.cssRules}catch(e){continue}for(let i=rules.length-1;i>=0;i--){const ru=rules[i];if(ru.selectorText==='button'&&/cursor:\s*pointer/.test(ru.cssText)&&!ru.parentRule){saved.push(ru.cssText);s.deleteRule(i);}}}
const after=getComputedStyle(h).cursor;return {before,after,hits,removed:saved.length,cls:h.className};});
out[vp.width]=r;await c.close();}
await b.close();fs.writeFileSync(path.join(__dirname,'..','out','handle-cause.json'),JSON.stringify(out,null,1));console.log(JSON.stringify(out,null,1));})();
