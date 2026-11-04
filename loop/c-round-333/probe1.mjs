import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'load'});
await p.waitForFunction(() => /ready/i.test(document.querySelector('[data-testid="arrangement-status"]')?.textContent ?? ''),null,{timeout:120000});
await p.getByRole('button',{name:'Add',exact:true}).first().click(); await p.locator('[data-clip-kind="audio"]').first().waitFor(); await p.waitForTimeout(1500);
const nb = p.locator('[data-clip-kind="audio"]').first().getByTitle(/ — drag to move$/).first(); const bb = await nb.boundingBox();
await p.mouse.click(bb.x+30,bb.y+bb.height/2); await p.waitForTimeout(500);
console.log(await p.evaluate(()=>{const s=document.querySelector('[data-testid="arrangement-detail-start"]');const r=s.getBoundingClientRect();return {v:s.value,dis:s.disabled,rect:[r.x,r.y,r.width,r.height],vis:getComputedStyle(s).visibility,anc:(()=>{let e=s,o=[];while(e&&o.length<8){const c=getComputedStyle(e);o.push(e.tagName+':'+c.display+'/'+c.visibility+'/'+e.getBoundingClientRect().height);e=e.parentElement}return o})(), vh:innerHeight}}));
await p.screenshot({path:'shots/probe1.png'}); await b.close();
