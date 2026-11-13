import { createRequire } from 'module';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const out = process.argv[2];
const b = await chromium.launch();
const res = [];
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} });
  await ctx.addInitScript(() => localStorage.setItem('czaba_lead_magnet_dismissed','true'));
  for (const p of ['/studio/1','/account/downloads','/studio-lab']) {
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:5173'+p, {waitUntil:'domcontentloaded', timeout:45000}).catch(e=>res.push({p,w,err:String(e).slice(0,120)}));
    await page.waitForTimeout(1500);
    const text = (await page.locator('body').innerText({timeout:10000}).catch(()=>'')).slice(0,4000);
    const dl = await page.locator('a[download], a[href*="download" i]:not([href="/account/downloads"])').count();
    res.push({p,w,url:page.url(),signIn:/sign in required/i.test(text),downloadLinks:dl,demo:/studio/i.test(text)&&p==='/studio-lab',snippet:text.slice(0,160).replace(/\n/g,' | ')});
    await page.screenshot({path:`${out}/auth-${p.replace(/\W+/g,'_')}-${w}.png`});
    await page.close();
  }
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(res,null,1));
