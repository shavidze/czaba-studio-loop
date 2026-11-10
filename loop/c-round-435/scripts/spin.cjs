const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});await p.getByText('Demo collection ready').first().waitFor({timeout:120000});await p.waitForTimeout(800);
await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');await p.waitForTimeout(800);
const f=p.getByRole('spinbutton').first();const n=await p.getByRole('spinbutton').count();
const info=await p.getByRole('spinbutton').evaluateAll(els=>els.map(e=>({type:e.type,app:getComputedStyle(e).appearance,mozApp:getComputedStyle(e).MozAppearance})));
await f.hover();await p.waitForTimeout(300);const bb=await f.boundingBox();
await p.screenshot({path:'c-round-435/smoke/spin-hover.png',clip:{x:bb.x-10,y:bb.y-10,width:bb.width+40,height:bb.height+20}});
console.log(n,JSON.stringify(info),JSON.stringify(bb));await b.close();})();
