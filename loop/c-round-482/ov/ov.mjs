import { chromium } from '/home/runner/czaba-project/store/node_modules/playwright/index.mjs';
const D=process.argv[2];const br=await chromium.launch();const out={};
for(const [w,h] of [[1440,900],[1280,720]]){
 const c=await br.newContext({viewport:{width:w,height:h}});const p=await c.newPage();
 await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]');
 await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
 const r={};const st=async()=>p.evaluate(()=>{const o=document.querySelector('[data-testid="arrangement-overview"]');const b=o&&o.getBoundingClientRect();return{overview:!!o,box:b?[Math.round(b.width),Math.round(b.height)]:null,lanes:!!document.querySelector('[data-testid="arrangement-overview-lanes"]'),hiddenSlot:!!document.querySelector('[data-testid="arrangement-overview-hidden-slot"]')}});
 r.empty=await st();await p.screenshot({path:`${D}/ov-empty-${w}.png`});
 await p.getByTestId('arrangement-library-list').getByRole('option').first().click();await p.keyboard.press('Enter');
 await p.waitForSelector('[data-clip-id]');await p.waitForTimeout(500);
 r.withClip=await st();await p.screenshot({path:`${D}/ov-clip-${w}.png`});
 await p.locator('body').click({position:{x:5,y:5}}).catch(()=>{});
 await p.keyboard.press('Control+Alt+o');await p.waitForTimeout(400);r.afterHide=await st();await p.screenshot({path:`${D}/ov-hidden-${w}.png`});
 await p.keyboard.press('Control+Alt+o');await p.waitForTimeout(400);r.afterShow=await st();await p.screenshot({path:`${D}/ov-shown-${w}.png`});
 out[`${w}x${h}`]=r;await c.close()}
console.log(JSON.stringify(out,null,1));await br.close();
