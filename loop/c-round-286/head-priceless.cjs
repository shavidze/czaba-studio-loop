// C286: HEAD contrast for priceless-pack (figure, buttons, Buy Now result, store card)
const { chromium } = require('/home/runner/czaba-project/store/node_modules/@playwright/test');
(async()=>{const b=await chromium.launch();const out=[];
for (const [w,h] of [[1440,900],[1280,720]]){const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
await p.goto(process.argv[2]+'/products/priceless-pack',{waitUntil:'load'});await p.getByText('Total Price',{exact:true}).waitFor();await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{const l=[...document.querySelectorAll('div')].find(d=>d.textContent.trim()==='Total Price'&&!d.children.length);const bt=n=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim().includes(n));
return {figure:l.nextElementSibling.textContent.replace(/\s+/g,' ').trim(),addDisabled:bt('Add to Cart').disabled,buyDisabled:bt('Buy Now').disabled,ariaAdd:bt('Add to Cart').getAttribute('aria-disabled'),complimentary:document.body.innerText.includes('Complimentary Download')}});
await p.screenshot({path:`shots/unknown-head-priceless-${w}.png`});
const bx=await p.getByRole('button',{name:'Buy Now'}).boundingBox();await p.mouse.click(bx.x+bx.width/2,bx.y+bx.height/2);await p.waitForTimeout(1200);
r.afterBuyNow=await p.evaluate(()=>({signInModal:document.body.innerText.includes('Forgot password?'),toastSignIn:document.body.innerText.includes('Please sign in')}));
out.push({viewport:[w,h],...r});await ctx.close();}
require('fs').writeFileSync('probe/unknown-head.json',JSON.stringify(out,null,1));console.log(JSON.stringify(out));await b.close();})();
