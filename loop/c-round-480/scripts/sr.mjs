import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch();
for (const [w,h] of [[1440,900],[1280,720]]) {
 const p = await b.newPage({viewport:{width:w,height:h}});
 const o={};
 await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
 o.storeBrand = await p.evaluate(()=>{const a=[...document.querySelectorAll('header a')].find(x=>/^\s*CZABA\s*$/.test(x.textContent));return a?getComputedStyle(a).color:null});
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
 o.studioBack = await p.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>/CZABA/.test(x.textContent)&&/←/.test(x.textContent));return a?{t:a.textContent.trim(),color:getComputedStyle(a).color}:null});
 o.demoBox = await p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length<4&&/Demo collection — no sign-in required/.test(x.textContent)&&x.textContent.length<120);if(!e)return null;const cs=getComputedStyle(e);return {t:e.textContent.trim(),bt:cs.borderTopWidth,bs:cs.borderTopStyle,tag:e.tagName}});
 console.log(w,JSON.stringify(o)); await p.close();
}
await b.close();
