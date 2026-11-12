import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const res = {};
const init = () => { try { localStorage.setItem('czaba_lead_magnet_dismissed', String(Date.now())); sessionStorage.setItem('czaba_entrance_seen', '1'); } catch {} };
for (const [w,h] of [[1440,900],[1280,720]]) {
  const ctx = await b.newContext({ viewport:{width:w,height:h} }); const p = await ctx.newPage(); await p.addInitScript(init);
  const badge = () => p.evaluate(() => [...document.querySelectorAll('article div.absolute.top-3.left-3.rounded-full')].slice(0,3).map(s=>[s.textContent,getComputedStyle(s).backgroundColor,getComputedStyle(s).color]));
  await p.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'}); await p.waitForTimeout(2000);
  const before = await badge();
  await p.locator('article a').first().click(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(1500);
  const o = { url:p.url(), h1: await p.locator('h1').first().textContent().catch(()=>null) };
  await p.goBack(); await p.waitForLoadState('networkidle'); await p.waitForTimeout(2000);
  o.before=before; o.after=await badge(); res[w]=o;
  await p.screenshot({path:`/home/runner/czaba-project/tmp/studio-real-loop/c-round-475/journey-back-${w}.png`});
  // auth
  const p2 = await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p2.goto('http://127.0.0.1:5173/studio/middle-east',{waitUntil:'networkidle'}); await p2.waitForTimeout(1500);
  o.studioText = await p2.evaluate(()=>document.body?.innerText.slice(0,300).replace(/\n/g,' | '));o.studioUrl=p2.url();
  o.audioSrc = await p2.evaluate(()=>document.querySelectorAll('audio[src], source[src]').length);
  const r = await p2.request.get('http://127.0.0.1:5173/api/studio-token?product=middle-east&file=x'); o.tokenStatus = r.status();
}
console.log(JSON.stringify(res,null,1)); await b.close();
