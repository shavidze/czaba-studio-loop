import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire('/home/runner/czaba-project/store/package.json');
const { chromium } = require('@playwright/test');
const b = await chromium.launch(); const res={};
for (const [w,h] of [[1440,900],[1280,720]]) {
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage(); const r={};
  await p.goto('http://127.0.0.1:5173/studio-lab',{waitUntil:'networkidle'});
  await p.waitForSelector('[data-testid="arrangement-timeline-scroller"]',{timeout:120000});
  await p.getByText('Demo collection ready').first().waitFor({timeout:120000}).catch(()=>{});
  await p.getByRole('button',{name:'All'}).first().click().catch(()=>{});
  await p.getByTestId('arrangement-library-list').getByRole('option',{name:/Bass/}).first().click();
  await p.keyboard.press('Enter'); await p.waitForTimeout(900);
  const st=()=>p.evaluate(()=>{const c=document.querySelector('[data-clip-id]');return {lane:c.closest('[data-track-id]').getAttribute('data-track-id'),start:c.getAttribute('data-clip-start')}});
  r.before=await st();
  const bb=await p.locator('[data-clip-id] [title$="drag to move"]').first().boundingBox();
  await p.mouse.move(bb.x+20,bb.y+bb.height/2); await p.mouse.down();
  for(let i=1;i<=10;i++){await p.mouse.move(bb.x+20+i*30,bb.y+bb.height/2);await p.waitForTimeout(30)}
  await p.mouse.up(); await p.waitForTimeout(500);
  r.after=await st(); r.undoTitle=await p.locator('button[title^="Undo"]').first().getAttribute('title');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(400); r.undone=await st();
  res[w]=r;
}
writeFileSync('c-round-336/smoke2.json',JSON.stringify(res,null,1)); console.log(JSON.stringify(res)); await b.close();
