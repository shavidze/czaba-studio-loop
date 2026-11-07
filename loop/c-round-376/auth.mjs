import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res = {};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const c = await b.newContext({ viewport:{width:w,height:h} }); const p = await c.newPage();
  await p.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle'}); await p.waitForTimeout(2500);
  const body=(await p.locator('body').innerText()).slice(0,200).replace(/\n/g,' | ');
  await p.screenshot({path:`auth-${w}.png`});
  const r1=await p.request.get('http://127.0.0.1:5173/api/studio-token?productId=middle-east&file=stem.wav');
  const r2=await p.request.post('http://127.0.0.1:5173/api/studio-token',{data:{productId:'middle-east',file:'stem.wav'}});
  res[w]={body,workspace:await p.getByTestId('arrangement-transport').count(),audio:await p.locator('audio[src]').count(),get:[r1.status(),(await r1.text()).slice(0,100)],post:[r2.status(),(await r2.text()).slice(0,100)]};
  await c.close();
}
console.log(JSON.stringify(res,null,1)); await b.close();
