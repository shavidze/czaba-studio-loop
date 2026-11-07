import { createRequire } from 'node:module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res={};
for (const base of ['http://127.0.0.1:5173','http://127.0.0.1:5180']) for (const [w,h] of [[1440,900],[1280,720]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto(base+'/studio-lab',{waitUntil:'networkidle'}); await p.getByText('Demo collection ready').first().waitFor({timeout:120000}); await p.waitForTimeout(600);
  const mm = p.getByTestId('arrangement-master').getByRole('button').first();
  const info = async()=>mm.evaluate(e=>({n:e.getAttribute('aria-label'),p:e.getAttribute('aria-pressed')}));
  const o={b:await info()}; await mm.click(); await p.waitForTimeout(300); o.m=await info(); const u1=await p.getByRole('button',{name:/^Undo/}).first().getAttribute('title'); o.undo=u1; await p.keyboard.press('Control+z'); await p.waitForTimeout(300); o.u=await info();
  res[base.slice(-4)+'@'+w]=o; await p.context().close();
}
console.log(JSON.stringify(res,null,1)); await b.close();
