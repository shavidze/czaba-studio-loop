import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b=await chromium.launch(); const ctx=await b.newContext(); const p=await ctx.newPage();
await p.goto('http://127.0.0.1:5173/store',{waitUntil:'load'}); await p.waitForTimeout(2500);
console.log(await p.evaluate(()=>{for(const s of document.styleSheets){try{for(const r of s.cssRules){const m=r.cssText.match(/.{120}19,\s*217,\s*204.{80}/s);if(m)return m[0];}}catch{}}}));
for (const u of ['/api/studio-token?productId=middle-east&file=x','/api/studio-token?productId=middle-east&fileName=a.mp3']) { const r=await ctx.request.get('http://127.0.0.1:5173'+u); console.log(u,r.status(),(await r.text()).slice(0,80)); }
await b.close();
