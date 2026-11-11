const L = require('../../c-round-205/tools/lib.cjs');
(async()=>{const b=await L.launch();const {ctx,page}=await L.newPage(b,1440);const req=[];page.on('request',r=>{if(/subscribe/.test(r.url()))req.push(r.url())});
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await L.declineCookies(page);await L.scrollTo55(page);await L.waitPopup(page,14000);
await page.evaluate(()=>{[...document.querySelectorAll('button')].find(b=>/FREE DOWNLOAD/i.test(b.textContent)).click()});await L.sleep(600);
await page.locator('input[type=email]').fill('c@test.dev');await page.getByRole('button',{name:'CONTINUE'}).click();await L.sleep(2500);
console.log(req, await page.evaluate(()=>document.querySelector('[role=alert]')?.textContent));await page.screenshot({path:'../shots/dbg.png'});await b.close();})();
