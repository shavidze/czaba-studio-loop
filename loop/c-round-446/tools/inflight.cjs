const L = require('../../c-round-205/tools/lib.cjs');
(async()=>{const b=await L.launch();const out=[];
for(const W of [1440]){
const {ctx,page,log}=await L.newPage(b,W);
let hits=0;await page.route('**/api/subscribe',async r=>{hits++;await L.sleep(5000);await r.fulfill({status:500,contentType:'application/json',body:JSON.stringify({error:'STALE-BOOM'})});});
await page.goto('http://127.0.0.1:5173/products/pulse-loop-kit',{waitUntil:'networkidle'});await L.declineCookies(page);
await page.evaluate(()=>{const a=document.querySelector('a[href="/"]');a&&a.click()});
await page.waitForURL(u=>new URL(u).pathname==='/').catch(()=>{});await L.sleep(800);await L.scrollTo55(page);
const shown=await L.waitPopup(page,14000);
await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>/FREE DOWNLOAD/i.test(b.textContent)).click()});await L.sleep(600);
await page.getByPlaceholder('Enter your email address').fill('c@test.dev');
await page.getByRole('button',{name:'CONTINUE'}).click();await L.sleep(500);const mid=hits;await L.sleep(300);await page.goBack();await page.waitForURL(/\/products\//).catch(()=>{});
await L.sleep(6500);
const onProduct=await page.evaluate(()=>/STALE-BOOM/.test(document.body.innerText));
await page.goForward();await page.waitForURL(u=>new URL(u).pathname==='/').catch(()=>{});await L.sleep(600);await L.scrollTo55(page);
const again=await L.waitPopup(page,14000);
const offerStale=await page.evaluate(()=>/STALE-BOOM/.test(document.body.innerText));
await page.evaluate(()=>{const x=[...document.querySelectorAll('button')].find(b=>/FREE DOWNLOAD/i.test(b.textContent));x&&x.click()});await L.sleep(600);
const emailStale=await page.evaluate(()=>/STALE-BOOM/.test(document.body.innerText));
await page.screenshot({path:`../shots/inflight-${W}.png`});
out.push({mid,hits,W,shown:shown.visible,onProductStale:onProduct,again:again.visible,offerStale,emailStale,errors:log.errors});await ctx.close();}
await b.close();console.log(JSON.stringify(out));require('fs').writeFileSync('../inflight.json',JSON.stringify(out,null,1));})();
