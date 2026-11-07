import { open } from '/home/runner/czaba-project/tmp/studio-real-loop/c-round-382/lib.mjs';
const { browser, page } = await open('http://127.0.0.1:5173', 1440, 900);
await page.waitForTimeout(3000);
console.log(await page.evaluate(()=>[...document.querySelectorAll('[role=option]')].map(e=>e.textContent.slice(0,50)).slice(0,15)));
console.log((await page.innerText('body')).slice(0,600));
await page.screenshot({path:'/home/runner/czaba-project/tmp/studio-real-loop/c-round-387/peek.png'});
await browser.close();
